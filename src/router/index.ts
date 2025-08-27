import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/pages/Login/Login.vue'),
            meta: {
                title: '登录',
                requiresAuth: false
            }
        },
        {
            path: '/home',
            name: 'Home',
            component: () => import('@/pages/Home/Home.vue'),
            meta: {
                title: '首页',
                requiresAuth: true
            }
        }
    ]
});

// 路由守卫
router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();
    
    // 设置页面标题
    if (to.meta?.title) {
        document.title = `${to.meta.title} - 实景数据引擎`;
    }
    
    // 检查路由是否需要认证
    if (to.meta?.requiresAuth) {
        // 需要认证的路由
        if (!authStore.isLoggedIn) {
            // 未登录，跳转到登录页
            ElMessage.warning('请先登录');
            next({ 
                path: '/login',
                query: { redirect: to.fullPath } // 保存原始路径，登录后跳转
            });
        } else {
            // 已登录，允许访问
            next();
        }
    } else {
        // 不需要认证的路由
        if (to.path === '/login' && authStore.isLoggedIn) {
            // 已登录用户访问登录页，跳转到首页
            next('/home');
        } else {
            next();
        }
    }
});