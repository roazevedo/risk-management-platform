import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export const RelatorioDocument = () => {
  return (
    <Document
      title="Relatório de Riscos"
      author="Controladora de Riscos"
    >
      <Page size="A4">
        <View>
          <Text>Relatório de Riscos</Text>
        </View>
      </Page>
    </Document>
  );
}
