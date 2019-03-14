import { Component, OnInit } from '@angular/core';
// Other Components
import { LibraryService, FileMetadata, OandEService } from '../../../generated';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'import-actuals',
  templateUrl: './import-actuals.component.html',
  styleUrls: ['./import-actuals.component.scss']
})
export class ImportActualsComponent implements OnInit {

  private gfebsfile: File;
  private daifile: File;
  private oldgfebs: FileMetadata[] = [];
  private olddai: FileMetadata[] = [];

  constructor( private oandesvc:OandEService, private library:LibraryService ) { }

  ngOnInit() {
    this.fetchFileRecords();
  }

  fetchFileRecords() {
    this.library.getAll().subscribe(d => {
      if (d.result) {
        this.oldgfebs = d.result.filter(fmd => fmd.metadata.area === 'gfebs');
        this.olddai = d.result.filter(fmd => fmd.metadata.area === 'dai');
      }
      else {
        this.oldgfebs = [];
        this.olddai = [];
      }
    });
  }

  handleFileInput(files: FileList, type:string) {
    if ("GFEBS" === type) {
      this.gfebsfile = files.item(0);
    }
    else {
      this.daifile = files.item(0);
    }
  }

  upload() {
    var calls: Observable<any>[] = [];
    if (this.gfebsfile) {
      calls.push(this.oandesvc.upload(this.gfebsfile, "GFEBS"));
    }
    if (this.daifile) {
      calls.push(this.oandesvc.upload(this.daifile, "DAI"));
    }

    if (calls.length > 0) {
      forkJoin(calls).subscribe(d => {
        this.fetchFileRecords();
      });
    }
  }
}
