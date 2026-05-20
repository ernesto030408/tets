import { Component } from '@angular/core';
import { NavBar } from "../nav-bar/nav-bar";
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-user',
  imports: [NavBar, RouterModule,RouterOutlet],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {

}
