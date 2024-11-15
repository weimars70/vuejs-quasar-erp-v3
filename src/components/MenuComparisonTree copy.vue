<template>
  <q-page>
    <q-tree
      :nodes="treeData"                
      node-key="path"                 
      tick-strategy="leaf"            
      :selected.sync="selectedItems"   
      :expanded.sync="expandedNodes"    
      @update:selected="updateSelection"
    />
  </q-page>
</template>


<script>
import { ref, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { menuService } from 'src/services/menuServices';

export default {
  
  setup() {
    const $q = useQuasar();
    const treeData = ref([]);            // Datos del árbol
    const selectedItems = ref([]);        // Paths de nodos seleccionados
    const expandedNodes = ref([]);        // Paths de nodos expandidos

    // Función para cargar los datos del árbol
    const loadTreeData = async () => {
      try {
        const response = await menuService.getMenuItems();
        console.log('response: :::', response);
        treeData.value = response;

        // Expande todos los nodos que tienen subnodos
        expandAllNodes(response);
        await nextTick();  // Espera a que Vue reactive la expansión
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al cargar datos del árbol' });
      }
    };

    // Función para expandir todos los nodos con subnodos
    const expandAllNodes = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          expandedNodes.value.push(node.path); // Añade el path del nodo con hijos
          expandAllNodes(node.children);       // Expande recursivamente subnodos
        }
      });
    };

    // Función para cargar los elementos seleccionados desde la base de datos
    const loadSelectedItems = async () => {
      try {
        const response = await menuService.getMenuRol();
        // Extrae los 'path' de los nodos seleccionados
        const getPaths = (nodes) => {
          return nodes.reduce((acc, node) => {
            acc.push(node.path);
            if (node.children && node.children.length > 0) {
              acc = acc.concat(getPaths(node.children));
            }
            return acc;
          }, []);
        };

        selectedItems.value = getPaths(response); // Carga solo los 'path' de los nodos
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al cargar selecciones' });
      }
    };

    // Inicializa el árbol y las selecciones
    onMounted(async () => {
      await loadTreeData();     // Cargar la estructura del árbol y expandir nodos
      await loadSelectedItems(); // Cargar las selecciones iniciales
    });

    // Maneja los cambios en la selección
    const updateSelection = (selected) => {
      selectedItems.value = selected;
    };

    return {
      treeData,
      selectedItems,
      expandedNodes,
      updateSelection
    };
  }
};
</script>
