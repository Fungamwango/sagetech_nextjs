import type { Metadata } from "next";
import CodingClient from "@/components/coding/CodingClient";
import { getCodingTutorialContent } from "@/lib/codingTutorialContent";

export const metadata: Metadata = {
  title: "Coding Tutorials | Learn HTML, CSS and Sage.js | SageTech",
  description:
    "Learn web development with HTML, CSS, and Sage.js tutorials on a fully readable coding page built for study and search visibility.",
  openGraph: {
    title: "Coding Tutorials | Learn HTML, CSS and Sage.js | SageTech",
    description:
      "Learn web development with HTML, CSS, and Sage.js tutorials on SageTech.",
    images: [{ url: "/files/sagetech_icon.jpg" }],
  },
};

export default async function CodingPage() {
  const tutorialContent = await getCodingTutorialContent();
  return <CodingClient tutorialContent={tutorialContent} />;
}
