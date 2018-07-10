import {Component, Input, OnInit} from '@angular/core';
import {ProgrammaticRequest} from "../../../../generated";
import {ProgramsService} from "../../../../generated/api/programs.service";

@Component({
  selector: 'program-tab',
  templateUrl: './program-tab.component.html',
  styleUrls: ['./program-tab.component.scss']
})
export class ProgramTabComponent implements OnInit {
  @Input()
  pr : ProgrammaticRequest;

  tags = ['Lead Component',
    'Manager',
    'Primary Capability',
    'Core Capability Area',
    'Secondary Capability',
    'Functional Area',
    'Medical Category',
    'DASD CBD',
    'Emphasis Areas'
  ];

  dropdownValues= new Map();

  constructor(private programsService: ProgramsService) { }

  ngOnInit() {

    this.tags.forEach(tag => {
      this.programsService.getTagsByType(tag).subscribe(data => {
        this.dropdownValues.set(tag, data.result);
      })
    });
  }
}
