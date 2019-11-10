import { MenuBarSubItem } from './MenuBarSubItem';

export class MenuBarItem {
  public displayName:string;
  public routerLink:string;
  public iconName:string;
  public forRoles:string[];
  public subitems:MenuBarSubItem[];
}