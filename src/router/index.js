import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// Importar layouts
import MainLayout from '@/components/layout/MainLayout.vue'

// Importar vistas
import LoginView from '@/views/Auth/LoginView.vue'
import DashboardView from '@/views/Dashboard/DashboardView.vue'
import MembersListView from '@/views/Members/MembersListView.vue'
import MemberDetailView from '@/views/Members/MemberDetailView.vue'
import MemberFormView from '@/views/Members/MemberFormView.vue'
import CheckInView from '@/views/CheckIn/CheckInView.vue'
import NewPaymentView from '@/views/Payments/NewPaymentView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView
      },
      {
        path: 'miembros',
        name: 'Members',
        component: MembersListView
      },
      {
        path: 'miembros/nuevo',
        name: 'NewMember',
        component: MemberFormView
      },
      {
        path: 'miembros/:id',
        name: 'MemberDetail',
        component: MemberDetailView
      },
      {
        path: 'miembros/:id/editar',
        name: 'EditMember',
        component: MemberFormView
      },
      {
        path: 'checkin',
        name: 'CheckIn',
        component: CheckInView
      },
      {
        path: 'pagos/nuevo',
        name: 'NewPayment',
        component: NewPaymentView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth

  // Si la ruta requiere autenticación y no hay sesión, redirigir a login
  if (requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login' })
  } 
  // Si está autenticado e intenta ir a login, redirigir al dashboard
  else if (to.name === 'Login' && userStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } 
  // En cualquier otro caso, permitir la navegación
  else {
    next()
  }
})

export default router
