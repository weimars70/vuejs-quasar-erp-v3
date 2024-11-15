<template>
  <q-page padding>
    <UserTable
      :users="users"
      :loading="loading"
      @add="openCreateDialog()"
      @edit="openEditDialog($event)"
    />

    <UserForm
      v-model="showCreateDialog"
      :loading="saving"
      @submit="saveUser"
    />

    <EditUserForm
      v-model="showEditDialog"
      :user="editingUser"
      :loading="saving"
      @submit="saveUser"
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

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await userRepository.getUsers();
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

const openCreateDialog = () => {
  showCreateDialog.value = true;
};

const openEditDialog = (user: User) => {
  editingUser.value = user;
  showEditDialog.value = true;
};

const saveUser = async (formData: Partial<User>) => {
  saving.value = true;
  try {
    if (editingUser.value) {
      await userRepository.updateUser({
        ...editingUser.value,
        ...formData
      });
    } else {
      await userRepository.createUser(formData as Omit<User, 'id'>);
    }

    $q.notify({
      type: 'positive',
      message: `Usuario ${editingUser.value ? 'actualizado' : 'creado'} exitosamente`,
      position: 'center'
    });

    showCreateDialog.value = false;
    showEditDialog.value = false;
    editingUser.value = null;
    loadUsers();
  } catch (error) {
    console.error('Error saving user:', error);
    $q.notify({
      type: 'negative',
      message: `Error al ${editingUser.value ? 'actualizar' : 'crear'} usuario`,
      position: 'center'
    });
  } finally {
    saving.value = false;
  }
};

onMounted(loadUsers);
</script>