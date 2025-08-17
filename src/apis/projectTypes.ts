export interface AddProjectResponseData {
    id: number,
    name: string,
    processed_file_id: number,
    static_file_id: number,
    project_cover_image_static_id: number
}

export interface GetProjectResponseData {
    code: number,
    data: Project[],
    msg: string
}

export interface Project {
    id: number,
    name: string,
    processed_file: ProcessedFile,
    static_file: StaticFile,
    cover_image: StaticFile,
    algorithm: string
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