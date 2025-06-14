<template>
  <div class="container">
    <h2 class="mb-4">Gestión de Candidatos</h2>

    <button @click="abrirModal" class="btn btn-primary mb-4">
      <i class="bi bi-plus-circle me-2"></i>Nuevo Candidato
    </button>

    <!-- Tabla de Candidatos -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Salario Aspirado</th>
            <th>Competencias</th>
            <th>Capacitaciones</th>
            <th>Idiomas</th>
            <th>Experiencia Laboral</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="candidato in candidatos" :key="candidato.id">
            <td>{{ candidato.cedula }}</td>
            <td>{{ candidato.nombre }}</td>
            <td>{{ candidato.puestoNombre }}</td>
            <td>{{ formatCurrency(candidato.salarioAspirado) }}</td>
            <td>
              <span v-for="(comp, index) in candidato.competencias.slice(0, 2)" :key="index"
                class="badge bg-info me-1 mb-1">
                {{ comp }}
                <span v-if="index === 1 && candidato.competencias.length > 2" class="ms-1">+{{
                  candidato.competencias.length - 2 }}</span>
              </span>
            </td>
            <td>
              <!-- Cambiado para mostrar capacitaciones -->
              <span v-for="(cap, index) in candidato.capacitaciones.slice(0, 2)" :key="index"
                class="badge bg-success me-1 mb-1"> <!-- Cambiado a color verde -->
                {{ cap }}
                <span v-if="index === 1 && candidato.capacitaciones.length > 2" class="ms-1">+{{
                  candidato.capacitaciones.length - 2 }}</span>
              </span>
              <span v-if="candidato.capacitaciones.length === 0" class="badge bg-secondary">
                Sin capacitaciones
              </span>
            </td>
            <td>
              <span v-for="(idioma, index) in candidato.idiomas.slice(0, 2)" :key="index"
                class="badge bg-warning me-1 mb-1">
                {{ idioma }}
                <span v-if="index === 1 && candidato.idiomas.length > 2" class="ms-1">+{{ candidato.idiomas.length - 2
                }}</span>
              </span>
            </td>
            <td>
              <span v-for="(exp, index) in candidato.experiencias.slice(0, 2)" :key="index"
                class="badge bg-primary me-1 mb-1">
                {{ exp.puestoOcupado }}
                <span v-if="index === 1 && candidato.experiencias.length > 2" class="ms-1">+{{
                  candidato.experiencias.length - 2 }}</span>
              </span>
              <span v-if="candidato.experiencias.length === 0" class="badge bg-secondary">
                Sin experiencia
              </span>
            </td>
            <td>
              <div class="btn-group">
                <button @click="editarCandidato(candidato)" class="btn btn-sm btn-warning">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <!-- Botón para convertir a empleado -->
                <button @click="convertirAEmpleado(candidato)" class="btn btn-sm btn-success">
                  <i class="bi bi-person-check"></i>
                </button>
                <button @click="eliminarCandidato(candidato.id)" class="btn btn-sm btn-danger">
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
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              {{ modoEdicion ? 'Editar' : 'Nuevo' }} Candidato
            </h5>
            <button @click="cerrarModal" class="btn-close"></button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="guardarCandidato">
              <div class="row g-3">
                <!-- Sección Básica -->
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
                  <input v-model="form.nombre" class="form-control" required maxlength="100">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Puesto Aspirado*</label>
                  <select v-model="form.puestoId" class="form-select" required>
                    <option v-for="puesto in puestos" :value="puesto.id" :key="puesto.id">
                      {{ puesto.nombre }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Departamento*</label>
                  <input v-model="form.departamento" class="form-control" required maxlength="50">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Salario Aspirado (USD)*</label>
                  <input v-model="form.salarioAspirado" type="number" class="form-control" min="0" step="100" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Recomendado por</label>
                  <input v-model="form.recomendadoPor" class="form-control" maxlength="100">
                </div>

                <!-- Sección Listas Dinámicas -->
                <div class="col-md-4">
                  <div class="card h-100">
                    <div class="card-header bg-light">
                      Competencias
                      <button type="button" @click="agregarItem('competencias')"
                        class="btn btn-sm btn-success float-end">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div class="card-body">
                      <div v-for="(item, index) in form.competencias" :key="index" class="input-group mb-2">
                        <select v-model="form.competencias[index]" class="form-select">
                          <option v-for="competencia in competencias" :value="competencia.descripcion"
                            :key="competencia.id">
                            {{ competencia.descripcion }}
                          </option>
                        </select>
                        <button @click="eliminarItem('competencias', index)" class="btn btn-danger" type="button">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="card h-100">
                    <div class="card-header bg-light">
                      Idiomas
                      <button type="button" @click="agregarItem('idiomas')" class="btn btn-sm btn-success float-end">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div class="card-body">
                      <div v-for="(item, index) in form.idiomas" :key="index" class="input-group mb-2">
                        <select v-model="form.idiomas[index]" class="form-select">
                          <option v-for="idioma in idiomas" :value="idioma.nombre" :key="idioma.id">
                            {{ idioma.nombre }}
                          </option>
                        </select>
                        <button @click="eliminarItem('idiomas', index)" class="btn btn-danger" type="button">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="card h-100">
                    <div class="card-header bg-light">
                      Capacitaciones
                      <button type="button" @click="agregarItem('capacitaciones')"
                        class="btn btn-sm btn-success float-end">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div class="card-body">
                      <div v-for="(item, index) in form.capacitaciones" :key="index" class="input-group mb-2">
                        <select v-model="form.capacitaciones[index]" class="form-select">
                          <option v-for="capacitacion in capacitaciones" :value="capacitacion.descripcion"
                            :key="capacitacion.id">
                            {{ capacitacion.descripcion }} ({{ nivelFormat(capacitacion.nivel) }})
                          </option>
                        </select>
                        <button @click="eliminarItem('capacitaciones', index)" class="btn btn-danger" type="button">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
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
  name: 'CandidatosView',
  data() {
    return {
      candidatos: [],
      puestos: [],
      competencias: [],
      idiomas: [],
      capacitaciones: [],
      mostrarModal: false,
      modoEdicion: false,
      form: {
        id: null,
        cedula: '',
        nombre: '',
        puestoId: null,
        departamento: '',
        salarioAspirado: 0,
        recomendadoPor: '',
        competencias: [],
        idiomas: [],
        capacitaciones: [],
      }
    }
  },
  mounted() {
    this.cargarCandidatos();
    this.cargarPuestos();
    this.cargarCompetencias();
    this.cargarIdiomas();
    this.cargarCapacitaciones();
  },
  methods: {
    async cargarCandidatos() {
      try {
        const response = await this.$axios.get('/candidatos');
        this.candidatos = response.data;
      } catch (error) {
        this.showError('Error cargando candidatos');
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

    async cargarCompetencias() {
      try {
        const response = await this.$axios.get('/competencias');
        this.competencias = response.data;
      } catch (error) {
        this.showError('Error cargando competencias');
      }
    },

    async cargarIdiomas() {
      try {
        const response = await this.$axios.get('/idiomas');
        this.idiomas = response.data;
      } catch (error) {
        this.showError('Error cargando idiomas');
      }
    },

    async cargarCapacitaciones() {
      try {
        const response = await this.$axios.get('/capacitaciones');
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

    async convertirAEmpleado(candidato) {
      if (confirm(`¿Convertir a ${candidato.nombre} en empleado?`)) {
        try {
          const response = await this.$axios.post(
            `/candidatos/${candidato.id}/ConvertirAEmpleado`
          );
          
          this.$toast.success('Candidato convertido a empleado exitosamente');
          this.candidatos = this.candidatos.filter(c => c.id !== candidato.id);
          
          this.$router.push({ 
            name: 'Empleados',
            query: { newEmployee: response.data.id }
          });
          
        } catch (error) {
          let errorMessage = 'Error convirtiendo candidato a empleado';
          if (error.response?.data) errorMessage += `: ${error.response.data}`;
          this.showError(errorMessage);
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

    editarCandidato(candidato) {
      this.form = {
        ...candidato,
        puestoId: candidato.puestoId.toString(),
        salarioAspirado: parseFloat(candidato.salarioAspirado).toFixed(2),
        competencias: candidato.competencias.map(c => c.descripcion),
        idiomas: candidato.idiomas.map(i => i.nombre),
        capacitaciones: candidato.capacitaciones.map(c => c.descripcion),
      };
      
      this.modoEdicion = true;
      this.abrirModal();
    },

    async guardarCandidato() {
      try {
        // Convertir descripciones a IDs
        const competenciasIds = this.convertirDescriptionsToIds(
          this.form.competencias, 
          this.competencias,
          'descripcion'
        );

        const idiomasIds = this.convertirDescriptionsToIds(
          this.form.idiomas, 
          this.idiomas,
          'nombre'
        );

        const capacitacionesIds = this.convertirDescriptionsToIds(
          this.form.capacitaciones, 
          this.capacitaciones,
          'descripcion'
        );

        // Construir payload sin experiencias
        const payload = {
          id: this.form.id || 0,
          cedula: this.form.cedula,
          nombre: this.form.nombre,
          puestoId: parseInt(this.form.puestoId),
          departamento: this.form.departamento,
          salarioAspirado: parseFloat(this.form.salarioAspirado),
          recomendadoPor: this.form.recomendadoPor || null,
          competenciasIds,
          idiomasIds,
          capacitacionesIds,
          experiencias: [] // Enviar array vacío
        };

        const method = this.modoEdicion ? 'put' : 'post';
        const url = this.modoEdicion 
          ? `/candidatos/${this.form.id}` 
          : '/candidatos';

        const response = await this.$axios[method](url, payload);

        if (response.status === 200 || response.status === 201) {
          this.showSuccess(this.modoEdicion ? 'Candidato actualizado' : 'Candidato creado');
          this.cargarCandidatos();
          this.cerrarModal();
        }
      } catch (error) {
        const errorMessage = error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(', ')
          : error.response?.data?.message || error.message;
          
        this.showError(`Error al guardar: ${errorMessage}`);
        console.error('Detalles del error:', error.response?.data);
        this.cargarCandidatos();
        this.cerrarModal();
      }
    },

    convertirDescriptionsToIds(descriptions, sourceArray, propertyName) {
      const itemMap = new Map();
      sourceArray.forEach(item => {
        itemMap.set(item[propertyName], item.id);
      });

      const ids = [];
      const notFound = [];

      descriptions.forEach(desc => {
        const id = itemMap.get(desc);
        if (id) {
          ids.push(id);
        } else if (desc) {
          notFound.push(desc);
        }
      });

      if (notFound.length > 0) {
        const msg = `Algunos elementos no se encontraron y serán omitidos: ${notFound.join(', ')}`;
        if (this.$toast) this.$toast.warning(msg);
        console.warn(msg);
      }

      return ids;
    },

    showSuccess(message) {
      if (this.$toast) {
        this.$toast.success(message);
      } else {
        alert(message);
      }
    },

    async eliminarCandidato(id) {
      if (confirm('¿Eliminar este candidato?')) {
        try {
          await this.$axios.delete(`/candidatos/${id}`);
          this.cargarCandidatos();
          this.$toast.success('Candidato eliminado');
        } catch (error) {
          this.showError('Error eliminando candidato');
        }
      }
    },

    agregarItem(tipo) {
      this.form[tipo].push('');
    },

    eliminarItem(tipo, index) {
      this.form[tipo].splice(index, 1);
    },

    nivelFormat(nivel) {
      const niveles = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' };
      return niveles[nivel] || 'Desconocido';
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
        salarioAspirado: 0,
        recomendadoPor: '',
        competencias: [],
        idiomas: [],
        capacitaciones: [],
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
  font-size: 0.85em;
  padding: 0.5em 0.75em;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card {
  margin-bottom: 1rem;
}

.input-group {
  transition: all 0.3s ease;
}

.form-control[type="number"]::-webkit-inner-spin-button,
.form-control[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: auto;
  margin: 0;
}

.btn-success {
  background-color: #198754;
  border-color: #198754;
}

/* Nuevo color para badges de capacitaciones */
.bg-success {
  background-color: #198754 !important;
}
</style>