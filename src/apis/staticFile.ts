import { request } from ".";
import type { UploadResponseData } from "./staticFileTypes";

/**
 * @description 文件上传
 * @param file 文件对象
 * @returns 数据库的文件数据项
 */
export const upload = (file: File) => request.postForm<UploadResponseData>(`http://localhost:8000/upload/`, {
    file
})