import type { IPayment } from 'src/types/payment';
import type { IQuotation } from 'src/types/quotation';
import type { ICompanyProfile } from 'src/types/settings';

import { Font, Page, View, Text, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { PAYMENT_METHOD_LABEL, PAYMENT_PURPOSE_LABEL } from './payment-method';

// ----------------------------------------------------------------------

Font.register({
  family: 'LINE Seed Sans TH',
  fonts: [
    { src: '/fonts/LINESeedSansTH-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/LINESeedSansTH-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'LINE Seed Sans TH', color: '#212B36' },
  row: { flexDirection: 'row' },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  h3: { fontSize: 16, fontWeight: 'bold' },
  h4: { fontSize: 12, fontWeight: 'bold' },
  subtitle: { fontSize: 9, color: '#637381' },
  mb4: { marginBottom: 4 },
  mb24: { marginBottom: 24 },
  tableHeadText: { fontSize: 9, fontWeight: 'bold' },
  tableHeadRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#212B36',
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF0',
    paddingVertical: 8,
  },
  colDescription: { width: '42%' },
  colUnit: { width: '10%' },
  colQty: { width: '10%', textAlign: 'right' },
  colPrice: { width: '18%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  paymentMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E7EBF0',
  },
  totalBox: { width: '42%', marginLeft: 'auto', marginTop: 12 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#212B36',
    paddingTop: 6,
    marginTop: 4,
  },
  signatureSection: { marginTop: 52, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '42%', alignItems: 'center' },
  signatureSpace: { height: 48 },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#637381',
    marginBottom: 8,
  },
  signatureText: { fontSize: 9, textAlign: 'center' },
});

type Props = {
  payment: IPayment;
  quotation?: IQuotation | null;
  companyProfile?: ICompanyProfile | null;
  companyName?: string;
};

export function PaymentPdfDocument({
  payment,
  quotation,
  companyProfile,
  companyName = 'MEE BUNKOON GALLERY',
}: Props) {
  const issuerName =
    companyProfile?.entityType === 'individual'
      ? companyProfile?.name
      : companyProfile?.storeNameTh || companyProfile?.name || companyName;
  const issuerNameEn = companyProfile?.storeNameEn;
  const issuerContact = [
    companyProfile?.phone ? `โทร: ${companyProfile.phone}` : null,
    companyProfile?.email ? `อีเมล: ${companyProfile.email}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.spaceBetween, styles.mb24]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!!companyProfile?.logoUrl && (
              <Image
                src={companyProfile.logoUrl}
                style={{ width: 80, height: 80, objectFit: 'contain', marginRight: 20 }}
              />
            )}
            <View>
              <Text style={styles.h3}>{issuerName}</Text>
              {!!issuerNameEn && <Text style={styles.subtitle}>{issuerNameEn}</Text>}
              <Text style={styles.subtitle}>
                {companyProfile?.entityType === 'individual' ? 'ในนามบุคคล' : 'ในนามบริษัท'}
              </Text>
            </View>
          </View>

          <View>
            <Text style={[styles.h4, { textAlign: 'right' }]}>ใบเสร็จรับเงิน / Receipt</Text>
            <Text style={[styles.h4, { textAlign: 'right' }]}>{payment.receiptNo}</Text>
            <Text style={styles.subtitle}>วันที่ออก: {fDate(payment.paymentDate)}</Text>
          </View>
        </View>

        <View style={[styles.spaceBetween, styles.mb24]}>
          <View style={{ width: '50%' }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>จาก</Text>
            <Text style={styles.mb4}>{issuerName}</Text>
            {companyProfile?.branch && (
              <Text style={styles.subtitle}>สาขา: {companyProfile.branch}</Text>
            )}
            {!!issuerContact && <Text style={styles.subtitle}>{issuerContact}</Text>}
            {companyProfile?.address && (
              <Text style={styles.subtitle}>ที่อยู่: {companyProfile.address}</Text>
            )}
            {companyProfile?.taxId && (
              <Text style={styles.subtitle}>เลขผู้เสียภาษี: {companyProfile.taxId}</Text>
            )}
          </View>

          <View style={{ width: '50%' }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>ได้รับเงินจาก</Text>
            <Text style={styles.mb4}>{payment.customer?.name}</Text>
            {payment.customer?.contactPerson && (
              <Text style={styles.subtitle}>ผู้ติดต่อ: {payment.customer.contactPerson}</Text>
            )}
            {payment.customer?.phone && (
              <Text style={styles.subtitle}>โทร: {payment.customer.phone}</Text>
            )}
            {payment.customer?.email && (
              <Text style={styles.subtitle}>อีเมล: {payment.customer.email}</Text>
            )}
            {payment.customer?.address && (
              <Text style={styles.subtitle}>ที่อยู่: {payment.customer.address}</Text>
            )}
            {payment.customer?.taxId && (
              <Text style={styles.subtitle}>เลขผู้เสียภาษี: {payment.customer.taxId}</Text>
            )}
          </View>
        </View>

        <View style={styles.paymentMeta}>
          <View style={{ width: '50%' }}>
            <Text style={styles.subtitle}>ประเภทการรับเงิน</Text>
            <Text>{PAYMENT_PURPOSE_LABEL[payment.paymentPurpose]}</Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={styles.subtitle}>ช่องทางการชำระเงิน</Text>
            <Text>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</Text>
            {payment.quotation && (
              <Text style={styles.subtitle}>อ้างอิงใบเสนอราคา: {payment.quotation.quoteNo}</Text>
            )}
            {payment.referenceNo && (
              <Text style={styles.subtitle}>เลขที่อ้างอิง: {payment.referenceNo}</Text>
            )}
          </View>
        </View>

        {quotation?.items.length ? (
          <View>
            <View style={styles.tableHeadRow}>
              <Text style={[styles.colDescription, styles.tableHeadText]}>รายการตามใบเสนอราคา</Text>
              <Text style={[styles.colUnit, styles.tableHeadText]}>หน่วย</Text>
              <Text style={[styles.colQty, styles.tableHeadText]}>จำนวน</Text>
              <Text style={[styles.colPrice, styles.tableHeadText]}>ราคาต่อหน่วย</Text>
              <Text style={[styles.colAmount, styles.tableHeadText]}>จำนวนเงิน</Text>
            </View>
            {quotation.items.map((item, index) => (
              <View key={item.id ?? index} style={styles.tableRow}>
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colUnit}>{item.unit || '-'}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{fBaht(item.unitPrice)}</Text>
                <Text style={styles.colAmount}>{fBaht(item.amount)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.tableHeadRow}>
              <Text style={[styles.colDescription, styles.tableHeadText]}>
                รายละเอียดการรับเงิน
              </Text>
              <Text style={[styles.colAmount, styles.tableHeadText]}>จำนวนเงิน</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text>{PAYMENT_PURPOSE_LABEL[payment.paymentPurpose]}</Text>
                <Text style={styles.subtitle}>
                  ช่องทาง: {PAYMENT_METHOD_LABEL[payment.paymentMethod]}
                </Text>
                {payment.quotation && (
                  <Text style={styles.subtitle}>
                    อ้างอิงใบเสนอราคา: {payment.quotation.quoteNo}
                  </Text>
                )}
                {payment.referenceNo && (
                  <Text style={styles.subtitle}>เลขที่อ้างอิง: {payment.referenceNo}</Text>
                )}
              </View>
              <Text style={styles.colAmount}>{fBaht(payment.amount)}</Text>
            </View>
          </View>
        )}

        <View style={styles.totalBox}>
          {quotation && (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.subtitle}>ยอดรวมรายการ</Text>
                <Text>{fBaht(quotation.subtotal)}</Text>
              </View>
              {quotation.discount > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={styles.subtitle}>ส่วนลด</Text>
                  <Text>-{fBaht(quotation.discount)}</Text>
                </View>
              )}
              {quotation.includeVat && (
                <View style={styles.totalsRow}>
                  <Text style={styles.subtitle}>ภาษีมูลค่าเพิ่ม ({quotation.vatRate}%)</Text>
                  <Text>{fBaht(quotation.vatAmount)}</Text>
                </View>
              )}
              <View style={styles.totalsRow}>
                <Text style={styles.subtitle}>ยอดตามใบเสนอราคา</Text>
                <Text>{fBaht(quotation.total)}</Text>
              </View>
            </>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.h4}>จำนวนเงินที่ได้รับ</Text>
            <Text style={styles.h4}>{fBaht(payment.amount)}</Text>
          </View>
        </View>

        {payment.note && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>หมายเหตุ</Text>
            <Text style={styles.subtitle}>{payment.note}</Text>
          </View>
        )}

        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>ผู้รับเงิน</Text>
            <Text style={styles.subtitle}>{issuerName}</Text>
            <Text style={[styles.subtitle, { marginTop: 4 }]}>วันที่ ____ / ____ / ______</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>ผู้ชำระเงิน</Text>
            <Text style={styles.subtitle}>{payment.customer?.name || 'ลูกค้า'}</Text>
            <Text style={[styles.subtitle, { marginTop: 4 }]}>วันที่ ____ / ____ / ______</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
