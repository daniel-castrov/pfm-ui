import { ListItem } from '../pfm-common-models/ListItem';

export class ListItemHelper {
  static generateListItemFromArray(items: string[] | string[][], selectValue?: string): ListItem[] {
    if (items) {
      if (typeof items[0] === 'string') {
        return this.getItemsFromStringArray(items as string[], selectValue);
      } else {
        return this.getItemsFromMultDimArray(items as string[][], selectValue);
      }
    }
    return null;
  }

  private static getItemsFromStringArray(items: string[], selectValue?: string): ListItem[] {
    const li: ListItem[] = new Array<ListItem>();
    for (const elem of items) {
      const item: ListItem = new ListItem();
      item.id = elem;
      item.name = elem;
      item.value = elem;
      item.rawData = item.value;
      if (selectValue) {
        item.isSelected = elem === selectValue;
      }
      li.push(item);
    }
    return li;
  }

  private static getItemsFromMultDimArray(items: string[][], selectValue?: string): ListItem[] {
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
      item.rawData = item.value;
      if (selectValue) {
        item.isSelected = item.value === selectValue;
      }
      li.push(item);
    }
    return li;
  }
}
