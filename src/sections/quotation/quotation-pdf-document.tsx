import type { IQuotation } from 'src/types/quotation';
import type { ICompanyProfile } from 'src/types/settings';

import { Font, Page, View, Text, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';
import { fThaiBahtText } from 'src/utils/format-thai-baht-text';

// ----------------------------------------------------------------------

Font.register({
  family: 'LINE Seed Sans TH',
  fonts: [
    { src: '/fonts/LINESeedSansTH-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/LINESeedSansTH-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Thai is commonly written without spaces. Break at language-aware word boundaries
// instead of Unicode characters so combining vowels and tone marks stay with their glyph.
const thaiWordSegmenter = new Intl.Segmenter('th', { granularity: 'word' });
const textEndGuard = '\u00A0';
const glyphEndGuard = '\u200A';

Font.registerHyphenationCallback((word) =>
  Array.from(thaiWordSegmenter.segment(word), ({ segment }) => `${segment}${glyphEndGuard}`)
);

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'LINE Seed Sans TH',
    color: '#212B36',
  },
  row: { flexDirection: 'row' },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  h3: { fontSize: 16, fontWeight: 'bold' },
  h4: { fontSize: 12, fontWeight: 'bold' },
  subtitle: { fontSize: 9, color: '#637381' },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb24: { marginBottom: 24 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#E7EBF0', marginVertical: 16 },
  table: { display: 'flex', width: '98%', alignSelf: 'center' },
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
    paddingVertical: 6,
  },
  // Keep numeric headers wide enough for Thai labels; the columns add up to 100%.
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
  tableHeadText: { fontSize: 9, fontWeight: 'bold', lineHeight: 1.5 },
  totalsBox: { width: '41%', marginLeft: 'auto', marginTop: 12, paddingHorizontal: 4 },
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
  signatureSection: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '42%', alignItems: 'center' },
  signatureImageArea: { width: 150, height: 48 },
  signatureImage: { width: 150, height: 48, objectFit: 'contain' },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#637381',
    marginBottom: 8,
  },
  signatureText: { fontSize: 9, textAlign: 'center' },
  attachmentPage: {
    padding: 24,
    fontSize: 10,
    fontFamily: 'LINE Seed Sans TH',
    color: '#212B36',
  },
  attachmentImage: { width: '100%', height: '100%', objectFit: 'contain' },
});

type Props = {
  quotation: IQuotation;
  companyProfile?: ICompanyProfile | null;
  companyName?: string;
};

