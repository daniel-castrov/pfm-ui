import { Injectable } from '@angular/core';


@Injectable()

export class CreatePomSessionService {
    years: any = [];
    currentYear: number;
    scrollstartyear:number;
    constructor() { }

    setYears(years: any): void {
        console.log('into service',years);
        this.years = years;
    }

    setCurrentYear(currentYear: number,scrollstartyear:number) {
        console.log(currentYear,scrollstartyear);
        this.currentYear = currentYear;
        this.scrollstartyear = scrollstartyear;
    }

    getCurrentYear() {
        return this.currentYear +","+this.scrollstartyear;
    }

    getYears(): any {
        return this.years;
    }
    
    
}