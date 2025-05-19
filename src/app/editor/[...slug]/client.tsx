'use client';

import type { Data } from '@measured/puck';
import { Button, Puck } from '@measured/puck';
import config from '@/lib/puck.config';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

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

Client.theme = 'light';
