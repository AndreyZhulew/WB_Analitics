<template>
  <div class="stocks-page">
    <div class="page-header">
      <h1>Склады</h1>
      <el-tag type="info">Инвентаризация</el-tag>
    </div>

    <div class="stock-filters">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>Фильтры</span>
          </div>
        </template>

        <el-form :model="filterData" @submit.prevent="loadStocks" class="filters-form">
          <div class="filters-row">
            <div class="filter-item">
              <label class="filter-label">Дата от</label>
              <el-date-picker
                v-model="filterData.dateFrom"
                type="date"
                placeholder="Дата начала"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="filter-input"
              />
            </div>
            
            <div class="filter-item">
              <label class="filter-label">Дата до</label>
              <el-date-picker
                v-model="filterData.dateTo"
                type="date"
                placeholder="Дата окончания"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="filter-input"
              />
            </div>

            <div class="filter-buttons">
              <el-button type="primary" @click="loadStocks" :loading="loading">
                Загрузить данные
              </el-button>
              <el-button @click="resetFilters">Сбросить</el-button>
            </div>
          </div>
        </el-form>
      </el-card>
    </div>

    <div v-if="error" class="error-message">
      <el-alert :title="error" type="error" show-icon closable @close="error = null" />
    </div>

    <div class="stats-cards" v-if="!loading && statsData.total > 0">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ statsData.totalQuantity }}</div>
              <div class="stat-label">Общие остатки</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ statsData.uniqueArticles }}</div>
              <div class="stat-label">Уникальных артикулов</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ statsData.warehouses }}</div>
              <div class="stat-label">Складов</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <DataChart
      :chart-data="chartData"
      x-field="last_change_date"
      y-field="quantity"
      title="Остатки по датам изменения"
      :loading="loading"
      v-if="chartData.length > 0 || loading"
    />

    <DataTable
      :table-data="tableData"
      :columns="tableColumns"
      :loading="loading"
      :current-page="pagination.currentPage"
      :page-size="pagination.perPage"
      :total="pagination.totalItems"
      title="Детализация складов"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />

    <div v-if="!loading && tableData.length === 0 && !error" class="no-data">
      <el-empty description="Нет данных для отображения">
        <el-button @click="resetFilters">Сбросить фильтры</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useApiData } from "@/composables/useApiData";
import { apiService } from "@/services/api";
import DataChart from "@/components/DataChart.vue";
import DataTable from "@/components/DataTable.vue";

const { data, loading, error, pagination, fetchData, changePage, setPerPage } = useApiData(
  apiService.getStocks
);

const filterData = ref({
  dateFrom: '2025-07-26',
  dateTo: new Date().toISOString().split("T")[0]
});

// Динамические колонки без фиксированной ширины
const tableColumns = [
  { prop: "last_change_date", label: "Дата изменения" },
  { prop: "supplierarticle", label: "Артикул поставщика" },
  { prop: "techsize", label: "Размер" },
  { prop: "barcode", label: "Штрихкод" },
  { prop: "quantity", label: "Количество" },
  { prop: "warehouse_name", label: "Склад" },
  { prop: "nm_id", label: "ID товара" },
];

const chartData = computed(() => {
  const grouped = {};
  data.value.forEach((item) => {
    const date = item.last_change_date || "Неизвестно";
    if (!grouped[date]) {
      grouped[date] = 0;
    }
    grouped[date] += item.quantity || 0;
  });

  // Сортируем по датам
  const sortedDates = Object.keys(grouped).sort();
  
  const sorted = sortedDates.map((date) => ({
    last_change_date: date,
    quantity: grouped[date],
  }));

  return sorted;
});

const statsData = computed(() => {
  if (data.value.length === 0) return { totalQuantity: 0, uniqueArticles: 0, warehouses: 0 };

  const totalQuantity = data.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const uniqueArticles = new Set(data.value.map((item) => item.supplierarticle)).size;
  const warehouses = new Set(data.value.map((item) => item.warehouse_name)).size;

  return {
    totalQuantity,
    uniqueArticles,
    warehouses,
  };
});

const tableData = computed(() => data.value);

const loadStocks = async () => {
  const params = {};

  if (filterData.value.dateFrom) {
    params.dateFrom = filterData.value.dateFrom;
  }
  
  if (filterData.value.dateTo) {
    params.dateTo = filterData.value.dateTo;
  }

  console.log("Loading stocks with params:", params);
  await fetchData(params);
};

const resetFilters = () => {
  const today = new Date().toISOString().split("T")[0];
  filterData.value.dateFrom = '2025-07-26';
  filterData.value.dateTo = today;
  loadStocks();
};

const handlePageChange = (page) => {
  changePage(page);
};

const handlePageSizeChange = (size) => {
  setPerPage(size);
};

onMounted(() => {
  const today = new Date().toISOString().split("T")[0];
  filterData.value.dateFrom = '2025-07-26';
  filterData.value.dateTo = today;
  loadStocks();
});
</script>

<style scoped>
.stocks-page {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.stock-filters {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.filter-input {
  width: 180px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 1px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  background-color: #f5f7fa;
}

.error-message {
  margin-bottom: 20px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  text-align: center;
  padding: 20px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.no-data {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    align-items: stretch;
  }
  
  .filter-input {
    width: 100%;
  }
  
  .filter-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  :deep(.el-row) {
    flex-direction: column;
    gap: 15px;
  }

  :deep(.el-col) {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>