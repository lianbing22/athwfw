import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'

// 路由组件
const Home = () => import('@/views/Home.vue')
const ServiceRequest = () => import('@/views/ServiceRequest.vue')
const ServiceStatus = () => import('@/views/ServiceStatus.vue')
const Schedule = () => import('@/views/Schedule.vue')
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const AdminServices = () => import('@/views/admin/AdminServices.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '会议室服务系统',
      requiresAuth: false
    }
  },
  {
    path: '/service-request',
    name: 'ServiceRequest',
    component: ServiceRequest,
    meta: {
      title: '服务请求',
      requiresAuth: false
    }
  },
  {
    path: '/service-status',
    name: 'ServiceStatus',
    component: ServiceStatus,
    meta: {
      title: '服务状态',
      requiresAuth: false
    }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule,
    meta: {
      title: '值班安排',
      requiresAuth: false
    }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      title: '管理后台',
      requiresAuth: true,
      role: 'admin'
    }
  },
  {
    path: '/admin/services',
    name: 'AdminServices',
    component: AdminServices,
    meta: {
      title: '服务管理',
      requiresAuth: true,
      role: 'admin'
    }
  },
  {
    path: '/meeting-service',
    name: 'MeetingService',
    component: () => import('@/views/MeetingService.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const appStore = useAppStore()
  
  // 设置页面标题
  document.title = to.meta.title || '会议室服务系统'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!appStore.isAuthenticated) {
      // 未登录，跳转到首页
      next('/')
      return
    }
    
    // 检查角色权限
    if (to.meta.role && appStore.userRole !== to.meta.role) {
      // 权限不足，跳转到首页
      next('/')
      return
    }
  }
  
  next()
})

export default router