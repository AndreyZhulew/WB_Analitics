<template>
  <div class="filters-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Фильтры</span>
        </div>
      </template>
      
      <el-form :model="filterData" @submit.prevent="applyFilters" class="filters-form">
        <div class="filters-row">
          <div class="filter-item">
            <label class="filter-label">Дата от</label>
            <el-date-picker
              v-model="filterData.dateFrom"
              type="date"
              placeholder="Выберите дату"
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
              placeholder="Выберите дату"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="filter-input"
            />
          </div>
          
          <div class="filter-buttons">
            <el-button 
              type="primary" 
              @click="applyFilters"
              :loading="applying"
            >
              Применить фильтры
            </el-button>
            <el-button @click="resetFilters">Сбросить</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

// Устанавливаем сегодняшнюю дату по умолчанию
const today = new Date().toISOString().split('T')[0]

const filterData = reactive({
  dateFrom: today,
  dateTo: today
})

const applying = ref(false)

const emit = defineEmits(['apply', 'reset'])

const applyFilters = async () => {
  applying.value = true
  try {
    emit('apply', { ...filterData })
  } finally {
    applying.value = false
  }
}

const resetFilters = () => {
  filterData.dateFrom = today
  filterData.dateTo = today
  emit('reset')
}

defineExpose({
  getFilters: () => ({ ...filterData })
})
</script>

<style scoped>
.filters-container {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-form {
  width: 100%;
}

.filters-row {
  display: flex;
  align-items: end;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.filter-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.filter-input {
  width: 100%;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 2px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  background-color: #f5f7fa;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-item {
    min-width: auto;
  }
  
  .filter-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-buttons :deep(.el-button) {
    width: 100%;
  }
}
</style>