export const enum UFRStatus {
  SAVED = 'SAVED',
  OUTSTANDING = 'OUTSTANDING',
  SUBMITTED = 'SUBMITTED',
  VALID = 'VALID',
  INVALID = 'INVALID',
  WITHDRAWN = 'WITHDRAWN',
  ARCHIVED = 'ARCHIVED'
}

export function getUFRStatusDescription(val: UFRStatus): string {
  switch (val) {
    case UFRStatus.SAVED:
      return 'Saved';
    case UFRStatus.OUTSTANDING:
      return 'Outstanding';
    case UFRStatus.SUBMITTED:
      return 'Submitted';
    case UFRStatus.VALID:
      return 'Valid';
    case UFRStatus.INVALID:
      return 'Invalid';
    case UFRStatus.WITHDRAWN:
      return 'Withdrwn';
    case UFRStatus.ARCHIVED:
      return 'Archived';
    default:
      return '';
  }
}
