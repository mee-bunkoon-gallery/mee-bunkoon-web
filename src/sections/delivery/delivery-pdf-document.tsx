import type { IDelivery } from 'src/types/delivery';
import type { ICompanyProfile } from 'src/types/settings';

import { Font, Page, View, Text, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';

import { DELIVERY_STATUS_META, DELIVERY_METHOD_LABEL } from './delivery-status';

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
  subtitle: { fontSize: 9, color: '#637381' },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb24: { marginBottom: 24 },
  tableHeadText: { fontSize: 9, fontWeight: 'bold' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  section: { marginTop: 16 },
  bodyText: { fontSize: 10, lineHeight: 1.5 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  imageGridItem: { width: '23.5%', marginRight: '2%', marginBottom: 8 },
  imageGridPhoto: { width: '100%', height: 90, objectFit: 'cover' },
  signatureBox: { width: '45%' },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#212B36',
    marginTop: 40,
    marginBottom: 6,
  },
});

type Props = {
  delivery: IDelivery;
  companyProfile?: ICompanyProfile | null;
  companyName?: string;
};

export function DeliveryPdfDocument({
  delivery,
  companyProfile,
  companyName = 'MEE BUNKOON GALLERY',
}: Props) {
  const statusMeta = DELIVERY_STATUS_META[delivery.status];
  const issuerName = companyProfile?.storeNameTh || companyProfile?.name || companyName;
  const issuerNameEn = companyProfile?.storeNameEn;
  const issuerContact = [
    companyProfile?.phone ? `โทร: ${companyProfile.phone}` : null,
    companyProfile?.email ? `อีเมล: ${companyProfile.email}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const itemLines = (delivery.itemsDelivered ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.spaceBetween, styles.mb24]}>
          <View>
            <Text style={styles.h3}>{issuerName}</Text>
            {!!issuerNameEn && <Text style={styles.subtitle}>{issuerNameEn}</Text>}
            <Text style={styles.subtitle}>เอกสารส่งมอบงาน / Delivery Note</Text>
          </View>

          <View>
            <Text style={[styles.h4, { textAlign: 'right' }]}>{delivery.deliveryNo}</Text>
            <Text style={[styles.subtitle, { textAlign: 'right' }]}>สถานะ: {statusMeta.label}</Text>
          </View>
        </View>

        <View style={[styles.spaceBetween, styles.mb24]}>
          <View style={{ width: '31%' }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>ผู้ส่งมอบ</Text>
            <Text style={styles.mb4}>{issuerName}</Text>
            {!!issuerContact && <Text style={styles.subtitle}>{issuerContact}</Text>}
          </View>

          <View style={{ width: '31%' }}>
            <Text style={[styles.tableHeadText, styles.mb4]}>ผู้รับมอบ</Text>
            <Text style={styles.mb4}>{delivery.customer?.name}</Text>
            {delivery.customer?.phone && (
              <Text style={styles.subtitle}>โทร: {delivery.customer.phone}</Text>
            )}
          </View>

          <View style={{ width: '31%' }}>
            <View style={styles.totalsRow}>
              <Text style={styles.subtitle}>วันที่ส่งมอบ</Text>
              <Text>{fDate(delivery.deliveryDate)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.subtitle}>วิธีส่งมอบ</Text>
              <Text>{DELIVERY_METHOD_LABEL[delivery.deliveryMethod]}</Text>
            </View>
          </View>
        </View>

        {!!itemLines.length && (
          <View style={styles.section}>
            <Text style={[styles.tableHeadText, styles.mb8]}>รายการที่ส่งมอบ</Text>
            {itemLines.map((line, index) => (
              <Text key={index} style={[styles.bodyText, { marginBottom: 2 }]}>
                • {line}
              </Text>
            ))}
          </View>
        )}

        {!!delivery.imageUrls.length && (
          <View style={styles.section} wrap={false}>
            <Text style={[styles.tableHeadText, styles.mb8]}>ภาพประกอบการส่งมอบงาน</Text>
            <View style={styles.imageGrid}>
              {delivery.imageUrls.map((url, index) => (
                <View key={index} style={styles.imageGridItem}>
                  <Image src={url} style={styles.imageGridPhoto} />
                </View>
              ))}
            </View>
          </View>
        )}

        {delivery.note && (
          <View style={styles.section}>
            <Text style={[styles.tableHeadText, styles.mb4]}>หมายเหตุ</Text>
            <Text style={styles.subtitle}>{delivery.note}</Text>
          </View>
        )}

        <View style={[styles.spaceBetween, { marginTop: 48 }]}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={{ textAlign: 'center' }}>ผู้ส่งมอบ</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>( {issuerName} )</Text>
            <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>
              วันที่ ....../....../..........
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={{ textAlign: 'center' }}>ผู้รับมอบ</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              ( {delivery.customer?.name} )
            </Text>
            <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>
              วันที่ ....../....../..........
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
