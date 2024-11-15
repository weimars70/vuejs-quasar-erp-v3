export interface User {
  id?: number;
  nombre: string;
  email: string;
  clave?: string;
  rol?: number;
  rol_nombre?: string;
}