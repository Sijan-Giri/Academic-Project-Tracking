import type { Role } from '@/types';
import { NAV_ITEMS } from '@/constants';

export function hasRouteAccess(pathname: string, userRole?: Role | string | null): boolean {
  if (!userRole) return false;
  const matched = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  if (!matched) return true;
  return matched.roles.includes(userRole as Role);
}

export default hasRouteAccess;
