import { Injectable } from '@angular/core';
import { ProgramRequestWithFullName, ProgramWithFullName } from '../../../services/with-full-name.service';

export enum Type {
  PROGRAM_OF_MRDB,
  SUBPROGRAM_OF_MRDB,
  SUBPROGRAM_OF_PR_OR_UFR,
  NEW_PROGRAM
}

@Injectable()
export class ProgramRequestPageModeService {

  private _initialized: boolean;
  private _id: string;                                                    // null if a PR is being created, an id if an existing PR is being edited
  public type: Type;                                                      // applicable only when this._id is not defined
  public reference: ProgramWithFullName | ProgramRequestWithFullName;     // applicable only when this._id is not defined
  public phaseId: string;                                                 // applicable only when this._id is not defined

  // edit mode
  set id(id:string) {
    this.init();
    this._id = id;
  }

  // crete mode
  set(type: Type, phaseId: string) {
    this.init();
    this.type = type;
    this.phaseId = phaseId;
  }

  private init() {
    this._initialized = true;
    this._id = null;
    this.type = null;
    this.reference = null;
    this.phaseId = null;
  }

  // begin properties
  get id() {
    return this._id;
  }

  get programOfMrDb(): boolean {
    return this.type === Type.PROGRAM_OF_MRDB;
  }

  get subprogramOfMrDb(): boolean {
    return this.type === Type.SUBPROGRAM_OF_MRDB;
  }

  get subprogramOfPrOrUfr(): boolean {
    return this.type === Type.SUBPROGRAM_OF_PR_OR_UFR;
  }

  get newProgram(): boolean {
    return this.type === Type.NEW_PROGRAM;
  }

  get initialized() {
    return this._initialized;
  }
  // end properties
}
