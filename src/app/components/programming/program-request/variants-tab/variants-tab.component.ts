import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { ProgrammaticRequest} from '../../../../generated'
import { FeedbackComponent } from './../../../feedback/feedback.component';

@Component({
  selector: 'variants-tab',
  templateUrl: './variants-tab.component.html',
  styleUrls: ['./variants-tab.component.scss']
})
export class VariantsTabComponent implements OnInit {


  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() pr: ProgrammaticRequest;

  constructor() { }

  ngOnChanges(){
    if(!this.pr.phaseId) return; // the parent has not completed it's ngOnInit()
    console.log(this.pr)
  }

  ngOnInit() {
  }
}
