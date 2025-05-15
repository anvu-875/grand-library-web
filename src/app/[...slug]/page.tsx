import { Client } from './client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPage } from '../../lib/get-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;

  return {
    title: getPage(path)?.root.props?.title,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;
  const data = getPage(path);

  if (!data) {
    return notFound();
  }

  return <Client data={data} />;
}

// Force Next.js to produce static pages: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
// Delete this if you need dynamic rendering, such as access to headers or cookies
export const dynamic = 'force-static';
