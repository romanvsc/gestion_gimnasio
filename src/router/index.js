import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// Importar layouts
import MainLayout from '@/components/layout/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/LoginView.vue'),
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
        component: () => import('@/views/Dashboard/DashboardView.vue')
      },
      {
        path: 'miembros',
        name: 'Members',
        component: () => import('@/views/Members/MembersListView.vue')
      },
      {
        path: 'miembros/nuevo',
        name: 'NewMember',
        component: () => import('@/views/Members/MemberFormView.vue')
      },
      {
        path: 'miembros/:id',
        name: 'MemberDetail',
        component: () => import('@/views/Members/MemberDetailView.vue')
      },
      {
        path: 'miembros/:id/editar',
        name: 'EditMember',
        component: () => import('@/views/Members/MemberFormView.vue')
      },
      {
        path: 'checkin',
        name: 'CheckIn',
        component: () => import('@/views/CheckIn/CheckInView.vue')
      },
      {
        path: 'pagos/nuevo',
        name: 'NewPayment',
        component: () => import('@/views/Payments/NewPaymentView.vue')
      },
      {
        path: 'caja',
        name: 'Cash',
        component: () => import('@/views/Cash/CashView.vue'),
        meta: { role: 'admin' }
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('@/views/Staff/StaffListView.vue'),
        meta: { role: 'admin' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports/ReportsView.vue'),
        meta: { role: 'admin' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/SettingsView.vue'),
        meta: { role: 'admin' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación global
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth

  // Verificar sesión directamente con Supabase si el store está vacío
  if (!userStore.session) {
    const { supabase } = await import('@/lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Si Supabase tiene sesión pero el store no, actualizar el store
      userStore.session = session
      userStore.user = session.user
      await userStore.checkUserRole(session.user.id)
    }
  }

  // Si la ruta requiere autenticación y no hay sesión, redirigir a login
  if (requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login' })
  } 
  // Si está autenticado e intenta ir a login, redirigir al dashboard
  else if (to.name === 'Login' && userStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  }
  // Verificar Roles (RBAC)
  else if (to.meta.role && userStore.userRole !== to.meta.role) {
    alert('No tienes permisos para acceder a esta sección.')
    next({ name: 'Dashboard' })
  }
  // En cualquier otro caso, permitir la navegación
  else {
    next()
  }
})

export default router
