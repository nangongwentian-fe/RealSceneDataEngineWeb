import type { StaticFile } from "./staticFileTypes";

export interface GetAssetListResponseData {
    code: number,
    data: DataAsset[],
    total?: number,  // 总数据量，用于分页
    msg: string
}

export interface DataAsset {
    id: number,
    name: string,
    static_file: StaticFile,
}

export interface AddDataAssetOptions {
    name: string,
    static_file_id: number
}

export interface DataAssetsImagePreview {
    id: number,
    original_filename: string,
    filename: string,
    path: string,
}
