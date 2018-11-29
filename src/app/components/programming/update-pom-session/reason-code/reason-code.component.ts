import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject} from 'rxjs';
import {merge} from 'rxjs/observable/merge';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {TagsService} from "../../../../services/tags.service";

@Component({
  selector: 'reason-code',
  templateUrl: './reason-code.component.html',
  styleUrls: ['./reason-code.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReasonCodeComponent implements OnInit {

  @ViewChild("instance") instance: NgbTypeahead;

  reasonCode;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  tags: any[];
  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.tags
        : this.tags.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  };

  constructor( private tagService: TagsService ) {}

  ngOnInit() {
    this.tagService.tagAbbreviationsForReasonCode().then(tags => {
      this.tags = tags;
    });
  }

}
