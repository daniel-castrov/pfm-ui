
export class FormatterUtil {

  public static pad(num: number, size:number){
      var s = num+"";
      while (s.length < size) s = "0" + s;
      return s;
    }

    public static getCurrentFiscalYear():number {
      var today = new Date();
      var curMonth = today.getMonth();
      var fiscalYr;
      if (curMonth > 9) { 
          fiscalYr = (new Date()).getFullYear()+1;
      } else {
          var nextYr2 = today.getFullYear().toString();
          fiscalYr = (new Date()).getFullYear();
      }
      return fiscalYr;
  }
}
