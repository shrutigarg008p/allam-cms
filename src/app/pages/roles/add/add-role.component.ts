import { Component, OnInit } from '@angular/core';

import { Role } from '../../../models/role';
import { Permission } from '../../../models/permission';
import { RoleService } from '../../../services/role.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValueTransformer } from '@angular/compiler/src/util';

@Component({
  selector: 'app-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit 
{
  roles: Role[];
  permissions: any[];
  isNewRole: boolean;
  newRole: any = {};
  private toasterService: ToasterService;

  roleForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  
  constructor(
  private roleService: RoleService,
  private router:Router,
  private alertService: ToasterService,
  private fb: FormBuilder,
  ) 
  {}



  ngOnInit() 
  {
     this.getAllPermission();

      this.roleForm = this.fb.group({
            name: ['', Validators.required],
            description: [],
            permissionArray: this.fb.array([])
      });
  }


onCheckboxChange(e) {
    const permissionArray: FormArray = this.roleForm.get('permissionArray') as FormArray;
    if (e.target.checked) {
      permissionArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      permissionArray.controls.forEach((item: FormControl) => {
        if (item.value == e.target.value) {
          permissionArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  private getAllPermission() {
        this.roleService.getAllPermission().subscribe(permissions => { 
        this.permissions = permissions['data']; 
       
        });
  }

  
  get f() { return this.roleForm.controls; }

  
  onSubmit() {
      
       console.log(this.roleForm.value)

        this.submitted = true;

        // stop here if form is invalid
        if (this.roleForm.invalid) {
            return;
        }
 
        this.loading = true;
        this.roleService.createRole(this.roleForm.value)
            .subscribe(
                data => {
                console.log(data);
                    if(data['status']==200)
                    {
                       this.alertService.pop('success', data['msg']);
                       this.router.navigate(['/role']);
                    }
                    else if(data['status']==303)
                    {
                      this.alertService.pop('error', data['msg']);
                      this.router.navigate(['/role']);
                    }
                    else{
                      this.alertService.pop('error', data['msg']);
                      this.loading = false;
                    }
                    
                },
                error => {
                    this.alertService.pop("Something went wrong. Try again later.");
                    this.loading = false;
                });


    }
   

  cancelNewRole() {
    this.newRole = {};
  }
}
