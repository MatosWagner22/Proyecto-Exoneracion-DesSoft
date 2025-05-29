<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-building"></i> Sistema RH
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <!-- Gestión de Catálogos -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              Catálogos
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/competencias" class="dropdown-item">
                  Competencias
                </router-link>
              </li>
              <li>
                <router-link to="/idiomas" class="dropdown-item">
                  Idiomas
                </router-link>
              </li>
              <li>
                <router-link to="/capacitaciones" class="dropdown-item">
                  Capacitaciones
                </router-link>
              </li>
              <li>
                <router-link to="/puestos" class="dropdown-item">
                  Puestos
                </router-link>
              </li>
              <li>
                <router-link to="/experiencia-laboral" class="dropdown-item">
                  Experiencia laboral
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Módulo Principal -->
          <li class="nav-item">
            <router-link to="/candidatos" class="nav-link">
              Candidatos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/empleados" class="nav-link">
              Empleados
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppNavbar'  // Cambiar a multi-word
}
</script>

<style scoped>
.navbar {
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-link {
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover,
.router-link-exact-active {
  color: #20c997 !important;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-item:focus,
.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #20c997;
}
</style>