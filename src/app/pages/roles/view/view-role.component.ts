import { Component, OnInit } from '@angular/core';

import { Role } from '../../../models/role';
import { Permission } from '../../../models/permission';
import { RoleService } from '../../../services/role.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ValueTransformer } from '@angular/compiler/src/util';

@Component({
  selector: 'app-role',
  templateUrl: './view-role.component.html',
  styleUrls: ['./view-role.component.scss']
})
export class ViewRoleComponent implements OnInit 
{
  roles: Role[];
  permissions: any[];
  isNewRole: boolean;
  viewRole: any = {};
  viewPermission: any[];
  private toasterService: ToasterService;
  id: number;

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
  private activeAouter: ActivatedRoute, 
  ) 
  {}



  ngOnInit() 
  {
     this.id = this.activeAouter.snapshot.params['roleId'];
     this.getDetail(this.id);
     this.getAllPermission();
      this.roleForm = this.fb.group({
            name: ['', Validators.required],
            description: [],
            permissionArray: this.fb.array([])
      });
      
  }

  private getDetail(id) {
        this.roleService.getById(id).subscribe(roles => { 
        this.viewRole = roles['role'][0]; 
        //console.log(roles['permission']);
        //this.viewPermission = roles['permission'];    
        const mypermissionArray: any[]=[];
        const permissionArray: FormArray = this.roleForm.get('permissionArray') as FormArray;

        for (var index in roles['permission']) 
        {
          mypermissionArray[roles['permission'][index]['permission_id']]=roles['permission'][index]['permission_id'];
          permissionArray.push(new FormControl(roles['permission'][index]['permission_id'].toString()));
        }

        this.viewPermission=mypermissionArray;
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
        this.roleService.updateRole(this.roleForm.value,this.id)
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
                      this.alertService.pop('success', 'Role Updated successfully');
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
    this.viewRole = {};
  }
}
