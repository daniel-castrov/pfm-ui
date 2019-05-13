import {Injectable} from '@angular/core';
import {Program} from '../../../generated';


/**
 * Consolidates the context in which Rdte Program Data editing accurs. Eliminates the need to pass the data it contains form one
 * component to another. So, instead of doing it, simply inject this class and use the context information it provides.
 */
@Injectable({
  providedIn: 'root'
})
export class RdteProgramContextService {

  private _scenarioId: string;
  private _program: Program;
  private _ba: string;
  private _pe: string;
  private _item: string;

  // call this method rarely, ideally only when the Item is selected/unselected from the Edit Program Details menus
  init( scenarioId: string,
        program: Program,
        ba: string,
        pe: string,
        item: string ) {
    this._scenarioId = scenarioId;
    this._program = program;
    this._ba = ba;
    this._pe = pe;
    this._item = item;
  }

  // call this method rarely, ideally only when the Item is selected/unselected from the Edit Program Details menus
  reset() {
    this._scenarioId = null;
    this._program = null;
    this._ba = null;
    this._pe = null;
    this._item = null;
  }

  scenarioId() {
    return this._scenarioId;
  }

  program() {
    return this._program;
  }

  ba() {
    return this._ba;
  }

  pe() {
    return this._pe;
  }

  item() {
    return this._item;
  }

}
