import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../pfm-coreui/services/toast.service';
import { SnapshotService } from '../../services/snapshot.service';

@Component({
  selector: 'app-manage-snapshot',
  templateUrl: './manage-snapshot.component.html',
  styleUrls: ['./manage-snapshot.component.scss']
})
export class ManageSnapshotComponent implements OnInit {
  snapshotList: any[];
  snapshot: any = {};
  selectedSnapshot: any = null;
  busy = false;

  loadConfirmationDlg = {
    title: 'Warning',
    display: false
  };

  constructor(private toastService: ToastService, private snapshotService: SnapshotService) {}

  ngOnInit() {
    this.getSnapshots();
  }

  handleSaveSnapshot() {
    this.busy = true;
    if (this.snapshot.description) {
      this.snapshotService
        .create(this.snapshot.description)
        .subscribe(
          data => {
            this.toastService.displaySuccess('Snapshot saved successfully.');
            this.snapshot = {};
            this.getSnapshots();
          },
          error => {
            this.toastService.displayError('An error has occurred while attempting to save snapshot.');
          }
        )
        .add(() => (this.busy = false));
    } else {
      this.toastService.displayError('A description is required');
    }
  }

  handleLoadSnapshot() {
    if (this.selectedSnapshot) {
      this.busy = true;
      this.snapshotService
        .apply(this.selectedSnapshot.collectionName)
        .subscribe(
          data => {
            this.toastService.displaySuccess('Snapshot loaded successfully.');
            this.snapshot = {};
            this.getSnapshots();
            this.loadConfirmationDlg.display = false;
          },
          error => {
            this.toastService.displayError('An error has occurred while attempting to load snapshot.');
          }
        )
        .add(() => (this.busy = false));
    } else {
      this.toastService.displayError('A snapshot is required');
    }
  }

  showConfirmDialog() {
    if (this.selectedSnapshot) {
      this.loadConfirmationDlg.display = true;
    } else {
      this.toastService.displayError('A snapshot is required');
    }
  }

  getSnapshots() {
    this.busy = true;
    this.snapshotService
      .getAll()
      .subscribe(data => {
        this.snapshotList = (data as any).metas;
      })
      .add(() => (this.busy = false));
  }
}
