export class Request {
    requestId: string;
    name: string;
    date: string;
    link: string;
    type: string;
  
    constructor(id: string, n:string, d: string, l: string, t: string) {
      this.requestId = id;
      this.name = n;
      this.date = d;
      this.link = l;
      this.type = t;
    }
  
  }