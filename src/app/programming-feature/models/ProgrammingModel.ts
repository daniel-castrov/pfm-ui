import { Injectable } from '@angular/core';
import { Pom } from './Pom';
import { Program } from './Program';
import { Role } from '../../pfm-common-models/Role';

@Injectable({
  providedIn: 'root'
})
export class ProgrammingModel {
  selectedProgramId: string;
  pom: Pom;
  programs: Program[];
  roles: Map<string, Role>;
}
