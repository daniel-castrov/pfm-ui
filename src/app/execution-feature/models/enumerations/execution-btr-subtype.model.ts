import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { ListItemHelper } from 'src/app/util/ListItemHelper';

export const enum ExecutionBTRSubtype {
  BTR_DFAS = 'BTR_DFAS',
  BTR_FIAR = 'BTR_FIAR',
  BTR_UFR = 'BTR_UFR',
  BTR_BTR = 'BTR_BTR',
  BTR_OTHER = 'BTR_OTHER'
}

export function getBTRSubtypeShortDescription(val: ExecutionBTRSubtype): string {
  switch (val) {
    case ExecutionBTRSubtype.BTR_DFAS:
      return 'DFAS Bill';
    case ExecutionBTRSubtype.BTR_FIAR:
      return 'FIAR Spt';
    case ExecutionBTRSubtype.BTR_UFR:
      return 'UFR';
    case ExecutionBTRSubtype.BTR_BTR:
      return 'BTR';
    case ExecutionBTRSubtype.BTR_OTHER:
      return 'Other';
    default:
      return '';
  }
}

export function getBTRSubtypeDescription(val: ExecutionBTRSubtype): string {
  switch (val) {
    case ExecutionBTRSubtype.BTR_DFAS:
      return 'Defense Finance & Accounting Service (DFAS) Bill';
    case ExecutionBTRSubtype.BTR_FIAR:
      return 'Financial Improvement & Audit Readiness (FIAR) Support';
    case ExecutionBTRSubtype.BTR_UFR:
      return 'Unfunded Requirement';
    case ExecutionBTRSubtype.BTR_BTR:
      return 'Below Threshold Reprogramming';
    case ExecutionBTRSubtype.BTR_OTHER:
      return 'Unassigned';
    default:
      return '';
  }
}

export function getListItems(): ListItem[] {
  const enumValues = [
    ExecutionBTRSubtype.BTR_DFAS,
    ExecutionBTRSubtype.BTR_FIAR,
    ExecutionBTRSubtype.BTR_UFR,
    ExecutionBTRSubtype.BTR_BTR,
    ExecutionBTRSubtype.BTR_OTHER
  ];
  const items = ListItemHelper.generateListItemFromArray(
    enumValues.map(btr => [getBTRSubtypeShortDescription(btr) + ' - ' + getBTRSubtypeDescription(btr), btr])
  );
  return items;
}
