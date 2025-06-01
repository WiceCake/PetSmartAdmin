<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
      fill?: boolean
    }[]
  }
  options?: any
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  options: () => ({})
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: ChartJS | null = null

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#6366F1',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: (context: any) => {
          return `${context[0].label}`
        },
        label: (context: any) => {
          return `${context.dataset.label}: ${context.parsed.y}h`
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
        }
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
        callback: (value: any) => `${value}h`
      }
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
  if (!chartCanvas.value) return

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

  // Create new chart
  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      ...props.data,
      datasets: props.data.datasets.map(dataset => ({
        ...dataset,
        borderColor: dataset.borderColor || '#6366F1',
        backgroundColor: dataset.backgroundColor || 'rgba(99, 102, 241, 0.1)',
        fill: dataset.fill !== undefined ? dataset.fill : true
      }))
    },
    options: mergedOptions
  })
}

onMounted(async () => {
  await nextTick()
  createChart()
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
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
