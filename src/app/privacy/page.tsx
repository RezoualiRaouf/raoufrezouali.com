import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";

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
    <article className="mt-8 flex flex-col gap-8 pb-16">
      <h1 className="title">Privacy policy.</h1>
      
      <div className="prose dark:prose-invert">
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
      </div>
    </article>
  );
}