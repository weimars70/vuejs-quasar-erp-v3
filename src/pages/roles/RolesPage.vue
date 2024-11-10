<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Roles Management -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Roles</div>
            <q-form @submit="saveRole" class="q-gutter-md q-mt-md">
              <q-input 
                v-model="roleForm.codigo" 
                label="Código" 
                outlined 
                dense
                :rules="[val => !!val || 'Código es requerido']"
              />
              <q-input 
                v-model="roleForm.nombre" 
                label="Nombre" 
                outlined 
                dense
                :rules="[val => !!val || 'Nombre es requerido']"
              />
              <div class="row justify-end">
                <q-btn 
                  type="submit" 
                  color="primary" 
                  label="Guardar" 
                  :loading="saving"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="roles"
              :columns="columns"
              row-key="codigo"
              dense
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn-group flat>
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
                      @click="deleteRole(props.row)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Menu Tree -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Menú</div>
              <div class="row q-gutter-sm">
                <q-btn 
                  color="primary" 
                  icon="add" 
                  label="Nuevo Módulo" 
                  @click="addRootNode"
                />
                <q-btn 
                  color="secondary" 
                  icon="playlist_add" 
                  label="Módulos Predefinidos" 
                  @click="addDefaultModules"
                />
              </div>
            </div>

            <q-tree
              :nodes="menuTree"
              node-key="codigo"
              default-expand-all
            >
              <template v-slot:default-header="prop">
                <div class="row items-center full-width q-gutter-x-sm">
                  <q-icon :name="prop.node.icon || 'folder'" />
                  <div class="text-weight-medium">{{ prop.node.label }}</div>
                  <div class="text-caption text-grey-7" v-if="prop.node.path">
                    ({{ prop.node.path }})
                  </div>
                  <q-space />
                  <div class="row q-gutter-x-xs">
                    <q-btn
                      v-if="prop.node.level < 2"
                      flat
                      round
                      dense
                      color="positive"
                      icon="add"
                      @click.stop="addChildNode(prop.node)"
                    >
                      <q-tooltip>Agregar Subnivel</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      @click.stop="editNode(prop.node)"
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      @click.stop="deleteNode(prop.node)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </template>
            </q-tree>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Menu Node Dialog -->
    <q-dialog v-model="showMenuDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingNode ? 'Editar' : 'Nuevo' }} Menú</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveMenuNode" class="q-gutter-md">
            <q-input 
              v-model="menuForm.label" 
              label="Nombre" 
              outlined 
              dense
              :rules="[val => !!val || 'Nombre es requerido']"
              @update:model-value="updateSuggestedPath"
            />
            <q-input 
              v-model="menuForm.path" 
              label="Ruta" 
              outlined 
              dense
              :hint="suggestedPath"
            >
              <template v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  @click="menuForm.path = suggestedPath"
                >
                  <q-tooltip>Usar ruta sugerida</q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <q-select
              v-model="menuForm.icon"
              :options="icons"
              label="Icono"
              outlined
              dense
              emit-value
              map-options
              options-dense
              use-input
              input-debounce="0"
              @filter="filterIcons"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.value" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected>
                <q-icon :name="menuForm.icon || 'folder'" class="q-mr-xs" />
                {{ getIconLabel(menuForm.icon) }}
              </template>
            </q-select>

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" color="negative" flat v-close-popup />
              <q-btn label="Guardar" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useQuasar } from 'quasar';
import { defaultModules } from './data/menuStructure';
import { icons } from './data/icons';

const $q = useQuasar();

// Roles Management
const roles = ref([]);
const roleForm = ref({ codigo: '', nombre: '' });
const saving = ref(false);

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
];

// Menu Tree Management
const menuTree = ref([]);
const showMenuDialog = ref(false);
const editingNode = ref(null);
const currentParentNode = ref(null);

const menuForm = ref({
  id: '',
  label: '',
  icon: 'folder',
  path: '',
  children: [],
  level: 0
});

const suggestedPath = ref('');
const filteredIcons = ref(icons);

// Computed
const parentPath = computed(() => {
  if (!currentParentNode.value) return '';
  return currentParentNode.value.path || '';
});

