<template>
  <q-page padding>
    <q-tree
      :nodes="treeData"
      node-key="path"
      tick-strategy="leaf"
      default-expand-all
      :ticked.sync="selectedItems"
      :expanded.sync="expandedNodes"
      @update:ticked="updateSelection"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <div>{{ prop.node.label }}</div>
        </div>
      </template>
    </q-tree>
    <div class="q-mt-md">
      <q-btn 
        color="primary"
        label="Guardar Selección"
        @click="saveSelection"
        :loading="saving"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { menuService } from 'src/services/menuServices';

export default {
  setup() {
    const $q = useQuasar();
    const treeData = ref([]);
    const selectedItems = ref([]);
    const expandedNodes = ref([]);
    const saving = ref(false);
    const processNodes = (nodes) => {
      return nodes.map(node => ({
        ...node,
        label: node.name || node.label,
        tickable: true,
        children: node.children ? processNodes(node.children) : undefined
      }));
    };

    const loadTreeData = async () => {
      try {
        const response = await menuService.getMenuItems();
        console.log('Raw tree data:', response);
        treeData.value = processNodes(response);
        console.log('Processed tree data:', treeData.value);
        
        // Expand all nodes initially
        expandAllNodes(treeData.value);
        await nextTick();
      } catch (error) {
        console.error('Error loading tree data:', error);
        $q.notify({ 
          type: 'negative', 
          message: 'Error al cargar datos del árbol',
          position: 'top'
        });
      }
    };

    const expandAllNodes = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          expandedNodes.value.push(node.path);
          expandAllNodes(node.children);
        }
      });
    };

    const loadSelectedItems = async () => {
      try {
        const response = await menuService.getMenuRol();
        console.log('Selected items response:', response);
        
        const getPaths = (nodes) => {
          return nodes.reduce((acc, node) => {
            if (node.path) acc.push(node.path);
            if (node.children && node.children.length > 0) {
              acc.push(...getPaths(node.children));
            }
            return acc;
          }, []);
        };

        selectedItems.value = getPaths(response);
        console.log('Processed selected items:', selectedItems.value);
      } catch (error) {
        console.error('Error loading selected items:', error);
        $q.notify({ 
          type: 'negative', 
          message: 'Error al cargar selecciones',
          position: 'top'
        });
      }
    };
    const getSelectedNodesData = () => {
      const findNode = (path, nodes) => {
        for (const node of nodes) {
          if (node.path === path) {
            return {
              path: node.path,
              label: node.label,
              name: node.name
            };
          }
          if (node.children) {
            const found = findNode(path, node.children);
            if (found) return found;
          }
        }
        return null;
      };

      return selectedItems.value.map(path => findNode(path, treeData.value))
        .filter(node => node !== null);
    };

    const saveSelection = async () => {
      console.log('selectedData: ');
      const selectedData = getSelectedNodesData();
      console.log('selectedData: ', selectedData);
      saving.value = true;
      try {
        const selectedData = getSelectedNodesData();
        console.log('Saving selection:', selectedData);
        // Here you would typically send the data to your backend
        // await menuService.saveMenuRol(selectedData);
        
        $q.notify({
          type: 'positive',
          message: 'Selección guardada exitosamente',
          position: 'top'
        });
      } catch (error) {
        console.error('Error saving selection:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al guardar la selección',
          position: 'top'
        });
      } finally {
        saving.value = false;
      }
    };

    onMounted(async () => {
      await loadTreeData();
      await loadSelectedItems();
    });

    const updateSelection = (ticked) => {
      console.log('Selection updated:', ticked);
      selectedItems.value = ticked;
    };

    return {
      treeData,
      selectedItems,
      expandedNodes,
      updateSelection,
      saving,
      saveSelection,
      getSelectedNodesData
    };
  }
};
</script>

<style scoped>
.q-tree {
  margin: 1rem;
}
</style>