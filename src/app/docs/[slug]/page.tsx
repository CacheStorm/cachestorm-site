import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { docLinks, COMMIT, SOURCE } from "@/lib/site";
import { readDoc } from "@/lib/docs";
import { Markdown } from "@/components/markdown";
export const dynamicParams = false;
export function generateStaticParams() {
  return [...docLinks.map((d) => ({ slug: d.slug })), { slug: "api" }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = slug === "api" ? "http-api" : slug;
  const doc = docLinks.find((d) => d.slug === canonicalSlug);
  return {
    title: doc?.title,
    description: doc?.description,
    alternates: { canonical: `/docs/${canonicalSlug}/` },
  };
}
export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const canonicalSlug = slug === "api" ? "http-api" : slug;
  const doc = readDoc(canonicalSlug);
  if (!doc) notFound();
  const i = docLinks.findIndex((d) => d.slug === canonicalSlug);
  const prev = docLinks[i - 1],
    next = docLinks[i + 1];
  return (
    <article className="doc-content">
      <div className="doc-breadcrumb">
        <Link href="/docs/">Documentation</Link>
        <ChevronRight size={12} />
        {doc.group}
      </div>
      <h1>{doc.title}</h1>
      <p className="doc-description">{doc.description}</p>
      <div className="doc-source">
        <span>Source snapshot: {COMMIT.slice(0, 7)}</span>
        <span>·</span>
        <a href={SOURCE} target="_blank" rel="noreferrer">
          View upstream source ↗
        </a>
      </div>
      <Markdown>{doc.body}</Markdown>
      <nav className="doc-pagination" aria-label="Adjacent documentation">
        {prev ? (
          <Link href={`/docs/${prev.slug}/`}>
            <ArrowLeft size={16} />
            <span>
              <small>Previous</small>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/docs/${next.slug}/`}>
            <span>
              <small>Next</small>
              {next.title}
            </span>
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link href="/docs/commands/">
            Command reference
            <ArrowRight size={16} />
          </Link>
        )}
      </nav>
    </article>
  );
}
