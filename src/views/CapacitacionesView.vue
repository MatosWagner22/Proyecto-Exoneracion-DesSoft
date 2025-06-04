<template>
  <div class="container">
    <h2 class="mb-4">Gestión de Capacitaciones</h2>

    <button @click="abrirModal" class="btn btn-primary mb-4">
      <i class="bi bi-plus-circle me-2"></i>Nueva Capacitación
    </button>

    <!-- Tabla de Capacitaciones -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Descripción</th>
            <th>Nivel</th>
            <th>Institución</th>
            <th>Fechas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="capacitacion in capacitaciones" :key="capacitacion.id">
            <td>{{ capacitacion.descripcion }}</td>
            <td>
              <span class="badge bg-info">{{ nivelFormat(capacitacion.nivel) }}</span>
            </td>
            <td>{{ capacitacion.institucion }}</td>
            <td>
              {{ formatFecha(capacitacion.fechaDesde) }} -
              {{ formatFecha(capacitacion.fechaHasta) }}
            </td>
            <td>
              <div class="btn-group">
                <button @click="editarCapacitacion(capacitacion)" class="btn btn-sm btn-warning">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="eliminarCapacitacion(capacitacion.id)" class="btn btn-sm btn-danger">
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
            <h5 class="modal-title">
              {{ modoEdicion ? 'Editar' : 'Nueva' }} Capacitación
            </h5>
            <button @click="cerrarModal" class="btn-close"></button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="guardarCapacitacion">
              <div class="row g-3">
                <!-- Descripción -->
                <div class="col-md-12">
                  <label class="form-label">Descripción*</label>
                  <input v-model="form.descripcion" class="form-control" required maxlength="150">
                </div>

                <!-- Nivel y Horas -->
                <div class="col-md-6">
                  <label class="form-label">Nivel*</label>
                  <select v-model="form.nivel" class="form-select" required>
                    <option value="1">Básico</option>
                    <option value="2">Intermedio</option>
                    <option value="3">Avanzado</option>
                  </select>
                </div>

                <!-- Fechas -->
                <div class="col-md-6">
                  <label class="form-label">Fecha Inicio*</label>
                  <input v-model="form.fechaDesde" type="date" class="form-control" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Fecha Fin*</label>
                  <input v-model="form.fechaHasta" type="date" class="form-control" :min="form.fechaDesde" required>
                </div>

                <!-- Institución -->
                <div class="col-12">
                  <label class="form-label">Institución*</label>
                  <input v-model="form.institucion" class="form-control" required>
                </div>
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
  name: 'CapacitacionesView',
  data() {
    return {
      capacitaciones: [],
      mostrarModal: false,
      modoEdicion: false,
      form: {
        id: null,
        descripcion: '',
        nivel: '1',
        fechaDesde: '',
        fechaHasta: '',
        institucion: ''
      }
    }
  },
  mounted() {
    this.cargarCapacitaciones();
  },
  methods: {
    async cargarCapacitaciones() {
      try {
        const response = await this.$axios.get('Capacitaciones');
        this.capacitaciones = response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al cargar capacitaciones';
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error('Error:', errorMessage);
          alert(errorMessage);
        }
      }
    },
    abrirModal() {
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.resetForm();
    },

    editarCapacitacion(capacitacion) {
      this.form = {
        ...capacitacion,
        nivel: capacitacion.nivel.toString() // Asegurar que sea string si viene como número
      };
      this.modoEdicion = true;
      this.abrirModal();
    },

    async guardarCapacitacion() {
      try {
        if (this.validarFechas()) {
          if (this.modoEdicion) {
            await this.$axios.put(`Capacitaciones/${this.form.id}`, this.form);
            this.$toast.success('Capacitación actualizada');
          } else {
            await this.$axios.post('Capacitaciones', this.form);
            this.$toast.success('Capacitación creada');
          }
          this.cargarCapacitaciones();
          this.cerrarModal();
        }
      } catch (error) {
        // Manejo seguro del error
        /*const errorMessage = error.response?.data?.message ||
          error.message ||
          'Error desconocido al guardar la capacitación';

        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error('Error:', errorMessage);
          alert(errorMessage);
        }*/
        this.cargarCapacitaciones();
        this.cerrarModal();
      }
    },
    async eliminarCapacitacion(id) {
      if (confirm('¿Eliminar esta capacitación?')) {
        try {
          await this.$axios.delete(`Capacitaciones/${id}`);
          this.cargarCapacitaciones();
          this.$toast.success('Capacitación eliminada');
        } catch (error) {
          this.$toast.error('Error eliminando capacitación');
        }
      }
    },

    validarFechas() {
      if (new Date(this.form.fechaHasta) < new Date(this.form.fechaDesde)) {
        this.$toast.warning('La fecha fin no puede ser anterior a la fecha inicio');
        return false;
      }
      return true;
    },

    nivelFormat(nivel) {
      const niveles = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' };
      return niveles[nivel] || 'Desconocido';
    },

    formatFecha(fecha) {
      try {
        if (!fecha) return 'Fecha inválida';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', options);
      } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'Fecha inválida';
      }
    },

    resetForm() {
      this.form = {
        id: null,
        descripcion: '',
        nivel: '1',
        fechaInicio: '',
        fechaFin: '',
        horas: 1,
        institucion: ''
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

.badge {
  font-size: 0.9em;
  padding: 0.5em 0.75em;
}
</style>