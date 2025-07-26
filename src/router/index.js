import { createRouter, createWebHistory } from 'vue-router'
import IncomesView from '@/views/Incomes.vue'
import OrdersView from '@/views/Orders.vue'
import SalesView from '@/views/Sales.vue'
import StocksView from '@/views/Stocks.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/incomes'
    },
    {
      path: '/incomes',
      name: 'Incomes',
      component: IncomesView
    },
    {
      path: '/orders',
      name: 'Orders',
      component: OrdersView
    },
    {
      path: '/sales',
      name: 'Sales',
      component: SalesView
    },
    {
      path: '/stocks',
      name: 'Stocks',
      component: StocksView
    }
  ]
})

export default router