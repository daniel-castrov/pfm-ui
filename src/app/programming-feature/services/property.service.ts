import { BaseRestService } from '../../services/base-rest.service';
import { Observable } from 'rxjs';

export abstract class PropertyService extends BaseRestService {

  abstract getByType(type: string): Observable<object>;

}
