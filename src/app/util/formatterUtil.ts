export class FormatterUtil {
  static pad(num: number, size: number) {
    let s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  }

  static getCurrentFiscalYear(): number {
    let today = new Date();
    let curMonth = today.getMonth();
    let fiscalYr;
    if (curMonth > 9) {
      fiscalYr = new Date().getFullYear() + 1;
    } else {
      fiscalYr = new Date().getFullYear();
    }
    return fiscalYr;
  }

  static formatCurrency(amount): string {
    return (
      '$ ' +
      Number(amount)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
  }
}
