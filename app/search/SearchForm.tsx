"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdvancedSearchInput } from "@/components/AdvancedSearchInput";

interface SearchFormProps {
  initialQuery: string;
}

export function SearchForm({ initialQuery }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSubmit = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router]
  );

  return (
    <div className="mt-4 max-w-xl">
      <AdvancedSearchInput
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        defaultValue={initialQuery}
        className="w-full"
        aria-label="Search movies and TV shows"
      />
    </div>
  );
}
