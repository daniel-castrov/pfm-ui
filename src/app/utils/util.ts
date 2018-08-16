export class Util {
  public static removeDuplicates(array): any[]{
    let unique = array.filter((value, index, array) =>
      !array.filter((v, i) => JSON.stringify(value) == JSON.stringify(v) && i < index).length);
    return unique;
  }
}
