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
import PageService from '@/service/page.service';

const pageService = PageService.getInstance();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;

  return {
    title: path,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug = [] } = await params;
  const path = `/${slug.join('/')}`;

  const dataPromise = pageService.getPage(path);

  return <Client path={path} data={dataPromise} />;
}

export const dynamic = 'force-dynamic';
