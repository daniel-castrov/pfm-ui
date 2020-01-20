import { Component, OnInit } from '@angular/core';
import {Location } from '@angular/common'
import { ActivatedRoute } from '@angular/router';
import { ProgrammingModel } from '../../models/ProgrammingModel';

@Component({
  selector: 'pfm-requests-details',
  templateUrl: './requests-details.component.html',
  styleUrls: ['./requests-details.component.scss']
})
export class RequestsDetailsComponent implements OnInit {

  constructor(public programmingModel: ProgrammingModel, private location:Location, private route: ActivatedRoute) { }

  goBack():void{
    this.location.back();
  }

  ngOnInit() {
    this.programmingModel.selectedProgramName = this.route.snapshot.paramMap.get("id");
  }

}
