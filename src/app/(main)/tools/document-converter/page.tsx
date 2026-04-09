import type { Metadata } from "next";

import DocumentConverterClient from "./DocumentConverterClient";

export const metadata: Metadata = {
  title: "Document Converter | Convert PDF, DOCX, TXT, ODT, RTF and More",
  description:
    "Convert real documents between PDF, DOCX, TXT, RTF, HTML, ODT, CSV, and JSON with SageTech Document Converter.",
  alternates: {
    canonical: "/tools/document-converter",
  },
  openGraph: {
    title: "Document Converter | Convert PDF, DOCX, TXT, ODT, RTF and More",
    description:
      "Convert real documents between PDF, DOCX, TXT, RTF, HTML, ODT, CSV, and JSON.",
    type: "website",
    url: "/tools/document-converter",
  },
};

export default function DocumentConverterPage() {
  return <DocumentConverterClient />;
}
