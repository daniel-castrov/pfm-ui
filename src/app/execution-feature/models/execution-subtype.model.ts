import { EventEnum } from 'src/app/pfm-coreui/models/event-enum.model';
import { ExecutionInputValue } from 'src/app/execution-feature/models/enumerations/execution-input-value.model';
import { ExecutionImpact } from 'src/app/execution-feature/models/enumerations/execution-impact.model';

export class ExecutionSubtype {
  static readonly APPR_SECTION = new ExecutionSubtype(
    EventEnum.EXE_APPROPRIATION_ACTION,
    'Section',
    'Section (n) fromt Defense Appropriations Bill',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA
  );

  static readonly APPR_FFRDC = new ExecutionSubtype(
    EventEnum.EXE_APPROPRIATION_ACTION,
    'FFRDC',
    'Federally Funded Research and Development Centers (FFRDC)',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA
  );
  static readonly APPR_OTHER = new ExecutionSubtype(
    EventEnum.EXE_APPROPRIATION_ACTION,
    'Other',
    'Unassigned',
    ExecutionInputValue.ANY,
    ExecutionImpact.TOA
  );

  static readonly CRA_CII = new ExecutionSubtype(
    EventEnum.EXE_CONGRESSIONAL_ACTION,
    'CII',
    'Congressional Interest Item (CII)',
    ExecutionInputValue.ANY,
    ExecutionImpact.TOA
  );
  static readonly CRA_CONGRESSIONAL_RESCISSION = new ExecutionSubtype(
    EventEnum.EXE_CONGRESSIONAL_ACTION,
    'Congressional Rescission',
    'Congressional Rescission',
    ExecutionInputValue.NEGATIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly CRA_CONGRESSIONAL_DIRECTED_TRANSFER = new ExecutionSubtype(
    EventEnum.EXE_CONGRESSIONAL_ACTION,
    'Congressional Directed Transfer',
    'Congressional Directed Transfer',
    ExecutionInputValue.ANY,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );

  static readonly OUSDC_UFR = new ExecutionSubtype(
    EventEnum.EXE_OUSDC_ACTION,
    'UFR',
    'OUSD(C) Level Unfunded Requirement',
    ExecutionInputValue.ANY,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly OUSDC_OTHER = new ExecutionSubtype(
    EventEnum.EXE_OUSDC_ACTION,
    'Other',
    'Other OUSD(C) Directed Action',
    ExecutionInputValue.ANY,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );

  static readonly BTR_DFAS = new ExecutionSubtype(
    EventEnum.EXE_BTR,
    'DFAS Bill',
    'Defense Finance & Accounting Service (DFAS) Bill',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly BTR_FIAR = new ExecutionSubtype(
    EventEnum.EXE_BTR,
    'FIAR Spt',
    'Financial Improvement & Audit Readiness (FIAR) Support',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly BTR_UFR = new ExecutionSubtype(
    EventEnum.EXE_BTR,
    'UFR',
    'Unfunded Requirement',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly BTR_BTR = new ExecutionSubtype(
    EventEnum.EXE_BTR,
    'BTR',
    'Below Threshold Reprogramming',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly BTR_OTHER = new ExecutionSubtype(
    EventEnum.EXE_BTR,
    'Other',
    'Unassigned',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );

  static readonly FM_DIRECTED_ALIGNMENT = new ExecutionSubtype(
    EventEnum.EXE_FM_DIRECTED_ALIGNMENT,
    'FM Realignment',
    'Funds Manager Directed Execution Alignment',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA
  );

  static readonly REALIGNMENT_DFAS = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'DFAS Bill',
    'Defense Finance & Accounting Service (DFAS) Bill',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly REALIGNMENT_FIAR = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'FIAR Spt',
    'Financial Improvement & Audit Readiness (FIAR) Support',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly REALIGNMENT_UFR = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'UFR',
    'Unfunded Requirement',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly REALIGNMENT_REALIGNMENT = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'Realignment',
    'Generic',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly REALIGNMENT_CONGRESSIONAL_DIRECTED = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'Congressional Directed',
    'Directed in the Defense Appropriations Bill',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly REALIGNMENT_SBIR = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'SBIR',
    'Small Business Innovation Research (SBIR)',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly REALIGNMENT_STTR = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'STTR',
    'Small Business Technology Transfer (STTR)',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );
  static readonly REALIGNMENT_OTHER = new ExecutionSubtype(
    EventEnum.EXE_REALIGNMENT,
    'Other',
    'Unassigned',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA,
    ExecutionImpact.RELEASED
  );

  static readonly RELEASE_CRA = new ExecutionSubtype(
    EventEnum.EXE_RELEASE,
    'CRA',
    'Continuing Resolution Authority (CRA) Release',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.RELEASED
  );
  static readonly RELEASE_APPR = new ExecutionSubtype(
    EventEnum.EXE_RELEASE,
    'Appropriation',
    'Appropriation',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.RELEASED
  );

  static readonly REDIST_CRA = new ExecutionSubtype(
    EventEnum.EXE_REDISTRIBUTION,
    'CRA',
    'Continuing Resolution Authority (CRA) Redistribution',
    ExecutionInputValue.POSITIVE,
    ExecutionImpact.TOA
  );
  static readonly WITHHOLD_ODASD = new ExecutionSubtype(
    EventEnum.EXE_WITHHOLD,
    'ODASD(CBD) Withhold',
    'ODASD(CBD) Withhold',
    ExecutionInputValue.ANY,
    ExecutionImpact.RELEASED,
    ExecutionImpact.WITHHOLD
  );

  private impact: ExecutionImpact[];
  private constructor(
    private type: EventEnum,
    private desc: string,
    private shortname: string,
    private inputValue: ExecutionInputValue,
    ...impact: ExecutionImpact[]
  ) {
    this.impact = impact;
  }

  getType(): EventEnum {
    return this.type;
  }

  getShortname(): string {
    return this.shortname;
  }
}
