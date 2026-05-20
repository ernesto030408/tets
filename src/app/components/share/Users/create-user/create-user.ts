import { Component, inject } from '@angular/core';
import { Auth } from '../../../../services/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Users } from '../../../../services/users';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-user',
  imports: [
     CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser {
  createUserForm: FormGroup;
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private userService: Users,
    private router: Router
  ) {
    this.createUserForm = fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      role: ['User', [Validators.required]]
    })
  }


  onSubmit(): void {
    if (
      this.createUserForm.valid
    ) {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = ""
      const userData: { name: string, password: string, role: 'Admin' | 'User' } = this.createUserForm.value
      this.userService.createUser(userData).subscribe({
        next: () => {

          this.successMessage = 'Usuario creado exitosamente';
          this.createUserForm.reset({ role: 'User' });
          this.router.navigate(['/admin'])

        },
        error: (e: Error) => {
          this.loading = false;
          this.errorMessage = 'Error al crear el usuario. Intente nuevamente.';
          console.error('Error al crear usuario:', e);
        },
        complete: () => {
          this.loading = false
        }
      })
    }
  }
}
