<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="chart-controls">
        <el-select v-model="chartType" size="small" style="width: 120px;">
          <el-option label="Столбцы" value="bar" />
          <el-option label="Линия" value="line" />
          <el-option v-if="isPieChartAvailable" label="Круговая" value="pie" />
        </el-select>

        <el-select v-model="selectedXField" size="small" style="width: 150px;" placeholder="X поле">
          <el-option
            v-for="field in fields"
            :key="field"
            :label="field"
            :value="field"
          />
        </el-select>

        <el-select v-model="selectedYField" size="small" style="width: 150px;" placeholder="Y поле">
          <el-option
            v-for="field in fields"
            :key="field"
            :label="field"
            :value="field"
          />
        </el-select>
      </div>
    </div>

    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div v-if="loading" class="chart-loading">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 300px;" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  chartData: { type: Array, required: true },
  fields: { type: Array, required: true }, // список всех полей таблицы
  title: { type: String, default: 'График' },
  loading: { type: Boolean, default: false }
})

const selectedXField = ref(props.fields[0] || '')
const selectedYField = ref(props.fields[1] || '')
const chartType = ref('bar')
const chartCanvas = ref(null)
let chartInstance = null

const isPieChartAvailable = computed(() => {
  const field = selectedXField.value.toLowerCase()
  return chartType.value === 'pie' && (field.includes('склад') || field.includes('warehouse'))
})

const createChart = async () => {
  if (chartInstance) chartInstance.destroy()
  if (!chartCanvas.value || props.chartData.length === 0) return

  await nextTick()
  const ctx = chartCanvas.value.getContext('2d')

  let config = {}

  if (isPieChartAvailable.value) {
    const dataMap = {}
    props.chartData.forEach(item => {
      const key = item[selectedXField.value] || 'Неизвестно'
      dataMap[key] = (dataMap[key] || 0) + 1
    })

    const labels = Object.keys(dataMap)
    const data = Object.values(dataMap)
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#C9CBCF'
    ]

    config = {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || ''
                const count = ctx.parsed
                const total = ctx.dataset.data.reduce((sum, val) => sum + val, 0)
                const percent = ((count / total) * 100).toFixed(1)
                return `${label}: ${count} записей (${percent}%)`
              }
            }
          }
        }
      }
    }
  } else {
    const labels = props.chartData.map(item => item[selectedXField.value])
    const data = props.chartData.map(item => item[selectedYField.value])

    config = {
      type: chartType.value,
      data: {
        labels: labels.slice(0, 30),
        datasets: [{
          label: selectedYField.value,
          data: data.slice(0, 30),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: chartType.value === 'line' ? 0.4 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true },
          x: {}
        }
      }
    }
  }

  chartInstance = new ChartJS(ctx, config)
}

watch([() => props.chartData, chartType, selectedXField, selectedYField], createChart, { deep: true })
onMounted(createChart)

defineExpose({ updateChart: createChart })
</script>

<style scoped>
.chart-container {
  margin: 20px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.chart-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

.chart-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
