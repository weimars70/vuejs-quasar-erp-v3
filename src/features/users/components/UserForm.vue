<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="onClose" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-if="props.user?.id"
            v-model="form.id"
            label="ID"
            readonly
            outlined
            disable
          />

          <q-input
            v-model="form.nombre"
            label="Nombre"
            :rules="[val => !!val || 'Nombre es requerido']"
            outlined
          />

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            :rules="emailRules"
            outlined
          />

          <q-select
            v-model="form.rol"
            :options="roles"
            option-label="nombre"
            option-value="codigo"
            label="Rol"
            :loading="loadingRoles"
            :rules="[val => !!val || 'Rol es requerido']"
            outlined
            emit-value
            map-options
          />

          <q-input
            v-model="form.clave"
            label="Clave"
            :type="showPassword ? 'text' : 'password'"
            :rules="claveRules"
            outlined
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.confirmClave"
            label="Confirmar Clave"
            :type="showPassword ? 'text' : 'password'"
            :rules="confirmClaveRules"
            outlined
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="row justify-end q-mt-md">
            <q-btn label="Cancelar" flat @click="onClose" class="q-mr-sm" />
            <q-btn
              label="Guardar"
              type="submit"
              color="primary"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useUserForm } from '../composables/useUserForm';
import type { User } from '../domain/user.model';

const props = defineProps<{
  modelValue: boolean;
  user?: User;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: Partial<User>): void;
}>();

const { form, roles, loadingRoles, emailRules, claveRules, confirmClaveRules, resetForm, updateForm } = useUserForm(props.user);
const showPassword = ref(false);

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const title = computed(() => props.user ? 'Editar Usuario' : 'Nuevo Usuario');

watch(() => props.user, (newUser) => {
  updateForm(newUser);
});

const onSubmit = () => {
  const { confirmClave, ...userData } = form;
  emit('submit', userData);
};

const onClose = () => {
  resetForm();
  emit('update:modelValue', false);
};
</script>