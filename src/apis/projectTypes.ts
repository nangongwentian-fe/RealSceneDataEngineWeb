import type { Tag } from './tagTypes';

export interface AddProjectResponseData {
    id: number,
    name: string,
    processed_file_id: number,
    static_file_id: number,
    project_cover_image_static_id: number
}

export interface PaginationInfo {
    total: number,           // 总项目数
    page: number,            // 当前页码
    page_size: number,       // 每页数量
    total_pages: number,     // 总页数
    has_next: boolean,       // 是否有下一页
    has_prev: boolean        // 是否有上一页
}

export interface GetProjectResponseData {
    code: number,
    data: Project[],
    pagination: PaginationInfo,
    msg: string
}

export interface Project {
    id: number,
    name: string,
    processed_file: ProcessedFile,
    static_file: StaticFile,
    cover_image: StaticFile,
    algorithm: string,
    tags?: Tag[]
}

export interface ProcessedFile {
    id: number,
    file_id: number,
    folder_path: string,
    status: string,
    result_url: string | null,
    algorithm: string
}

export interface StaticFile {
    id: number,
    path: string,
    filename: string,
    original_filename: string
}

export interface GetProjectStatusResponseData {
    task_id: number,
    status: string,
    result_url: string | null
}