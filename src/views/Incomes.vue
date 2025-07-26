<template>
  <div class="incomes-page">
    <div class="page-header">
      <h1>Доходы</h1>
      <el-tag type="success">Аналитика</el-tag>
    </div>
    
    <DataFilters 
      ref="filtersRef"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
    />
    
    <div v-if="error" class="error-message">
      <el-alert
        :title="error"
        type="error"
        show-icon
        closable
        @close="error = null"
      />
    </div>
    
    <div class="stats-cards" v-if="!loading && statsData.total > 0">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(statsData.total) }}</div>
              <div class="stat-label">Общий доход</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ statsData.count }}</div>
              <div class="stat-label">Количество записей</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(statsData.average) }}</div>
              <div class="stat-label">Средний доход</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <DataChart
      :chart-data="chartData"
      x-field="date"
      y-field="income"
      title="Доходы по датам"
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
      title="Детализация доходов"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />
    
    <div v-if="!loading && tableData.length === 0 && !error" class="no-data">
      <el-empty description="Нет данных для отображения">
        <el-button @click="refreshData">Обновить данные</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApiData } from '@/composables/useApiData'
import { apiService } from '@/services/api'
import DataFilters from '@/components/DataFilters.vue'
import DataChart from '@/components/DataChart.vue'
import DataTable from '@/components/DataTable.vue'
import 'chart.js/auto'

const { 
  data, 
  loading, 
  error,
  pagination, 
  fetchData, 
  changePage,
  setPerPage,
  refresh
} = useApiData(apiService.getIncomes)

const filtersRef = ref(null)

const tableColumns = [
  { 
    prop: 'date', 
    label: 'Дата', 
    sortable: true
  },
  { 
    prop: 'income', 
    label: 'Доход', 
    sortable: true,
    formatter: (value) => formatCurrency(value)
  },
  { 
    prop: 'order_id', 
    label: 'ID заказа', 
    sortable: true
  },
  { 
    prop: 'supplierarticle', 
    label: 'Артикул поставщика'
  },
  { 
    prop: 'techsize', 
    label: 'Размер'
  },
  { 
    prop: 'barcode', 
    label: 'Штрихкод'
  }
]

const chartData = computed(() => {
  // Группируем данные по датам и суммируем доходы
  const grouped = {}
  data.value.forEach(item => {
    if (item.date) {
      if (!grouped[item.date]) {
        grouped[item.date] = 0
      }
      grouped[item.date] += item.income || 0
    }
  })
  
  // Сортируем по датам
  const sortedDates = Object.keys(grouped).sort()
  
  return sortedDates.map(date => ({
    date,
    income: Math.round(grouped[date] * 100) / 100
  }))
})

const statsData = computed(() => {
  if (data.value.length === 0) return { total: 0, count: 0, average: 0 }
  
  const total = data.value.reduce((sum, item) => sum + (item.income || 0), 0)
  const count = data.value.length
  const average = count > 0 ? total / count : 0
  
  return {
    total: Math.round(total * 100) / 100,
    count,
    average: Math.round(average * 100) / 100
  }
})

const tableData = computed(() => data.value)

const loadIncomes = async (filters = {}) => {
  const params = {}
  
  if (filters.dateFrom) params.dateFrom = filters.dateFrom
  if (filters.dateTo) params.dateTo = filters.dateTo
  
  console.log('Loading incomes with params:', params)
  await fetchData(params)
}

const handleApplyFilters = (filters) => {
  loadIncomes(filters)
}

const handleResetFilters = () => {
  loadIncomes()
}

const handlePageChange = (page) => {
  changePage(page)
}

const handlePageSizeChange = (size) => {
  setPerPage(size)
}

const refreshData = () => {
  const filters = filtersRef.value?.getFilters() || {}
  loadIncomes(filters)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2
  }).format(value || 0)
}

// Загружаем данные с 03.07.2025 по сегодняшнюю дату
onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  
  const defaultFilters = {
    dateFrom: '2025-07-03',
    dateTo: today
  }
  
  loadIncomes(defaultFilters)
})
</script>

<style scoped>
.incomes-page {
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
</style>