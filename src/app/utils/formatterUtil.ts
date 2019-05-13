import {DatePipe} from "@angular/common";

export class FormatterUtil {

  private static datePipe: DatePipe = new DatePipe('en-US');

  public static removeDuplicates(array): any[]{
    let unique = array.filter((value, index, array) =>
      !array.filter((v, i) => JSON.stringify(value) == JSON.stringify(v) && i < index).length);
    return unique;
  }

  public static hasDuplicates (array, property) {
    const valueArr = array.map(item => item[property]);
    const isDuplicate = valueArr.some((item, idx) => {
      return valueArr.indexOf(item) !== idx;
    });
    return isDuplicate;
  }

  public static currencyFormatter(value, decimalDigits?, round?) {
    if(!decimalDigits){
      decimalDigits = 0;
    }
    let amount = 0;
    if(!isNaN(value) && value !== undefined){
      amount = value;
    } else if(value && !isNaN(value.value) && value.value !== undefined) {
      amount = value.value;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimalDigits
    });
    if(round){
      return this.transformNegative(usdFormate.format(Math.round(amount)));
    } else {
      return this.transformNegative(usdFormate.format(amount));
    }
  }

  public static transformNegative(value: any){
    return value.charAt(0) === '-' ?
      '(' + value.substring(1, value.length) + ')' :
      value;
  }

  public static numberFormatter(value) {
    if(isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0
    });
    return usdFormate.format(value.value);
  }

  public static dateFormatter(params){
    let dateFormat = 'MM/dd/yyyy hh:mm:ss a';
    let parsedDate = Date.parse(params.value);
    return this.datePipe.transform(parsedDate, dateFormat);
  }

  public static dateFormatter2(date: Date, format: string){
    return this.datePipe.transform(date, format);
  }

  public static percentageFormatter( value: number, decimalDigits?: number){
    if(!decimalDigits){
      decimalDigits = 0;
    }
    return (value * 100).toFixed(decimalDigits) + "%";
  }

}
