export class EventType {
  constructor(private name: string, private type: string, private topic: string, private description: string) {}

  getName(): string {
    return this.name;
  }

  getType(): string {
    return this.type;
  }

  getTopic(): string {
    return this.topic;
  }

  getDescripction(): string {
    return this.description;
  }
}
