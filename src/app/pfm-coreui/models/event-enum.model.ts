import { EventType } from './event-type.model';

export class EventEnum {
  static readonly EXE_APPROPRIATION_ACTION = new EventEnum(
    new EventType('EXE_APPROPRIATION_ACTION', 'Update', 'Phase', 'Execution Appropriation Action')
  );
  static readonly EXE_CONGRESSIONAL_ACTION = new EventEnum(
    new EventType('EXE_CONGRESSIONAL_ACTION', 'Update', 'Phase', 'Execution Congressional Action')
  );
  static readonly EXE_OUSDC_ACTION = new EventEnum(
    new EventType('EXE_OUSDC_ACTION', 'Update', 'Phase', 'Execution OUSD(c) Action')
  );
  static readonly EXE_BTR = new EventEnum(new EventType('EXE_BTR', 'Update', 'Phase', 'Execution BTR'));
  static readonly EXE_FM_DIRECTED_ALIGNMENT = new EventEnum(
    new EventType('EXE_FM_DIRECTED_ALIGNMENT', 'Update', 'Phase', 'Execution FM Directed Alignment')
  );
  static readonly EXE_REALIGNMENT = new EventEnum(
    new EventType('EXE_REALIGNMENT', 'Update', 'Phase', 'Execution Realignment')
  );
  static readonly EXE_RELEASE = new EventEnum(
    new EventType('EXE_RELEASE', 'Update', 'Phase', 'Execution Funds Release (CRA or Appropriation)')
  );
  static readonly EXE_REDISTRIBUTION = new EventEnum(
    new EventType('EXE_REDISTRIBUTION', 'Update', 'Phase', 'Execution Redistribution')
  );
  static readonly EXE_WITHHOLD = new EventEnum(
    new EventType('EXE_WITHHOLD', 'Update', 'Phase', 'Execution Funds Withhold')
  );

  static readonly EXELINE_CREATE = new EventEnum(
    new EventType('EXELINE_CREATE', 'Create', 'Phase', 'Create Execution Line in an existing Phase')
  );

  private constructor(private type: EventType) {}

  getType(): EventType {
    return this.type;
  }
}
