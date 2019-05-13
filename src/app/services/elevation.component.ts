import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElevationService {
  
  constructor() {
    this.elevatedString || sessionStorage.setItem("elevated", "off");
  }

  get elevatedString(): string {
    return sessionStorage.getItem("elevated");
  }

  get elevatedBoolean(): boolean {
    return this.elevatedString=== "on";
  }

  flip() {
    sessionStorage.setItem("elevated", this.elevatedString === "on"? "off" : "on");
  }

}
