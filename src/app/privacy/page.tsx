import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import RevealText from "@/components/RevealText";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How raoufrezouali.com handles analytics and contact data.",
};

async function getPrivacyContent() {
  const filePath = path.join(process.cwd(), 'src/data/privacy.md');
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

export default async function PrivacyPage() {
  const privacyContent = await getPrivacyContent();
  
  return (
    <article className="flex flex-col gap-14 py-16 sm:py-24">
      <RevealText
        as="h1"
        trigger="load"
        text="Privacy policy."
        accent={["policy."]}
        className="display text-[clamp(3rem,8vw,6rem)]"
      />
      
      <div className="prose dark:prose-invert">
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
      </div>
    </article>
  );
}