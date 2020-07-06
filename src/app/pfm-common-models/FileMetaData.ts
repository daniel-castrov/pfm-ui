export class FileMetaData {
  id: string;
  name: string;
  nickName: string;
  contentType: string;
  size: number;
  file?: Blob;

  created: Date;
  modified: Date;
  modifiedBy: string;
  createdBy: string;
}
