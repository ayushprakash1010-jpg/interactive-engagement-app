import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './events-api';

export interface WorkspaceOverview {
  totalEvents: number;
  draftCount: number;
  completedCount: number;
  liveCount: number;
  totalParticipants: number;
  totalResponses: number;
  aiUsage: number;
}

export function useOverviewStats() {
  const { data, error, isLoading, refetch } = useQuery<WorkspaceOverview>({
    queryKey: ['workspace', 'overview'],
    queryFn: () => apiFetch('workspace/overview'),
    refetchInterval: 10000, // refresh every 10 seconds to keep live metrics up to date
  });

  return {
    overview: data,
    isLoading,
    isError: error,
    mutate: refetch,
  };
}
