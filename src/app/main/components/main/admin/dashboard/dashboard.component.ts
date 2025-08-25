import { Component } from '@angular/core';
import { BaseComponent } from '../../../../../base.component';
import { CommonService } from '../../../../../services/common.service';
import { LogHandlerService } from '../../../../../services/log-handler.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent extends BaseComponent<any> {
  constructor(commonService:CommonService,logHandler:LogHandlerService) {
    super(commonService,logHandler);
    this.viewModel = {};

  }

  ngOnInit(){
    this._commonService.dismissLoader();
  }




}
