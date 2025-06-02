import { Client } from './client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Data } from '@measured/puck';
import PageService from '@/service/page.service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;

  if (slug[0] == 'page-not-found') {
    return {
      title: 'Not found!',
      description: 'The page you are looking for does not exist.',
    };
  }

  const path = `/${slug.join('/')}`;
  const data = await PageService.getInstance().getPage(path);

  if (!data) {
    return {
      title: 'Not found!',
      description: 'The page you are looking for does not exist.',
    };
  }

  return {
    title: (data as Data)?.root?.props?.title,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;

  if (slug[0] == 'page-not-found') {
    return notFound();
  }

  const data = PageService.getInstance().getPage(path);

  return <Client data={data} />;
}

// Force Next.js to produce static pages: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
// Delete this if you need dynamic rendering, such as access to headers or cookies
// export const dynamic = 'force-static';
