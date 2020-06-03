import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/User/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import Goods from '../components/goods/Goods.vue'
import Orders from '../components/Orders.vue'
import Reports from '../components/Reports.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path: '/Home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports

      }

    ]
  }

]

const router = new VueRouter({
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from代表总那个路径来
  // next是一个函数 表示放行
  if (to.path === '/') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/')
  next()
})

export default router
