<template>
  <div class="consulta-candidatos">
    <div class="card shadow h-100">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">
          <i class="bi bi-search me-2"></i>Consulta de Candidatos por Criterios
        </h4>
        <button v-if="candidatos.length > 0" @click="exportarPDF" class="btn btn-light w-100">
          <i class="bi bi-file-earmark-pdf me-1"></i> Exportar PDF
        </button>
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
                      {{ comp.descripcion }} <!-- Cambiado de comp.descripcion a comp.descripcion -->
                    </span>
                  </td>
                  <td>
                    <span v-for="(idioma, index) in candidato.idiomas" :key="index" class="badge bg-warning me-1 mb-1">
                      {{ idioma.nombre }} <!-- Cambiado de idioma.nombre a idioma.nombre -->
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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
        
        const [puestosRes, compRes, idiomasRes, capRes] = await Promise.all([
          this.$axios.get('Puestos'),         
          this.$axios.get('Competencias'),    
          this.$axios.get('Idiomas'),         
          this.$axios.get('Capacitaciones')   
        ]);
        
        this.puestos = puestosRes.data;
        this.competencias = compRes.data;
        this.idiomas = idiomasRes.data;
        this.capacitaciones = capRes.data;
        
      } catch (error) {
        // Manejo de errores mejorado
        this.error = true;
        this.errorMessage = error.response?.data?.message || 'Error cargando los catálogos de referencia';
        console.error("Error en cargarCatalogos:", error);
      } finally {
        this.cargando = false;
      }
    },
    
    async buscarCandidatos() {
      try {
        this.cargando = true;
        this.error = false;
        
        // Construir parámetros con nombres exactos que espera la API
        const params = {
          puestoId: this.filtros.puestoId || null,
          competenciaId: this.filtros.competenciaId || null,
          idiomaId: this.filtros.idiomaId || null,
          capacitacionId: this.filtros.capacitacionId || null
        };
        
        // Filtrar parámetros nulos/vacíos
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === '') {
            delete params[key];
          }
        });
        
        // Usar el nuevo endpoint de filtrado
        const response = await this.$axios.get('Candidatos/filtro', { params });
        this.candidatos = response.data;
        
      } catch (error) {
        this.error = true;
        this.errorMessage = error.response?.data?.message || 'Error buscando candidatos';
        console.error("Error en buscarCandidatos:", error);
        this.candidatos = [];
      } finally {
        this.cargando = false;
      }
    },
    
    formatSalario(value) {
      if (!value) return 'No especificado';
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
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
        capacitacionId: ''
      };
    },
    exportarPDF() {
      // Crear nuevo documento PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Título del reporte
      const title = "Reporte de Candidatos";
      const date = new Date().toLocaleDateString();
      doc.setFontSize(16);
      doc.text(title, 15, 15);
      doc.setFontSize(10);
      doc.text(`Generado: ${date}`, 15, 22);

      // Preparar datos para la tabla
      const tableData = this.candidatos.map(candidato => {
        return [
          candidato.cedula,
          candidato.nombre,
          candidato.puestoNombre,
          candidato.departamento,
          this.formatSalario(candidato.salarioAspirado),
          candidato.competencias.map(c => c.descripcion).join(', '),
          candidato.idiomas.map(i => i.nombre).join(', ')
        ];
      });

      // Encabezados de la tabla
      const headers = [
        'Cédula',
        'Nombre',
        'Puesto',
        'Departamento',
        'Salario Aspirado',
        'Competencias',
        'Idiomas'
      ];

      // Crear tabla con autotable
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 10,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });

      // Guardar PDF
      doc.save('reporte-candidatos.pdf');
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