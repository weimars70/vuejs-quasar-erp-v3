<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card>
        <q-card-section>
          <div class="text-h6">Formulario de Compra</div>
          <q-form @submit="savePurchase" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <q-select
                  v-model="purchase.supplier"
                  :options="suppliers"
                  option-label="label"
                  option-value="value"
                  label="Proveedor *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Proveedor es requerido']"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="purchase.invoice"
                  label="Factura *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Factura es requerida']"
                />
              </div>
              <div class="col-12 col-md-2">
                <q-select
                  v-model="purchase.paymentMethod"
                  :options="paymentMethods"
                  label="Método de Pago *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Método de pago es requerido']"
                />
              </div>
              <div class="col-12 col-md-2">
                <q-input
                  v-model="purchase.term"
                  type="number"
                  label="Plazo *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Plazo es requerido']"
                />
              </div>
              <div class="col-12 col-md-2">
                <q-input
                  v-model="purchase.date"
                  type="date"
                  label="Fecha *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Fecha es requerida']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="selectedItemDisplay"
                  label="Artículo *"
                  outlined
                  dense
                  readonly
                  @click="showItemSelector = true"
                >
                  <template v-slot:append>
                    <q-icon name="search" class="cursor-pointer" @click="showItemSelector = true" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-1">
                <q-input
                  v-model.number="currentItem.vat"
                  type="number"
                  label="IVA %"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-2">
                <q-input
                  v-model.number="currentItem.purchasePrice"
                  type="number"
                  label="Precio Compra"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-2">
                <q-input
                  v-model.number="currentItem.salePrice"
                  type="number"
                  label="Precio Venta"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-1">
                <q-input
                  v-model.number="currentItem.discount"
                  type="number"
                  label="Desc %"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-2">
                <q-input
                  v-model.number="currentItem.quantity"
                  type="number"
                  label="Cantidad *"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-1">
                <q-btn
                  color="primary"
                  icon="add"
                  @click="addItem"
                  class="full-width"
                  style="margin-top: 4px"
                  dense
                />
              </div>
            </div>

            <q-table
              title="Artículos"
              :rows="purchase.items"
              :columns="columns"
              row-key="id"
              dense
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click="removeItem(props.rowIndex)"
                  />
                </q-td>
              </template>
            </q-table>

            <div class="row justify-end q-gutter-sm">
              <div class="text-subtitle2">
                Subtotal: {{ formatCurrency(calculateSubtotal) }}
              </div>
              <div class="text-subtitle2">
                Descuento: {{ formatCurrency(calculateDiscount) }}
              </div>
              <div class="text-subtitle2">
                IVA: {{ formatCurrency(calculateVAT) }}
              </div>
              <div class="text-subtitle2">
                Total: {{ formatCurrency(calculateTotal) }}
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn
                type="submit"
                color="primary"
                label="Guardar"
                :loading="saving"
                icon="save"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <!-- Item Selector Dialog -->
    <q-dialog v-model="showItemSelector" position="right">
      <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Seleccionar Artículo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="itemSearch"
            dense
            outlined
            placeholder="Buscar artículo"
            class="q-mb-md"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="filteredItems"
            :columns="itemColumns"
            row-key="id"
            dense
            :pagination="{ rowsPerPage: 10 }"
            :filter="itemSearch"
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="cursor-pointer"
                @click="selectItem(props.row)"
              >
                <q-td v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.value }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const suppliers = ref<any[]>([]);
const items = ref<any[]>([]);
const showItemSelector = ref(false);
const itemSearch = ref('');
const saving = ref(false);

const paymentMethods = ['Efectivo', 'Tarjeta de Crédito', 'Transferencia'];

const purchase = ref({
  supplier: null,
  invoice: '',
  paymentMethod: null,
  term: 0,
  date: '',
  items: []
});

const currentItem = ref({
  item: null,
  vat: 0,
  purchasePrice: 0,
  salePrice: 0,
  discount: 0,
  quantity: 1
});

const selectedItemDisplay = computed(() => 
  currentItem.value.item ? `${currentItem.value.item.code} - ${currentItem.value.item.name}` : ''
);

