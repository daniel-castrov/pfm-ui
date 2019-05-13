import {Observable} from 'rxjs';
import {RestResult} from '../generated/model/restResult';
import {Injectable} from '@angular/core';
import {PropertyService, PropertyType, R3Contractor, R3ContractType, R3CostCategory} from '../generated';
import {Caching} from '../services/caching';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PropertyUtils {

  constructor(private propertyService: PropertyService) {}

  @Caching('r3CostCategory')
  r3CostCategory(): Observable<R3CostCategory> {
    return this.propertyService.getByPropertyType(PropertyType.R3_COST_CATEGORY)
      .pipe(map( (response: RestResult) => response.result ));
  }

  @Caching('r3ContractType')
  r3ContractType(): Observable<R3ContractType> {
    return this.propertyService.getByPropertyType(PropertyType.R3_CONTRACT_TYPE)
      .pipe(map( (response: RestResult) => response.result ));
  }

  @Caching('r3Contractor')
  r3Contractor(): Observable<R3Contractor> {
    return this.propertyService.getByPropertyType(PropertyType.R3_CONTRACTOR)
      .pipe(map( (response: RestResult) => response.result ));
  }

}
