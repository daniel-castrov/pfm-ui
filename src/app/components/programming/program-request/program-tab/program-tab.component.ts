import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ProgrammaticRequest} from "../../../../generated";
import {ProgramsService} from "../../../../generated/api/programs.service";
import {PRService} from "../../../../generated/api/pR.service";

import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'program-tab',
  templateUrl: './program-tab.component.html',
  styleUrls: ['./program-tab.component.scss']
})
export class ProgramTabComponent implements OnInit, OnChanges {
  @Input()
  pr : ProgrammaticRequest;

  imagePath: string;
  fileName: string;

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

  constructor(private programsService: ProgramsService,
              private prService: PRService,
              private sanitization: DomSanitizer) { }

  ngOnInit() {

    this.tags.forEach(tag => {
      this.programsService.getTagsByType(tag).subscribe(data => {
        this.dropdownValues.set(tag, data.result);
      })
    });
  }

  ngOnChanges() {
    if (this.pr.imageName) {
      this.prService.downloadImage(this.pr.imageName).subscribe(response => {
        if (response.result) {
          this.imagePath = this.sanitization.bypassSecurityTrustResourceUrl(response.result) as string;
        }
      });
    }
  }

  onFileChange(event){
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.onload = () => {
        this.fileName = file.name;
        this.imagePath = reader.result;
        this.prService.uploadImage(file).subscribe(response => {
          if (response.result) {
            this.pr.imageName = response.result;
            this.pr.imageArea = "pr";
          }
        })
      }
      reader.readAsDataURL(file);
    }
  }
}
