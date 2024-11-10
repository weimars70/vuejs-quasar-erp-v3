<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Gestión de Roles y Menús</div>
      <div class="row q-gutter-sm">
        <q-btn color="primary" icon="add" label="Nuevo Módulo" @click="addRootNode" />
        <q-btn color="secondary" icon="playlist_add" label="Módulos Predefinidos" @click="addDefaultModules" />
      </div>
    </div>

    <q-tree
      :nodes="menuTree"
      node-key="id"
      default-expand-all
      class="menu-tree"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center full-width q-gutter-x-sm">
          <q-icon :name="prop.node.icon || 'folder'" size="sm" />
          <div class="text-weight-medium">{{ prop.node.label }}</div>
          <div class="text-caption text-grey" v-if="prop.node.path">({{ prop.node.path }})</div>
          <q-space />
          <div class="row q-gutter-x-xs">
            <q-btn
              v-if="prop.node.type !== 'action'"
              flat
              round
              dense
              icon="add"
              size="sm"
              color="positive"
              @click.stop="addChildNode(prop.node)"
            >
              <q-tooltip>Agregar {{ prop.node.type === 'module' ? 'Menú' : 'Acción' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="edit"
              size="sm"
              color="primary"
              @click.stop="editNode(prop.node)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              size="sm"
              color="negative"
              @click.stop="deleteNode(prop.node)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>
    </q-tree>

    <!-- Node Dialog -->
    <q-dialog v-model="showNodeDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingNode ? 'Editar' : 'Nueva' }} {{ getTypeLabel(nodeForm.type) }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveNode" class="q-gutter-md">
            <q-input
              v-model="nodeForm.label"
              label="Nombre *"
              outlined
              dense
              :rules="[val => !!val || 'Nombre es requerido']"
              @update:model-value="updateSuggestedPath"
            />
            <q-input
              v-if="nodeForm.type !== 'module'"
              v-model="nodeForm.path"
              label="Ruta"
              outlined
              dense
              :rules="[val => !!val || 'Ruta es requerida']"
              :hint="suggestedPath"
            >
              <template v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  @click="nodeForm.path = suggestedPath"
                >
                  <q-tooltip>Usar ruta sugerida</q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <q-select
              v-model="nodeForm.icon"
              :options="availableIcons"
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
              <template v-slot:option="{ itemProps, opt }">
                <q-item v-bind="itemProps">
                  <q-item-section avatar>
                    <q-icon :name="opt.value" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ opt.label }}</q-item-label>
                    <q-item-label caption>{{ opt.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected>
                <q-icon :name="nodeForm.icon || 'help'" class="q-mr-xs" />
                {{ getIconLabel(nodeForm.icon) }}
              </template>
            </q-select>
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" color="grey" flat v-close-popup />
              <q-btn type="submit" :label="editingNode ? 'Actualizar' : 'Guardar'" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { v4 as uuidv4 } from 'uuid';
import { defaultModules } from './data/menuStructure';
import { icons } from './data/icons';

const $q = useQuasar();

const menuTree = ref([]);
const showNodeDialog = ref(false);
const editingNode = ref(null);
const selectedNode = ref(null);
const suggestedPath = ref('');

const nodeForm = ref({
  id: '',
  label: '',
  icon: '',
  path: '',
  type: 'module',
  children: []
});

const availableIcons = icons;
const filteredIcons = ref(availableIcons);

function filterIcons(val, update) {
  if (val === '') {
    update(() => {
      filteredIcons.value = availableIcons;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredIcons.value = availableIcons.filter(
      v => v.label.toLowerCase().indexOf(needle) > -1 ||
           v.value.toLowerCase().indexOf(needle) > -1
    );
  });
}

function getIconLabel(iconValue) {
  const icon = availableIcons.find(i => i.value === iconValue);
  return icon ? icon.label : iconValue;
}

function getTypeLabel(type) {
  const types = {
    module: 'Módulo',
    menu: 'Menú',
    action: 'Acción'
  };
  return types[type] || type;
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
    id: module.id || uuidv4()
  })));

  $q.notify({
    message: `Se agregaron ${newModules.length} módulos predefinidos`,
    color: 'positive'
  });
}

function addRootNode() {
  editingNode.value = null;
  selectedNode.value = null;
  nodeForm.value = {
    id: uuidv4(),
    label: '',
    icon: 'folder',
    path: '',
    type: 'module',
    children: []
  };
  showNodeDialog.value = true;
}

function addChildNode(parentNode) {
  if (parentNode.type === 'action') return;
  
  editingNode.value = null;
  selectedNode.value = parentNode;
  nodeForm.value = {
    id: uuidv4(),
    label: '',
    icon: 'folder',
    path: '',
    type: parentNode.type === 'module' ? 'menu' : 'action',
    children: []
  };
  showNodeDialog.value = true;
}

function editNode(node) {
  editingNode.value = node;
  selectedNode.value = findParentNode(menuTree.value, node.id);
  nodeForm.value = { ...node };
  showNodeDialog.value = true;
}

function deleteNode(node) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar "${node.label}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    if (node.type === 'module') {
      const index = menuTree.value.findIndex(n => n.id === node.id);
      if (index > -1) {
        menuTree.value.splice(index, 1);
      }
    } else {
      deleteNodeFromTree(menuTree.value, node.id);
    }
  });
}

function deleteNodeFromTree(nodes, nodeId) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].children) {
      const index = nodes[i].children.findIndex(n => n.id === nodeId);
      if (index > -1) {
        nodes[i].children.splice(index, 1);
        return true;
      }
      if (deleteNodeFromTree(nodes[i].children, nodeId)) {
        return true;
      }
    }
  }
  return false;
}

function findParentNode(nodes, nodeId) {
  for (const node of nodes) {
    if (node.children) {
      const found = node.children.find(n => n.id === nodeId);
      if (found) return node;
      const result = findParentNode(node.children, nodeId);
      if (result) return result;
    }
  }
  return null;
}

function updateSuggestedPath() {
  if (nodeForm.value.type === 'module') {
    suggestedPath.value = `/${nodeForm.value.label.toLowerCase()}`;
    return;
  }
  
  const parentNode = selectedNode.value;
  const parentPath = parentNode?.path || '';
  const slug = nodeForm.value.label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
    
  suggestedPath.value = parentPath ? `${parentPath}/${slug}` : slug;
}

function saveNode() {
  const newNode = { ...nodeForm.value };
  
  if (!newNode.path && newNode.type === 'module') {
    newNode.path = `/${newNode.label.toLowerCase()}`;
  }
  
  if (editingNode.value) {
    Object.assign(editingNode.value, newNode);
  } else if (selectedNode.value) {
    if (!selectedNode.value.children) {
      selectedNode.value.children = [];
    }
    selectedNode.value.children.push(newNode);
  } else {
    menuTree.value.push(newNode);
  }
  
  showNodeDialog.value = false;
  
  $q.notify({
    message: `${editingNode.value ? 'Actualizado' : 'Agregado'} correctamente`,
    color: 'positive'
  });
}
</script>

<style lang="scss" scoped>
.menu-tree {
  :deep(.q-tree__node-header) {
    padding: 4px;
    border-radius: 4px;
    
    &:hover {
      background: rgba(0,0,0,0.03);
    }
  }
  
  :deep(.q-tree__children) {
    padding-left: 32px;
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