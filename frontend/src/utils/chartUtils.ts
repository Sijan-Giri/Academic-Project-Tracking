
export function getChartTooltipStyle(isDark: boolean): React.CSSProperties {
  return {
    backgroundColor: isDark ? '#11131c' : '#ffffff',
    border: isDark ? '1px solid #1e2333' : '1px solid #e2e8f0',
    color: isDark ? '#ffffff' : '#0f172a',
    borderRadius: '8px',
    fontSize: '12px',
  };
}

export function getAxisStroke(isDark: boolean): string {
  return isDark ? '#94a3b8' : '#64748b';
}

export function getChartCursorFill(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
}
