<template>
  <div class="container">
    <h2 class="mb-4">Gestión de Competencias</h2>
    
    <button @click="abrirModal" class="btn btn-primary mb-4">
      <i class="bi bi-plus-circle me-2"></i>Nueva Competencia
    </button>

    <!-- Tabla de Competencias -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Candidatos Registrados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="competencia in competencias" :key="competencia.id">
            <td>{{ competencia.descripcion }}</td>
            <td>
              <span class="badge" :class="competencia.estado ? 'bg-success' : 'bg-danger'">
                {{ competencia.estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ competencia.cantidadCandidatos }}</td>
            <td>
              <div class="btn-group">
                <button @click="editarCompetencia(competencia)" 
                        class="btn btn-sm btn-warning">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="eliminarCompetencia(competencia.id)" 
                        class="btn btn-sm btn-danger">
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
              {{ modoEdicion ? 'Editar' : 'Nueva' }} Competencia
            </h5>
            <button @click="cerrarModal" class="btn-close"></button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="guardarCompetencia">
              <div class="row g-3">
                <!-- Descripción -->
                <div class="col-md-12">
                  <label class="form-label">Descripción*</label>
                  <input v-model="form.descripcion" 
                         class="form-control" 
                         required
                         maxlength="150">
                </div>

                <!-- Estado -->
                <div class="col-md-12">
                  <label class="form-label">Estado*</label>
                  <select v-model="form.estado" class="form-select" required>
                    <option :value="true">Activo</option>
                    <option :value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div class="modal-footer mt-4">
                <button type="button" @click="cerrarModal" 
                        class="btn btn-secondary">
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
  name: 'CompetenciasView',
  data() {
    return {
      competencias: [],
      mostrarModal: false,
      modoEdicion: false,
      form: {
        id: null,
        descripcion: '',
        estado: true
      }
    }
  },
  mounted() {
    this.cargarCompetencias();
  },
  methods: {
    async cargarCompetencias() {
      try {
        const response = await this.$axios.get('Competencias');
        this.competencias = response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al cargar competencias';
        this.showError(errorMessage);
      }
    },
    
    abrirModal() {
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.resetForm();
    },

    editarCompetencia(competencia) {
      this.form = { 
        id: competencia.id,
        descripcion: competencia.descripcion,
        estado: competencia.estado
      };
      this.modoEdicion = true;
      this.abrirModal();
    },

    async guardarCompetencia() {
      try {
        if (this.modoEdicion) {
          await this.$axios.put(`Competencias/${this.form.id}`, this.form);
          this.$toast.success('Competencia actualizada');
        } else {
          await this.$axios.post('Competencias', this.form);
          this.$toast.success('Competencia creada');
        }
        this.cargarCompetencias();
        this.cerrarModal();
      } catch (error) {
        this.showError('Error guardando competencia');
      }
    },

    async eliminarCompetencia(id) {
      if (confirm('¿Eliminar esta competencia?')) {
        try {
          await this.$axios.delete(`Competencias/${id}`);
          this.cargarCompetencias();
          this.$toast.success('Competencia eliminada');
        } catch (error) {
          this.showError('Error eliminando competencia');
        }
      }
    },

    showError(message) {
      if (this.$toast) {
        this.$toast.error(message);
      } else {
        console.error('Error:', message);
        alert(message);
      }
    },

    resetForm() {
      this.form = {
        id: null,
        descripcion: '',
        estado: true
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