
import { PDFViewer, RelatorioDocument } from "@/src/components/features/pdf";

export default function RelatorioPage() {
  return (
    <PDFViewer className="min-h-screen w-full">
      <RelatorioDocument />
    </PDFViewer>
  );
}
