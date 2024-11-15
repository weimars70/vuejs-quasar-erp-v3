import { ref, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { menuService } from 'src/services/menuServices';

interface TreeNode {
  path: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  tickable?: boolean;
  selectable?: boolean;
}

interface Role {
  codigo: number;
  nombre: string;
}

export function useTreeLogic() {
  const $q = useQuasar();
  const treeData = ref<TreeNode[]>([]);
  const selectedItems = ref<string[]>([]);
  const expandedNodes = ref<string[]>([]);
  const saving = ref(false);
  const roles = ref<Role[]>([]);
  const selectedRole = ref<number | null>(null);
  const loadingRoles = ref(false);

  const processNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
      ...node,
      label: node.name || node.label,
      tickable: true,
      children: node.children ? processNodes(node.children) : []
    }));
  };

  const loadTreeData = async () => {
    try {
      const response = await menuService.getMenuItems();
      console.log('Raw tree data:', response);
      treeData.value = processNodes(response);
      console.log('Processed tree data:', treeData.value);
      
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

  const expandAllNodes = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        expandedNodes.value.push(node.path);
        expandAllNodes(node.children);
      }
    });
  };

  const getAllDescendantPaths = (node: TreeNode): string[] => {
    let paths: string[] = [];
    if (node.children) {
      node.children.forEach(child => {
        paths.push(child.path);
        paths = paths.concat(getAllDescendantPaths(child));
      });
    }
    return paths;
  };

  const getAllParentPaths = (nodes: TreeNode[], targetPath: string, path: string[] = []): string[] => {
    for (const node of nodes) {
      if (node.path === targetPath) {
        return path;
      }
      if (node.children) {
        const newPath = [...path, node.path];
        const found = getAllParentPaths(node.children, targetPath, newPath);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  };

  const findNodeByPath = (nodes: TreeNode[], path: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findNodeByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const updateSelection = (ticked: string[]) => {
    const previousSelection = new Set(selectedItems.value);
    const currentSelection = new Set(ticked);
    
    // Find which node was changed
    let changedPath: string | undefined;
    for (const path of previousSelection) {
      if (!currentSelection.has(path)) {
        changedPath = path;
        break;
      }
    }
    if (!changedPath) {
      for (const path of currentSelection) {
        if (!previousSelection.has(path)) {
          changedPath = path;
          break;
        }
      }
    }

    if (changedPath) {
      const node = findNodeByPath(treeData.value, changedPath);
      if (node) {
        const wasUnchecked = !currentSelection.has(changedPath);
        
        if (wasUnchecked) {
          // Get all descendant paths
          const descendantPaths = getAllDescendantPaths(node);
          
          // Remove the node and all its descendants from selection
          selectedItems.value = selectedItems.value.filter(path => 
            !descendantPaths.includes(path) && path !== changedPath
          );
        } else {
          // When checking a node, get all parent paths
          const parentPaths = getAllParentPaths(treeData.value, changedPath);
          
          // Combine current selection with parent paths and new selection
          const newSelection = new Set([
            ...ticked,
            ...parentPaths
          ]);
          
          selectedItems.value = Array.from(newSelection);
        }
      }
    }
    
    console.log('Selection updated:', selectedItems.value);
  };

  const loadRoles = async () => {
    loadingRoles.value = true;
    try {
      roles.value = await menuService.getRoles();
    } catch (error) {
      console.error('Error loading roles:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cargar roles',
        position: 'top'
      });
    } finally {
      loadingRoles.value = false;
    }
  };

  const onRoleChange = async (roleId: number) => {
    if (!roleId) return;
    try {
      const response = await menuService.getMenuRol(roleId);
      selectedItems.value = extractPaths(response);
    } catch (error) {
      console.error('Error loading role menu:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al cargar menú del rol',
        position: 'top'
      });
    }
  };

  const extractPaths = (nodes: TreeNode[]): string[] => {
    const paths: string[] = [];
    const traverse = (node: TreeNode) => {
      paths.push(node.path);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return paths;
  };

  const getSelectedNodesData = (): TreeNode[] => {
    const selectedNodes: TreeNode[] = [];
    
    selectedItems.value.forEach(path => {
      const node = findNodeByPath(treeData.value, path);
      if (node) {
        const nodeWithChildren = {
          path: node.path,
          label: node.label,
          icon: node.icon,
          children: []
        };
        
        // Find and add selected children
        if (node.children) {
          nodeWithChildren.children = node.children
            .filter(child => selectedItems.value.includes(child.path))
            .map(child => ({
              path: child.path,
              label: child.label,
              icon: child.icon,
              children: child.children 
                ? child.children
                    .filter(grandChild => selectedItems.value.includes(grandChild.path))
                    .map(grandChild => ({
                      path: grandChild.path,
                      label: grandChild.label,
                      icon: grandChild.icon,
                      children: []
                    }))
                : []
            }));
        }
        
        selectedNodes.push(nodeWithChildren);
      }
    });

    return selectedNodes;
  };

  const saveSelection = async (): Promise<void> => {
    if (!selectedRole.value) {
      $q.notify({
        type: 'warning',
        message: 'Por favor seleccione un rol',
        position: 'top'
      });
      return;
    }

    saving.value = true;
    try {
      const selectedTree = getSelectedNodesData();
      console.log('Saving selection tree:', selectedTree);
      const resp = await menuService.saveMenuRol(selectedRole.value, selectedTree);
      
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
    await loadRoles();
  });

  return {
    treeData,
    selectedItems,
    expandedNodes,
    updateSelection,
    saving,
    saveSelection,
    getSelectedNodesData,
    roles,
    selectedRole,
    loadingRoles,
    onRoleChange
  };
}