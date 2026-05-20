import { Component, inject, OnInit } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import{MatDividerModule}from '@angular/material/divider'

@Component({
  selector: 'app-nav-bar',
  imports: [RouterModule, RouterLinkActive
    ,CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  private authService = inject(Auth)

  rol: string| any= this.authService.getCurrentUser()?.role
      
  logOut() {
    this.authService.logout()
  }
}
