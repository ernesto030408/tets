import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class Tasks {
  private readonly apiUrl = 'http://localhost:3000/tasks'
  private readonly http = inject(HttpClient)

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl)
  }
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`)
  }
  getTasksByUserId(userId: string): Observable<Task[]> {
   return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}`)
  }
  deleteTask(id: string): Observable<Task> {
    return this.http.delete<Task>(`${this.apiUrl}/${id}`)
  }
   putTask(task:Task, id:string):Observable<Task>{
     return this.http.put<Task>(`${this.apiUrl}/${id}`,task)
   }
   postTask(task:Task):Observable<Task>{
    return this.http.post<Task>(this.apiUrl, task)
   }
}