// Functions
function filterIcons(val, update) {
  if (val === '') {
    update(() => {
      filteredIcons.value = icons;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredIcons.value = icons.filter(
      v => v.label.toLowerCase().indexOf(needle) > -1 ||
           v.value.toLowerCase().indexOf(needle) > -1
    );
  });
}

function getIconLabel(iconValue) {
  const icon = icons.find(i => i.value === iconValue);
  return icon ? icon.label : iconValue;
}

function addDefaultModules() {
  const existingModules = new Set(menuTree.value.map(node => node.id));
  const newModules = defaultModules.filter(module => !existingModules.has(module.id));
  
  if (newModules.length === 0) {
    $q.notify({
      message: 'Todos los módulos predefinidos ya están agregados',
      color: 'warning'
    });
    return;
  }

  menuTree.value.push(...newModules.map(module => ({
    ...module,
    id: module.id || uuidv4(),
    level: 0,
    children: []
  })));

  $q.notify({
    message: `Se agregaron ${newModules.length} módulos predefinidos`,
    color: 'positive'
  });
}

function addRootNode() {
  editingNode.value = null;
  currentParentNode.value = null;
  menuForm.value = {
    id: uuidv4(),
    label: '',
    icon: 'folder',
    path: '',
    children: [],
    level: 0
  };
  showMenuDialog.value = true;
}

function addChildNode(parentNode) {
  if (parentNode.level >= 2) return;
  
  editingNode.value = null;
  currentParentNode.value = parentNode;
  menuForm.value = {
    id: uuidv4(),
    label: '',
    icon: 'folder',
    path: '',
    children: [],
    level: parentNode.level + 1
  };
  showMenuDialog.value = true;
}

function editNode(node) {
  editingNode.value = node;
  currentParentNode.value = findParentNode(menuTree.value, node.id);
  menuForm.value = { ...node };
  showMenuDialog.value = true;
}

function deleteNode(node) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar "${node.label}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    if (node.level === 0) {
      const index = menuTree.value.findIndex(n => n.id === node.id);
      if (index > -1) {
        menuTree.value.splice(index, 1);
      }
    } else {
      deleteNodeFromTree(menuTree.value, node.id);
    }
  });
}

function updateSuggestedPath() {
  if (!menuForm.value.label) return;
  
  const parentPath = currentParentNode.value?.path || '';
  const slug = menuForm.value.label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
    
  suggestedPath.value = parentPath ? `${parentPath}/${slug}` : `/${slug}`;
}

function saveMenuNode() {
  const newNode = {
    ...menuForm.value,
    path: menuForm.value.path || suggestedPath.value
  };
  
  if (editingNode.value) {
    Object.assign(editingNode.value, newNode);
  } else if (currentParentNode.value) {
    currentParentNode.value.children = currentParentNode.value.children || [];
    currentParentNode.value.children.push(newNode);
  } else {
    menuTree.value.push(newNode);
  }
  
  showMenuDialog.value = false;
  
  $q.notify({
    message: `${editingNode.value ? 'Actualizado' : 'Agregado'} correctamente`,
    color: 'positive'
  });
}

function findParentNode(nodes, id) {
  for (const node of nodes) {
    if (node.children?.some(child => child.id === id)) {
      return node;
    }
    if (node.children?.length) {
      const found = findParentNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function deleteNodeFromTree(nodes, id) {
  for (const node of nodes) {
    if (node.children) {
      const index = node.children.findIndex(n => n.id === id);
      if (index > -1) {
        node.children.splice(index, 1);
        return true;
      }
      if (deleteNodeFromTree(node.children, id)) {
        return true;
      }
    }
  }
  return false;
}

// Initialize
onMounted(() => {
  // Add default modules on component mount
  addDefaultModules();
});
</script>

<style lang="scss" scoped>
.q-tree {
  .q-tree__node-header {
    padding: 4px;
    border-radius: 4px;
    
    &:hover {
      background: rgba(0,0,0,0.03);
    }
  }
}

.q-select {
  :deep(.q-field__native) {
    line-height: 1;
  }
  
  :deep(.q-item) {
    min-height: 40px;
    padding: 4px 16px;
  }
}
</style>