import { request } from './index';
import type { 
    CreateTagRequest, 
    UpdateTagRequest,
    GetTagsResponseData,
    CreateTagResponseData,
    UpdateTagResponseData,
    DeleteTagResponseData,
    AddTagToProjectResponseData,
    RemoveTagFromProjectResponseData
} from './tagTypes';

// Axios响应包装类型
interface AxiosResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
}

export const getTags = (): Promise<AxiosResponse<GetTagsResponseData>> => {
    return request.get('/tags');
}

export const createTag = (data: CreateTagRequest): Promise<AxiosResponse<CreateTagResponseData>> => {
    return request.post('/tags', data);
}

export const updateTag = (id: number, data: UpdateTagRequest): Promise<AxiosResponse<UpdateTagResponseData>> => {
    return request.put(`/tags/${id}`, data);
}

export const deleteTag = (id: number): Promise<AxiosResponse<DeleteTagResponseData>> => {
    return request.delete(`/tags/${id}`);
}

export const addTagToProject = (projectId: number, tagId: number): Promise<AxiosResponse<AddTagToProjectResponseData>> => {
    return request.post(`/projects/${projectId}/tags`, { tag_id: tagId });
}

export const removeTagFromProject = (projectId: number, tagId: number): Promise<AxiosResponse<RemoveTagFromProjectResponseData>> => {
    return request.delete(`/projects/${projectId}/tags/${tagId}`);
}

export const getProjectsByTag = (tagId: number, page: number = 1, pageSize: number = 20): Promise<any> => {
    // 使用正确的项目列表接口，该接口已经支持tag_id参数
    return request.get(`/projects/list?tag_id=${tagId}&page=${page}&page_size=${pageSize}`);
}