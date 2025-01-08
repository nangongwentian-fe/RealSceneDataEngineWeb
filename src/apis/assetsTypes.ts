import type { StaticFile } from "./staticFileTypes";

export interface GetAssetListResponseData {
    code: number,
    data: DataAsset[],
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