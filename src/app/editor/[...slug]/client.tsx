'use client';

import type { Data } from '@measured/puck';
import { Puck } from '@measured/puck';
import config from '@/lib/puck.config';

export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  return (
    <Puck
      config={config}
      data={data}
      onPublish={async (data) => {
        await fetch('/editor/api', {
          method: 'post',
          body: JSON.stringify({ data, path }),
        });
      }}
      overrides={{
        headerActions: ({ children }) => (
          <>
            <button>Click me</button>
            {children}
          </>
        ),
      }}
    />
  );
}
