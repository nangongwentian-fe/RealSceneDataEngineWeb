import axios from 'axios';
import type { UploadResponseData } from "./staticFileTypes";

// 创建专门用于文件上传的axios实例，超时时间更长
const uploadRequest = axios.create({
    timeout: 300000, // 5分钟超时，适合大文件上传
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

// 添加认证拦截器
uploadRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 添加响应拦截器处理认证错误
uploadRequest.interceptors.response.use(
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

/**
 * @description 文件上传
 * @param file 文件对象
 * @returns 数据库的文件数据项
 */
// 支持上传进度的文件上传封装
export const upload = (
    file: File,
    /** 上传进度回调，返回已上传字节、总字节及百分比 */
    onProgress?: (progress: { loaded: number; total: number; percent: number }) => void,
) => {
    const formData = new FormData();
    formData.append('file', file);

    return uploadRequest.post<UploadResponseData>(
        `${window.realSceneDataEngineConfig.apiBaseUrl}/upload/`,
        formData,
        {
            // Axios 上传进度回调
            onUploadProgress: (event) => {
                if (event.total) {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    onProgress?.({
                        loaded: event.loaded,
                        total: event.total,
                        percent,
                    });
                }
            },
        },
    );
};