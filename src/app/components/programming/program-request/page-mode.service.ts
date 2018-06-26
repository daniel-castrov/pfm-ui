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
  private type: Type;            // applicable only when this._id is not defined
  public originatingProgramId;   // applicable only when this._id is not defined
  public parentId;               // applicable only when this._id is not defined
  public phaseId: string;        // applicable only when this._id is not defined

  // begin initilizers
  set id(id:string) {
    this.init();
    this._id = id;
  }

  setProgramOfRecord(phaseId: string) {
    this.init();
    this.type = Type.ProgramFormRecord;
    this.phaseId = phaseId;
  }

  setNewSubprogram(phaseId: string) {
    this.init();
    this.type = Type.NewSubprogram;
    this.phaseId = phaseId;
  }
  
  setNewProgram(phaseId: string) {
    this.init();
    this.type = Type.NewProgram;
    this.phaseId = phaseId;
  }
  // end initilizers

  private init() {
    this._initialized = true;
    this._id = null;
    this.type = null;
    this.originatingProgramId = null;
    this.parentId = null;
    this.phaseId = null;
  }

  // begin properties
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
  // end properties
}
