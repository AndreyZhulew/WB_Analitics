<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="chart-controls">
        <el-select
          v-model="chartType"
          size="small"
          style="width: 120px;"
          :disabled="!hasData"
        >
          <el-option label="Столбцы" value="bar" />
          <el-option label="Линия" value="line" />
          <el-option v-if="isPieChartAvailable" label="Круговая" value="pie" />
        </el-select>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <canvas ref="chartCanvas" v-show="hasData && !loading"></canvas>
      
      <!-- Сообщение при отсутствии данных -->
      <div v-if="!hasData && !loading" class="no-data-message">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/4444/4444607.png" 
          alt="Нет данных" 
          class="no-data-image"
        />
        <p>Нет данных для отображения графика</p>
      </div>
      
      <!-- Загрузка -->
      <div v-if="loading" class="chart-loading">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="rect" style="width: 100%; height: 300px;" />
          </template>
        </el-skeleton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  xField: {
    type: String,
    required: true
  },
  yField: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'График'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartCanvas = ref(null)
let chartInstance = null
const chartType = ref('bar')

// Проверяем наличие данных
const hasData = computed(() => {
  return props.chartData && props.chartData.length > 0
})

// Проверяем, можно ли отображать pie chart
const isPieChartAvailable = computed(() => {
  return props.xField.includes('warehouse') || props.xField.includes('склад') || 
         props.yField.includes('warehouse') || props.yField.includes('склад')
})

const createChart = async () => {
  await nextTick()

  if (chartInstance && typeof chartInstance.destroy === 'function' && !chartInstance._destroyed) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!chartCanvas.value || !hasData.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  let config = {}

  if (chartType.value === 'pie' && isPieChartAvailable.value) {
    const warehouseCount = {}
    props.chartData.forEach(item => {
      const warehouse = item.warehouse_name || item[props.xField] || 'Неизвестно'
      warehouseCount[warehouse] = (warehouseCount[warehouse] || 0) + 1
    })

    const labels = Object.keys(warehouseCount)
    const data = Object.values(warehouseCount)

    const backgroundColors = labels.map((_, index) => {
      const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)'
      ]
      return colors[index % colors.length]
    })

    config = {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors,
          borderColor: 'rgba(255, 255, 255, 1)',
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
              label(context) {
                const label = context.label || ''
                const count = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = Math.round((count / total) * 100)
                return `${label}: ${count} записей (${percentage}%)`
              }
            }
          }
        }
      }
    }
  } else {
    const labels = props.chartData.map(item => item[props.xField])
    const data = props.chartData.map(item => item[props.yField])

    config = {
      type: chartType.value,
      data: {
        labels: labels.slice(0, 20),
        datasets: [{
          label: props.yField,
          data: data.slice(0, 20),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: chartType.value === 'line' ? 0.4 : 0,
          fill: chartType.value !== 'line'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: false },
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          },
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      }
    }
  }

  chartInstance = new ChartJS(ctx, config)
}


onMounted(() => {
  createChart()
})

watch([() => props.chartData, chartType], () => {
  createChart()
}, { deep: true })

defineExpose({
  updateChart: createChart
})
</script>

<style scoped>
.chart-container {
  margin: 20px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.no-data-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  text-align: center;
  color: #909399;
}

.no-data-image {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.no-data-message p {
  margin: 0;
  font-size: 16px;
  color: #909399;
}
</style>