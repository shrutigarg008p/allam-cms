import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DcService } from '../../services/dc.service';

//import { countries } from './countries';

@Component({
    selector: 'data-details',
    template: `
        <ng-container [formGroup]="dataDetails">
            <div class="row">
            <div class="col-xs-12 col-sm-12">
              <div class="dt-responsive table-responsive">
                <table id="autofill" class="table table-striped table-bordered nowrap dataTable" role="grid" aria-describedby="autofill_info">
                  <thead>
                    <tr>
                      <th width="15%">Question</th>
                      <th width="10%">Question File Url</th>
                      <th width="10%">Answer</th>
                      <th width="10%">Option 2</th>
                      <th width="10%">Option 3</th>
                      <th width="10%">Option 4</th>
                      <th width="10%">Level</th>
                      <th width="10%">Notes</th>
                      <th width="15%">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedProducts">
                      <td width="15%">{{ item.question }}</td>
                      <td width="10%">{{ item.question_file_url }}</td>
                      <td width="10%">{{ item.answer }}</td>
                      <td width="10%">{{ item.option2 }}</td>
                      <td width="10%">{{ item.option3 }}</td>
                      <td width="10%">{{ item.option4 }}</td>
                      <td width="10%">{{ item.level }}</td>
                      <td width="10%">{{ item.notes }}</td>
                      <td [innerHTML]="item.Remarks" width="15%"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
export class DataDetailsComponent  implements OnInit {
    //public countries: Array<string> = countries;
    selectProducts: any;
    updateUserInfo: any;
    constructor(private dataService: DcService){};
    @Input() public dataDetails: FormGroup;


    ngOnInit(){
      /*this.dataService.allPassedData.subscribe((allPassedData)=>{
       this.selectProducts = allPassedData;
       console.log(JSON.stringify(this.selectProducts)); // print the data
     }) */

      let selectedProducts = this.dataService.retrievePassedObject();
      console.log('selectedProducts '+JSON.stringify(selectedProducts)); // prints empty array

      /*this.dataService.sharedParam.subscribe(param=>console.log('paramProducts '+JSON.stringify(param)))*/

       /*this.dataService.retrievePassedObject.subscribe((allPassedData)=>{
         this.selectProducts = allPassedData;
         console.log(JSON.stringify(this.selectProducts)); // print the data
       }) */
       //this.dataService.sharedParam.subscribe(param=>console.log(param))

       /*this.dataService.getEvent().subscribe(info => {
        //this.updateUserInfo = info;

        console.log(info)
      })*/

      /*this.dataService.currentData.subscribe(data => {
        console.log(data);
      });*/
      //this.dataService.sharedParam.subscribe(param=>this.name=JSON.stringify(param))
      //console.log(this.name);
    }

    
}
