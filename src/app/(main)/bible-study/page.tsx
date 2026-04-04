import type { Metadata } from "next";
import BibleStudyClient from "@/components/bible/BibleStudyClient";
import { getBibleStudyContent } from "@/lib/bibleStudyContent";

export const metadata: Metadata = {
  title: "Bible Study | Stories, Key Points and Scripture Topics | SageTech",
  description:
    "Explore Bible study content, key scripture points, and major Bible stories in one searchable reading page on SageTech.",
  openGraph: {
    title: "Bible Study | Stories, Key Points and Scripture Topics | SageTech",
    description:
      "Explore Bible study content, key scripture points, and major Bible stories in one reading page on SageTech.",
    images: [{ url: "/files/sagetech_icon.jpg" }],
  },
};

export default async function BibleStudyPage() {
  const contentHtml = await getBibleStudyContent();
  return <BibleStudyClient contentHtml={contentHtml} />;
}
