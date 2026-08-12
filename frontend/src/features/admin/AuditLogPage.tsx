import { useState } from 'react'; import { format } from 'date-fns'; import { FileText, Download, Filter, ChevronDown, ChevronRight } from 'lucide-react'; import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, PageHeader, EmptyState } from '@/components'; 
import { useAuditLogs } from '@/hooks';
import { AUDIT_ACTIONS } from '@/constants';
import { getAuditActionClass } from '@/utils';
import { downloadAuditLog } from '@/api';

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
          <Button variant="outline" onClick={handleExport} disabled={exporting} id="export-audit-btn" className="border-border">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting…' : 'Export Excel'}
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-dark-muted" />
          <span className="text-sm text-neutral-sm font-medium">Filters</span>
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
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="space-y-px">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-neutral-subtle animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs" description="No activity found for the selected filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-subtle">
                  <th className="text-left px-4 py-3 text-neutral-sm font-medium w-8"></th>
                  <th className="text-left px-4 py-3 text-neutral-sm font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 text-neutral-sm font-medium">User</th>
                  <th className="text-left px-4 py-3 text-neutral-sm font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-neutral-sm font-medium">Entity Type</th>
                  <th className="text-left px-4 py-3 text-neutral-sm font-medium">Entity ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <>
                    <tr
                      key={log.id}
                      className="border-b border-border hover:bg-neutral-subtle cursor-pointer transition-colors"
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 text-dark-muted">
                        {expandedRow === log.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </td>
                      <td className="px-4 py-3 text-neutral-sm whitespace-nowrap">
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {log.user?.name || <span className="text-dark-muted italic">System</span>}
                        {log.user?.email && <div className="text-xs text-dark-muted">{log.user.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getAuditActionClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-md capitalize">{log.entityType}</td>
                      <td className="px-4 py-3 text-dark-muted font-mono text-xs truncate max-w-24">{log.entityId || '—'}</td>
                    </tr>
                    {expandedRow === log.id && (
                      <tr key={`${log.id}-expand`} className="bg-neutral-subtle border-b border-border">
                        <td colSpan={6} className="px-8 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-neutral-sm uppercase tracking-wide mb-1 font-semibold">Old Value</p>
                              <pre className="text-xs text-foreground bg-neutral-subtle rounded p-2 overflow-auto max-h-32 border border-border">
                                {log.oldValue ? JSON.stringify(log.oldValue, null, 2) : 'null'}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-sm uppercase tracking-wide mb-1 font-semibold">New Value</p>
                              <pre className="text-xs text-foreground bg-neutral-subtle rounded p-2 overflow-auto max-h-32 border border-border">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-neutral-sm">Page {filters.page} of {totalPages}</p>
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
