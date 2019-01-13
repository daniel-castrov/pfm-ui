import {Program} from "../generated";

export class NameUtils {

  static getParentName(fullName: string): string {
    return fullName.substring(0, fullName.lastIndexOf("/"));
  }

  /**
   * Creates a shortname from a prent program and a child name
   * @param reference can be null or undefined
   * @param value
   */
  static createShortName(parent: Program, childName: string): string {
    if(parent) {
      return parent.shortName + "/" + childName;
    } else {
      return childName;
    }
  }

  static urlEncode(shortname: string): string {
    // flawn algo: '//' is encoded as 'slashslash' which will be decoded to 'slash'; Hopefully we will never be encoding '//';
    return shortname.replace('slash','slashslash').replace('/','slash')
  }
}