export function QuotationPdfDocument({
  quotation,
  companyProfile,
  companyName = 'MEE BUNKOON GALLERY',
}: Props) {
  const issuerName =
    companyProfile?.entityType === 'individual'
      ? companyProfile?.name
      : companyProfile?.storeNameTh || companyName;
  const issuerNameEn = companyProfile?.storeNameEn;
  const issuerContact = [
    companyProfile?.phone ? `โทร: ${companyProfile.phone}` : null,
    companyProfile?.email ? `อีเมล: ${companyProfile.email}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const issuerContactCustomer = [
    quotation?.customer?.phone ? `โทร: ${quotation.customer.phone}` : null,
    quotation?.customer?.email ? `อีเมล: ${quotation?.customer?.email}` : null,
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
                {companyProfile?.entityType === 'individual' ? 'ในนามบุคคล' : 'บริษัท'}
              </Text>
            </View>
          </View>

          <View>
            <Text style={[styles.h4, { textAlign: 'right' }]}>{quotation.quoteNo}</Text>
            <Text style={styles.subtitle}>ใบเสนอราคา / Quotation</Text>
            <Text style={styles.subtitle}>วันที่ออก : {fDate(quotation.issueDate)}</Text>
            {quotation.validUntil && (
              <Text style={styles.subtitle}>ยืนราคาถึง : {fDate(quotation.validUntil)}</Text>
            )}
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
            <Text style={[styles.tableHeadText, styles.mb4]}>เสนอราคาให้</Text>
            <Text style={styles.mb4}>{quotation.customer?.name}</Text>
            {quotation.customer?.contactPerson && (
              <Text style={styles.subtitle}>ผู้ติดต่อ: {quotation.customer.contactPerson}</Text>
            )}

            {!!issuerContactCustomer && (
              <Text style={styles.subtitle}>{issuerContactCustomer}</Text>
            )}
            {quotation.customer?.address && (
              <Text style={styles.subtitle}>ที่อยู่: {quotation.customer.address}</Text>
            )}
            {quotation.customer?.taxId && (
              <Text style={styles.subtitle}>เลขผู้เสียภาษี: {quotation.customer.taxId}</Text>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeadRow}>
            <Text style={[styles.colDescription, styles.tableHeadText]}>
              รายละเอียด{textEndGuard}
            </Text>
            <Text style={[styles.colUnit, styles.tableHeadText]}>หน่วย{textEndGuard}</Text>
            <Text style={[styles.colQty, styles.tableHeadText]}>จำนวน{textEndGuard}</Text>
            <Text style={[styles.colPrice, styles.tableHeadText]}>
              ราคาต่อหน่วย{textEndGuard}
            </Text>
            <Text style={[styles.colAmount, styles.tableHeadText]}>
              จำนวนเงิน{textEndGuard}
            </Text>
          </View>

          {quotation.items.map((item, index) => (
            <View key={item.id ?? index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}{textEndGuard}</Text>
              <Text style={styles.colUnit}>{item.unit || '-'}{textEndGuard}</Text>
              <Text style={styles.colQty}>{item.quantity}{textEndGuard}</Text>
              <Text style={styles.colPrice}>{fBaht(item.unitPrice)}{textEndGuard}</Text>
              <Text style={styles.colAmount}>{fBaht(item.amount)}{textEndGuard}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={[styles.subtitle, styles.totalsLabel]}>ยอดรวม{textEndGuard}</Text>
            <Text style={styles.totalsValue}>{fBaht(quotation.subtotal)}</Text>
          </View>

          {quotation.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={[styles.subtitle, styles.totalsLabel]}>ส่วนลด{textEndGuard}</Text>
              <Text style={styles.totalsValue}>-{fBaht(quotation.discount)}</Text>
            </View>
          )}

          {quotation.includeVat && (
            <View style={styles.totalsRow}>
              <Text style={[styles.subtitle, styles.totalsLabel]}>
                ภาษีมูลค่าเพิ่ม ({quotation.vatRate}%){textEndGuard}
              </Text>
              <Text style={styles.totalsValue}>{fBaht(quotation.vatAmount)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={[styles.h4, styles.totalsLabel]}>ยอดรวมสุทธิ{textEndGuard}</Text>
            <Text style={[styles.h4, styles.totalsValue]}>{fBaht(quotation.total)}</Text>
          </View>
        </View>

        <View style={styles.amountWordsRow} wrap={false}>
          <Text>จำนวนเงิน (Amount) {fThaiBahtText(quotation.total)}{textEndGuard}</Text>
        </View>

        {quotation.note && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>หมายเหตุ</Text>
            <Text style={styles.subtitle}>{quotation.note}</Text>
          </View>
        )}

        {quotation.paymentTerms && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>เงื่อนไขการชำระเงิน</Text>
            {quotation.paymentTerms
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, index) => (
                <Text key={index} style={[styles.subtitle, { marginBottom: 2 }]}>
                  • {line}
                </Text>
              ))}
          </View>
        )}

        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureImageArea}>
              {!!quotation.issuerSignatureUrl && (
                <Image src={quotation.issuerSignatureUrl} style={styles.signatureImage} />
              )}
            </View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>ลงชื่อผู้เสนอราคา</Text>
            <Text style={styles.subtitle}>{issuerName}</Text>
            <Text style={[styles.subtitle, { marginTop: 4 }]}>
              วันที่{' '}
              {quotation.issuerSignedAt ? fDate(quotation.issuerSignedAt) : '____ / ____ / ______'}
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureImageArea}>
              {!!quotation.customerSignatureUrl && (
                <Image src={quotation.customerSignatureUrl} style={styles.signatureImage} />
              )}
            </View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>ลงชื่อผู้รับข้อเสนอ</Text>
            <Text style={styles.subtitle}>{quotation.customer?.name || 'ลูกค้า'}</Text>
            <Text style={[styles.subtitle, { marginTop: 4 }]}>
              วันที่{' '}
              {quotation.customerSignedAt
                ? fDate(quotation.customerSignedAt)
                : '____ / ____ / ______'}
            </Text>
          </View>
        </View>
      </Page>

      {(quotation.attachmentImageUrls ?? []).map((imageUrl, index) => (
        <Page key={imageUrl} size="A4" style={styles.attachmentPage}>
          <Text style={[styles.h4, { marginBottom: 12 }]}>เอกสารเพิ่มเติม {index + 1}</Text>
          <View style={{ flexGrow: 1 }}>
            <Image src={imageUrl} style={styles.attachmentImage} />
          </View>
        </Page>
      ))}
    </Document>
  );
}
