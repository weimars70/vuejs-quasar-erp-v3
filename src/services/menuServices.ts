import type { MenuNode } from '../types/menu'
import  { api } from 'boot/axios';

export const menuService = {
  async getMenuItems(): Promise<MenuNode[]> {
    try {
      const response = await api.get('/plantilla');
      if (!response.data) throw new Error('Error consultando items');
      return JSON.parse(response.data[0].permisos);
    } catch (error) {
      console.error('Error loading menu:', error)
      // Return default menu items if API fails
      return [
        { path: '/inicio', label: 'Inicio', icon: 'home', children: [] },
        { path: '/colors', label: 'Colores', icon: 'palette', children: [] },
        { path: '/sizes', label: 'Tallas', icon: 'straighten', children: [] },
        { path: '/item-groups', label: 'Grupos', icon: 'category', children: [] },
        { path: '/purchases', label: 'Compras', icon: 'shopping_cart', children: [] },
        { path: '/roles', label: 'Roles', icon: 'admin_panel_settings', children: [] },
        { path: '/permisos', label: 'Permisos', icon: 'admin_panel_settings', children: [] }
      ]
    }
  },

  async getMenuRol(roleId: number): Promise<MenuNode[]> {
    const rol = roleId ?? 1;
    try {
      if (roleId > 0 ){
        const response = await api.get('/plantilla/'+roleId);
        if (!response.data) throw new Error('Error consultando items');
        return JSON.parse(response.data[0].permisos);    
      }else return [];
      
    } catch (error) {
      console.error('Error loading menu:', error)
      // Return default menu items if API fails
      return [];
    }
  },

  async getRoles(): Promise<any> {
    try {
      const response = await api.get('/roles');
      return response.data as Role[];  // Especificamos que data es un array de Role
    } catch (error) {
      console.error('Error loading roles:', error);
      return [];
    }
  },

  async saveMenuRol(rol: number, permisos: any[]): Promise<[]>{
    const rpta =JSON.stringify(permisos);
    
    const payload = {
      permisos: permisos, // Convierte permisos a string para cumplir con el DTO
      rol,
    };
  
    try {
      const response = await api.post('/plantilla', payload);
      return response;
    } catch (error) {
      console.error('Error saving menu:', error)
      throw error
    }
   
  },
    
  async saveMenuItems(items: MenuNode[]): Promise<void> {
    try {
      const response = await fetch('http://108.181.193.178:3000/erp/plantilla', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items)
      })
      if (!response.ok) throw new Error('Error saving menu items')
    } catch (error) {
      console.error('Error saving menu:', error)
      throw error
    }
  }
}