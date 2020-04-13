import { Component, OnInit } from '@angular/core';
import { ListItem } from '../../pfm-common-models/ListItem';
import { ListItemHelper } from 'src/app/util/ListItemHelper';
import { PomService } from '../services/pom-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { FormatterUtil } from 'src/app/util/formatterUtil';

@Component({
  selector: 'pfm-programming',
  templateUrl: './toa.component.html',
  styleUrls: ['./toa.component.scss']
})
export class ToaComponent implements OnInit {
  pomYears: ListItem[];
  defaultYear: ListItem;
  byYear: number;

  constructor(private pomService: PomService, private dialogService: DialogService) {}

  ngOnInit() {
    this.byYear = FormatterUtil.getCurrentFiscalYear() + 2;
    this.defaultYear = new ListItem();
    this.defaultYear.id = this.byYear.toString();
    this.defaultYear.name = this.byYear.toString();
    this.defaultYear.value = this.byYear.toString();
    this.pomService.getPomYearsByStatus(['OPEN', 'LOCKED', 'CLOSED']).subscribe(
      resp => {
        const years: string[] = (resp as any).result.map(String);
        const currentYear = years.find(element => element === this.byYear.toString());
        if (!currentYear) {
          years.push(this.byYear.toString());
        }
        this.pomYears = ListItemHelper.generateListItemFromArray(years);
      },
      error => {
        this.dialogService.displayInfo(error.error.error);
      }
    );
  }
}
