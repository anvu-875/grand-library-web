import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import PageService from '@/service/page.service';

const pageService = PageService.getInstance();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  if (!path) {
    return new Response('Path parameter is required', { status: 400 });
  }

  const data = pageService.getPage(path);

  if (!data) {
    return new Response(JSON.stringify({ error: 'Page not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  await new Promise((res) => setTimeout(res, 3000));
  return Response.json(data);
}

export async function POST(request: Request) {
  const payload = await request.json();

  pageService.updatePage(payload.path, payload.data);

  // Purge Next.js cache
  revalidatePath(payload.path);

  revalidateTag('page_title');

  return NextResponse.json({
    status: 'ok',
    message: 'Page content updated successfully',
    path: payload.path,
  });
}
