import {Injectable} from '@angular/core';
import {ProgramType} from "../../../generated/model/programType";
import {Program} from "../../../generated";

export enum AddNewPrForMode {
  AN_MRDB_PROGRAM = 'Previously Funded Program',
  A_NEW_INCREMENT = 'New Increment',
  A_NEW_FOS = 'New FoS',
  A_NEW_SUBPROGRAM = 'New Subprogram',
  A_NEW_PROGRAM = 'New Program'
}

@Injectable({
  providedIn: 'root'
})
export class ProgramRequestPageModeService {

  private _initialized: boolean;
  private _prId: string;                                                  // null if a PR is being created, an id if an existing PR is being edited
  public type: AddNewPrForMode;                                          // applicable only when this._prId is not defined
  public reference: Program;                                              // applicable only when this._prId is not defined
  public phaseId: string;                                                 // applicable only when this._prId is not defined
  public programType: ProgramType;

  // edit mode
  set prId(id:string) {
    this.init();
    this._prId = id;
  }

  // create mode
  set(type: AddNewPrForMode, phaseId: string, reference: Program, programType: ProgramType) {
    this.init();
    this.type = type;
    this.phaseId = phaseId;
    this.reference = reference;
    this.programType = programType;
  }

  private init() {
    this._initialized = true;
    this._prId = null;
    this.type = null;
    this.reference = null;
    this.phaseId = null;
  }

  // begin properties
  get prId() {
    return this._prId;
  }

  get programOfMrDb(): boolean {
    return this.type === AddNewPrForMode.AN_MRDB_PROGRAM;
  }

  get child(): boolean {
    return this.type === AddNewPrForMode.A_NEW_INCREMENT || this.type === AddNewPrForMode.A_NEW_FOS || this.type === AddNewPrForMode.A_NEW_SUBPROGRAM;
  }

  get newProgram(): boolean {
    return this.type === AddNewPrForMode.A_NEW_PROGRAM;
  }

  get initialized() {
    return this._initialized;
  }
  // end properties
}
