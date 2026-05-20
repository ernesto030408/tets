import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Auth } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { response } from 'express';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import{gsap}from 'gsap'
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login    {
  loginForm: FormGroup
  errorMessage: string = "";
  loading: boolean = false
   hidePassword = true;
  returnUrl = '/admin';
  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
    // Obtener la URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { name, password } = this.loginForm.value;

      this.authService.login(name, password).subscribe({
        next: (response) => {
          console.log('login exitoso', response)

          const userRole = response.user.role
          if (userRole === 'Admin') {
            this.router.navigate(['/admin'])
          } else if (userRole === 'User') {
            this.router.navigate(['/user'])
          } else {
            this.router.navigate(['/user'])
          }
          
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'nombre o contraseña incorrectos';
          console.error('Error en login:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
     
  }
      ngAfterViewInit(): void {
        
          this.animate()
        
  }
  animate():void{
// Animación de entrada simple
    gsap.from('.login-card', {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: 'power2.out'
    });

    gsap.from('.logo-circle', {
      duration: 0.6,
      scale: 0,
      delay: 0.3,
      ease: 'back.out(1.7)'
    });

    gsap.from('.mat-mdc-form-field, .submit-button', {
      duration: 0.6,
      y: 20,
      opacity: 0,
      stagger: 0.1,
      delay: 0.5,
      ease: 'power2.out'
    });
  }
}

