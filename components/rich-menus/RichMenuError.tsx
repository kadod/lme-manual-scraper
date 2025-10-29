'use client';

import { Button } from '@/components/ui/button';

export function RichMenuError() {
  return (
    <div className="text-center py-12 bg-white rounded-lg border">
      <p className="text-red-500 mb-4">Failed to load rich menus</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
}
