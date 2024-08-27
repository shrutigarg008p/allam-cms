import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubCategoryRoutingModule } from './subcategory-routing.module';
import { SubCategoryComponent } from './list/sub-category.component';
import { AddSubCategoryComponent } from './add/add-sub-category.component';
import { EditSubCategoryComponent } from './edit/edit-sub-category.component';

import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SubCategoryRoutingModule,
    SharedModule
  ],
  declarations: [
  SubCategoryComponent,
  AddSubCategoryComponent,
  EditSubCategoryComponent
  ]
})
export class SubCategoryModule { }
