"use client";

import dynamic from "next/dynamic";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

export { RelatorioDocument } from "./relatorios/document";

export const PDFViewer = dynamic(
  async () => await import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { loading: () => <>Loading...</> }
);

export const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button disabled>
        <Loader2 className="animate-spin" />
        Carregando...
      </Button>
    )
  }
)
