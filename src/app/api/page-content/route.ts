import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { Data } from '@measured/puck';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  if (!path) {
    return new Response('Path parameter is required', { status: 400 });
  }

  const allData: Record<string, Data> | null = fs.existsSync('database.json')
    ? JSON.parse(fs.readFileSync('database.json', 'utf-8'))
    : null;
  const data = allData ? allData[path] : null;

  if (!data) {
    return new Response('Not found', { status: 404 });
  }

  await new Promise((res) => setTimeout(res, 3000));
  return Response.json(data);
}

export async function POST(request: Request) {
  const payload = await request.json();

  const existingData = JSON.parse(
    fs.existsSync('database.json')
      ? fs.readFileSync('database.json', 'utf-8')
      : '{}'
  );

  const updatedData = {
    ...existingData,
    [payload.path]: payload.data,
  };

  fs.writeFileSync('database.json', JSON.stringify(updatedData));

  // Purge Next.js cache
  revalidatePath(payload.path);

  return NextResponse.json({ status: 'ok' });
}
