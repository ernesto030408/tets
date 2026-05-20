import { Component, inject, OnInit } from '@angular/core';
import { Users } from '../../../../services/users';
import { User } from '../../../../models/user.model';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { gsap } from 'gsap';
@Component({
  selector: 'app-list-users',
  imports: [RouterModule,
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
  templateUrl: './list-users.html',
  styleUrl: './list-users.css',
})
export class ListUsers implements OnInit {
  private usersService = inject(Users)
  private router = inject(Router)
  listaUsuarios: User[] = []
  usuariosFiltrados: User[] = [];

  // Filtros
  searchTerm: string = '';
  selectedRole: string = '';
  ngOnInit(): void {
    this.listarUsuario()
  }

  listarUsuario() {
    this.usersService.getUsers().subscribe({
      next: (users: User[]) => {
        this.listaUsuarios = users;
        this.usuariosFiltrados = users
         requestAnimationFrame(()=>{
          this.animateRow()
         })  

      }, error: (e: Error) => {
        console.log(e.message)
      }
    })
  }


  // Método para filtrar usuarios
  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.listaUsuarios.filter(usuario => {
      const matchNombre = usuario.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchRol = this.selectedRole === '' || usuario.role === this.selectedRole;

      return matchNombre && matchRol;
    });
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.usuariosFiltrados = this.listaUsuarios;
  }

  delete(id: string) {
    this.usersService.deleteUser(id).subscribe({
      next: () => {
        console.log('borrado')
        this.listarUsuario()

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
