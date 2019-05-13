import {Component, Input, OnChanges} from '@angular/core';
import {LibraryService, RdteBudgetData} from '../../../../generated';
import {Notify} from '../../../../utils/Notify';

@Component({
  selector: 'r1-tab',
  templateUrl: './r1-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R1TabComponent implements OnChanges {

  @Input() rdteBudgetData: RdteBudgetData;

  constructor(private libraryService:LibraryService) { }

  ngOnChanges() {
  }

  r1HandleFileInput(files: FileList) {
    let r1FileToUpload:File = files.item(0);
    this.libraryService.uploadFile(r1FileToUpload, this.rdteBudgetData.fileArea).subscribe(response => {
      if (response.result) {
        this.rdteBudgetData.r1Id=response.result.id;
        this.rdteBudgetData.r1Name=r1FileToUpload.name;
      } else if (response.error) {
        Notify.error( "Something went wrong with the overview file upload" + response.error );
      } else {
        Notify.error( "Something went wrong with the overview file upload" );
      }
    });
  }

}
