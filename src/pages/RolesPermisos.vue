<template>
    <div class="q-pa-md">
      <!-- Selector de Rol -->
      <q-select
        v-model="selectedRole"
        :options="roles"
        label="Seleccionar Rol"
        outlined
        @update:model-value="onRoleChange"  <!-- Evento para capturar cambio de rol -->
      />
  
      <!-- Árbol de datos -->
      <q-tree
        v-if="selectedRole"
        :nodes="nodes"
        node-key="id"
        :tick-strategy="'leaf'"    <!-- Selecciona solo los nodos hoja -->
        ticked.sync="checkedNodes"
        default-expand-all
        @update:ticked="onCheckChange"  <!-- Evento para capturar cambios en checkboxes -->
        class="q-mt-md"
      />
  
      <q-btn
        label="Obtener seleccionados"
        @click="getSelectedNodes"
        color="primary"
        class="q-mt-md"
      />
    </div>
  </template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    // Datos para el selector de roles
    const roles = ref([
      { label: 'Administrador', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' }
    ]);

    // Rol seleccionado
    const selectedRole = ref(null);

    // Datos para el árbol
    const nodes = ref([
      {
        id: 1,
        label: 'Node 1',
        children: [
          { id: 2, label: 'Child 1-1' },
          { id: 3, label: 'Child 1-2' }
        ]
      },
      {
        id: 4,
        label: 'Node 2',
        children: [
          { id: 5, label: 'Child 2-1' },
          {
            id: 6,
            label: 'Child 2-2',
            children: [
              { id: 7, label: 'Child 2-2-1' },
              { id: 8, label: 'Child 2-2-2' }
            ]
          }
        ]
      }
    ]);

    // Estado para almacenar los nodos seleccionados
    const checkedNodes = ref([]);

    // Función para capturar el rol seleccionado
    const onRoleChange = (newRole) => {
      console.log('Rol seleccionado:', newRole);
      // Aquí puedes hacer alguna acción según el rol seleccionado
    };

    // Función para capturar los nodos seleccionados
    const getSelectedNodes = () => {
      console.log('Nodos seleccionados:', checkedNodes.value);
    };

    // Función para capturar el cambio de checkboxes
    const onCheckChange = (checked) => {
      console.log('Cambio en checkboxes:', checked);
    };

    return {
      roles,
      selectedRole,
      nodes,
      checkedNodes,
      onRoleChange,
      getSelectedNodes,
      onCheckChange
    };
  }
};
</script>
