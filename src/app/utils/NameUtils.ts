
export class NameUtils {

  static getUrlEncodedParentName(fullName: string): string {
    return this.urlEncode(this.getParentName(fullName));
  }

  static getParentName(fullName: string): string {
    return fullName.substring(0, fullName.lastIndexOf("/"));
  }

  static hasParent(fullName: string): boolean {
    return fullName.lastIndexOf("/") != -1;
  }

  static getChildName(fullName: string): string {
    return fullName.substring(fullName.lastIndexOf("/") + 1);
  }

  static createShortName(parentName: string, childName: string): string {
    if(parentName) return parentName + "/" + childName;
    return childName;
  }

  static urlEncode(shortname: string): string {
    // flawn algo: '//' is encoded as 'slashslash' which will be decoded to 'slash'; Hopefully we will never be encoding '//';
    return shortname.replace(/slash/g,'slashslash').replace(/\//g,'slash')
  }
}
