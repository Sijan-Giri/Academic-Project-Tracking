export default function CommonFooter() {
  return (
    <footer className="border-t border-border/40 py-4 px-6 text-center text-xs text-muted-foreground bg-card/50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} Academic Project Tracking System (APTS). All rights reserved.</p>
        <p className="text-[11px]">Academic Project Management & Evaluation Platform</p>
      </div>
    </footer>
  );
}

export { CommonFooter };
