<template>
  <div class="container">
    <h2 class="mb-4">Gestión de Puestos</h2>
    
    <button @click="abrirModal" class="btn btn-primary mb-4">
      <i class="bi bi-plus-circle me-2"></i>Nuevo Puesto
    </button>

    <!-- Tabla de Puestos -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Nivel de Riesgo</th>
            <th>Rango Salarial</th>
            <th>Estado</th>
            <th>Candidatos</th>
            <th>Empleados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="puesto in puestos" :key="puesto.id">
            <td>{{ puesto.nombre }}</td>
            <td>
              <span class="badge" :class="nivelRiesgoClass(puesto.nivelRiesgo)">
                {{ puesto.nivelRiesgo }}
              </span>
            </td>
            <td>
              {{ formatCurrency(puesto.salarioMinimo) }} - 
              {{ formatCurrency(puesto.salarioMaximo) }}
            </td>
            <td>
              <span class="badge" :class="puesto.estado ? 'bg-success' : 'bg-danger'">
                {{ puesto.estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ puesto.totalCandidatos }}</td>
            <td>{{ puesto.totalEmpleados }}</td>
            <td>
              <div class="btn-group">
                <button @click="editarPuesto(puesto)" 
                        class="btn btn-sm btn-warning">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="eliminarPuesto(puesto.id)" 
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
              {{ modoEdicion ? 'Editar' : 'Nuevo' }} Puesto
            </h5>
            <button @click="cerrarModal" class="btn-close"></button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="guardarPuesto">
              <div class="row g-3">
                <!-- Nombre -->
                <div class="col-md-12">
                  <label class="form-label">Nombre del Puesto*</label>
                  <input v-model="form.nombre" 
                         class="form-control" 
                         required
                         maxlength="100">
                </div>

                <!-- Nivel de Riesgo -->
                <div class="col-md-6">
                  <label class="form-label">Nivel de Riesgo*</label>
                  <select v-model="form.nivelRiesgo" class="form-select" required>
                    <option value="Alto">Alto</option>
                    <option value="Medio">Medio</option>
                    <option value="Bajo">Bajo</option>
                  </select>
                </div>

                <!-- Rango Salarial -->
                <div class="col-md-6">
                  <label class="form-label">Salario Mínimo*</label>
                  <input v-model="form.salarioMinimo" 
                         type="number" 
                         class="form-control" 
                         min="0"
                         required>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Salario Máximo*</label>
                  <input v-model="form.salarioMaximo" 
                         type="number" 
                         class="form-control" 
                         :min="form.salarioMinimo"
                         required>
                </div>

                <!-- Estado -->
                <div class="col-md-6">
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
  name: 'PuestosView',
  data() {
    return {
      puestos: [],
      mostrarModal: false,
      modoEdicion: false,
      form: {
        id: null,
        nombre: '',
        nivelRiesgo: 'Medio',
        salarioMinimo: 0,
        salarioMaximo: 0,
        estado: true
      }
    }
  },
  mounted() {
    this.cargarPuestos();
  },
  methods: {
    async cargarPuestos() {
      try {
        const response = await this.$axios.get('/puestos');
        this.puestos = response.data;
      } catch (error) {
        this.showError(error.response?.data?.message || 'Error cargando puestos');
      }
    },
    
    abrirModal() {
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.resetForm();
    },

    editarPuesto(puesto) {
      this.form = { 
        id: puesto.id,
        nombre: puesto.nombre,
        nivelRiesgo: puesto.nivelRiesgo,
        salarioMinimo: puesto.salarioMinimo,
        salarioMaximo: puesto.salarioMaximo,
        estado: puesto.estado
      };
      this.modoEdicion = true;
      this.abrirModal();
    },

    async guardarPuesto() {
      try {
        if (this.validarSalarios()) {
          if (this.modoEdicion) {
            await this.$axios.put(`/puestos/${this.form.id}`, this.form);
            this.$toast.success('Puesto actualizado');
          } else {
            await this.$axios.post('/puestos', this.form);
            this.$toast.success('Puesto creado');
          }
          this.cargarPuestos();
          this.cerrarModal();
        }
      } catch (error) {
        //this.showError('Error guardando puesto');
        this.cargarPuestos();
        this.cerrarModal();
      }
    },

    async eliminarPuesto(id) {
      if (confirm('¿Eliminar este puesto?')) {
        try {
          await this.$axios.delete(`/puestos/${id}`);
          this.cargarPuestos();
          this.$toast.success('Puesto eliminado');
        } catch (error) {
          this.showError('Error eliminando puesto');
        }
      }
    },

    validarSalarios() {
      if (parseFloat(this.form.salarioMaximo) < parseFloat(this.form.salarioMinimo)) {
        this.$toast.warning('El salario máximo no puede ser menor al mínimo');
        return false;
      }
      return true;
    },

    nivelRiesgoClass(nivel) {
      return {
        'bg-danger': nivel === 'Alto',
        'bg-warning text-dark': nivel === 'Medio',
        'bg-success': nivel === 'Bajo'
      };
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
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
        nivelRiesgo: 'Medio',
        salarioMinimo: 0,
        salarioMaximo: 0,
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