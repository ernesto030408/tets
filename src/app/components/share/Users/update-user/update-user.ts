import { Component, inject, OnInit } from '@angular/core';
import { Users } from '../../../../services/users';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../models/user.model';
import { response } from 'express';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-user',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    CommonModule],
  templateUrl: './update-user.html',
  styleUrl: './update-user.css',
})
export class UpdateUser implements OnInit {
  updateUserForm: FormGroup;
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = false;
   
  id: any

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: Users,
    private route: ActivatedRoute,

  ) {
    this.updateUserForm = fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id']
    this.userService.getUserById(this.id).subscribe({
      next: (user: User) => {
        this.updateUserForm.controls['name'].setValue(user.name),
          this.updateUserForm.controls['password'].setValue(user.password),
          this.updateUserForm.controls['role'].setValue(user.role)

      },
      error: (err) => {
        console.log(err)
      }
    })

  }

  onSubmit() {
    if (this.updateUserForm.invalid) return;

    const updateUser = this.updateUserForm.getRawValue()

    this.userService.putUser(updateUser, this.id).subscribe({
      next: () => {
        console.log('actualizado');
        this.router.navigate(['/admin'])

      }, error: (e: Error) => {
        console.log(e)
      }
    })

  }
}
