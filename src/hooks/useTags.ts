import useSWR from 'swr';
import { Tag } from '@/types/exercise';
import { getAllTags } from '@/lib/api-client';

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<Tag[]>(
    '/api/tags',
    getAllTags,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    tags: data || [],
    isLoading,
    error,
    mutate,
  };
}