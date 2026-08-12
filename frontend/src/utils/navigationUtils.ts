import { ROUTES } from '@/constants';
import type { User } from '@/types/user.types';

export function getPageTitle(
  pathname: string,
  user?: User | null,
  currentProjectTitle?: string,
  currentTeamName?: string
): string {
  if (pathname === '/dashboard') {
    return user?.name ? `${user.name}'s Dashboard` : 'Dashboard';
  }
  if (pathname === '/my-project' || pathname.startsWith('/my-project/')) {
    if (pathname === ROUTES.MY_PROJECT_ABSTRACT) return 'Project Abstract Proposal';
    if (pathname === ROUTES.MY_PROJECT_MILESTONES) return 'Milestone Deliverables';
    if (pathname === ROUTES.MY_PROJECT_SUBMISSIONS) return 'Submission History';
    if (pathname === ROUTES.MY_PROJECT_CREATE) return 'Create Project Proposal';
    return currentProjectTitle ? currentProjectTitle : 'My Capstone Project';
  }
  if (pathname === ROUTES.MY_TEAM) {
    return currentTeamName ? `Team ${currentTeamName}` : 'Team Roster';
  }
  if (pathname.includes(ROUTES.COORDINATOR_PROJECTS)) return 'Academic Projects';

  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return 'Dashboard';

  return last
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
