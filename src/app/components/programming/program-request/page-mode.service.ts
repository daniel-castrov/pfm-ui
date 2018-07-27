import { CreationTimeType } from './../../../generated/model/creationTimeType';
import { Injectable } from '@angular/core';
import { ProgramRequestWithFullName, ProgramWithFullName } from '../../../services/with-full-name.service';

@Injectable()
export class ProgramRequestPageModeService {

  private _initialized: boolean;
  private _prId: string;                                                  // null if a PR is being created, an id if an existing PR is being edited
  public type: CreationTimeType;                                          // applicable only when this._prId is not defined
  public reference: ProgramWithFullName | ProgramRequestWithFullName;     // applicable only when this._prId is not defined
  public phaseId: string;                                                 // applicable only when this._prId is not defined

  // edit mode
  set prId(id:string) {
    this.init();
    this._prId = id;
  }

  // create mode
  set(type: CreationTimeType, phaseId: string) {
    this.init();
    this.type = type;
    this.phaseId = phaseId;
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
    return this.type === CreationTimeType.PROGRAM_OF_MRDB;
  }

  get subprogramOfMrDb(): boolean {
    return this.type === CreationTimeType.SUBPROGRAM_OF_MRDB;
  }

  get subprogramOfPrOrUfr(): boolean {
    return this.type === CreationTimeType.SUBPROGRAM_OF_PR_OR_UFR;
  }

  get newProgram(): boolean {
    return this.type === CreationTimeType.NEW_PROGRAM;
  }

  get initialized() {
    return this._initialized;
  }
  // end properties
}
