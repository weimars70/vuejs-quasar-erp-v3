<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-mb-md justify-between items-center">
        <div class="text-h6">Configuración del Menú</div>
        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            icon="add"
            label="Nuevo Módulo"
            @click="addRootModule"
          />
          <q-btn
            color="secondary"
            icon="save"
            label="Guardar Estructura"
            @click="saveMenuStructure"
            :loading="saving"
          />
        </div>
      </div>

      <q-tree
        :nodes="menuTree"
        node-key="id"
        default-expand-all
      >
        <template v-slot:default-header="prop">
          <div class="row items-center full-width q-gutter-x-sm">
            <q-icon :name="prop.node.icon || 'folder'" size="sm" />
            <div class="text-weight-medium">{{ prop.node.label }}</div>
            <div class="text-caption text-grey">{{ prop.node.path }}</div>
            <q-space />
            <div class="row q-gutter-x-xs">
              <q-btn
                v-if="prop.node.children"
                flat
                round
                dense
                color="primary"
                icon="add"
                @click.stop="addChildModule(prop.node)"
              >
                <q-tooltip>Agregar Submódulo</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click.stop="editModule(prop.node)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click.stop="confirmDeleteModule(prop.node)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
      </q-tree>

      <!-- Vista previa del JSON -->
      <div class="q-mt-lg">
        <q-expansion-item
          group="json-preview"
          icon="code"
          label="Vista previa del JSON"
          header-class="text-primary"
        >
          <q-card>
            <q-card-section>
              <pre class="json-preview">{{ prettyJson }}</pre>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                flat
                color="primary"
                icon="content_copy"
                label="Copiar"
                @click="copyJson"
              />
            </q-card-actions>
          </q-card>
        </q-expansion-item>
      </div>

      <q-dialog v-model="showModuleForm" persistent>
        <q-card style="min-width: 400px">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ editMode ? 'Editar' : 'Nuevo' }} Módulo</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-form @submit="saveModule" class="q-gutter-md">
              <q-input
                v-model="moduleForm.label"
                label="Nombre"
                outlined
                dense
                :rules="[val => !!val || 'El nombre es requerido']"
                @update:model-value="updatePath"
              />
              
              <q-select
                v-model="moduleForm.icon"
                :options="icons"
                label="Icono"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'El icono es requerido']"
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
              </q-select>

              <q-input
                v-model="moduleForm.path"
                label="Ruta"
                outlined
                dense
                readonly
                :hint="editMode ? undefined : 'La ruta se genera automáticamente'"
              >
                <template v-slot:prepend>
                  <div class="text-grey-7">/</div>
                </template>
              </q-input>

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
                  icon="save"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { v4 as uuidv4 } from 'uuid';
import { defaultModules } from './data/menuStructure';
import { icons } from './data/icons';

const $q = useQuasar();

const menuTree = ref(defaultModules);
const showModuleForm = ref(false);
const editMode = ref(false);
const currentParent = ref<any>(null);
const saving = ref(false);

const moduleForm = ref({
  id: '',
  label: '',
  icon: '',
  path: '',
  children: []
});

// Computed property para generar el JSON formateado
const prettyJson = computed(() => {
  return JSON.stringify(cleanMenuTree(menuTree.value), null, 2);
});

// Función para generar la ruta basada en el nombre
function generatePath(label: string, parentPath?: string): string {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales por guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final

  return parentPath ? `${parentPath}/${slug}` : `/${slug}`;
}

// Función para actualizar la ruta cuando cambia el nombre
function updatePath() {
  if (!editMode.value) {
    const parentPath = currentParent.value?.path;
    moduleForm.value.path = generatePath(moduleForm.value.label, parentPath);
  }
}

// Función para limpiar el árbol antes de convertirlo a JSON
function cleanMenuTree(tree: any[]) {
  return tree.map(node => {
    const cleanNode = {
      id: node.id,
      label: node.label,
      icon: node.icon,
      path: node.path,
      children: node.children?.length ? cleanMenuTree(node.children) : []
    };
    return cleanNode;
  });
}

// Función para copiar el JSON al portapapeles
function copyJson() {
  navigator.clipboard.writeText(prettyJson.value).then(() => {
    $q.notify({
      color: 'positive',
      message: 'JSON copiado al portapapeles',
      icon: 'content_copy'
    });
  });
}

// Función para guardar la estructura del menú
async function saveMenuStructure() {
  try {
    saving.value = true;
    const menuStructure = cleanMenuTree(menuTree.value);
    
    // Aquí iría la llamada a la API para guardar la estructura
    console.log('Estructura del menú:', menuStructure);
    
    // Simular delay de guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    $q.notify({
      color: 'positive',
      message: 'Estructura del menú guardada exitosamente',
      icon: 'check'
    });
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Error al guardar la estructura: ${error.message}`,
      icon: 'error'
    });
  } finally {
    saving.value = false;
  }
}

function addRootModule() {
  editMode.value = false;
  currentParent.value = null;
  moduleForm.value = {
    id: uuidv4(),
    label: '',
    icon: '',
    path: '',
    children: []
  };
  showModuleForm.value = true;
}

function addChildModule(parent: any) {
  editMode.value = false;
  currentParent.value = parent;
  moduleForm.value = {
    id: uuidv4(),
    label: '',
    icon: '',
    path: '',
    children: []
  };
  showModuleForm.value = true;
}

function editModule(module: any) {
  editMode.value = true;
  moduleForm.value = { ...module };
  showModuleForm.value = true;
}

function confirmDeleteModule(module: any) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro que desea eliminar este módulo?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteModule(module);
  });
}

function deleteModule(moduleToDelete: any) {
  function removeFromTree(nodes: any[]) {
    const index = nodes.findIndex(node => node.id === moduleToDelete.id);
    if (index > -1) {
      nodes.splice(index, 1);
      return true;
    }
    for (const node of nodes) {
      if (node.children && removeFromTree(node.children)) {
        return true;
      }
    }
    return false;
  }

  if (removeFromTree(menuTree.value)) {
    $q.notify({
      color: 'positive',
      message: 'Módulo eliminado exitosamente',
      icon: 'check'
    });
  }
}

function saveModule() {
  const newModule = {
    id: moduleForm.value.id,
    label: moduleForm.value.label,
    icon: moduleForm.value.icon,
    path: moduleForm.value.path,
    children: moduleForm.value.children
  };

  if (editMode.value) {
    function updateInTree(nodes: any[]) {
      const index = nodes.findIndex(node => node.id === newModule.id);
      if (index > -1) {
        nodes[index] = { ...nodes[index], ...newModule };
        return true;
      }
      for (const node of nodes) {
        if (node.children && updateInTree(node.children)) {
          return true;
        }
      }
      return false;
    }

    updateInTree(menuTree.value);
  } else {
    if (currentParent.value) {
      const parent = menuTree.value.find(node => node.id === currentParent.value.id);
      if (parent) {
        parent.children.push(newModule);
      }
    } else {
      menuTree.value.push(newModule);
    }
  }

  showModuleForm.value = false;
  $q.notify({
    color: 'positive',
    message: 'Módulo guardado exitosamente',
    icon: 'check'
  });
}
</script>

<style lang="scss" scoped>
.q-tree {
  font-size: 14px;
  
  :deep(.q-tree__node-header) {
    padding: 8px;
    border-radius: 4px;
    
    &:hover {
      background: rgba(0,0,0,0.03);
    }
  }
}

.json-preview {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.body--dark {
  .json-preview {
    background: #1d1d1d;
  }
}
</style>