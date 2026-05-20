export interface Task{
    id:string,
    name:string,
    description:string,
    status:"pendiente" | "En Progreso" | "Completada",
    userId:string
}