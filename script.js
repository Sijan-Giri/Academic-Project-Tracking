const fs = require('fs');
const path = require('path');

const mappings = [
  { from: /text-indigo-600 dark:text-indigo-400/g, to: 'text-brand' },
  { from: /text-indigo-700 dark:text-indigo-300/g, to: 'text-brand' },
  { from: /text-indigo-300/g, to: 'text-brand' },
  { from: /text-indigo-400/g, to: 'text-brand' },
  { from: /text-indigo-500/g, to: 'text-brand' },
  { from: /bg-indigo-50 dark:bg-indigo-500\/15/g, to: 'bg-brand-subtle' },
  { from: /bg-indigo-500\/10/g, to: 'bg-brand-subtle' },
  { from: /bg-indigo-500\/20/g, to: 'bg-brand-subtle' },
  { from: /bg-indigo-100/g, to: 'bg-brand-subtle' },
  { from: /border-indigo-200 dark:border-indigo-500\/30/g, to: 'border-brand' },
  { from: /border-indigo-500\/20/g, to: 'border-brand' },
  { from: /border-indigo-600 dark:border-indigo-500/g, to: 'border-brand-strong' },
  { from: /hover:border-indigo-500\/40/g, to: 'hover:border-brand' },
  { from: /hover:border-indigo-500\/50/g, to: 'hover:border-brand' },
  { from: /bg-indigo-600 hover:bg-indigo-700 text-white/g, to: 'gradient-brand gradient-brand-hover text-white' },
  { from: /text-emerald-600 dark:text-emerald-400/g, to: 'text-success' },
  { from: /text-emerald-700 dark:text-emerald-300/g, to: 'text-success-md' },
  { from: /text-emerald-400/g, to: 'text-success' },
  { from: /bg-emerald-50 dark:bg-emerald-500\/15/g, to: 'bg-success-subtle' },
  { from: /(?<!-)bg-emerald-400/g, to: 'bg-success-subtle' },
  { from: /border-emerald-200 dark:border-emerald-500\/30/g, to: 'border-success' },
  { from: /text-amber-600 dark:text-amber-400/g, to: 'text-warning' },
  { from: /text-amber-700 dark:text-amber-300/g, to: 'text-warning-md' },
  { from: /text-amber-800 dark:text-amber-300/g, to: 'text-warning-md' },
  { from: /text-amber-300/g, to: 'text-warning' },
  { from: /text-amber-400/g, to: 'text-warning' },
  { from: /bg-amber-50 dark:bg-amber-500\/15/g, to: 'bg-warning-subtle' },
  { from: /border-amber-200 dark:border-amber-500\/30/g, to: 'border-warning' },
  { from: /text-rose-600 dark:text-rose-400/g, to: 'text-danger' },
  { from: /text-rose-700 dark:text-rose-300/g, to: 'text-danger-md' },
  { from: /text-red-500/g, to: 'text-danger' },
  { from: /text-rose-400/g, to: 'text-danger' },
  { from: /bg-rose-50 dark:bg-rose-500\/15/g, to: 'bg-danger-subtle' },
  { from: /border-rose-200 dark:border-rose-500\/30/g, to: 'border-danger' },
  { from: /bg-rose-600 hover:bg-rose-700 text-white/g, to: 'bg-danger-solid text-white' },
  { from: /text-slate-400/g, to: 'text-dark-muted' },
  { from: /text-gray-400/g, to: 'text-dark-muted' },
  { from: /text-slate-500 dark:text-slate-400/g, to: 'text-neutral-sm' },
  { from: /dark:text-slate-400 text-slate-500/g, to: 'text-neutral-sm' },
  { from: /text-slate-700 dark:text-slate-300/g, to: 'text-neutral-md' },
  { from: /dark:text-slate-300 text-slate-800/g, to: 'text-neutral-md' },
  { from: /dark:text-slate-200 text-slate-800/g, to: 'text-neutral-md' },
  { from: /text-slate-800/g, to: 'text-foreground' },
  { from: /dark:text-slate-400 text-slate-600/g, to: 'text-neutral-sm' },
  { from: /bg-slate-100/g, to: 'bg-neutral-subtle' },
  { from: /bg-slate-200/g, to: 'bg-neutral-subtle' },
  { from: /text-purple-600 dark:text-purple-400/g, to: 'text-purple' },
  { from: /bg-purple-500\/15/g, to: 'bg-purple-subtle' },
  { from: /bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600/g, to: 'gradient-text-brand' },
  { from: /bg-gradient-to-r from-indigo-500 to-violet-600/g, to: 'gradient-brand' },
  { from: /hover:from-indigo-600 hover:to-violet-700/g, to: 'gradient-brand-hover' },
  { from: /bg-indigo-50\/50 dark:bg-indigo-500\/10 border-indigo-200 dark:border-indigo-500\/30 border-l-indigo-600 dark:border-l-indigo-500/g, to: 'bg-brand-subtle border-brand border-l-[theme(colors.indigo.600)] dark:border-l-[theme(colors.indigo.500)]' },
  
  // Custom tweaks based on variations found in files
  { from: /text-rose-700 dark:text-rose-400/g, to: 'text-danger-md' },
  { from: /text-rose-800 dark:text-rose-300/g, to: 'text-danger-md' },
  { from: /border-rose-200/g, to: 'border-danger' },
  { from: /bg-rose-50 dark:bg-rose-500\/10/g, to: 'bg-danger-subtle' },
  { from: /text-indigo-600 dark:text-indigo-300/g, to: 'text-brand' },
  { from: /text-red-600 dark:text-red-400/g, to: 'text-danger' },
  { from: /text-rose-600/g, to: 'text-danger' },
  { from: /bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent/g, to: 'gradient-text-brand' },
  { from: /bg-rose-50\/50/g, to: 'bg-danger-subtle' },
  { from: /bg-indigo-600\/10 dark:bg-indigo-500\/15/g, to: 'bg-brand-subtle' },
  { from: /border-indigo-500\/30/g, to: 'border-brand' },
  { from: /bg-indigo-500\/5/g, to: 'bg-brand-subtle' },
  { from: /bg-amber-50 dark:bg-amber-500\/10/g, to: 'bg-warning-subtle' },
  { from: /border-amber-200 dark:border-amber-500\/20/g, to: 'border-warning' },
  { from: /text-amber-900 dark:text-amber-300/g, to: 'text-warning-md' },
  { from: /bg-amber-600 hover:bg-amber-700 text-white/g, to: 'bg-warning-solid text-white' }, // Not strictly in list, but implied
  { from: /bg-indigo-50 dark:bg-indigo-500\/10/g, to: 'bg-brand-subtle' },
  { from: /border-indigo-200 dark:border-indigo-500\/20/g, to: 'border-brand' },
  { from: /text-indigo-900 dark:text-indigo-300/g, to: 'text-brand' },
  { from: /bg-emerald-50 dark:bg-emerald-500\/10/g, to: 'bg-success-subtle' },
  { from: /border-emerald-200 dark:border-emerald-500\/20/g, to: 'border-success' },
  { from: /text-emerald-900 dark:text-emerald-300/g, to: 'text-success-md' },
  { from: /dark:bg-indigo-500\/10 bg-indigo-200\/40/g, to: 'bg-brand-subtle' },
  { from: /dark:bg-violet-500\/10 bg-violet-200\/40/g, to: 'bg-purple-subtle' },
];

const files = [
  'f:/Academic-Project-Tracking-System/frontend/src/features/evaluations/EvaluationFormPage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/evaluations/MySchedulesPage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/profile/ProfilePage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/reports/ReportsPage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/reports/FormatSelector.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/student/AbstractPage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/student/CreateProjectPage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/student/MilestonesPage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/student/SubmissionsPage.tsx',
  'f:/Academic-Project-Tracking-System/frontend/src/features/NotFoundPage.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const { from, to } of mappings) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed', file);
}
