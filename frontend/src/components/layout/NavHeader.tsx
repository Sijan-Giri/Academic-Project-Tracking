import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { NAV_ITEMS } from '@/constants';
import type { Role } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib';

export default function NavHeader() {
  const { user } = useAuthStore();
  const allowedItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role as Role));

  return (
    <div className="border-b border-border mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <ul className="flex items-center gap-2 list-none p-0 m-0 py-2 px-1">
          {allowedItems.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-brand-subtle text-brand border border-brand/20 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export { NavHeader };
