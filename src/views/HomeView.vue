<!-- src/views/HomeView.vue -->
<template>
  <div class="row g-4">
    <!-- Sección de Consultas -->
    <div class="col-md-6">
      <div class="card shadow h-100">
        <div class="card-header bg-primary text-white">
          <h3 class="mb-0"><i class="bi bi-search me-2"></i>Consultas por Criterios</h3>
        </div>
        <div class="card-body">
          <ConsultaCandidatos />
        </div>
      </div>
    </div>

    <!-- Sección de Reportes -->
    <div class="col-md-6">
      <div class="card shadow h-100">
        <div class="card-header bg-success text-white">
          <h3 class="mb-0"><i class="bi bi-graph-up me-2"></i>Reportes de Ingresos</h3>
        </div>
        <div class="card-body">
          <ReporteIngresos />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ConsultaCandidatos from '@/components/ConsultaCandidatos.vue'
import ReporteIngresos from '@/components/ReporteIngresos.vue'

export default {
  name: 'HomeView',
  components: {
    ConsultaCandidatos,
    ReporteIngresos
  }
}
</script>

<style scoped>
.card {
  border-radius: 15px;
  border: none;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
}

.h-100 {
  min-height: 400px;
}
</style>