'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export default function CloseModal() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="secondary"
      className="size-6 p-0 rounded-md"
      aria-label="Close modal"
    >
      <X className="size-4" />
    </Button>
  );
}
