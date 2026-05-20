import { Component, inject, OnInit } from '@angular/core';
import { Tasks } from '../../../../services/tasks';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Task } from '../../../../models/task.model';
import { Users } from '../../../../services/users';
import { filter, map, Observable } from 'rxjs';
import { Auth } from '../../../../services/auth';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
@Component({
  selector: 'app-list-task',
  imports: [
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule
  ],
  templateUrl: './list-task.html',
  styleUrl: './list-task.css',
})
export class ListTask implements OnInit {
  private taskService = inject(Tasks)
  private userService = inject(Users)
  private router = inject(Router)
  private authService = inject(Auth)
  listaTareas: Task[] = []
  tareasFiltradas: Task[] = [];
  usuariosMap: { [key: string]: string } = {};
  currentUser: any
  isAdmin: boolean = false

  searchTerm: string = '';
  selectedStatus: string = '';


  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'Admin';
    this.listarTareas()

  }

  listarTareas() {

    const userId = this.currentUser?.id
    this.usuariosMap = {};

    if (this.isAdmin) {
      this.taskService.getTasks().subscribe({
        next: (tasks: Task[]) => {

          this.listaTareas = tasks
          this.tareasFiltradas = tasks;
          this.getUserName()
           requestAnimationFrame(()=>{
          this.animateRow()
         }) 
        }, error: (e: Error) => {
          console.log(e.message)
        }
      })
    } else if (userId) {
      this.taskService.getTasksByUserId(userId).subscribe({
        next: (tasks: Task[]) => {
          console.log("esta funcionado")
          this.listaTareas = tasks
          this.tareasFiltradas = tasks;
          this.getUserName()
           requestAnimationFrame(()=>{
          this.animateRow()
         }) 
        }, error: (e: Error) => {
          console.log(e.message)
        }
      })
    }

  }

  getUserName() {

    this.listaTareas.forEach(tarea => {
      if (tarea.userId) {
        this.userService.getUserById(tarea.userId).subscribe({
          next: (user) => {
            this.usuariosMap[tarea.userId] = user.name;
          }, error: (error) => {
            console.error(`Error al obtener usuario ${tarea.userId}:`, error);

            this.usuariosMap[tarea.userId] = 'Usuario no encontrado';
          }
        });
      } else {
        this.usuariosMap[''] = 'Sin asignar';

      }

    });
  }

  getName(userId: string): string {
    return this.usuariosMap[userId] || 'Cargando...';
  }

  // Método para filtrar tareas
  filtrarTareas(): void {
    this.tareasFiltradas = this.listaTareas.filter(tarea => {
      const matchNombre = tarea.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tarea.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchEstado = this.selectedStatus === '' || tarea.status === this.selectedStatus;

      return matchNombre && matchEstado;
    });
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.tareasFiltradas = this.listaTareas;
  }




  delete(id: string) {

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        console.log('borrado')
        this.listarTareas()

      },
      error: (e: Error) => {
        console.log('error')
      }
    })
  }


   ngAfterViewInit(): void {

    
    this.animateEntrance();
  }

  animateEntrance(): void {
    // Animación del header
    gsap.from('.custom-header', {
      duration: 0.6,
      y: -30,
      opacity: 0,
      ease: 'power2.out'
    });

    // Animación de los filtros
    gsap.from('.filters-container', {
      duration: 0.6,
      y: 20,
      opacity: 0,
      delay: 0.2,
      ease: 'power2.out'
    });

    // Animación de las filas de la tabla
    
  }
   animateRow(){
    gsap.from('.row', {
      duration: 1,
      x: -20,
      opacity: 0,
      stagger: 0.08,
      delay: 0.4,
      ease: 'power2.out',
     
    });
   }
}
