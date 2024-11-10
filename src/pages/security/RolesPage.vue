<template>
  <q-page padding>
    <div class="q-pa-md">
      <TableToolbar
        @register="openForm"
        @search="onSearch"
        @toggle-density="dense = !dense"
        @export="exportTable"
      />

      <q-dialog v-model="showForm" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ editMode ? 'Editar' : 'Nuevo' }} Rol</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-form @submit="saveRole" class="q-gutter-md">
              <q-input 
                v-model="formData.code" 
                label="Código" 
                outlined
                dense
                :readonly="editMode"
                :rules="[val => !!val || 'El código es requerido']"
              />
              <q-input 
                v-model="formData.name" 
                label="Nombre" 
                outlined
                dense
                :rules="[val => !!val || 'El nombre es requerido']"
              />
              <div class="row justify-end q-mt-md">
                <q-btn 
                  label="Cancelar" 
                  color="negative" 
                  flat 
                  v-close-popup
                  icon="close"
                />
                <q-btn 
                  label="Guardar" 
                  type="submit" 
                  color="primary" 
                  class="q-ml-sm"
                  :loading="saving"
                  icon="save"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-table
        ref="table"
        title="Roles"
        :rows="filteredRoles"
        :columns="columns"
        row-key="codigo"
        :loading="loading"
        :dense="dense"
        :filter="filter"
        :pagination="initialPagination"
        binary-state-sort
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn 
              flat 
              round 
              dense
              color="primary" 
              icon="edit" 
              @click="editRole(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              round 
              dense
              color="negative" 
              icon="delete" 
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import TableToolbar from 'components/TableToolbar.vue';

const $q = useQuasar();

const roles = ref<any[]>([]);
const formData = ref({ codigo: '', nombre: '' });
const loading = ref(false);
const saving = ref(false);
const showForm = ref(false);
const dense = ref(false);
const filter = ref('');
const editMode = ref(false);

const initialPagination = {
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 10
};

const columns = [
  { 
    name: 'codigo', 
    label: 'Código', 
    field: 'codigo', 
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'nombre', 
    label: 'Nombre', 
    field: 'nombre', 
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'actions', 
    label: 'Acciones', 
    field: 'actions', 
    align: 'center' 
  }
];

const filteredRoles = computed(() => {
  if (!roles.value) return [];
  if (!filter.value) return roles.value;
  const searchTerm = filter.value.toLowerCase();
  return roles.value.filter(role => 
    role?.nombre?.toLowerCase().includes(searchTerm)
  );
});

function openForm() {
  editMode.value = false;
  formData.value = { codigo: '', nombre: '' };
  showForm.value = true;
}

function editRole(row: any) {
  editMode.value = true;
  formData.value = { ...row };
  showForm.value = true;
}

function confirmDelete(row: any) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro que desea eliminar este rol?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const index = roles.value.findIndex(r => r.codigo === row.codigo);
      if (index > -1) {
        roles.value.splice(index, 1);
      }
      $q.notify({
        color: 'positive',
        message: 'Rol eliminado exitosamente',
        icon: 'check'
      });
    } catch (error: any) {
      $q.notify({
        color: 'negative',
        message: `Error al eliminar el rol: ${error.message}`,
        icon: 'error'
      });
    }
  });
}

async function saveRole() {
  try {
    saving.value = true;
    if (editMode.value) {
      const index = roles.value.findIndex(r => r.codigo === formData.value.codigo);
      if (index > -1) {
        roles.value[index] = { ...formData.value };
      }
    } else {
      roles.value.push({
        id: Date.now(),
        ...formData.value
      });
    }
    showForm.value = false;
    $q.notify({
      color: 'positive',
      message: 'Rol guardado exitosamente',
      icon: 'check'
    });
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Error al guardar el rol: ${error.message}`,
      icon: 'error'
    });
  } finally {
    saving.value = false;
  }
}

function onSearch(value: string) {
  filter.value = value;
}

function exportTable() {
  if (!roles.value?.length) {
    $q.notify({
      message: 'No hay datos para exportar',
      color: 'warning',
      icon: 'warning'
    });
    return;
  }

  const content = roles.value.map(row => `${row.codigo},${row.nombre}`).join('\n');
  const status = $q.exportFile(
    'roles.csv',
    `Código,Nombre\n${content}`,
    'text/csv'
  );

  if (!status) {
    $q.notify({
      message: 'El navegador denegó la descarga del archivo',
      color: 'negative',
      icon: 'warning'
    });
  }
}
</script>