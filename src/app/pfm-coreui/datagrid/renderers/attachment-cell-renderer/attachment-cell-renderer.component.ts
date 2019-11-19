import { Component, OnInit } from '@angular/core';
import { ListItem } from '../../../../planning-feature/models/ListItem';

@Component({
  selector: 'pfm-attachment-cell-renderer',
  templateUrl: './attachment-cell-renderer.component.html',
  styleUrls: ['./attachment-cell-renderer.component.scss']
})
export class AttachmentCellRendererComponent implements OnInit {

  data: any;
  params: any;

  list:ListItem[];

  constructor(){}

  agInit(params) {
    this.params = params;
    this.data =  params.value;

    this.list = [];
    for(let x of this.data){
      let item:ListItem = new ListItem();
      item.name = x.name;
      item.value = x.name;
      item.id = x.name;
      this.list.push(item);
    }
  }

  ngOnInit() {}

}
