import Vue from 'vue'
import Router from 'vue-router'
import Home from '../pages/home/Home'
import Center from '../pages/center/Center'
import Blog from '../pages/center/Blog'
import Certificate from '../pages/center/Certificate'
import Message from '../pages/center/Message'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/center',
      name: 'Center',
      component: Center
    },
    {
      path:'/blog',
      name:'Blog',
      component:Blog
    },
    {
      path:'/certificate',
      name:'Certificate',
      component:Certificate
    },
    {
      path:'/message',
      name:'Message',
      component:Message
    }
  ]
})