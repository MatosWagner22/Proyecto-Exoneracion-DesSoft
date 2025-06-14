<template>
  <div class="container">
    <h2 class="mb-4">Gestión de Empleados</h2>
    
    <button @click="abrirModal" class="btn btn-primary mb-4">
      <i class="bi bi-plus-circle me-2"></i>Nuevo Empleado
    </button>

    <!-- Tabla de Empleados -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Departamento</th>
            <th>Salario</th>
            <th>Estado</th>
            <th>Fecha Ingreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empleado in empleados" :key="empleado.id">
            <td>{{ empleado.cedula }}</td>
            <td>{{ empleado.nombre }}</td>
            <td>{{ empleado.puestoNombre }}</td>
            <td>{{ empleado.departamento }}</td>
            <td>{{ formatCurrency(empleado.salarioMensual) }}</td>
            <td>
              <span class="badge" :class="estadoClass(empleado.estado)">
                {{ empleado.estado }}
              </span>
            </td>
            <td>{{ formatFecha(empleado.fechaIngreso) }}</td>
            <td>
              <div class="btn-group">
                <button @click="editarEmpleado(empleado)" 
                        class="btn btn-sm btn-warning">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button @click="eliminarEmpleado(empleado.id)" 
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
              {{ modoEdicion ? 'Editar' : 'Nuevo' }} Empleado
            </h5>
            <button @click="cerrarModal" class="btn-close"></button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="guardarEmpleado">
              <div class="row g-3">
                <!-- Cédula y Nombre -->
                <div class="col-md-6">
                  <label class="form-label">Cédula*</label>
                  <input 
                    v-model="form.cedula" 
                    @input="formatearCedula"
                    class="form-control" 
                    required 
                    maxlength="13"
                    placeholder="000-0000000-0"
                    :class="{ 'is-invalid': cedulaInvalida }"
                  >
                  <div v-if="cedulaInvalida" class="invalid-feedback">
                    {{ mensajeErrorCedula }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Nombre Completo*</label>
                  <input v-model="form.nombre" 
                         class="form-control" 
                         required
                         maxlength="100">
                </div>

                <!-- Puesto y Departamento -->
                <div class="col-md-6">
                  <label class="form-label">Puesto*</label>
                  <select v-model="form.puestoId" class="form-select" required>
                    <option v-for="puesto in puestos" :value="puesto.id" :key="puesto.id">
                      {{ puesto.nombre }}
                    </option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Departamento*</label>
                  <input v-model="form.departamento" 
                         class="form-control" 
                         required
                         maxlength="50">
                </div>

                <!-- Salario y Fecha -->
                <div class="col-md-6">
                  <label class="form-label">Salario Mensual*</label>
                  <input v-model="form.salarioMensual" 
                         type="number" 
                         class="form-control" 
                         min="0"
                         step="0.01"
                         required>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Fecha de Ingreso*</label>
                  <input v-model="form.fechaIngreso" 
                        type="date" 
                        class="form-control" 
                        :max="new Date().toISOString().split('T')[0]"
                        :disabled="!modoEdicion"
                        required>
                </div>

                <!-- Estado -->
                <div class="col-md-12">
                  <label class="form-label">Estado*</label>
                  <select v-model="form.estado" class="form-select" required>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Licencia">Licencia</option>
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
  name: 'EmpleadosView',
  data() {
    return {
      empleados: [],
      puestos: [],
      mostrarModal: false,
      modoEdicion: false,
      form: {
        id: null,
        cedula: '',
        nombre: '',
        puestoId: null,
        departamento: '',
        salarioMensual: 0,
        estado: 'Activo',
        fechaIngreso: new Date().toISOString().split('T')[0]
      }
    }
  },
  mounted() {
    this.cargarEmpleados();
    this.cargarPuestos();
  },
  methods: {
    async cargarEmpleados() {
      try {
        const response = await this.$axios.get('/empleados');
        this.empleados = response.data;
      } catch (error) {
        this.showError('Error cargando empleados');
      }
    },
    
    async cargarPuestos() {
      try {
        const response = await this.$axios.get('/puestos');
        this.puestos = response.data;
      } catch (error) {
        this.showError('Error cargando puestos');
      }
    },

    abrirModal() {
      this.mostrarModal = true;
    },

    cerrarModal() {
      this.mostrarModal = false;
      this.resetForm();
    },

    editarEmpleado(empleado) {
      this.form = {
        id: empleado.id,
        cedula: empleado.cedula,
        nombre: empleado.nombre,
        puestoId: empleado.puestoId,
        departamento: empleado.departamento,
        salarioMensual: empleado.salarioMensual,
        estado: empleado.estado,
        fechaIngreso: empleado.fechaIngreso.split('T')[0]
      };
      this.modoEdicion = true;
      this.abrirModal();
    },

    async guardarEmpleado() {
      try {
        if (!this.validarFecha()) return;
        
        // Construir payload según lo que espera el backend
        const payload = this.modoEdicion
          ? {
              id: this.form.id,
              nombre: this.form.nombre,
              puestoId: parseInt(this.form.puestoId),
              departamento: this.form.departamento,
              salarioMensual: parseFloat(this.form.salarioMensual),
              estado: this.form.estado
            }
          : {
              cedula: this.form.cedula,
              nombre: this.form.nombre,
              puestoId: parseInt(this.form.puestoId),
              departamento: this.form.departamento,
              salarioMensual: parseFloat(this.form.salarioMensual),
              estado: this.form.estado
            };

        if (this.modoEdicion) {
          await this.$axios.put(`empleados/${this.form.id}`, payload);
          this.$toast.success('Empleado actualizado');
        } else {
          await this.$axios.post('/empleados', payload);
          this.$toast.success('Empleado creado');
        }
        
        this.cargarEmpleados();
        this.cerrarModal();
      } catch (error) {
        /*let errorMessage = 'Error guardando empleado';
        
        if (error.response?.data) {
          // Manejar diferentes formatos de error
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.errors) {
            errorMessage = Object.values(error.response.data.errors).flat().join(', ');
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        this.showError(errorMessage);*/
        this.cargarEmpleados();
        this.cerrarModal();
      }
    },

    async eliminarEmpleado(id) {
      if (confirm('¿Eliminar este empleado?')) {
        try {
          await this.$axios.delete(`/empleados/${id}`);
          this.cargarEmpleados();
          this.$toast.success('Empleado eliminado');
        } catch (error) {
          this.showError('Error eliminando empleado');
        }
      }
    },

    validarFecha() {
      const fechaIngreso = new Date(this.form.fechaIngreso);
      if (fechaIngreso > new Date()) {
        this.$toast.warning('La fecha de ingreso no puede ser futura');
        return false;
      }
      return true;
    },

    estadoClass(estado) {
      return {
        'bg-success': estado === 'Activo',
        'bg-danger': estado === 'Inactivo',
        'bg-warning': estado === 'Vacaciones',
        'bg-info': estado === 'Licencia'
      };
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    },

    formatFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-ES');
    },

    showError(message) {
      if (this.$toast) {
        this.$toast.error(message);
      } else {
        alert(message);
      }
    },

    resetForm() {
      this.form = {
        id: null,
        cedula: '',
        nombre: '',
        puestoId: null,
        departamento: '',
        salarioMensual: 0,
        estado: 'Activo',
        fechaIngreso: new Date().toISOString().split('T')[0]
      };
      this.modoEdicion = false;
    },
    formatearCedula() {
      // Eliminar cualquier carácter no numérico
      let cedula = this.form.cedula.replace(/\D/g, '');
      
      // Formatear solo si la longitud es suficiente
      if (cedula.length > 3 && cedula.length <= 10) {
        cedula = cedula.substring(0, 3) + '-' + cedula.substring(3);
      }
      if (cedula.length > 11) {
        cedula = cedula.substring(0, 11) + '-' + cedula.substring(11, 12);
      }
      
      this.form.cedula = cedula;
      this.validarCedula();
    },
    
    validarCedula() {
      this.cedulaInvalida = false;
      this.mensajeErrorCedula = '';
      
      const cedula = this.form.cedula.replace(/-/g, '');
      
      // Validar longitud
      if (cedula.length !== 11) {
        this.cedulaInvalida = true;
        this.mensajeErrorCedula = 'La cédula debe tener 11 dígitos';
        return false;
      }
      
      // Validar que todos sean números
      if (!/^\d+$/.test(cedula)) {
        this.cedulaInvalida = true;
        this.mensajeErrorCedula = 'La cédula solo puede contener números';
        return false;
      }
      
      // Validar dígito verificador
      const digitoVerificador = this.calcularDigitoVerificador(cedula);
      if (parseInt(cedula[10]) !== digitoVerificador) {
        this.cedulaInvalida = true;
        this.mensajeErrorCedula = 'El dígito verificador no es válido';
        return false;
      }
      
      return true;
    },
    
    calcularDigitoVerificador(cedula) {
      // Factores de ponderación para cada posición
      const factores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
      let suma = 0;
      
      for (let i = 0; i < 10; i++) {
        let producto = parseInt(cedula[i]) * factores[i];
        
        // Si el producto es >= 10, sumar los dígitos individuales
        if (producto >= 10) {
          producto = Math.floor(producto / 10) + (producto % 10);
        }
        
        suma += producto;
      }
      
      // Calcular dígito verificador
      const modulo = suma % 10;
      return modulo === 0 ? 0 : 10 - modulo;
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

.form-control[type="number"]::-webkit-inner-spin-button,
.form-control[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: auto;
  margin: 0;
}
</style>