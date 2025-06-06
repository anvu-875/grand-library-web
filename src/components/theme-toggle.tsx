'use client';

import { useCallback, useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show the theme toggle after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <Button
        type='button'
        variant='outline'
        className='group/toggle h-8 w-8 px-0'
        disabled
      >
        <span className='sr-only'>Loading theme</span>
      </Button>
    );
  }

  return (
    <Button
      type='button'
      variant='outline'
      className='group/toggle h-8 w-8 px-0'
      onClick={toggleTheme}
    >
      {resolvedTheme === 'light' && <SunIcon />}
      {resolvedTheme === 'dark' && <MoonIcon />}
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
