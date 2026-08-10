import React from 'react';
import {
  LayoutGrid,
  Users,
  Palette,
  MessageCircle,
  Briefcase,
  Code,
  ListTodo,
  ShoppingCart,
  Mail,
  Globe,
  Handshake,
  Share2,
} from 'lucide-react';

const iconClass = 'w-5 h-5';

export const APP_ICON_MAP: Record<string, React.ReactNode> = {
  LayoutGrid: <LayoutGrid className={iconClass} />,
  Users: <Users className={iconClass} />,
  Palette: <Palette className={iconClass} />,
  MessageCircle: <MessageCircle className={iconClass} />,
  Briefcase: <Briefcase className={iconClass} />,
  Code: <Code className={iconClass} />,
  ListTodo: <ListTodo className={iconClass} />,
  ShoppingCart: <ShoppingCart className={iconClass} />,
  Mail: <Mail className={iconClass} />,
  Globe: <Globe className={iconClass} />,
  Handshake: <Handshake className={iconClass} />,
  Share2: <Share2 className={iconClass} />,
};

export function getAppIcon(iconKey: string): React.ReactNode {
  return APP_ICON_MAP[iconKey] ?? <LayoutGrid className={iconClass} />;
}
