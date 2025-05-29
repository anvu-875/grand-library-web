'use client';

import type { Data } from '@measured/puck';
import { Button, Puck } from '@measured/puck';
import config from '@/lib/puck.config';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';
import { use } from 'react';

export function Client({
  path,
  data,
}: {
  path: string;
  data: Promise<Partial<Data> | null>;
}) {
  const pdata = use(data);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  return (
    <Puck
      config={config}
      data={pdata || {}}
      onPublish={async (data) => {
        await fetch('/api/page-content', {
          method: 'post',
          body: JSON.stringify({ data, path }),
        });
        router.refresh();
      }}
      overrides={{
        iframe: ({ children, document }) => {
          if (document && resolvedTheme) {
            document.documentElement.setAttribute(
              'style',
              `color-scheme: ${resolvedTheme}`
            );
            document.documentElement.setAttribute('class', `${resolvedTheme}`);
          }
          return <main className='border-none'>{children}</main>;
        },
        headerActions: ({ children }) => (
          <>
            {children}
            <Button
              icon={<Eye className='size-3.75' />}
              onClick={() => router.push(path)}
            >
              View page
            </Button>
            <ThemeToggle />
          </>
        ),
      }}
    />
  );
}
