import { Component, Input, OnInit } from '@angular/core';
import { NewsItem } from '../models/NewsItem';

@Component({
  selector: 'pfm-latest-news-pod',
  templateUrl: './latest-news-pod.component.html',
  styleUrls: ['./latest-news-pod.component.scss']
})
export class LatestNewsPodComponent implements OnInit {

  @Input() newsList:NewsItem[];

  constructor() { }

  ngOnInit() {
  }

}
