<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend
)

interface Props {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor?: string[]
      borderColor?: string[]
      borderWidth?: number
    }[]
  }
  options?: any
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 250,
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
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500'
        },
        color: '#64748B',
        generateLabels: (chart: any) => {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label: string, i: number) => {
              const dataset = data.datasets[0]
              const value = dataset.data[i]
              const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              
              return {
                text: `${label}: ${value} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: dataset.borderColor?.[i] || '#fff',
                lineWidth: dataset.borderWidth || 2,
                hidden: false,
                index: i
              }
            })
          }
          return []
        }
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
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  },
  cutout: '60%',
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: '#fff'
    }
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

  // Default colors for pet statistics
  const defaultColors = [
    '#6366F1', // Primary blue for dogs
    '#10B981', // Success green for cats
    '#F59E0B', // Warning orange
    '#EF4444', // Error red
    '#8B5CF6', // Purple
    '#06B6D4'  // Cyan
  ]

  // Prepare datasets with proper styling
  const datasets = props.data.datasets.map(dataset => ({
    ...dataset,
    backgroundColor: dataset.backgroundColor || defaultColors.slice(0, props.data.labels.length),
    borderColor: dataset.borderColor || Array(props.data.labels.length).fill('#fff'),
    borderWidth: dataset.borderWidth || 2
  }))

  // Create new chart
  chartInstance = new ChartJS(ctx, {
    type: 'doughnut',
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
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
