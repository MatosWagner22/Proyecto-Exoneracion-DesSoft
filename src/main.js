import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'

// Configuración de Axios
const axiosInstance = axios.create({
    baseURL: 'https://localhost:7234/api', // URL de tu API
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Configuración de Toast
const toastOptions = {
    transition: "Vue-Toastification__bounce",
    maxToasts: 5,
    newestOnTop: true,
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
}

const app = createApp(App)

// Plugins globales
app.use(router)
app.use(Toast, toastOptions)

// Configuración global de Axios
app.config.globalProperties.$axios = axiosInstance

// Montaje de la aplicación
app.mount('#app')

// Interceptores de Axios para manejo global de errores
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const errorMessage = error.response?.data?.message ||
            `Error: ${error.message}`

        if (error.config.showToast !== false) {
            app.config.globalProperties.$toast.error(errorMessage)
        }

        return Promise.reject(error)
    }
)