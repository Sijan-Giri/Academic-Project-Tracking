import { useQuery } from '@tanstack/react-query'; 
import { unwrapList } from '@/utils';
import type { AuditLog } from '@/types';
import { api } from '@/api';

export function useAuditLogs(params?: Record<string, unknown>) {
  const { data: rawLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => (await api.get('/audit', { params })).data,
  });

  const auditLogs = unwrapList<AuditLog>(rawLogs);

  return {
    auditLogs,
    isLoading,
  };
}
