// https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/hooks/src/use-previous/use-previous.ts
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
