/**
 * This file implements a *magic* catch-all route that renders the Puck editor.
 *
 * This route exposes /puck/[...slug], but is disabled by middleware.ts. The middleware
 * then rewrites all URL requests ending in `/edit` to this route, allowing you to visit any
 * page in your application and add /edit to the end to spin up a Puck editor.
 *
 * This approach enables public pages to be statically rendered whilst the /puck route can
 * remain dynamic.
 *
 * NB this route is public, and you will need to add authentication
 */

import '@measured/puck/puck.css';
import '@/styles/puck-overrides.css';
import { Client } from './client';
import { Metadata } from 'next';
import { env } from '@/lib/env';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;

  return {
    title: 'Puck: ' + path,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;
  const data = fetch(
    `${env.NEXT_PUBLIC_BASE_URL}/api/page-content?path=${path}`,
    { cache: 'no-store' }
  ).then((res) => res.json());

  return <Client path={path} data={data || {}} />;
}

export const dynamic = 'force-dynamic';
