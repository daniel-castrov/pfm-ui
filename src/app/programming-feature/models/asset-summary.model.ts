import { AssetDetail } from './asset-detail.model';

export class AssetSummary {
  id?: string;
  assetId?: string;
  description?: string;
  contractorOrManufacturer?: string;
  toBeUsedBy?: string;
  details?: { [year: number]: AssetDetail };

  action: any;
  isDisabled?: boolean;
}
