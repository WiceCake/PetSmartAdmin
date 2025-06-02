<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartDataset {
  label: string
  data: number[]
  borderColor?: string
  backgroundColor?: string
  fill?: boolean
  tension?: number
}

interface Props {
  data: {
    labels: string[]
    datasets: ChartDataset[]
  }
  options?: any
  height?: number
  type?: 'line' | 'area'
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  type: 'line',
  options: () => ({})
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: ChartJS | null = null

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500'
        },
        color: '#64748B'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#6366F1',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
      titleFont: {
        size: 14,
        weight: '600'
      },
      bodyFont: {
        size: 13
      },
      callbacks: {
        title: (context: any) => {
          return context[0].label
        },
        label: (context: any) => {
          const value = context.parsed.y
          const label = context.dataset.label
          const monthLabel = context.label

          // Format based on data type
          if (label.toLowerCase().includes('revenue') || label.toLowerCase().includes('$')) {
            return `${monthLabel}: $${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
          } else if (label.toLowerCase().includes('user') || label.toLowerCase().includes('registration')) {
            return `${monthLabel}: ${Number(value).toLocaleString()} new users`
          } else {
            return `${monthLabel}: ${Number(value).toLocaleString()}`
          }
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#64748B',
        font: {
          size: 12
        },
        maxTicksLimit: 8
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#64748B',
        font: {
          size: 12
        },
        callback: (value: any) => {
          // Format Y-axis labels based on data type
          if (props.data.datasets.some((d: any) => d.label.toLowerCase().includes('revenue'))) {
            return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
          } else if (props.data.datasets.some((d: any) => d.label.toLowerCase().includes('user'))) {
            return `${Number(value).toLocaleString()}`
          } else {
            return Number(value).toLocaleString()
          }
        }
      },
      beginAtZero: true
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: '#6366F1',
      borderColor: '#fff',
      borderWidth: 2
    },
    line: {
      tension: 0.4
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  }
}

const createChart = () => {
  if (!chartCanvas.value || !props.data.labels.length) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...props.options
  }

  // Prepare datasets with proper styling
  const datasets = props.data.datasets.map((dataset, index) => {
    const colors = [
      { border: '#6366F1', background: 'rgba(99, 102, 241, 0.1)' },
      { border: '#10B981', background: 'rgba(16, 185, 129, 0.1)' },
      { border: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)' },
      { border: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }
    ]
    
    const colorSet = colors[index % colors.length]
    
    return {
      ...dataset,
      borderColor: dataset.borderColor || colorSet.border,
      backgroundColor: dataset.backgroundColor || colorSet.background,
      fill: props.type === 'area' ? (dataset.fill !== undefined ? dataset.fill : true) : false,
      tension: dataset.tension !== undefined ? dataset.tension : 0.4,
      borderWidth: 2,
      pointBackgroundColor: dataset.borderColor || colorSet.border,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  })

  // Create new chart
  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: props.data.labels,
      datasets
    },
    options: mergedOptions
  })
}

onMounted(async () => {
  await nextTick()
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

watch(() => props.data, () => {
  createChart()
}, { deep: true })

watch(() => props.options, () => {
  createChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 250px;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
