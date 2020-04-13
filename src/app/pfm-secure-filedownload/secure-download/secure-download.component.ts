import { Component, ElementRef, ViewChild } from '@angular/core';
import { FileDownloadService } from '../services/file-download-service';
import { FileMetaData } from '../../pfm-common-models/FileMetaData';

@Component({
  selector: 'pfm-secure-download',
  templateUrl: './secure-download.component.html',
  styleUrls: ['./secure-download.component.css']
})
export class SecureDownloadComponent {
  @ViewChild('downloadLink', { static: false }) private downloadLink: ElementRef;

  linkeURL: string;

  constructor(private fileDownloadService: FileDownloadService) {}

  async downloadFile(item: FileMetaData): Promise<void> {
    const blob = await this.fileDownloadService.downloadSecureResource(item.id);
    const url = window.URL.createObjectURL(blob);

    const link = this.downloadLink.nativeElement;
    link.href = url;
    link.download = item.name;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
