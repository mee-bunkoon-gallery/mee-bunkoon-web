import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

function mapPackage(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    promotionPrice: Number(row.promotion_price),
    startDate: row.start_date,
    endDate: row.end_date,
    active: row.active,
    eventTypeId: row.event_type_id,
    eventType: row.event_type
      ? { id: row.event_type.id, name: row.event_type.name, inUse: true }
      : null,
    items: (row.items ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((item: any) => ({
        id: item.id,
        serviceItemId: item.service_item_id,
        quantity: Number(item.quantity),
        unitPrice: Number(item.service_item.unit_price),
        serviceItem: {
          id: item.service_item.id,
          name: item.service_item.name,
          description: item.service_item.description,
          imageUrl: item.service_item.image_url,
          unit: item.service_item.unit,
          unitPrice: Number(item.service_item.unit_price),
          colorThemeIds: [],
          colorThemes: [],
          createdAt: item.service_item.created_at,
          updatedAt: item.service_item.updated_at,
        },
      })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabase
    .from('promotion_packages')
    .select(
      '*, event_type:event_types(*), items:promotion_package_items(*, service_item:service_items(*))'
    )
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 404 });
  return NextResponse.json({ package: mapPackage(data) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.name?.trim() || !body.items?.length) {
    return NextResponse.json({ message: 'กรุณากรอกชื่อและเลือกรายการบริการ' }, { status: 400 });
  }
  if (body.startDate && body.endDate && body.endDate < body.startDate) {
    return NextResponse.json(
      { message: 'วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น' },
      { status: 400 }
    );
  }

  const { data: linkedPackageItems, error: linkedError } = await supabase
    .from('quotation_items')
    .select('quotation_id, promotion_package_discount')
    .eq('promotion_package_id', id);
  if (linkedError) return NextResponse.json({ message: linkedError.message }, { status: 400 });

  const { error } = await supabase
    .from('promotion_packages')
    .update({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      image_url: body.imageUrl || null,
      promotion_price: Number(body.promotionPrice) || 0,
      start_date: body.startDate || null,
      end_date: body.endDate || null,
      active: body.active ?? true,
      event_type_id: body.eventTypeId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const { error: deleteError } = await supabase
    .from('promotion_package_items')
    .delete()
    .eq('package_id', id);
  if (deleteError) return NextResponse.json({ message: deleteError.message }, { status: 400 });

  const { error: itemError } = await supabase.from('promotion_package_items').insert(
    body.items.map((item: any, position: number) => ({
      package_id: id,
      service_item_id: item.serviceItemId,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unitPrice) || 0,
      position,
    }))
  );
  if (itemError) return NextResponse.json({ message: itemError.message }, { status: 400 });

  const quotationIds = [...new Set((linkedPackageItems ?? []).map((item) => item.quotation_id))];
  if (quotationIds.length) {
    const serviceItemIds = body.items.map((item: any) => item.serviceItemId);
    const { data: services, error: servicesError } = await supabase
      .from('service_items')
      .select('id, name, unit')
      .in('id', serviceItemIds);
    if (servicesError) {
      return NextResponse.json({ message: servicesError.message }, { status: 400 });
    }

    const { data: quotations, error: quotationsError } = await supabase
      .from('quotations')
      .select('id, discount, include_vat, vat_rate, items:quotation_items(*)')
      .in('id', quotationIds);
    if (quotationsError) {
      return NextResponse.json({ message: quotationsError.message }, { status: 400 });
    }

    const packageSubtotal = body.items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    );
    const newPackageDiscount = Math.max(packageSubtotal - Number(body.promotionPrice || 0), 0);

    for (const quotation of quotations) {
      const packageRows = quotation.items.filter((item: any) => item.promotion_package_id === id);
      const remainingItems = quotation.items.filter(
        (item: any) => item.promotion_package_id !== id
      );
      const previousPackageDiscount = packageRows.reduce(
        (sum: number, item: any) => sum + Number(item.promotion_package_discount || 0),
        0
      );
      const nextPosition =
        remainingItems.reduce(
          (max: number, item: any) => Math.max(max, Number(item.position)),
          -1
        ) + 1;

      const { error: removeError } = await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', quotation.id)
        .eq('promotion_package_id', id);
      if (removeError) return NextResponse.json({ message: removeError.message }, { status: 400 });

      const packageQuotationItems = body.items.map((item: any, index: number) => {
        const service = services.find((serviceItem) => serviceItem.id === item.serviceItemId);
        return {
          quotation_id: quotation.id,
          service_item_id: item.serviceItemId,
          promotion_package_id: id,
          promotion_package_discount: index === 0 ? newPackageDiscount : 0,
          position: nextPosition + index,
          description: service?.name || body.name,
          unit: service?.unit || 'รายการ',
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unitPrice) || 0,
          amount: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
        };
      });
      const { error: insertError } = await supabase
        .from('quotation_items')
        .insert(packageQuotationItems);
      if (insertError) return NextResponse.json({ message: insertError.message }, { status: 400 });

      const allItems = [...remainingItems, ...packageQuotationItems];
      const subtotal = allItems.reduce(
        (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unit_price),
        0
      );
      const discount = Math.max(
        Number(quotation.discount) - previousPackageDiscount + newPackageDiscount,
        0
      );
      const taxable = Math.max(subtotal - discount, 0);
      const vatAmount = quotation.include_vat ? (taxable * Number(quotation.vat_rate)) / 100 : 0;
      const total = taxable + vatAmount;
      const scopeOfWork = allItems
        .sort((a: any, b: any) => Number(a.position) - Number(b.position))
        .map((item: any) => `${item.description} (${item.quantity} ${item.unit ?? ''})`.trim())
        .join('\n');

      const [quotationResult, contractResult] = await Promise.all([
        supabase
          .from('quotations')
          .update({ subtotal, discount, vat_amount: vatAmount, total })
          .eq('id', quotation.id),
        supabase
          .from('contracts')
          .update({ scope_of_work: scopeOfWork, total_amount: total })
          .eq('quotation_id', quotation.id),
      ]);
      const syncError = quotationResult.error || contractResult.error;
      if (syncError) return NextResponse.json({ message: syncError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { count, error: usageError } = await supabase
    .from('quotation_items')
    .select('id', { count: 'exact', head: true })
    .eq('promotion_package_id', id);
  if (usageError) return NextResponse.json({ message: usageError.message }, { status: 400 });
  if (count) {
    return NextResponse.json(
      { message: 'ไม่สามารถลบแพ็กเกจที่ถูกใช้อ้างอิงในใบเสนอราคาได้' },
      { status: 409 }
    );
  }
  const { error } = await supabase.from('promotion_packages').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
