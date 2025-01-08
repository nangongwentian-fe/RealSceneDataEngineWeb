import { request } from ".";
import type { AddProjectResponseData, GetProjectResponseData, GetProjectStatusResponseData } from "./projectTypes";

export const addProject = (name: string, staticFileId: number) => request.post<AddProjectResponseData>(`${import.meta.env.VITE_API_BASE_URL}/projects/add`, {
    name: name,
    static_file_id: staticFileId
})

export const getProjectList = (page: number, pageSize: number) => request.get<GetProjectResponseData>(`${import.meta.env.VITE_API_BASE_URL}/projects/list?page=${page}&page_size=${pageSize}`)

export const getProjectStatus = (processedFileId: number) => request.get<GetProjectStatusResponseData>(`${import.meta.env.VITE_API_BASE_URL}/threeDGS/status/${processedFileId}`)

export const deleteProject = (projectId: number) => request.delete(`${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}`)