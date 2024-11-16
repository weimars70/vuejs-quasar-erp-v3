<template>
  <q-page padding>
    <UserTable
      :users="users"
      :loading="loading"
      @add="openCreateDialog()"
      @edit="openEditDialog($event)"
      @filter-change="handleFilterChange"
    />

    <UserForm
      v-model="showCreateDialog"
      :loading="saving"
      @submit="createUser"
    />

    <EditUserForm
      v-model="showEditDialog"
      :user="editingUser"
      :loading="saving"
      @submit="updateUser"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import UserTable from '../components/UserTable.vue';
import UserForm from '../components/UserForm.vue';
import EditUserForm from '../components/EditUserForm.vue';
import { UserApi } from '../infrastructure/user.api';
import type { User } from '../domain/user.model';

const $q = useQuasar();
const userRepository = new UserApi();

const users = ref<User[]>([]);
const loading = ref(false);
const saving = ref(false);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editingUser = ref<User | null>(null);
const currentFilters = ref<Record<string, string>>({});

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await userRepository.getUsers(currentFilters.value);
  } catch (error) {
    console.error('Error loading users:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar usuarios',
      position: 'center'
    });
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = async (filters: Record<string, string>) => {
  currentFilters.value = filters;
  await loadUsers();
};

const openCreateDialog = () => {
  showCreateDialog.value = true;
};

const openEditDialog = (user: User) => {
  editingUser.value = user;
  showEditDialog.value = true;
};

const createUser = async (formData: Partial<User>) => {
  saving.value = true;
  try {
    await userRepository.createUser(formData as Omit<User, 'id'>);
    
    $q.notify({
      type: 'positive',
      message: 'Usuario creado exitosamente',
      position: 'center'
    });

    showCreateDialog.value = false;
    await loadUsers();
  } catch (error) {
    console.error('Error creating user:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al crear usuario',
      position: 'center'
    });
  } finally {
    saving.value = false;
  }
};

const updateUser = async (formData: Partial<User>) => {
  if (!editingUser.value?.id) return;
  
  saving.value = true;
  try {
    const updateDto = {
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol
    };

    await userRepository.updateUser({
      id: editingUser.value.id,
      ...updateDto
    });
    
    $q.notify({
      type: 'positive',
      message: 'Usuario actualizado exitosamente',
      position: 'center'
    });

    showEditDialog.value = false;
    editingUser.value = null;
    await loadUsers();
  } catch (error) {
    console.error('Error updating user:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar usuario',
      position: 'center'
    });
  } finally {
    saving.value = false;
  }
};

onMounted(loadUsers);
</script>