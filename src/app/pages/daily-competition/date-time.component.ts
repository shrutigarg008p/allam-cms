import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DcService } from '../../services/dc.service';

//import { countries } from './countries';

@Component({
    selector: 'data-time',
    template: `
        <ng-container [formGroup]="dateTime">
            <div class="row">
                    <div class="col-sm-12 col-md-6 "> 
                      <div class="competition-logo-upload">
                        Start Time
                        </div>
                        <input type="time" class="form-control" formControlName="startTime">
                    </div>
                    <div class="col-sm-12 col-md-6 "> 
                      <div class="competition-logo-upload">
                        Start Date
                        </div>
                        <input type="date" class="form-control" formControlName="startDate">
                    </div>
                    <div class="col-sm-12 col-md-6 "> 
                      <div class="competition-logo-upload">
                        End Time
                        </div>
                        <input type="time" class="form-control" formControlName="endTime">
                    </div>
                    <div class="col-sm-12 col-md-6 "> 
                      <div class="competition-logo-upload">
                        End Date
                        </div>
                        <input type="date" class="form-control" formControlName="endDate">
                    </div>
                  </div>
                    
      </ng-container>
    `,
    providers: [DcService], // instead of injecting service in component inject in module for sigleton instance.
    encapsulation: ViewEncapsulation.None,
    styles: [`
        .k-list-horizontal .k-radio-item,
        .k-radio-list .k-radio-item:first-child {
            margin: 0 12px 0 0;
        }

        .k-radio+.k-radio-label, .k-radio-label+.k-radio {
            margin-left: 6px;
        }
    `]
})
export class DateTimeComponent  implements OnInit {
    
    constructor(private dataService: DcService){};
    @Input() public dateTime: FormGroup;


    ngOnInit(){
    }

    
}
