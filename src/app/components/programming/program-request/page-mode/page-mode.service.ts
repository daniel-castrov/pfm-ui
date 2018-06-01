import { Injectable } from '@angular/core';

enum Type {
  ProgramFormRecord,
  NewSubprogram,
  NewProgram
}

@Injectable()
export class ProgramRequestPageModeService {

  private _initialized: boolean;
  private _id: string; // null if a PR is being created, an id if an existing PR is being edited
  private type: Type; // applicable only when this._is is not defined
  public phaseId: string;

  // begin initilizers
  set id(id:string) {
    this._id = id;
    this._initialized = true;
  }

  setProgramOfRecord(phaseId: string) {
    this.type = Type.ProgramFormRecord;
    this.phaseId = phaseId;
    this._initialized = true;
  }

  setNewSubprogram(phaseId: string) {
    this.type = Type.NewSubprogram;
    this.phaseId = phaseId;
    this._initialized = true;
  }
  
  setNewProgram(phaseId: string) {
    this.type = Type.NewProgram;
    this.phaseId = phaseId;
    this._initialized = true;
  }
  // end initilizers

  // begin queries
  get id() {
    return this._id;
  }

  get programOfRecord(): boolean {
    return this.type === Type.ProgramFormRecord;
  }

  get newSubprogram(): boolean {
    return this.type === Type.NewSubprogram;
  }

  get newProgram(): boolean {
    return this.type === Type.NewProgram;
  }

  get initialized() {
    return this._initialized;
  }
  // end queries
}
