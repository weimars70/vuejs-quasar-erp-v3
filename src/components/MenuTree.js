export const templateMenu = [
    {
      path: '/',
      label: 'Inicio',
      icon: 'home',
      children: []
    },
    {
      path: '/colors',
      label: 'Colores',
      icon: 'palette',
      children: [
        {
          path: '/nuevo-color',
          label: 'Nuevo color',
          icon: 'dashboard',
          children: []
        }
      ]
    },
    {
      path: '/sizes',
      label: 'Tallas',
      icon: 'straighten',
      children: []
    },
    {
      path: '/item-groups',
      label: 'Grupos',
      icon: 'category',
      children: [
        {
          path: '/nuevo-grupo-editado',
          label: 'Nuevo grupo editado',
          icon: 'add',
          children: []
        }
      ]
    },
    {
      path: '/purchases',
      label: 'Compras',
      icon: 'shopping_cart',
      children: [
        {
          path: '/nueva-compra',
          label: 'Nueva Compra',
          icon: 'shopping_cart',
          children: []
        }
      ]
    },
    {
      path: '/roles',
      label: 'Roles',
      icon: 'admin_panel_settings',
      children: [
        {
          path: '/nuevo-rol',
          label: 'Nuevo Rol',
          icon: 'account_circle',
          children: []
        }
      ]
    },
    {
      path: '/permisos',
      label: 'Permisos',
      icon: 'admin_panel_settings',
      children: [
        {
          path: '/roles-permisos',
          label: 'Roles Permisos',
          icon: 'security',
          children: []
        }
      ]
    }
  ]
  
  export const permissionsMenu = [
    {
      path: '/',
      label: 'Inicio',
      icon: 'home',
      children: []
    },
    {
      path: '/purchases',
      label: 'Compras',
      icon: 'shopping_cart',
      children: [
        {
          path: '/nueva-compra',
          label: 'Nueva Compra',
          icon: 'shopping_cart',
          children: []
        }
      ]
    },
    {
      path: '/roles',
      label: 'Roles',
      icon: 'admin_panel_settings',
      children: [
        {
          path: '/nuevo-rol',
          label: 'Nuevo Rol',
          icon: 'account_circle',
          children: []
        }
      ]
    }
  ]