import type { QTableColumn } from 'quasar';

export function useUserTableColumns(): QTableColumn[] {
  return [
    {
      name: 'id',
      required: true,
      label: 'ID',
      align: 'left',
      field: 'id',
      sortable: true
    },
    {
      name: 'nombre',
      required: true,
      label: 'Nombre',
      align: 'left',
      field: 'nombre',
      sortable: true
    },
    {
      name: 'email',
      required: true,
      label: 'Email',
      align: 'left',
      field: 'email',
      sortable: true
    },
    {
      name: 'rol',
      required: true,
      label: 'Rol',
      align: 'left',
      field: row => row.rol_nombre || 'Sin rol',
      sortable: true
    },
    {
      name: 'actions',
      required: true,
      label: 'Acciones',
      align: 'center',
      field: 'actions'
    }
  ];
}