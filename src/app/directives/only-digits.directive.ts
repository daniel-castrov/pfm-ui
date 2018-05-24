import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[digits]'
})
export class OnlyDigitsDirective {
  private regex: RegExp = new RegExp(/^-?[0-9]+$/g);
  private specialKeys: string[] = ['Backspace', 'Tab', 'End', 'Home', '-'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log( 'here I am in only-digits!')

    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.textContent;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
