export class NameUtils {

  public static getParentName(fullName: string): string {
    return fullName.substring(0, fullName.lastIndexOf("/"));
  }

}
