import {Component, Injector, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ProgrammingModel} from './models/ProgrammingModel';
import {PomService} from './services/pom-service';
import {DialogService} from '../pfm-coreui/services/dialog.service';
import {ProgrammingService} from './services/programming-service';

@Component({
    selector: 'app-programming-feature',
    templateUrl: './programming-feature.component.html',
    styleUrls: ['./programming-feature.component.css']
})
export class ProgrammingFeatureComponent implements OnInit {

    busy: boolean;
    ready = true;

    constructor(private programmingModel: ProgrammingModel, private pomService: PomService, private programmingService: ProgrammingService, private dialogService: DialogService) {
    }

    ngOnInit() {
    }

}
