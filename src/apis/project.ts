import { request } from ".";
import type { AddProjectResponseData, GetProjectResponseData, GetProjectStatusResponseData } from "./projectTypes";

export const addProject = (name: string, staticFileId: number, projectCoverImageStaticId: number) => request.post<AddProjectResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/projects/add`, {
    name: name,
    static_file_id: staticFileId,
    project_cover_image_static_id: projectCoverImageStaticId
})

export const getProjectList = (page: number, pageSize: number) => request.get<GetProjectResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/projects/list?page=${page}&page_size=${pageSize}`)

export const getProjectStatus = (processedFileId: number) => request.get<GetProjectStatusResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/threeDGS/status/${processedFileId}`)

export const deleteProject = (projectId: number) => request.delete(`${window.realSceneDataEngineConfig.apiBaseUrl}/projects/${projectId}`)

export const threeDGSToObj = (projectId: number) => request.post(`${window.realSceneDataEngineConfig.apiBaseUrl}/threeDGS/toObj?project_id=${projectId}`, {}, { responseType: 'blob' })