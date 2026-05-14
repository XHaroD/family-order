import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Dishes from '../views/Dishes.vue'
import Categories from '../views/Categories.vue'
import Orders from '../views/Orders.vue'
import Members from '../views/Members.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'Dashboard', component: Dashboard },
        { path: 'dishes', name: 'Dishes', component: Dishes },
        { path: 'categories', name: 'Categories', component: Categories },
        { path: 'orders', name: 'Orders', component: Orders },
        { path: 'members', name: 'Members', component: Members },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
