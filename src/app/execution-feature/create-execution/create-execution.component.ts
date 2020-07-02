import { Component, OnInit } from '@angular/core';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { ListItemHelper } from 'src/app/util/ListItemHelper';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { ExecutionService } from '../services/execution.service';
import { RestResponse } from 'src/app/util/rest-response';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { of } from 'rxjs';
import { takeWhile, switchMap, finalize } from 'rxjs/operators';

@Component({
  selector: 'pfm-create-execution',
  templateUrl: './create-execution.component.html',
  styleUrls: ['./create-execution.component.scss']
})
export class CreateExecutionComponent implements OnInit {
  years: ListItem[];
  busy: boolean;
  showUploadDialog: boolean;
  ousdFile: FileMetaData;
  selectedYear: ListItem;
  execution: any;

  constructor(
    private dialogService: DialogService,
    private executionService: ExecutionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.executionService.getYearsReadyForExecution().subscribe(resp => {
      const years = (resp as any).result;
      this.years = ListItemHelper.generateListItemFromArray(
        years.map(y => ['FY' + y.toString().substring(2, 4), y.toString()])
      );
    });
  }

  handleAttachments(newFile: FileMetaData): void {
    this.showUploadDialog = false;
    if (newFile) {
      this.ousdFile = newFile;
    }
  }

  onFileUploadClick(): void {
    this.showUploadDialog = true;
  }

  onSelectYearChanged(year: ListItem): void {
    this.selectedYear = year;
  }

  onCreate(): void {
    this.busy = true;
    of(this.isReadyForCreation())
      .pipe(
        takeWhile(Boolean),
        switchMap(() =>
          this.executionService.create(Number(this.selectedYear.value), this.ousdFile.file, this.ousdFile.name)
        ),
        finalize(() => (this.busy = false))
      )
      .subscribe(
        (resp: RestResponse<any>) => {
          this.execution = resp.result;
          this.toastService.displaySuccess(`Execution phase for ${this.execution.fy} successfully created.`);
        },
        error => {
          this.toastService.displayError(error.error.error);
        }
      );
  }

  private isReadyForCreation(): boolean {
    let valid = true;
    if (!this.selectedYear) {
      this.toastService.displayError('Please select an execution year in the dropdown', 'Execution');
      valid = false;
    }
    if (!this.ousdFile?.file.size) {
      this.toastService.displayError('Please upload the OUSD file.', 'Execution');
      valid = false;
    }
    return valid;
  }
}
