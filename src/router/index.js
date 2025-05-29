import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue';
const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView // Componente que se mostrará en la página principal
    },
    { path: '/competencias', component: () => import('../views/CompetenciasView.vue') },
    { path: '/idiomas', component: () => import('../views/IdiomasView.vue') },
    { path: '/capacitaciones', component: () => import('../views/CapacitacionesView.vue') },
    { path: '/puestos', component: () => import('../views/PuestosView.vue') },
    { path: '/candidatos', component: () => import('../views/CandidatosView.vue') },
    { path: '/empleados', component: () => import('../views/EmpleadosView.vue') },
    { path: '/experiencia-laboral', component: () => import('../views/ExperienciaLaboralView.vue') }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// Opcional: Cambiar título de página dinámicamente
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Sistema de Recursos Humanos'
    next()
})

export default router