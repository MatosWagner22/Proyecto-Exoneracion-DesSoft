<template>
  <div class="container">
    <h2 class="mb-4">Gestión de Experiencia Laboral</h2>

    <!-- Selector de Candidato -->
    <div class="row mb-4">
      <div class="col-md-6">
        <label class="form-label">Seleccionar Candidato:</label>
        <select v-model="candidatoSeleccionado" class="form-select" @change="cargarExperienciasPorCandidato">
          <option v-for="candidato in candidatos" :key="candidato.id" :value="candidato.id">
            {{ candidato.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Botón de Nueva Experiencia -->
    <button @click="abrirModal" class="btn btn-primary mb-3">
      <i class="bi bi-plus-circle me-2"></i>Agregar Experiencia
    </button>

    <!-- Tabla de Experiencias -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Empresa</th>
            <th>Puesto</th>
            <th>Periodo</th>
            <th>Salario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="experiencia in experiencias" :key="experiencia.id">
            <td>{{ experiencia.empresa }}</td>
            <td>{{ experiencia.puestoOcupado }}</td>
            <td>
              {{ formatFecha(experiencia.fechaDesde) }} -
              {{ experiencia.fechaHasta ? formatFecha(experiencia.fechaHasta) : 'Actual' }}
            </td>
            <td>{{ formatSalario(experiencia.salario) }}</td>
            <td>
              <div class="btn-group">
                <button @click="editarExperiencia(experiencia)" class="btn btn-sm btn-warning me-2">
                  <i class="bi bi-pencil"></i>
                </button>
                <button @click="eliminarExperiencia(experiencia.id)" class="btn btn-sm btn-danger">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Formulario -->
    <div class="modal fade" :class="{ 'show': mostrarModal }" style="display: block" v-if="mostrarModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ modoEdicion ? 'Editar' : 'Nueva' }} Experiencia</h5>
            <button @click="cerrarModal" class="btn-close"></button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="guardarExperiencia">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Empresa*</label>
                  <input v-model="form.empresa" class="form-control" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Puesto*</label>
                  <input v-model="form.puestoOcupado" class="form-control" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Fecha Inicio*</label>
                  <input v-model="form.fechaDesde" type="date" class="form-control" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Fecha Fin</label>
                  <input v-model="form.fechaHasta" type="date" class="form-control" :min="form.fechaDesde">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Salario*</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input v-model="form.salario" type="number" step="0.01" class="form-control" required>
                  </div>
                </div>

                <input type="hidden" v-model="form.candidatoId">
              </div>

              <div class="modal-footer mt-4">
                <button type="button" @click="cerrarModal" class="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      candidatos: [],
      candidatoSeleccionado: null,
      experiencias: [],
      mostrarModal: false,
      modoEdicion: false,
      form: {
        id: null,
        empresa: '',
        puestoOcupado: '',
        fechaDesde: new Date().toISOString().split('T')[0],
        fechaHasta: null,
        salario: 0,
        candidatoId: null
      }
    }
  },
  async mounted() {
    await this.cargarCandidatos();
    if (this.candidatos.length > 0) {
      this.candidatoSeleccionado = this.candidatos[0].id;
      await this.cargarExperienciasPorCandidato();
    }
  },
  methods: {
    async cargarCandidatos() {
      try {
        const response = await this.$axios.get('/Candidatos');
        this.candidatos = response.data;
      } catch (error) {
        let errorMessage = 'Error cargando candidatos';

        // Manejo seguro de errores
        if (error.response) { // El servidor respondió con error
          errorMessage = error.response.data?.message ||
            `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) { // No se recibió respuesta
          errorMessage = "El servidor no respondió. Verifica tu conexión";
        } else { // Error de configuración
          errorMessage = `Error de configuración: ${error.message}`;
        }

        // Fallback seguro para notificaciones
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error(errorMessage);
          alert(errorMessage); // Fallback básico
        }

        this.candidatos = []; // Limpiar datos para evitar errores
      }
    },

    async cargarExperienciasPorCandidato() {
      try {
        if (!this.candidatoSeleccionado) return;

        const response = await this.$axios.get(`/ExperienciaLaboral/candidato/${this.candidatoSeleccionado}`);
        this.experiencias = response.data;
        this.form.candidatoId = this.candidatoSeleccionado;
      } catch (error) {
        this.$toast.error('Error cargando experiencias');
      }
    },

    async guardarExperiencia() {
      try {
        const payload = { ...this.form };

        // Validación de fechas
        if (payload.fechaHasta && new Date(payload.fechaHasta) < new Date(payload.fechaDesde)) {
          throw new Error('La fecha fin no puede ser anterior a la fecha inicio');
        }

        if (this.modoEdicion) {
          await this.$axios.put(`/ExperienciaLaboral/${payload.id}`, payload);
          this.$toast.success('Experiencia actualizada');
        } else {
          await this.$axios.post('/ExperienciaLaboral', payload);
          this.$toast.success('Experiencia creada');
        }

        await this.cargarExperienciasPorCandidato();
        this.cerrarModal();
      } catch (error) {
        this.$toast.error(error.response?.data?.message || error.message);
      }
    },

    async eliminarExperiencia(id) {
      if (confirm('¿Está seguro de eliminar esta experiencia?')) {
        try {
          await this.$axios.delete(`/ExperienciaLaboral/${id}`);
          this.$toast.success('Experiencia eliminada');
          await this.cargarExperienciasPorCandidato();
        } catch (error) {
          this.$toast.error('Error eliminando experiencia');
        }
      }
    },

    editarExperiencia(experiencia) {
      this.form = {
        ...experiencia,
        fechaDesde: experiencia.fechaDesde.split('T')[0],
        fechaHasta: experiencia.fechaHasta?.split('T')[0]
      };
      this.modoEdicion = true;
      this.abrirModal();
    },

    formatFecha(fecha) {
      return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '';
    },

    formatSalario(monto) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(monto);
    },

    abrirModal() {
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.resetForm();
    },

    resetForm() {
      this.form = {
        id: null,
        empresa: '',
        puestoOcupado: '',
        fechaDesde: new Date().toISOString().split('T')[0],
        fechaHasta: null,
        salario: 0,
        candidatoId: this.candidatoSeleccionado
      };
      this.modoEdicion = false;
    }
  }
}
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.input-group-text {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
}
</style>