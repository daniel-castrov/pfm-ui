import { FileMetaData } from './FileMetaData';

export class Attachment {
  id: string;
  mpId: string;
  file: FileMetaData;

  // client side only - we can't send this to the service
  selectedForDelete: boolean;
}
