import {AfterViewInit, Component, ViewChild, ViewContainerRef} from "@angular/core";

import {ICellEditorAngularComp} from "ag-grid-angular";

@Component({
    selector: 'numeric-celleditor',
    template: `<input #input (keydown)="onKeyDown($event)" [(ngModel)]="value" style="width: 100%">`
})
export class NumericCellEditor implements ICellEditorAngularComp, AfterViewInit {
    private params: any;
    public value: number;
    private cancelBeforeStart: boolean = false;

    @ViewChild('input', {read: ViewContainerRef}) public input;

    // initializer for Angular
    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    // need to return the value
    getValue(): any {
        return this.value;
    }

    // Check one more time to make sure the value after editing is a number
    // and in range  ( +- 10 million )
    isCancelAfterEnd(): boolean {
        var isInRange = -10000000 < this.value  && this.value < 10000000;  
        return !( isInRange );
    };

    // If it is not a number but is Alpha the don't allow anything
    // Otherwise allow it (we nee the backspace and delete, etc)
    onKeyDown(event): void {

        if ( !this.isKeyValid( event ) ){
            event.preventDefault();
        }

    }

    // dont use afterGuiAttached for post gui events
    // hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        setTimeout(() => {
            this.input.element.nativeElement.focus();
        })
    }

    // Sometimes the charCode is enough
    private getCharCodeFromEvent(event): any {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    }

    // Sometimes you need the srting.  EG. Shift + 3 is still just 3
    private getKeyString( event ): any {
        return event.key ? event.key : String.fromCharCode( this.getCharCodeFromEvent(event) );
    }

    private isKeyValid(event): boolean {

        const charCode = this.getCharCodeFromEvent(event);
        var keysrt = this.getKeyString(event);

        //    189 is the '-',     8 is the backspace,   0 - 9 is OK.  That's it!
        if (  charCode == 189 || charCode == 8 || ( keysrt > -1 && keysrt < 10 )){
            return true;
        } 
        return false;
    }

}