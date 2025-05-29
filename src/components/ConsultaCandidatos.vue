<template>
  <div class="consulta-candidatos">
    <div class="card shadow h-100">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">
          <i class="bi bi-search me-2"></i>Consulta de Candidatos por Criterios
        </h4>
      </div>
      
      <div class="card-body">
        <!-- Filtros -->
        <div class="row g-3 mb-4">
          <!-- Puesto -->
          <div class="col-md-4">
            <label class="form-label">Puesto</label>
            <select v-model="filtros.puestoId" class="form-select">
              <option value="">Todos los puestos</option>
              <option v-for="puesto in puestos" :key="puesto.id" :value="puesto.id">
                {{ puesto.nombre }}
              </option>
            </select>
          </div>
          
          <!-- Competencias -->
          <div class="col-md-4">
            <label class="form-label">Competencias</label>
            <select v-model="filtros.competenciaId" class="form-select">
              <option value="">Todas las competencias</option>
              <option v-for="competencia in competencias" :key="competencia.id" :value="competencia.id">
                {{ competencia.descripcion }}
              </option>
            </select>
          </div>
          
          <!-- Idiomas -->
          <div class="col-md-4">
            <label class="form-label">Idiomas</label>
            <select v-model="filtros.idiomaId" class="form-select">
              <option value="">Todos los idiomas</option>
              <option v-for="idioma in idiomas" :key="idioma.id" :value="idioma.id">
                {{ idioma.nombre }}
              </option>
            </select>
          </div>
          
          <!-- Capacitaciones -->
          <div class="col-md-4">
            <label class="form-label">Capacitaciones</label>
            <select v-model="filtros.capacitacionId" class="form-select">
              <option value="">Todas las capacitaciones</option>
              <option v-for="capacitacion in capacitaciones" :key="capacitacion.id" :value="capacitacion.id">
                {{ capacitacion.descripcion }} ({{ nivelFormat(capacitacion.nivel) }})
              </option>
            </select>
          </div>
          
          <!-- Salario -->
          <div class="col-md-4">
            <label class="form-label">Salario Máximo</label>
            <input v-model.number="filtros.salarioMax" type="number" class="form-control" min="0" placeholder="Máximo salario aspirado">
          </div>
          
          <!-- Departamento -->
          <div class="col-md-4">
            <label class="form-label">Departamento</label>
            <input v-model="filtros.departamento" type="text" class="form-control" placeholder="Filtrar por departamento">
          </div>
          
          <!-- Botón de búsqueda -->
          <div class="col-12">
            <button @click="buscarCandidatos" class="btn btn-primary w-100">
              <i class="bi bi-search me-2"></i>Buscar Candidatos
            </button>
          </div>
        </div>
        
        <!-- Resultados -->
        <div v-if="cargando" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Buscando candidatos...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage }}
        </div>
        
        <div v-else>
          <div v-if="candidatos.length === 0" class="alert alert-info">
            No se encontraron candidatos con los criterios seleccionados.
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Puesto</th>
                  <th>Departamento</th>
                  <th>Salario Aspirado</th>
                  <th>Competencias</th>
                  <th>Idiomas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidato in candidatos" :key="candidato.id">
                  <td>{{ candidato.cedula }}</td>
                  <td>{{ candidato.nombre }}</td>
                  <td>{{ candidato.puestoNombre }}</td>
                  <td>{{ candidato.departamento }}</td>
                  <td>{{ formatSalario(candidato.salarioAspirado) }}</td>
                  <td>
                    <span v-for="(comp, index) in candidato.competencias" :key="index" class="badge bg-info me-1 mb-1">
                      {{ comp.descripcion }}
                    </span>
                  </td>
                  <td>
                    <span v-for="(idioma, index) in candidato.idiomas" :key="index" class="badge bg-warning me-1 mb-1">
                      {{ idioma.nombre }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsultaCandidatos',
  data() {
    return {
      filtros: {
        puestoId: '',
        competenciaId: '',
        idiomaId: '',
        capacitacionId: '',
        salarioMax: null,
        departamento: ''
      },
      candidatos: [],
      puestos: [],
      competencias: [],
      idiomas: [],
      capacitaciones: [],
      cargando: false,
      error: false,
      errorMessage: ''
    }
  },
  mounted() {
    this.cargarCatalogos();
  },
  methods: {
    async cargarCatalogos() {
      try {
        this.cargando = true;
        
        // Cargar todos los catálogos en paralelo
        const [puestosRes, compRes, idiomasRes, capRes] = await Promise.all([
          this.$axios.get('/Puestos'),
          this.$axios.get('/Competencias'),
          this.$axios.get('/Idiomas'),
          this.$axios.get('/Capacitaciones')
        ]);
        
        this.puestos = puestosRes.data;
        this.competencias = compRes.data;
        this.idiomas = idiomasRes.data;
        this.capacitaciones = capRes.data;
        
      } catch (error) {
        this.error = true;
        this.errorMessage = 'Error cargando los catálogos de referencia';
      } finally {
        this.cargando = false;
      }
    },
    
    async buscarCandidatos() {
      try {
        this.cargando = true;
        this.error = false;
        
        // Construir objeto de parámetros para la consulta
        const params = {};
        for (const [key, value] of Object.entries(this.filtros)) {
          if (value !== '' && value !== null) {
            params[key] = value;
          }
        }
        
        const response = await this.$axios.get('/Candidatos', { params });
        this.candidatos = response.data;
        
      } catch (error) {
        this.error = true;
        this.errorMessage = 'Error buscando candidatos';
        this.candidatos = [];
      } finally {
        this.cargando = false;
      }
    },
    
    formatSalario(value) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(value);
    },
    
    nivelFormat(nivel) {
      const niveles = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' };
      return niveles[nivel] || 'Desconocido';
    },
    
    resetFiltros() {
      this.filtros = {
        puestoId: '',
        competenciaId: '',
        idiomaId: '',
        capacitacionId: '',
        salarioMax: null,
        departamento: ''
      };
    }
  }
}
</script>

<style scoped>
.consulta-candidatos {
  height: 100%;
}

.card-header {
  border-radius: 8px 8px 0 0;
}

.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
  cursor: pointer;
}

.badge {
  font-size: 0.8em;
  padding: 0.5em 0.75em;
  display: inline-block;
  margin-bottom: 3px;
}

.alert {
  border-radius: 8px;
}
</style>