import { FileMetaData } from './FileMetaData';

export class Attachment {
  public id:string;
  public mpId:string;
  public file:FileMetaData;

  //client side only - we can't send this to the service
  public selectedForDelete:boolean;
}