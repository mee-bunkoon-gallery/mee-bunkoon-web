import type { IPayment } from 'src/types/payment';
import type { IQuotation } from 'src/types/quotation';
import type { ICompanyProfile } from 'src/types/settings';

import { Font, Page, View, Text, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';
import { fThaiBahtText } from 'src/utils/format-thai-baht-text';

import { PAYMENT_METHOD_LABEL, PAYMENT_PURPOSE_LABEL } from './payment-method';

// ----------------------------------------------------------------------

Font.register({
  family: 'LINE Seed Sans TH',
  fonts: [
    { src: '/fonts/LINESeedSansTH-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/LINESeedSansTH-Bold.ttf', fontWeight: 'bold' },
  ],
});

const thaiWordSegmenter = new Intl.Segmenter('th', { granularity: 'word' });
const textEndGuard = '\u00A0';
const glyphEndGuard = '\u200A';

Font.registerHyphenationCallback((word) =>
  Array.from(thaiWordSegmenter.segment(word), ({ segment }) => `${segment}${glyphEndGuard}`)
);

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'LINE Seed Sans TH', color: '#212B36' },
  row: { flexDirection: 'row' },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  h3: { fontSize: 16, fontWeight: 'bold' },
  h4: { fontSize: 12, fontWeight: 'bold' },
  subtitle: { fontSize: 9, color: '#637381', lineHeight: 1.5 },
  mb4: { marginBottom: 4 },
  mb24: { marginBottom: 24 },
  tableHeadText: { fontSize: 9, fontWeight: 'bold', lineHeight: 1.5 },
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
  colDescription: { width: '42%', paddingHorizontal: 2, lineHeight: 1.45 },
  colUnit: { width: '10%', paddingHorizontal: 2, lineHeight: 1.45 },
  colQty: { width: '10%', paddingHorizontal: 2, lineHeight: 1.45, textAlign: 'right' },
  colPrice: { width: '18%', paddingHorizontal: 2, lineHeight: 1.45, textAlign: 'right' },
  colAmount: {
    width: '20%',
    paddingLeft: 2,
    paddingRight: 6,
    lineHeight: 1.45,
    textAlign: 'right',
  },
  receiptDescription: { width: '75%', paddingHorizontal: 2, lineHeight: 1.45 },
  receiptAmount: {
    width: '25%',
    paddingLeft: 2,
    paddingRight: 6,
    lineHeight: 1.45,
    textAlign: 'right',
  },
  paymentMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E7EBF0',
  },
  totalBox: { width: '44%', marginLeft: 'auto', marginTop: 12, paddingHorizontal: 4 },
  totalsRow: {
    minHeight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalsLabel: { lineHeight: 1.5, paddingLeft: 2, paddingRight: 6 },
  totalsValue: { lineHeight: 1.5, paddingHorizontal: 2 },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#212B36',
    paddingTop: 6,
    paddingHorizontal: 2,
    marginTop: 4,
  },
  amountWordsRow: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#F2F3F5',
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 1.5,
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
              <Text style={styles.h3}>{companyProfile?.storeNameTh}</Text>
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

        {quotation?.items.length ? (
          <View>
            <View style={styles.tableHeadRow}>
              <Text style={[styles.colDescription, styles.tableHeadText]}>
                รายการตามใบเสนอราคา{textEndGuard}
              </Text>
              <Text style={[styles.colUnit, styles.tableHeadText]}>หน่วย{textEndGuard}</Text>
              <Text style={[styles.colQty, styles.tableHeadText]}>จำนวน{textEndGuard}</Text>
              <Text style={[styles.colPrice, styles.tableHeadText]}>
                ราคาต่อหน่วย{textEndGuard}
              </Text>
              <Text style={[styles.colAmount, styles.tableHeadText]}>จำนวนเงิน{textEndGuard}</Text>
            </View>
            {quotation.items.map((item, index) => (
              <View key={item.id ?? index} style={styles.tableRow}>
                <Text style={styles.colDescription}>
                  {item.description}
                  {textEndGuard}
                </Text>
                <Text style={styles.colUnit}>
                  {item.unit || '-'}
                  {textEndGuard}
                </Text>
                <Text style={styles.colQty}>
                  {item.quantity}
                  {textEndGuard}
                </Text>
                <Text style={styles.colPrice}>
                  {fBaht(item.unitPrice)}
                  {textEndGuard}
                </Text>
                <Text style={styles.colAmount}>
                  {fBaht(item.amount)}
                  {textEndGuard}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.tableHeadRow}>
              <Text style={[styles.receiptDescription, styles.tableHeadText]}>
                รายละเอียดการรับเงิน{textEndGuard}
              </Text>
              <Text style={[styles.receiptAmount, styles.tableHeadText]}>
                จำนวนเงิน{textEndGuard}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.receiptDescription}>
                <Text>
                  {PAYMENT_PURPOSE_LABEL[payment.paymentPurpose]}
                  {textEndGuard}
                </Text>
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
              <Text style={styles.receiptAmount}>
                {fBaht(payment.amount)}
                {textEndGuard}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.totalBox}>
          {quotation && (
            <>
              <View style={styles.totalsRow}>
                <Text style={[styles.subtitle, styles.totalsLabel]}>
                  ยอดรวมรายการ{textEndGuard}
                </Text>
                <Text style={styles.totalsValue}>
                  {fBaht(quotation.subtotal)}
                  {textEndGuard}
                </Text>
              </View>
              {quotation.discount > 0 && (
                <View style={styles.totalsRow}>
                  <Text style={[styles.subtitle, styles.totalsLabel]}>ส่วนลด{textEndGuard}</Text>
                  <Text style={styles.totalsValue}>
                    -{fBaht(quotation.discount)}
                    {textEndGuard}
                  </Text>
                </View>
              )}
              {quotation.includeVat && (
                <View style={styles.totalsRow}>
                  <Text style={[styles.subtitle, styles.totalsLabel]}>
                    ภาษีมูลค่าเพิ่ม ({quotation.vatRate}%){textEndGuard}
                  </Text>
                  <Text style={styles.totalsValue}>
                    {fBaht(quotation.vatAmount)}
                    {textEndGuard}
                  </Text>
                </View>
              )}
              <View style={styles.totalsRow}>
                <Text style={[styles.subtitle, styles.totalsLabel]}>
                  ยอดตามใบเสนอราคา{textEndGuard}
                </Text>
                <Text style={styles.totalsValue}>
                  {fBaht(quotation.total)}
                  {textEndGuard}
                </Text>
              </View>
            </>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={[styles.h4, styles.totalsLabel]}>จำนวนเงินที่ได้รับ{textEndGuard}</Text>
            <Text style={[styles.h4, styles.totalsValue]}>
              {fBaht(payment.amount)}
              {textEndGuard}
            </Text>
          </View>
        </View>

        <View style={styles.amountWordsRow} wrap={false}>
          <Text>
            จำนวนเงิน (Amount) {fThaiBahtText(payment.amount)}
            {textEndGuard}
          </Text>
        </View>

        {payment.note && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>หมายเหตุ</Text>
            <Text style={styles.subtitle}>{payment.note}</Text>
          </View>
        )}

        <View style={[styles.paymentMeta, { marginTop: 24 }]} wrap={false}>
          <View style={{ width: '50%' }}>
            <Text style={styles.subtitle}>ประเภทการรับเงิน{textEndGuard}</Text>
            <Text>
              {PAYMENT_PURPOSE_LABEL[payment.paymentPurpose]}
              {textEndGuard}
            </Text>
          </View>
          <View style={{ width: '50%' }}>
            <Text style={styles.subtitle}>ช่องทางการชำระเงิน{textEndGuard}</Text>
            <Text>
              {PAYMENT_METHOD_LABEL[payment.paymentMethod]}
              {textEndGuard}
            </Text>
            {payment.quotation && (
              <Text style={styles.subtitle}>อ้างอิงใบเสนอราคา: {payment.quotation.quoteNo}</Text>
            )}
            {payment.referenceNo && (
              <Text style={styles.subtitle}>เลขที่อ้างอิง: {payment.referenceNo}</Text>
            )}
          </View>
        </View>

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
