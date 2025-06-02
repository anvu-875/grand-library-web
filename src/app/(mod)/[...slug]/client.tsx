'use client';

import type { Data } from '@measured/puck';
import { Render } from '@measured/puck';
import config from '@/lib/puck.config';
import { use } from 'react';
import PNFBoundary from '@/lib/pnf-boundary';

export function Client({ data }: { data: Promise<Partial<Data> | null> }) {
  const pdata = use(data);
  return (
    <PNFBoundary condition={!pdata}>
      <Render config={config} data={pdata!} />
    </PNFBoundary>
  );
}
