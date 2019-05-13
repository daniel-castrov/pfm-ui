import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FundingLine, Program, ProgramService} from '../../../../generated';

export interface Selection {
  program: Program;
  ba: string;
  pe: string;
  item: string;
}

@Component({
  selector: 'program-and-item-selector',
  templateUrl: './program-and-item-selector.component.html',
  styleUrls: ['../edit-program-details.component.scss']
})
export class ProgramAndItemSelectorComponent implements OnChanges {

  @Input() containerId: string;
  @Output() itemSelected = new EventEmitter();
  @Output() itemUnselected = new EventEmitter();

  selectedProgram: Program;
  selectedPE: string;
  selectedItem: string;

  pes: string[];
  items: string[];
  mapProgramToItem = new Map<string, Set<string>>();

  programs: Program[];

  constructor(private programService: ProgramService) {}

  async ngOnChanges() {
    this.programs = (await this.programService.getByContainer(this.containerId).toPromise()).result;
  }

  onProgramSelected() {
    this.selectedPE = undefined;
    this.itemUnselected.emit();

    this.mapProgramToItem.clear();
    this.selectedProgram.fundingLines.forEach( fl => {
      if (!this.mapProgramToItem.has(fl.programElement)) {
        this.mapProgramToItem.set(fl.programElement, new Set());
      }
      const items = this.mapProgramToItem.get(fl.programElement);
      items.add(fl.item);
    });

    this.pes = Array.from(this.mapProgramToItem.keys());
    this.pes.sort();
  }

  async onPESelected() {
    this.selectedItem = undefined;
    this.itemUnselected.emit();
    this.items = Array.from(this.mapProgramToItem.get(this.selectedPE));
    this.items.sort();
  }

  onItemSelected() {
    const selection = {program: this.selectedProgram, ba: this.getBA(), pe: this.selectedPE, item: this.selectedItem} as Selection;
    this.itemSelected.emit(selection);
  }

  private getBA(): string {
    const fundingLine: FundingLine = this.selectedProgram.fundingLines.find(
      fl => fl.programElement === this.selectedPE && fl.item === this.selectedItem
    );
    return fundingLine.baOrBlin;
  }
  
  getBaByPe(pe: string) {
    const fundingLine: FundingLine = this.selectedProgram.fundingLines.find(
      fl => fl.programElement === pe
    );
    return fundingLine.baOrBlin;
  }

}
