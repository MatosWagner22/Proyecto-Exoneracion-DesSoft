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
            <th>Idiomas</th>
            <th>Experiencia Laboral</th> <!-- Nueva columna -->
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
                  <input v-model="form.cedula" class="form-control" required maxlength="20">
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

                <!-- Sección Experiencias Laborales -->
                <div class="col-12">
                  <div class="card">
                    <div class="card-header bg-light">
                      Experiencias Laborales
                      <button type="button" @click="agregarExperiencia" class="btn btn-sm btn-success float-end">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div class="card-body">
                      <div v-for="(exp, index) in form.experiencias" :key="index" class="border p-3 mb-3">
                        <div class="row g-3">
                          <div class="col-md-4">
                            <label class="form-label">Empresa*</label>
                            <input v-model="exp.empresa" class="form-control" required>
                          </div>
                          <div class="col-md-4">
                            <label class="form-label">Puesto Ocupado*</label>
                            <select v-model="exp.puestoOcupado" class="form-select" required>
                              <option v-for="puesto in puestos" :value="puesto.nombre" :key="puesto.id">
                                {{ puesto.nombre }}
                              </option>
                            </select>
                          </div>
                          <div class="col-md-4">
                            <label class="form-label">Salario (USD)*</label>
                            <input v-model="exp.salario" type="number" class="form-control" min="0" required>
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Fecha Desde*</label>
                            <input v-model="exp.fechaDesde" type="date" class="form-control" required>
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Fecha Hasta*</label>
                            <input v-model="exp.fechaHasta" type="date" class="form-control" :min="exp.fechaDesde"
                              required>
                          </div>
                          <div class="col-12 text-end">
                            <button @click="eliminarExperiencia(index)" class="btn btn-danger btn-sm" type="button">
                              Eliminar Experiencia
                            </button>
                          </div>
                        </div>
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
        experiencias: []
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
        
        // Convertir a arrays de descripciones
        competencias: candidato.competencias.map(c => c.descripcion),
        idiomas: candidato.idiomas.map(i => i.nombre),
        capacitaciones: candidato.capacitaciones.map(c => c.descripcion),
        
        experiencias: candidato.experiencias.map(exp => ({
          ...exp,
          id: exp.id, // Mantener el ID
          fechaDesde: exp.fechaDesde.split('T')[0],
          fechaHasta: exp.fechaHasta?.split('T')[0] || '',
          salario: parseFloat(exp.salario).toFixed(2)
        }))
      };
      
      this.modoEdicion = true;
      this.abrirModal();
    },

    async guardarCandidato() {
      try {
        if (!this.validarExperiencias()) return;

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

        // Preparar experiencias laborales
        const experiencias = this.form.experiencias.map(exp => ({
          ...exp,
          id: exp.id || 0, // Mantener ID si existe, de lo contrario 0
          candidatoId: this.modoEdicion ? this.form.id : 0,
          salario: parseFloat(exp.salario),
          fechaDesde: new Date(exp.fechaDesde).toISOString(),
          fechaHasta: new Date(exp.fechaHasta).toISOString()
        }));

        // Construir payload según API
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
          experiencias
        };

        // Determinar método HTTP
        const method = this.modoEdicion ? 'put' : 'post';
        const url = this.modoEdicion 
          ? `/candidatos/${this.form.id}` 
          : '/candidatos';

        // Enviar solicitud
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
      }
    },

    // Nuevo método para convertir descripciones a IDs
    convertirDescriptionsToIds(descriptions, sourceArray, propertyName) {
      return descriptions
        .map(desc => sourceArray.find(item => item[propertyName] === desc) // Encontrar objeto
        .filter(item => item) // Filtrar elementos no encontrados
        .map(item => item.id)); // Obtener solo IDs
    },

    // Nuevo método para mostrar éxito
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

    agregarExperiencia() {
      this.form.experiencias.push({
        id: 0, // <-- Asegurar ID inicial
        empresa: '',
        puestoOcupado: '',
        fechaDesde: '',
        fechaHasta: '',
        salario: 0,
        candidatoId: this.modoEdicion ? this.form.id : 0
      });
    },

    eliminarExperiencia(index) {
      this.form.experiencias.splice(index, 1);
    },

    validarExperiencias() {
      let isValid = true;
      this.form.experiencias.forEach((exp, index) => {
        if (!exp.empresa || !exp.puestoOcupado) {
          this.$toast.warning(`Experiencia ${index + 1}: Complete todos los campos obligatorios`);
          isValid = false;
        }

        const fechaDesde = new Date(exp.fechaDesde);
        const fechaHasta = new Date(exp.fechaHasta);

        if (isNaN(fechaDesde.getTime())) {
          this.$toast.warning(`Experiencia ${index + 1}: Fecha desde inválida`);
          isValid = false;
        }

        if (isNaN(fechaHasta.getTime())) {
          this.$toast.warning(`Experiencia ${index + 1}: Fecha hasta inválida`);
          isValid = false;
        }

        if (fechaHasta < fechaDesde) {
          this.$toast.warning(`Experiencia ${index + 1}: Fecha hasta no puede ser anterior`);
          isValid = false;
        }
      });
      return isValid;
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
        experiencias: []
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

.experiencia-item {
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.form-control[type="number"]::-webkit-inner-spin-button,
.form-control[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: auto;
  margin: 0;
}
</style>