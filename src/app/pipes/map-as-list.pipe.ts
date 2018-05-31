import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapAsList',
  pure: false
})
export class MapAsListPipe implements PipeTransform {

  transform(value: Map<any, any>, args?: any): any {
    var ret = [];

    if (args && 'values' === args) {
      value.forEach((val, key) => {
        ret.push(val);
      });
    }
    else {
      value.forEach((val, key) => {
        ret.push({
          key: key,
          value: val
        });
      });
    }  
    return ret;
  }
}
