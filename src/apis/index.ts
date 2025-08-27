import axios from "axios";

// 从配置文件读取API基础地址
declare global {
    interface Window {
        realSceneDataEngineConfig: {
            apiBaseUrl: string;
            threeDGSViewer: string;
        };
    }
}

const getApiBaseUrl = (): string => {
    if (typeof window !== 'undefined' && window.realSceneDataEngineConfig?.apiBaseUrl) {
        return window.realSceneDataEngineConfig.apiBaseUrl;
    }
    // 默认值，如果配置文件未加载
    return 'http://172.31.70.135:8000';
};

export const request = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器 - 添加认证token
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理认证错误
request.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 如果token过期或无效，清除本地存储并跳转到登录页
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // 如果不是在登录页面，则跳转到登录页
            if (window.location.hash !== '#/login') {
                window.location.hash = '#/login';
            }
        }
        return Promise.reject(error);
    }
);