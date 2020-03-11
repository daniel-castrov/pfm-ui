import { Action } from 'src/app/pfm-common-models/Action';

export class NewsItem {
  id: string;
  title: string;
  text: string;
  order: number;// 1 to 10, or something like that - this will be used to determine the icon or color
  begin: Date;
  end: Date;
  active: boolean;
  createDate: Date;

  // client side only
  isDisabled: boolean;
  actions: Action;
}
