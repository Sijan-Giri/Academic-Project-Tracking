import os
import re

files_to_update = [
    "frontend/src/components/shared/ConfirmDialog.tsx",
    "frontend/src/components/shared/EmptyState.tsx",
    "frontend/src/components/shared/FileUploadZone.tsx",
    "frontend/src/components/shared/Header.tsx",
    "frontend/src/components/shared/NotificationDropdown.tsx",
    "frontend/src/components/shared/NotificationPanel.tsx",
    "frontend/src/components/shared/PageHeader.tsx",
    "frontend/src/components/shared/ProjectTimeline.tsx",
    "frontend/src/components/shared/Sidebar.tsx",
    "frontend/src/components/shared/SocketProvider.tsx",
    "frontend/src/components/shared/StatsCard.tsx",
    "frontend/src/components/shared/StatusBadge.tsx",
    "frontend/src/components/ui/alert-dialog.tsx",
    "frontend/src/components/ui/alert.tsx",
    "frontend/src/components/ui/avatar.tsx",
    "frontend/src/components/ui/badge.tsx",
    "frontend/src/components/ui/card.tsx",
    "frontend/src/components/ui/checkbox.tsx",
    "frontend/src/components/ui/dialog.tsx",
    "frontend/src/components/ui/dropdown-menu.tsx",
    "frontend/src/components/ui/form.tsx",
    "frontend/src/components/ui/input.tsx",
    "frontend/src/components/ui/label.tsx",
    "frontend/src/components/ui/popover.tsx",
    "frontend/src/components/ui/progress.tsx",
    "frontend/src/components/ui/radio-group.tsx",
    "frontend/src/components/ui/scroll-area.tsx",
    "frontend/src/components/ui/select.tsx",
    "frontend/src/components/ui/separator.tsx",
    "frontend/src/components/ui/skeleton.tsx",
    "frontend/src/components/ui/switch.tsx",
    "frontend/src/components/ui/table.tsx",
    "frontend/src/components/ui/tabs.tsx",
    "frontend/src/components/ui/textarea.tsx",
    "frontend/src/components/ui/tooltip.tsx",
    "frontend/src/constants/status.ts",
    "frontend/src/features/auth/LoginPage.tsx",
    "frontend/src/features/coordinator/ReviewStagesPage.tsx",
    "frontend/src/features/dashboard/StudentDashboard.tsx",
    "frontend/src/features/notifications/NotificationsPage.tsx",
    "frontend/src/features/student/MilestonesPage.tsx",
    "frontend/src/features/student/MyProjectPage.tsx",
    "frontend/src/features/student/MyTeamPage.tsx",
    "frontend/src/layouts/DashboardLayout.tsx",
    "frontend/src/main.tsx",
    "frontend/src/store/auth.store.ts"
]

base_dir = r"f:\Academic-Project-Tracking-System"

import_pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]@/lib/(?:utils|queryClient|socket|validators|constants)[\'"];?(?:\r?\n)?')
export_pattern = re.compile(r'export\s+\*\s+from\s+[\'"]@/lib/(?:utils|queryClient|socket|validators|constants)[\'"];?')

for rel_path in files_to_update:
    filepath = os.path.join(base_dir, rel_path)
    if not os.path.exists(filepath):
        if rel_path == "frontend/src/layouts/DashboardLayout.tsx":
            filepath = os.path.join(base_dir, "frontend/src/features/layouts/DashboardLayout.tsx")
        
        if not os.path.exists(filepath):
            print(f"Not found: {filepath}")
            continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    content = export_pattern.sub(r"export * from '@/lib';", content)

    matches = import_pattern.findall(content)
    if matches:
        all_imports = []
        for m in matches:
            all_imports.extend([item.strip() for item in m.split(',') if item.strip()])
        
        seen = set()
        unique_imports = []
        for imp in all_imports:
            if imp not in seen:
                seen.add(imp)
                unique_imports.append(imp)
                
        merged_import = f"import {{ {', '.join(unique_imports)} }} from '@/lib';\n"
        
        def replace_content():
            first_match = True
            def repl(match):
                nonlocal first_match
                if first_match:
                    first_match = False
                    return merged_import
                else:
                    return ""
            return import_pattern.sub(repl, content)
        
        content = replace_content()
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
