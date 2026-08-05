// ─────────────────────────────────────────────────────────────────────────────
// utils/chartUtils.ts
// Recharts tooltip and axis style helpers.
// Extracted from copy-pasted contentStyle objects in all 3 dashboard files.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a consistent Recharts Tooltip contentStyle object for dark/light mode.
 * Usage: <Tooltip contentStyle={getChartTooltipStyle(isDark)} />
 */
export function getChartTooltipStyle(isDark: boolean): React.CSSProperties {
  return {
    backgroundColor: isDark ? '#11131c' : '#ffffff',
    border: isDark ? '1px solid #1e2333' : '1px solid #e2e8f0',
    color: isDark ? '#ffffff' : '#0f172a',
    borderRadius: '8px',
    fontSize: '12px',
  };
}

/**
 * Returns a consistent axis stroke color for Recharts XAxis/YAxis.
 * Usage: <XAxis stroke={getAxisStroke(isDark)} />
 */
export function getAxisStroke(isDark: boolean): string {
  return isDark ? '#94a3b8' : '#64748b';
}

/**
 * Returns a consistent cursor fill for bar/area charts on hover.
 * Usage: <Tooltip cursor={{ fill: getChartCursorFill(isDark) }} />
 */
export function getChartCursorFill(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
}
