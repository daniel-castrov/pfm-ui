export class FormatterUtil {
  public static removeDuplicates(array): any[]{
    let unique = array.filter((value, index, array) =>
      !array.filter((v, i) => JSON.stringify(value) == JSON.stringify(v) && i < index).length);
    return unique;
  }

  public static currencyFormatter(value, decimalDigits?, round?) {
    if(!decimalDigits){
      decimalDigits = 0;
    }
    if(isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimalDigits
    });
    if(round){
      return this.transformNegative(usdFormate.format(Math.round(value.value)));
    } else {
      return this.transformNegative(usdFormate.format(value.value));
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
}
