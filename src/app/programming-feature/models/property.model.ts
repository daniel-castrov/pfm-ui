import { PropertyType } from './enumerations/property-type.model';

export class Property<T> {
  id: string;
  type: PropertyType;
  containerId: string;
  value: T;
  active: boolean;
}
