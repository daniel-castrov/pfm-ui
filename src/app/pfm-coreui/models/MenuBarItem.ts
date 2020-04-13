import { MenuBarSubItem } from './MenuBarSubItem';

export class MenuBarItem {
  displayName: string;
  routerLink: string;
  iconName: string;
  forRoles: string[];
  subitems: MenuBarSubItem[];
}
