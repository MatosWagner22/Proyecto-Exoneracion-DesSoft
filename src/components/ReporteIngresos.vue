<template>
  <div class="reporte-ingresos">
    <div class="card shadow h-100">
      <div class="card-header bg-success text-white">
        <h3 class="mb-0">
          <i class="bi bi-people-fill me-2"></i>Nuevos Ingresos de Empleados
          <small class="ms-2">(por rango de fechas)</small>
        </h3>
      </div>
      
      <div class="card-body">
        <div class="row g-3 align-items-end mb-4">
          <div class="col-md-5">
            <label class="form-label text-muted small mb-1">Fecha Inicio</label>
            <input v-model="fechas.inicio" type="date" class="form-control form-control-sm">
          </div>
          <div class="col-md-5">
            <label class="form-label text-muted small mb-1">Fecha Fin</label>
            <input v-model="fechas.fin" type="date" class="form-control form-control-sm">
          </div>
          <div class="col-md-2">
            <button @click="generarReporte" class="btn btn-sm btn-success w-100">
              <i class="bi bi-calendar-check me-1"></i> Generar
            </button>
          </div>
        </div>

        <div v-if="cargando" class="text-center py-4">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Cargando datos...</p>
        </div>

        <div v-else>
          <div v-if="nuevosIngresos.length === 0" class="alert alert-info text-center">
            <i class="bi bi-info-circle me-2"></i>
            No hay nuevos empleados en el rango de fechas seleccionado
          </div>
          
          <div v-else>
            <div class="chart-container mb-4">
              <canvas ref="chartCanvas"></canvas>
            </div>
            
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Puesto</th>
                    <th>Departamento</th>
                    <th>Salario</th>
                    <th>Fecha Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="empleado in nuevosIngresos" :key="empleado.id">
                    <td>{{ empleado.nombre }}</td>
                    <td>{{ empleado.puestoNombre }}</td>
                    <td>{{ empleado.departamento }}</td>
                    <td>{{ formatCurrency(empleado.salarioMensual) }}</td>
                    <td>{{ formatDate(empleado.fechaIngreso) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="nuevosIngresos.length > 0" class="card-footer text-muted small">
        Mostrando {{ nuevosIngresos.length }} nuevos empleados
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'ReporteIngresos',
  data() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return {
      fechas: {
        inicio: firstDayOfMonth.toISOString().split('T')[0],
        fin: lastDayOfMonth.toISOString().split('T')[0]
      },
      chartInstance: null,
      cargando: false,
      nuevosIngresos: [],
      empleados: []
    }
  },
  mounted() {
    this.generarReporte();
  },
  methods: {
    async generarReporte() {
      this.cargando = true;
      
      try {
        // Destruir gráfico existente
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }
        
        // Obtener todos los empleados
        const response = await this.$axios.get('/Empleados');
        this.empleados = response.data;
        
        // Filtrar empleados por rango de fechas
        const fechaInicio = new Date(this.fechas.inicio);
        const fechaFin = new Date(this.fechas.fin);
        
        this.nuevosIngresos = this.empleados.filter(emp => {
          const fechaIngreso = new Date(emp.fechaIngreso);
          return fechaIngreso >= fechaInicio && fechaIngreso <= fechaFin;
        });
        
        // Agrupar por mes para el gráfico
        const datosPorMes = this.agruparPorMes();
        
        // Crear gráfico
        this.crearGrafico(datosPorMes);
        
      } catch (error) {
        console.error('Error generando reporte:', error);
        // Aquí podrías agregar manejo de errores con toast o alertas
      } finally {
        this.cargando = false;
      }
    },
    
    agruparPorMes() {
      const datos = {};
      
      this.nuevosIngresos.forEach(emp => {
        const fecha = new Date(emp.fechaIngreso);
        const mes = fecha.getMonth(); // 0-11
        const año = fecha.getFullYear();
        const clave = `${año}-${mes}`;
        
        if (!datos[clave]) {
          datos[clave] = 0;
        }
        datos[clave]++;
      });
      
      return datos;
    },
    
    crearGrafico(datos) {
      // Ordenar meses cronológicamente
      const mesesOrdenados = Object.keys(datos).sort();
      
      const labels = mesesOrdenados.map(clave => {
        const [año, mes] = clave.split('-');
        const nombreMes = new Date(año, mes).toLocaleString('es-ES', { month: 'short' });
        return `${nombreMes} ${año}`;
      });
      
      const data = mesesOrdenados.map(clave => datos[clave]);
      
      const ctx = this.$refs.chartCanvas;
      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nuevos Empleados',
            data: data,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y} ${context.parsed.y === 1 ? 'empleado' : 'empleados'}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              },
              title: {
                display: true,
                text: 'Cantidad de Empleados'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Mes'
              }
            }
          }
        }
      });
    },
    
    formatCurrency(value) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    }
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 200px;
  width: 100%;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.table {
  font-size: 0.85rem;
}

.table thead th {
  background-color: #f8f9fa;
}

.alert {
  margin-top: 20px;
  padding: 10px 15px;
  font-size: 0.9rem;
}

.card-footer {
  font-size: 0.8rem;
  padding: 8px 15px;
}

.form-control-sm {
  height: calc(1.5em + 0.5rem + 2px);
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>