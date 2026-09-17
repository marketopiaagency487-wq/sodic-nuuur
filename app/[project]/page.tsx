import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "../ui";
import { PROJECTS, getProject } from "../lib/site";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ project: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ project: string }> }
): Promise<Metadata> {
  const { project } = await params;
  const p = getProject(project);
  if (!p) return {};
  const price = p.priceFrom ? ` أسعار تبدأ من ${p.priceFrom} جنيه.` : "";
  const pay = p.down ? ` مقدم ${p.down} وتقسيط حتى ${p.years}.` : "";
  return {
    title: `${p.name} | ${p.en} — ${p.city}`,
    description: `${p.headline}.${price}${pay} ${p.loc}. عرض من وكيل مبيعات معتمد لدى سوديك — لسنا الشركة المطوّرة.`,
    alternates: { canonical: `/${p.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ project: string }> }) {
  const { project } = await params;
  if (!getProject(project)) notFound();
  return <ProjectPage slug={project} />;
}
