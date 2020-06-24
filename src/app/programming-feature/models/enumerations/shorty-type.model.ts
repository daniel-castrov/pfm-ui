export const enum ShortyType {
  MRDB_PROGRAM = 'MRDB_PROGRAM',
  PR = 'PR',
  NEW_INCREMENT = 'NEW_INCREMENT',
  NEW_INCREMENT_FOR_MRDB_PROGRAM = 'NEW_INCREMENT_FOR_MRDB_PROGRAM',
  NEW_INCREMENT_FOR_PR = 'NEW_INCREMENT_FOR_PR',
  NEW_FOS = 'NEW_FOS',
  NEW_FOS_FOR_MRDB_PROGRAM = 'NEW_FOS_FOR_MRDB_PROGRAM',
  NEW_FOS_FOR_PR = 'NEW_FOS_FOR_PR',
  NEW_PROGRAM = 'NEW_PROGRAM'
}

export function getShortyTypeDescription(val: ShortyType): string {
  switch (val) {
    case ShortyType.MRDB_PROGRAM:
      return 'Previously Funded Program';
    case ShortyType.PR:
      return 'Program Request';
    case ShortyType.NEW_INCREMENT:
      return 'New Increment';
    case ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM:
      return 'New Increment for Previously Funded Program';
    case ShortyType.NEW_INCREMENT_FOR_PR:
      return 'New Increment for Program Request';
    case ShortyType.NEW_FOS:
      return 'FoS';
    case ShortyType.NEW_FOS_FOR_MRDB_PROGRAM:
      return 'FoS for Previously Funded Program';
    case ShortyType.NEW_FOS_FOR_PR:
      return 'FoS for Program Request';
    case ShortyType.NEW_PROGRAM:
      return 'New Program';
    default:
      return '';
  }
}
