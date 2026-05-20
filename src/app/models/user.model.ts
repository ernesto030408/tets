export interface User{
    id:string;
    name:string;
    password:string;
    role:"Admin"| "User"
    
}

export interface AuthResponse {
  accessToken: string;
  user:User
}