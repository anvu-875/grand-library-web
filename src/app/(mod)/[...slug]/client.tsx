'use client';

import type { Data } from '@measured/puck';
import { Render } from '@measured/puck';
import config from '@/lib/puck.config';
import { use } from 'react';
import PNFBoundary from '@/lib/pnf-boundary';

export function Client({ data }: { data: Promise<Data> }) {
  const pdata = use(data);
  return (
    <PNFBoundary condition={(pdata as any).error == 'Page not found'}>
      <Render config={config} data={pdata} />
    </PNFBoundary>
  );
}
