<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:model-value', $event)" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ editing ? 'Editar' : 'Nueva' }} {{ getTypeLabel(node?.type) }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.label"
            label="Nombre *"
            outlined
            dense
            :rules="[val => !!val || 'Nombre es requerido']"
            @update:model-value="updateSuggestedPath"
          />
          
          <q-input
            v-if="form.type !== 'module'"
            v-model="form.path"
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
                @click="form.path = suggestedPath"
              >
                <q-tooltip>Usar ruta sugerida</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <q-select
            v-model="form.icon"
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
              <q-icon :name="form.icon || 'help'" class="q-mr-xs" />
              {{ getIconLabel(form.icon) }}
            </template>
          </q-select>

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" color="grey" flat v-close-popup />
            <q-btn type="submit" :label="editing ? 'Actualizar' : 'Guardar'" color="primary" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { icons } from '../data/icons';

const props = defineProps({
  modelValue: Boolean,
  node: Object,
  editing: Boolean,
  parentNode: Object
});

const emit = defineEmits(['update:model-value', 'save']);

const form = ref({
  id: '',
  label: '',
  icon: '',
  path: '',
  type: 'module',
  children: []
});

const suggestedPath = ref('');
const availableIcons = icons;
const filteredIcons = ref(availableIcons);

watch(() => props.node, (newNode) => {
  if (newNode) {
    form.value = { ...newNode };
  }
}, { immediate: true });

function getTypeLabel(type) {
  const types = {
    module: 'Módulo',
    menu: 'Menú',
    action: 'Acción'
  };
  return types[type] || type;
}

function getIconLabel(iconValue) {
  const icon = availableIcons.find(i => i.value === iconValue);
  return icon ? icon.label : iconValue;
}

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

function updateSuggestedPath() {
  if (form.value.type === 'module') return;
  
  const parentPath = props.parentNode?.path || '';
  const slug = form.value.label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
    
  suggestedPath.value = parentPath ? `${parentPath}/${slug}` : slug;
}

function onSubmit() {
  emit('save', { ...form.value });
}
</script>

<style lang="scss" scoped>
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