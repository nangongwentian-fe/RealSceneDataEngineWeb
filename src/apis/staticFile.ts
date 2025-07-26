import { request } from ".";
import type { UploadResponseData } from "./staticFileTypes";

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

    return request.post<UploadResponseData>(
        `${window.realSceneDataEngineConfig.apiBaseUrl}/upload/`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
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