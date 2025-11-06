import { type LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => (
          <SidebarMenuButton
            key={index}
            tooltip={item.title}
            className={
              pathname.includes(item.url)
                ? 'bg-primary text-primary-foreground pointer-events-none'
                : 'cursor-pointer transition-all duration-200'
            }
            onClick={() => navigate(item.url)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
