export class NewsItem {
  public title:string;
  public details:string;
  public priority:number;//1 to 10, or something like that - this will be used to determine the icon or color
  public createDate:Date;
}