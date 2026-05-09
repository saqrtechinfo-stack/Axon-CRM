// hooks/useFollowUpCount.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useFollowUpCount() {
  const { data = [] } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 60000,
  });

  return {
    count: data.length,
    hasUrgent: data.length > 0,
  };
}
