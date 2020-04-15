import { ListItem } from '../pfm-common-models/ListItem';

export class ListItemHelper {
  static generateListItemFromArray(items: string[] | string[][]): ListItem[] {
    if (items) {
      if (typeof items[0] === 'string') {
        return this.getItemsFromStringArray(items as string[]);
      } else {
        return this.getItemsFromMultDimArray(items as string[][]);
      }
    }
    return null;
  }

  private static getItemsFromStringArray(items: string[]): ListItem[] {
    const li: ListItem[] = new Array<ListItem>();
    for (const elem of items) {
      const item: ListItem = new ListItem();
      item.id = elem;
      item.name = elem;
      item.value = elem;
      li.push(item);
    }
    return li;
  }

  private static getItemsFromMultDimArray(items: string[][]): ListItem[] {
    const li: ListItem[] = new Array<ListItem>();
    for (const elem of items) {
      const item: ListItem = new ListItem();
      if (elem.length > 2) {
        item.name = elem[0];
        item.value = elem[1];
        item.id = elem[2];
      } else {
        item.name = elem[0];
        item.value = elem[1];
      }
      li.push(item);
    }
    return li;
  }
}
