import { request } from ".";
import axios from 'axios';
import type { AddProjectResponseData, GetProjectResponseData, GetProjectStatusResponseData } from "./projectTypes";

// 创建专门用于项目导入的axios实例，超时时间更长
const projectImportRequest = axios.create({
    timeout: 600000, // 10分钟超时，项目导入通常涉及大文件
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

// 添加认证拦截器
projectImportRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 添加响应拦截器处理认证错误
projectImportRequest.interceptors.response.use(
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

export const addProject = (name: string, staticFileId: number, projectCoverImageStaticId: number, algorithm: string) => request.post<AddProjectResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/projects/add`, {
    name: name,
    static_file_id: staticFileId,
    project_cover_image_static_id: projectCoverImageStaticId,
    algorithm: algorithm
})

export const getProjectList = (page: number, pageSize: number) => request.get<GetProjectResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/projects/list?page=${page}&page_size=${pageSize}`)

export const getProjectStatus = (processedFileId: number) => request.get<GetProjectStatusResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/threeDGS/status/${processedFileId}`)

export const deleteProject = (projectId: number) => request.delete(`${window.realSceneDataEngineConfig.apiBaseUrl}/projects/${projectId}`)

export const threeDGSToObj = (projectId: number) => request.post(`${window.realSceneDataEngineConfig.apiBaseUrl}/threeDGS/toObj?project_id=${projectId}`, {}, { responseType: 'blob' })

export const segmentProject = (projectId: number, prompt_text: string) => 
    request.post(
        `${window.realSceneDataEngineConfig.apiBaseUrl}/threeDGS/segmentGS?project_id=${projectId}&prompt_text=${prompt_text}`
    );
    
export const importProject = (formData: FormData) => projectImportRequest.post(
    `${window.realSceneDataEngineConfig.apiBaseUrl}/projects/import`, 
    formData
);

export const threeDGSCancelTask = (taskId: number) => request.post(`${window.realSceneDataEngineConfig.apiBaseUrl}/threeDGS/cancel/${taskId}`);