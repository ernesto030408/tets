import { Component } from '@angular/core';
import { ListUsers } from "../share/Users/list-users/list-users";
import { RouterModule, RouterOutlet } from "@angular/router";
import { NavBar } from "../nav-bar/nav-bar";

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterModule, NavBar],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {

}
