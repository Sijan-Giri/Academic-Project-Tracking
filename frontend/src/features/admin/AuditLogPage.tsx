import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, Download, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { downloadAuditLog } from '@/api/reports.api';
import { api } from '@/api/client';

const AUDIT_ACTIONS = ['CREATE','UPDATE','DELETE','STATUS_CHANGE','LOGIN','LOGOUT','FILE_UPLOAD','MARKS_LOCK','MARKS_ENTRY'];

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-500/20 text-green-400',
  UPDATE: 'bg-blue-500/20 text-blue-400',
  DELETE: 'bg-red-500/20 text-red-400',
  STATUS_CHANGE: 'bg-yellow-500/20 text-yellow-400',
  LOGIN: 'bg-indigo-500/20 text-indigo-400',
  LOGOUT: 'bg-gray-500/20 text-gray-400',
  FILE_UPLOAD: 'bg-purple-500/20 text-purple-400',
  MARKS_LOCK: 'bg-orange-500/20 text-orange-400',
  MARKS_ENTRY: 'bg-teal-500/20 text-teal-400',
};

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', entityType: '', startDate: '', endDate: '', page: 1, limit: 20 });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['audit', filters],
    queryFn: () => api.get('/audit', { params: filters }).then(r => r.data),
  });

  const logs = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleExport = async () => {
    setExporting(true);
    try { await downloadAuditLog({ startDate: filters.startDate, endDate: filters.endDate, format: 'excel' }); }
    catch { }
    finally { setExporting(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle={`${total} total entries`}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={exporting} id="export-audit-btn">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting…' : 'Export Excel'}
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400 font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Action</Label>
            <Select value={filters.action} onValueChange={v => setFilters(f => ({ ...f, action: v === 'all' ? '' : v, page: 1 }))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-9" id="audit-action-filter">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                <SelectItem value="all" className="text-gray-300">All actions</SelectItem>
                {AUDIT_ACTIONS.map(a => <SelectItem key={a} value={a} className="text-gray-300">{a.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Entity Type</Label>
            <Input
              placeholder="e.g. project, team"
              value={filters.entityType}
              onChange={e => setFilters(f => ({ ...f, entityType: e.target.value, page: 1 }))}
              className="bg-white/5 border-white/10 text-white h-9"
              id="audit-entity-filter"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">From Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, page: 1 }))}
              className="bg-white/5 border-white/10 text-white h-9"
              id="audit-start-date"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">To Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, page: 1 }))}
              className="bg-white/5 border-white/10 text-white h-9"
              id="audit-end-date"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-white/5 animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs" description="No activity found for the selected filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium w-8"></th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Entity Type</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Entity ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <>
                    <tr
                      key={log.id}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {expandedRow === log.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {log.user?.name || <span className="text-gray-500 italic">System</span>}
                        {log.user?.email && <div className="text-xs text-gray-500">{log.user.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{log.entityType}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs truncate max-w-24">{log.entityId || '—'}</td>
                    </tr>
                    {expandedRow === log.id && (
                      <tr key={`${log.id}-expand`} className="bg-white/3 border-b border-white/5">
                        <td colSpan={6} className="px-8 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Old Value</p>
                              <pre className="text-xs text-gray-300 bg-black/20 rounded p-2 overflow-auto max-h-32">
                                {log.oldValue ? JSON.stringify(log.oldValue, null, 2) : 'null'}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">New Value</p>
                              <pre className="text-xs text-gray-300 bg-black/20 rounded p-2 overflow-auto max-h-32">
                                {log.newValue ? JSON.stringify(log.newValue, null, 2) : 'null'}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-xs text-gray-500">Page {filters.page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