const columns = [
  { name: 'item', label: 'Artículo', field: row => row.item.name, align: 'left' },
  { name: 'vat', label: 'IVA %', field: 'vat', align: 'right' },
  { name: 'purchasePrice', label: 'Precio Compra', field: 'purchasePrice', align: 'right' },
  { name: 'salePrice', label: 'Precio Venta', field: 'salePrice', align: 'right' },
  { name: 'discount', label: 'Descuento %', field: 'discount', align: 'right' },
  { name: 'quantity', label: 'Cantidad', field: 'quantity', align: 'right' },
  { 
    name: 'subtotal', 
    label: 'Subtotal', 
    field: row => row.purchasePrice * row.quantity,
    format: val => formatCurrency(val),
    align: 'right'
  },
  { name: 'actions', label: 'Acciones', align: 'center' }
];

const itemColumns = [
  { name: 'code', label: 'Código', field: 'code', sortable: true, align: 'left' },
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'left' },
  { name: 'category', label: 'Categoría', field: 'category', sortable: true, align: 'left' },
  { 
    name: 'price', 
    label: 'Precio', 
    field: 'price', 
    sortable: true, 
    align: 'right',
    format: val => formatCurrency(val)
  },
  { name: 'stock', label: 'Stock', field: 'stock', sortable: true, align: 'right' }
];

const calculateSubtotal = computed(() => {
  return purchase.value.items.reduce((sum, item) => {
    return sum + (item.purchasePrice * item.quantity);
  }, 0);
});

const calculateDiscount = computed(() => {
  return purchase.value.items.reduce((sum, item) => {
    return sum + (item.purchasePrice * item.quantity * item.discount / 100);
  }, 0);
});

const calculateVAT = computed(() => {
  return purchase.value.items.reduce((sum, item) => {
    const subtotal = item.purchasePrice * item.quantity;
    const afterDiscount = subtotal - (subtotal * item.discount / 100);
    return sum + (afterDiscount * item.vat / 100);
  }, 0);
});

const calculateTotal = computed(() => {
  return calculateSubtotal.value - calculateDiscount.value + calculateVAT.value;
});

const filteredItems = computed(() => {
  if (!itemSearch.value || !items.value) return items.value;
  
  const searchTerm = itemSearch.value.toLowerCase();
  return items.value.filter(item => 
    item?.code?.toLowerCase().includes(searchTerm) ||
    item?.name?.toLowerCase().includes(searchTerm) ||
    item?.category?.toLowerCase().includes(searchTerm)
  );
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(value);
}

function addItem() {
  if (currentItem.value.item) {
    purchase.value.items.push({ ...currentItem.value });
    currentItem.value = {
      item: null,
      vat: 0,
      purchasePrice: 0,
      salePrice: 0,
      discount: 0,
      quantity: 1
    };
    showItemSelector.value = false;
  }
}

function removeItem(index: number) {
  purchase.value.items.splice(index, 1);
}

function selectItem(item: any) {
  currentItem.value.item = item;
  currentItem.value.purchasePrice = item.price || 0;
  currentItem.value.salePrice = item.price ? item.price * 1.3 : 0;
  showItemSelector.value = false;
}

async function savePurchase() {
  try {
    saving.value = true;
    await api.post('/purchases', purchase.value);
    $q.notify({
      color: 'positive',
      message: 'Compra guardada exitosamente',
      icon: 'check'
    });
    purchase.value = {
      supplier: null,
      invoice: '',
      paymentMethod: null,
      term: 0,
      date: '',
      items: []
    };
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Error al guardar la compra: ${error.message}`,
      icon: 'error'
    });
  } finally {
    saving.value = false;
  }
}

async function loadInitialData() {
  try {
    const [suppliersResponse, itemsResponse] = await Promise.all([
      api.get('/suppliers'),
      api.get('/items')
    ]);
    suppliers.value = suppliersResponse.data || [];
    items.value = itemsResponse.data || [];
  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Error al cargar datos iniciales: ${error.message}`,
      icon: 'error'
    });
  }
}

onMounted(() => {
  loadInitialData();
});
</script>

<style lang="scss" scoped>
.q-table {
  .q-td {
    font-size: 12px;
  }
}

.text-h6 {
  font-size: 14px !important;
}

.q-dialog {
  .q-table {
    tbody tr:hover {
      background: rgba(25, 118, 210, 0.05);
    }
  }
}
</style>