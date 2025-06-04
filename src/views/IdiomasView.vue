<template>
  <div class="container">
    <h2 class="mb-4">Gestión de Idiomas</h2>
    
    <button @click="abrirModal" class="btn btn-primary mb-4">
      <i class="bi bi-plus-circle me-2"></i>Nuevo Idioma
    </button>

    <!-- Tabla de Idiomas -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Candidatos Registrados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="idioma in idiomas" :key="idioma.id">
            <td>{{ idioma.nombre }}</td>
            <td>
              <span class="badge" :class="idioma.estado ? 'bg-success' : 'bg-danger'">
                {{ idioma.estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ idioma.cantidadCandidatos }}</td>
            <td>
              <div class="btn-group">
                <button @click="editarIdioma(idioma)" 
                        class="btn btn-sm btn-warning">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="eliminarIdioma(idioma.id)" 
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
              {{ modoEdicion ? 'Editar' : 'Nuevo' }} Idioma
            </h5>
            <button @click="cerrarModal" class="btn-close"></button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="guardarIdioma">
              <div class="row g-3">
                <!-- Nombre -->
                <div class="col-md-12">
                  <label class="form-label">Nombre*</label>
                  <input v-model="form.nombre" 
                         class="form-control" 
                         required
                         maxlength="50">
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
  name: 'IdiomasView',
  data() {
    return {
      idiomas: [],
      mostrarModal: false,
      modoEdicion: false,
      form: {
        id: null,
        nombre: '',
        estado: true
      }
    }
  },
  mounted() {
    this.cargarIdiomas();
  },
  methods: {
    async cargarIdiomas() {
      try {
        const response = await this.$axios.get('/idiomas');
        this.idiomas = response.data;
      } catch (error) {
        this.showError(error.response?.data?.message || 'Error cargando idiomas');
      }
    },
    
    abrirModal() {
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.resetForm();
    },

    editarIdioma(idioma) {
      this.form = { 
        id: idioma.id,
        nombre: idioma.nombre,
        estado: idioma.estado
      };
      this.modoEdicion = true;
      this.abrirModal();
    },

    async guardarIdioma() {
      try {
        if (this.modoEdicion) {
          await this.$axios.put(`/idiomas/${this.form.id}`, this.form);
          this.$toast.success('Idioma actualizado');
        } else {
          await this.$axios.post('/idiomas', this.form);
          this.$toast.success('Idioma creado');
        }
        this.cargarIdiomas();
        this.cerrarModal();
      } catch (error) {
        //this.showError('Error guardando idioma');
        this.cargarIdiomas();
        this.cerrarModal();
      }
    },

    async eliminarIdioma(id) {
      if (confirm('¿Eliminar este idioma?')) {
        try {
          await this.$axios.delete(`/idiomas/${id}`);
          this.cargarIdiomas();
          this.$toast.success('Idioma eliminado');
        } catch (error) {
          this.showError('Error eliminando idioma');
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
        nombre: '',
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