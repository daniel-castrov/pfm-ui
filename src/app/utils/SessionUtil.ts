export class SessionUtil {

  public static set(key: string, object: any) {
    sessionStorage.setItem(key, JSON.stringify(object));
  }

  public static get(key: string): any {
    return JSON.parse(sessionStorage.getItem(key));
  }
}
