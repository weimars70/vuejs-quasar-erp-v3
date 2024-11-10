<template>
  <q-tree
    :nodes="nodes"
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
            @click.stop="$emit('add-child', prop.node)"
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
            @click.stop="$emit('edit-node', prop.node)"
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
            @click.stop="$emit('delete-node', prop.node)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>
      </div>
    </template>
  </q-tree>
</template>

<script setup lang="ts">
defineProps({
  nodes: {
    type: Array,
    required: true
  }
});

defineEmits(['add-child', 'edit-node', 'delete-node']);
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
</style>