import {Component, OnInit} from '@angular/core';
import {FileMetadata, LibraryService, OandEService} from '../../../generated';
import {Observable} from 'rxjs';
import {NgbDate} from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date';
import {NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {NgModel} from '@angular/forms';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'import-actuals',
  templateUrl: './import-actuals.component.html',
  styleUrls: ['./import-actuals.component.scss']
})
export class ImportActualsComponent implements OnInit {

  private gfebsfile: File;
  private daifile: File;
  private ctrlfile: File;
  private oldgfebs: FileMetadata[] = [];
  private olddai: FileMetadata[] = [];
  private oldctrl: FileMetadata[] = [];

  today: Date = new Date();
  gfebsAsOfSelection: NgbDate;
  daiAsOfSelection: NgbDate;
  isGfebsValid: boolean = true;
  isDaiValid: boolean = true;

  constructor(
    private oandesvc:OandEService,
    private library:LibraryService,
    private dateParser: NgbDateParserFormatter) { }

  ngOnInit() {
    this.fetchFileRecords();
  }

  fetchFileRecords() {
    this.library.getAll().subscribe(d => {
      if (d.result) {
        this.oldgfebs = d.result.filter(fmd => fmd.metadata.area === 'gfebs');
        this.olddai = d.result.filter(fmd => fmd.metadata.area === 'dai');
        this.oldctrl = d.result.filter(fmd => fmd.metadata.area === 'dai-control');
      }
      else {
        this.oldgfebs = [];
        this.olddai = [];
        this.oldctrl = [];
      }
    });
  }

  handleFileInput(files: FileList, type:string) {
    if ("GFEBS" === type) {
      this.gfebsfile = files.item(0);
      this.gfebsAsOfSelection=null;
      if ( this.gfebsfile ) this.isGfebsValid=false;
    }
    else if( "DAI" === type ){
      this.daifile = files.item(0);
      this.daiAsOfSelection=null;
      if ( this.daifile ) this.isDaiValid=false;
    }
    else {
      this.ctrlfile = files.item(0);
    }
  }

  upload() {
    var calls: Observable<any>[] = [];

    if (this.ctrlfile && this.daifile) {
      // if we have a control file and a regular DAI upload,
      // make sure the control file goes first.
      this.oandesvc.upload(this.ctrlfile,"DAI-CONTROL" ).subscribe(d => {
        this.oandesvc.upload(this.daifile, 'DAI', this.dateParser.format(this.daiAsOfSelection)).subscribe(d2 => {
          if (this.gfebsfile) {
            this.oandesvc.upload(this.gfebsfile,  "GFEBS",  this.dateParser.format(this.gfebsAsOfSelection)).subscribe( n3 => {
              delete this.gfebsfile;
              this.gfebsAsOfSelection=null;
              this.fetchFileRecords();
            });
          }
          delete this.daifile;
          this.daiAsOfSelection=null;
          this.fetchFileRecords();
        });
        delete this.ctrlfile;
      });
    }
    else {
      if (this.gfebsfile) {
        calls.push(this.oandesvc.upload(this.gfebsfile,"GFEBS", this.dateParser.format(this.gfebsAsOfSelection)));
      }
      if (this.ctrlfile) {
        calls.push(this.oandesvc.upload(this.ctrlfile,"DAI-CONTROL"));
      }
      if (this.daifile) {
        calls.push(this.oandesvc.upload(this.daifile, "DAI", this.dateParser.format(this.daiAsOfSelection),));
      }
    }

    if (calls.length > 0) {
      forkJoin(calls).subscribe(d => {
        delete this.gfebsfile;
        delete this.ctrlfile;
        delete this.daifile;
        this.gfebsAsOfSelection=null;
        this.daiAsOfSelection=null;
        this.isGfebsValid = true;
        this.isDaiValid = true;
        this.fetchFileRecords();
      });
    }
  }

  pageValid(){
    return ( this.isGfebsValid && this.isDaiValid ) &&  ( this.gfebsfile || this.daifile || this.ctrlfile ) ;
  }

  onGfebsAsOfSelection(ngModel: NgModel) {
    this.isGfebsValid = (this.gfebsfile && ngModel && !ngModel.invalid) || !this.gfebsfile;
  }

  onDaiAsOfSelection(ngModel: NgModel) {
    this.isDaiValid = (this.daifile && ngModel && !ngModel.invalid) || !this.daifile;
  }

}
