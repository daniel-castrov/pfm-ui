import { AssetDetail } from './asset-detail.model';

export class Asset {

  id?: string;
  fundingLineId?: string;
  description?: string;
  contractorOrManufacturer?: string;
  toBeUsedBy?: string;
  details?: { [year: number]: AssetDetail };

  action: any;
  isDisabled?: boolean;

}
