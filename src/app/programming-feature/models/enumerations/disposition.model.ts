export const enum Disposition {
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  DEFERRED_POM = 'DEFERRED_POM',
  DEFERRED_YOE = 'DEFERRED_YOE',
  DISAPPROVED = 'DISAPPROVED',
  DASD_REQUESTED = 'DASD_REQUESTED'
}

export function getDispositionDescription(val: Disposition): string {
  switch (val) {
    case Disposition.APPROVED:
      return 'Approved';
    case Disposition.PARTIALLY_APPROVED:
      return 'Partially Approved';
    case Disposition.DISAPPROVED:
      return 'Disapproved';
    case Disposition.DEFERRED_POM:
      return 'Deferred to Future POM';
    case Disposition.DEFERRED_YOE:
      return 'Deferred to YOE';
    case Disposition.DISAPPROVED:
      return 'Disapproved';
    case Disposition.DASD_REQUESTED:
      return 'DASD Review Requested';
    default:
      return '';
  }
}
