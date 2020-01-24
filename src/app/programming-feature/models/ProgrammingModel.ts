import { Injectable } from '@angular/core';
import { Pom } from './Pom';
import { Program } from './Program';
import { Role } from '../../pfm-common-models/Role';

@Injectable( {
  providedIn: 'root'
} )
export class ProgrammingModel {
  public selectedProgramName: string;
  public pom: Pom;
  public programs: Program[];
  public roles: Map<string, Role>;
}
