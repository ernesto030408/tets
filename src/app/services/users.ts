import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Users {
   private readonly apiUrl = "http://localhost:3000/users";
   private readonly http = inject(HttpClient)

   getUsers(): Observable<User[]>{
     return this.http.get<User[]>(this.apiUrl)
   }   

   getUserById(id:string):Observable<User>{
    return this.http.get<User>(`${this.apiUrl}/${id}`)
   }
   deleteUser(id:string):Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
   }
   putUser(user:User ,id:string):Observable<User>{
    return this.http.put<User>(`${this.apiUrl}/${id}`, user)
   }
   createUser(userData:{name:string,password:string,role:'Admin'|'User';}): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }
}
