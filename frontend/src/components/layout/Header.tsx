import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { navItems } from './nav-items';

function currentPageLabel(pathname: string) {
  const exact = navItems.find((item) => (item.to === '/' ? pathname === '/' : pathname === item.to));
  if (exact) {
    return exact.label;
  }
  const closest = navItems.find((item) => item.to !== '/' && pathname.startsWith(item.to));
  return closest?.label ?? 'Dashboard';
}

export function Header() {
  const location = useLocation();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Vision Mapping</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPageLabel(location.pathname)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
