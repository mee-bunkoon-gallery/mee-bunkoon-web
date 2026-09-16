import type { IContract } from 'src/types/contract';
import type { ICompanyProfile } from 'src/types/settings';

import { Font, Page, View, Text, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fBaht } from 'src/utils/format-number';

import { CONTRACT_STATUS_META } from './contract-status';
import { renderClauseBodyPdf } from './contract-pdf-rich-text';
import {
  toClauseBodyHtml,
  parseContractClauses,
  resolveContractMentionHtml,
  buildContractMentionContext,
  resolveContractMentionTokens,
} from './contract-clauses';

// ----------------------------------------------------------------------

Font.register({
  family: 'LINE Seed Sans TH',
  fonts: [
    { src: '/fonts/LINESeedSansTH-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/LINESeedSansTH-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'LINE Seed Sans TH',
    color: '#212B36',
  },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  h3: { fontSize: 16, fontWeight: 'bold' },
  h4: { fontSize: 12, fontWeight: 'bold' },
  h5: { fontSize: 10 },
  subtitle: { fontSize: 9, color: '#637381' },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  tableHeadText: { fontSize: 9, fontWeight: 'bold' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  section: { marginTop: 16 },
  bodyText: { fontSize: 10, lineHeight: 1.5 },
  signatureBox: { width: '45%', alignItems: 'center' },
  signatureImageArea: { width: 150, height: 48, marginTop: 40 },
  signatureImage: { width: 150, height: 48, objectFit: 'contain' },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#212B36',
    marginBottom: 6,
  },
});

type Props = {
  contract: IContract;
  companyProfile?: ICompanyProfile | null;
  companyName?: string;
};

export function ContractPdfDocument({
  contract,
  companyProfile,
  companyName = 'MEE BUNKOON GALLERY',
}: Props) {
  const statusMeta = CONTRACT_STATUS_META[contract.status];
  const issuerName = companyProfile?.storeNameTh || companyProfile?.name || companyName;
  const issuerNameEn = companyProfile?.storeNameEn;

  const paymentLines = (contract.paymentTerms ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const clauses = parseContractClauses(contract.termsConditions);
  const mentionContext = buildContractMentionContext(contract, companyProfile);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.spaceBetween, styles.mb24]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!!companyProfile?.logoUrl && (
              <Image
                src={companyProfile.logoUrl}
                style={{ width: 50, height: 50, objectFit: 'contain', marginRight: 10 }}
              />
            )}
            <View>
              <Text style={styles.h3}>{issuerName}</Text>
              {!!issuerNameEn && <Text style={styles.subtitle}>{issuerNameEn}</Text>}
            </View>
          </View>
        </View>

        {!!contract.contractName && (
          <View style={styles.mb16}>
            <Text style={[styles.h4, { textAlign: 'center' }]}>{contract.contractName}</Text>
          </View>
        )}

        <View>
          <Text style={[styles.h5, { textAlign: 'right' }]}>สัญญาเลขที่ {contract.contractNo}</Text>
          {!!contract.quotation && (
            <Text style={[styles.subtitle, { textAlign: 'right' }]}>
              อ้างอิงใบเสนอราคาเลขที่ {contract.quotation.quoteNo} · มูลค่าสัญญา{' '}
              {fBaht(contract.totalAmount)}
            </Text>
          )}
          {/* <Text style={[styles.subtitle, { textAlign: 'right' }]}>สถานะ: {statusMeta.label}</Text> */}
        </View>

        {!!contract.scopeOfWork && (
          <View style={styles.section}>
            {/* <Text style={[styles.tableHeadText, styles.mb8]}>ขอบเขตงาน / รายละเอียดสัญญา</Text> */}
            {renderClauseBodyPdf(
              resolveContractMentionHtml(toClauseBodyHtml(contract.scopeOfWork), mentionContext),
              styles.bodyText
            )}
          </View>
        )}

        {/* <View style={styles.section}>
          <View style={styles.totalsRow}>
            <Text style={styles.h4}>มูลค่าสัญญา</Text>
            <Text style={styles.h4}>{fBaht(contract.totalAmount)}</Text>
          </View>
          {contract.depositAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.subtitle}>เงินมัดจำ</Text>
              <Text>{fBaht(contract.depositAmount)}</Text>
            </View>
          )}
        </View> */}

        {!!paymentLines.length && (
          <View style={styles.section}>
            {/* <Text style={[styles.tableHeadText, styles.mb8]}>เงื่อนไขการชำระเงิน</Text> */}
            {paymentLines.map((line, index) => (
              <Text key={index} style={[styles.bodyText, { marginBottom: 2 }]}>
                • {line}
              </Text>
            ))}
          </View>
        )}

        {!!clauses.length && (
          <View style={styles.section}>
            {/* <Text style={[styles.tableHeadText, styles.mb8]}>ข้อตกลงและเงื่อนไข</Text> */}
            {clauses.map((clause, index) => (
              <View key={clause.id} style={{ marginBottom: 6 }}>
                <Text style={[styles.bodyText, { fontWeight: 'bold', marginBottom: 2 }]}>
                  ข้อ {index + 1}
                  {clause.title
                    ? ` ${resolveContractMentionTokens(clause.title, mentionContext)}`
                    : ''}
                </Text>
                <View style={{ paddingLeft: 8 }}>
                  {renderClauseBodyPdf(
                    resolveContractMentionHtml(toClauseBodyHtml(clause.body), mentionContext),
                    styles.bodyText
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {contract.note && (
          <View style={styles.section}>
            <Text style={[styles.tableHeadText, styles.mb4]}>หมายเหตุ</Text>
            <Text style={styles.subtitle}>{contract.note}</Text>
          </View>
        )}

        <View style={[styles.spaceBetween, { marginTop: 8 }]} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureImageArea}>
              {!!contract.customerSignatureUrl && (
                <Image src={contract.customerSignatureUrl} style={styles.signatureImage} />
              )}
            </View>
            <View style={styles.signatureLine} />
            <Text style={{ textAlign: 'center' }}>ผู้ว่าจ้าง</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              ( {contract.customer?.name} )
            </Text>
            <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>
              วันที่ ....../....../..........
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureImageArea}>
              {!!contract.issuerSignatureUrl && (
                <Image src={contract.issuerSignatureUrl} style={styles.signatureImage} />
              )}
            </View>
            <View style={styles.signatureLine} />
            <Text style={{ textAlign: 'center' }}>ผู้รับจ้าง</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>( {issuerName} )</Text>
            <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>
              วันที่ ....../....../..........
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
