import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserRole } from '@/apis/userTypes';
import { login as loginApi, getUserInfo, logout as logoutApi } from '@/apis/auth';
import { ElMessage } from 'element-plus';

/**
 * 认证状态管理
 */
export const useAuthStore = defineStore('auth', () => {
    // 状态
    const token = ref<string>('');
    const user = ref<User | null>(null);
    const isLoading = ref(false);

    // 计算属性
    const isLoggedIn = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => user.value?.role === 'admin');

    /**
     * 初始化认证状态（从localStorage恢复）
     */
    const initAuth = () => {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        
        if (savedToken && savedUser) {
            token.value = savedToken;
            try {
                user.value = JSON.parse(savedUser);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                clearAuth();
            }
        }
    };

    /**
     * 本地验证（网络错误时的备用方案）
     */
    const localLogin = (username: string, password: string) => {
        // 预设的本地账户（可以根据需要修改）
        const localAccounts = [
            { username: 'admin', password: 'admin123', name: '管理员', role: 'admin' },
            { username: 'user', password: 'user123', name: '用户', role: 'user' },
            { username: 'test', password: 'test123', name: '测试用户', role: 'user' },
            { username: 'wangxu', password: 'szuailab', name: '王旭', role: 'user' }
        ];
        
        const account = localAccounts.find(acc => acc.username === username && acc.password === password);
        
        if (account) {
            // 生成临时token
            const tempToken = 'local_token_' + Date.now();
            const tempUser = {
                id: Date.now(),
                username: account.username,
                role: account.role as UserRole,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            token.value = tempToken;
            user.value = tempUser;
            
            // 保存到localStorage
            localStorage.setItem('auth_token', token.value);
            localStorage.setItem('auth_user', JSON.stringify(user.value));
            
            ElMessage.success('本地登录成功（离线模式）');
            return true;
        }
        
        return false;
    };

    /**
     * 用户登录
     */
    const login = async (username: string, password: string) => {
        try {
            isLoading.value = true;
            const response = await loginApi({ username, password });
            
            if (response.data.code === 200) {
                token.value = response.data.data.token;
                user.value = response.data.data.user;
                
                // 保存到localStorage
                localStorage.setItem('auth_token', token.value);
                localStorage.setItem('auth_user', JSON.stringify(user.value));
                
                ElMessage.success('登录成功');
                return true;
            } else {
                ElMessage.error(response.data.message || '登录失败');
                return false;
            }
        } catch (error: any) {
            console.error('网络登录失败:', error);
            
            // 网络错误时尝试本地验证
            console.log('尝试本地验证...');
            const localLoginSuccess = localLogin(username, password);
            
            if (localLoginSuccess) {
                return true;
            } else {
                ElMessage.error('登录失败：用户名或密码错误');
                return false;
            }
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
        try {
            const response = await getUserInfo();
            if (response.data.code === 200) {
                user.value = response.data.data;
                localStorage.setItem('auth_user', JSON.stringify(user.value));
                return true;
            } else {
                ElMessage.error('获取用户信息失败');
                return false;
            }
        } catch (error: any) {
            console.error('获取用户信息失败:', error);
            // 如果token失效，清除认证状态
            if (error.response?.status === 401) {
                clearAuth();
            }
            return false;
        }
    };

    /**
     * 用户退出登录
     */
    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error('退出登录API调用失败:', error);
        } finally {
            clearAuth();
            ElMessage.success('已退出登录');
        }
    };

    /**
     * 清除认证状态
     */
    const clearAuth = () => {
        token.value = '';
        user.value = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    /**
     * 设置请求拦截器的token
     */
    const setAuthHeader = () => {
        if (token.value) {
            return {
                'Authorization': `Bearer ${token.value}`
            };
        }
        return {};
    };

    return {
        // 状态
        token,
        user,
        isLoading,
        // 计算属性
        isLoggedIn,
        isAdmin,
        // 方法
        initAuth,
        login,
        logout,
        fetchUserInfo,
        clearAuth,
        setAuthHeader
    };
});
