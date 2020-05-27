import { Component, OnInit } from '@angular/core';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { ListItemHelper } from 'src/app/util/ListItemHelper';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { ExecutionService } from '../services/execution.service';

@Component({
  selector: 'pfm-create-execution',
  templateUrl: './create-execution.component.html',
  styleUrls: ['./create-execution.component.scss']
})
export class CreateExecutionComponent implements OnInit {
  years: ListItem[];
  busy: boolean;
  showUploadDialog: boolean;
  filename: string;

  constructor(private dialogService: DialogService, private executionService: ExecutionService) {}

  ngOnInit(): void {
    this.executionService.getYearsReadyForExecution().subscribe(resp => {
      const years = (resp as any).result;
      this.years = ListItemHelper.generateListItemFromArray(
        years.map(y => ['FY' + y.toString().substring(2, 4), y.toString()])
      );
    });
  }

  handleAttachments(newFile: FileMetaData) {
    this.showUploadDialog = false;
    if (newFile) {
      this.filename = newFile.name;
    }
  }

  onFileUploadClick() {
    this.showUploadDialog = true;
  }
}
