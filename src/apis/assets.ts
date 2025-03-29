import { request } from ".";
import type { AddDataAssetOptions, DataAssetsImagePreview, GetAssetListResponseData } from "./assetsTypes";

/**
 * @description 获取数据资源列表
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 数据资源列表
 */
export const getAssetListAll = () => request.get<GetAssetListResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/data_resources/listAll`);

/**
 * @description 获取数据资源列表
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 数据资源列表
 */
export const getAssetList = (page: number, pageSize: number) => request.get<GetAssetListResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/data_resources/list?page=${page}&page_size=${pageSize}`);

/**
 * @description 根据id删除数据资源
 * @param id 数据资源id
 * @returns 是否删除成功
 */
export const deleteAssetById = (id: number) => request.delete(`${window.realSceneDataEngineConfig.apiBaseUrl}/data_resources/${id}`);

/**
 * @description 添加数据资源项
 * @param options 参数
 * @returns 
 */
export const addDataAsset = (options: AddDataAssetOptions) => request.post(`${window.realSceneDataEngineConfig.apiBaseUrl}/data_resources/add`, {
    ...options
})

/**
 * @description 获取数据资源封面图列表
 * @param dataAssetsId 数据资源id
 * @returns 封面图列表
 */
export const getDataAssetsVideoImagePreviewList = (dataAssetsId: number) => request.get<DataAssetsImagePreview[]>(`${window.realSceneDataEngineConfig.apiBaseUrl}/data_resources/${dataAssetsId}/preview-images`)