import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Download, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { downloadAuditLog } from '@/api/reports.api';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AUDIT_ACTIONS } from '@/constants/options';
import { getAuditActionClass } from '@/utils/iconUtils';

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', entityType: '', startDate: '', endDate: '', page: 1, limit: 20 });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const { auditLogs: logs, isLoading } = useAuditLogs(filters);
  const total = logs.length;
  const totalPages = Math.ceil(total / filters.limit) || 1;

  const handleExport = async () => {
    setExporting(true);
    try { await downloadAuditLog({ startDate: filters.startDate, endDate: filters.endDate, format: 'excel' }); }
    catch { }
    finally { setExporting(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        subtitle={`${total} total entries`}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={exporting} id="export-audit-btn" className="dark:border-white/10 border-slate-300">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting…' : 'Export Excel'}
          </Button>
        }
      />

      {/* Filters */}
      <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500 font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Action</Label>
            <Select value={filters.action} onValueChange={v => setFilters(f => ({ ...f, action: v === 'all' ? '' : v, page: 1 }))}>
              <SelectTrigger className="h-9" id="audit-action-filter">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {AUDIT_ACTIONS.map(a => <SelectItem key={a} value={a}>{a.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Entity Type</Label>
            <Input
              placeholder="e.g. project, team"
              value={filters.entityType}
              onChange={e => setFilters(f => ({ ...f, entityType: e.target.value, page: 1 }))}
              className="h-9"
              id="audit-entity-filter"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">From Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, page: 1 }))}
              className="h-9"
              id="audit-start-date"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, page: 1 }))}
              className="h-9"
              id="audit-end-date"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="space-y-px">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 dark:bg-white/5 bg-slate-100 animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs" description="No activity found for the selected filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-white/10 border-slate-200 dark:bg-white/5 bg-slate-50">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium w-8"></th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Entity Type</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Entity ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <>
                    <tr
                      key={log.id}
                      className="border-b dark:border-white/5 border-slate-100 dark:hover:bg-white/5 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 text-slate-400">
                        {expandedRow === log.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </td>
                      <td className="px-4 py-3 dark:text-gray-400 text-slate-500 whitespace-nowrap">
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3 dark:text-white text-slate-900 font-medium">
                        {log.user?.name || <span className="text-slate-400 italic">System</span>}
                        {log.user?.email && <div className="text-xs text-slate-400">{log.user.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getAuditActionClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300 text-slate-700 capitalize">{log.entityType}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs truncate max-w-24">{log.entityId || '—'}</td>
                    </tr>
                    {expandedRow === log.id && (
                      <tr key={`${log.id}-expand`} className="dark:bg-white/3 bg-slate-50 border-b dark:border-white/5 border-slate-100">
                        <td colSpan={6} className="px-8 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1 font-semibold">Old Value</p>
                              <pre className="text-xs dark:text-gray-300 text-slate-800 dark:bg-black/20 bg-slate-100 rounded p-2 overflow-auto max-h-32 border border-slate-200 dark:border-transparent">
                                {log.oldValue ? JSON.stringify(log.oldValue, null, 2) : 'null'}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1 font-semibold">New Value</p>
                              <pre className="text-xs dark:text-gray-300 text-slate-800 dark:bg-black/20 bg-slate-100 rounded p-2 overflow-auto max-h-32 border border-slate-200 dark:border-transparent">
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
          <div className="flex items-center justify-between px-4 py-3 border-t dark:border-white/10 border-slate-200">
            <p className="text-xs text-slate-500">Page {filters.page} of {totalPages}</p>
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
