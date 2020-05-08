import { AssetSummary } from './asset-summary.model';

export class Asset {
  id?: string;
  fundingLineId?: string;
  assetSummaries?: AssetSummary[];
  remarks?: string;
}
