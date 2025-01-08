export interface StaticFile {
    id: number,
    filename: string,
    original_filename: string,
    path: string
}

export interface UploadResponseData {
    filename: string,
    id: number,
    path: string,
}