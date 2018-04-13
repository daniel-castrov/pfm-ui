export abstract class Request {
  protected constructor(readonly requestId: string, 
                        readonly name: string, 
                        readonly date: string, 
                        readonly service: any) {
  }

  abstract get link(): string;
  abstract get type(): string;
  abstract get approveRequestsPageType(): string;

  approve(): Promise<any> {
    return this.service.status("\"APPROVED\"", this.requestId).toPromise();
  }

  deny(): Promise<any> {
    return this.service.status("\"DENIED\"", this.requestId).toPromise();
  }
}