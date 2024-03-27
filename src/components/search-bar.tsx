'use client';

import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { trpc } from '@/trpc/client';
import debounce from 'lodash.debounce';
import { Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

type Props = {};

export default function SearchBar({}: Props) {
  const [input, setInput] = useState('');

  const router = useRouter();

  const commandRef = useRef<HTMLDivElement>(null);

  const { data: queryResults, refetch } = trpc.community.search.useQuery(
    {
      query: input,
    },
    { enabled: false }
  );

  useOnClickOutside(commandRef, () => {
    setInput('');
  });

  // Close searchbar if the path changes
  const pathname = usePathname();
  useEffect(() => {
    setInput('');
  }, [pathname]);

  const request = debounce(() => {
    refetch();
  }, 300);

  const debouncedRequest = useCallback(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Command
      ref={commandRef}
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debouncedRequest();
        }}
        className="outline-none border-none focus:outline-none focus:border-none ring-0"
        placeholder="Search communities..."
      />

      {input.length > 0 && (
        <CommandList className="absolute bg-white dark:bg-zinc-900 top-full inset-x-0 shadow rounded-b-md">
          {(queryResults?.communities.length ?? 0) === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {(queryResults?.communities.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResults?.communities.map((community) => (
                <CommandItem
                  key={community.id}
                  onSelect={(name) => {
                    router.push(`/r/${name}`);
                    router.refresh();
                  }}
                  value={community.name}
                >
                  <Users className="size-4 mr-2" />
                  <a href={`/r/${community.name}`}>r/{community.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  );
}
