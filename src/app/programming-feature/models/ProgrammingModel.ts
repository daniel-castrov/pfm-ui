import { Injectable } from '@angular/core';
import {Pom} from './Pom';
import {Program} from './Program';

@Injectable({
    providedIn: 'root'
})
export class ProgrammingModel {
    public pom: Pom;
    public programs: Program[];
}
