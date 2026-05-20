import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Tasks } from '../../../../services/tasks';
import { Task } from '../../../../models/task.model';
import { User } from '../../../../models/user.model';
import { Users } from '../../../../services/users';
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
  selector: 'app-update-task',
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
  templateUrl: './update-task.html',
  styleUrl: './update-task.css',
})
export class UpdateTask implements OnInit {
  updateTaskForm: FormGroup;
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = false;
  id: any;
  users: User[] = [];
  currentUser: any;
  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: Tasks,
    private userService: Users,
    private route: ActivatedRoute,
    private authService: Auth
  ) {



    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'Admin';

    

    this.updateTaskForm = fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      userId: [{ value: '', disabled: !this.isAdmin }, [Validators.required]],
      status: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.taskService.getTaskById(this.id).subscribe({
      next: (task: Task) => {
        // Verificar que el usuario tenga permiso para editar esta tarea
        if (!this.isAdmin && task.userId !== this.currentUser.id) {
          this.errorMessage = 'No tienes permiso para editar esta tarea';
          setTimeout(() => {
            this.router.navigate(['/user/tasks']);
          }, 2000);
          return;
        }

        this.updateTaskForm.patchValue({
          name: task.name,
          description: task.description,
          status: task.status,
          userId: task.userId
        });
      },
      error: (e: Error) => {
        console.error('Error al cargar tarea:', e);
        this.errorMessage = 'Error al cargar la tarea';
      }
    });

    if (this.isAdmin) {
      this.loadUsers();
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
    if (this.updateTaskForm.invalid) return;

    this.loading = true;
    const updateTask = this.updateTaskForm.getRawValue();
    
    this.taskService.putTask(updateTask, this.id).subscribe({
      next: () => {
        this.successMessage = 'Tarea actualizada exitosamente';
        console.log('actualizado');
       

        setTimeout(() => {
          if (this.isAdmin) {
            this.router.navigate(['/admin/tasks']);
          } else {
            this.router.navigate(['/user/tasks']);
          }
        }, 1500);
      },
      error: (e: Error) => {
        this.loading = false;
        this.errorMessage = 'Error al actualizar la tarea';
        console.log(e);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}