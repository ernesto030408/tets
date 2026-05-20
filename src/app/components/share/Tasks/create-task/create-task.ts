import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Tasks } from '../../../../services/tasks';
import { Users } from '../../../../services/users';
import { User } from '../../../../models/user.model';
import { Auth } from '../../../../services/auth';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-task',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule],
  templateUrl: './create-task.html',
  styleUrl: './create-task.css',
})
export class CreateTask implements OnInit {
  createTaskForm: FormGroup;
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = false;
  users: User[] = [];
  currentUser: any;
  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private taskService: Tasks,
    private userService: Users,
    private router: Router,
    private authService: Auth
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'Admin';

    this.createTaskForm = fb.group({
      name: ['', [Validators.required]],
      desciption: ['', [Validators.required]],
      userId: [{ value: this.currentUser?.id || '', disabled: !this.isAdmin }, [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadUsers();
    } else {
      // Para usuarios normales, asignar automáticamente su ID
      this.createTaskForm.patchValue({
        userId: this.currentUser.id
      });
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: (e: Error) => {
        console.error('Error al cargar usuarios:', e);
        this.errorMessage = 'Error al cargar la lista de usuarios';
      }
    });
  }

  onSubmit(): void {
    if (this.createTaskForm.valid || (!this.isAdmin && this.createTaskForm.get('name')?.valid && this.createTaskForm.get('desciption')?.valid)) {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const taskData = {
        name: this.createTaskForm.value.name,
        description: this.createTaskForm.value.desciption,
        status: 'pendiente',
        userId: this.isAdmin ? this.createTaskForm.value.userId : this.currentUser.id
      };

      console.log('Datos enviados:', taskData);

      this.taskService.postTask(taskData as any).subscribe({
        next: () => {
          this.successMessage = 'Tarea creada exitosamente';
          this.createTaskForm.reset();

          // Redirigir según el rol
          if (this.isAdmin) {
            this.router.navigate(['/admin/tasks']);
          } else {
            this.router.navigate(['/user/tasks']);
          }
        },
        error: (e: Error) => {
          this.loading = false;
          this.errorMessage = 'Error al crear la tarea. Intente nuevamente.';
          console.error('Error al crear tarea:', e);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}