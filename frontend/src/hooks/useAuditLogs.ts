import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { unwrapList } from '@/utils/apiUtils';
import type { AuditLog } from '@/types/system.types';

export function useAuditLogs(params?: Record<string, unknown>) {
  const { data: rawLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => (await api.get('/audit-logs', { params })).data,
  });

  const auditLogs = unwrapList<AuditLog>(rawLogs);

  return {
    auditLogs,
    isLoading,
  };
}
