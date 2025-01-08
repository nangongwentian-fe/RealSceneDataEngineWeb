import { request } from ".";
import type { AddDataAssetOptions, GetAssetListResponseData } from "./assetsTypes";

/**
 * @description 获取数据资源列表
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 数据资源列表
 */
export const getAssetListAll = () => request.get<GetAssetListResponseData>(`${import.meta.env.VITE_API_BASE_URL}/data_resources/listAll`);

/**
 * @description 获取数据资源列表
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 数据资源列表
 */
export const getAssetList = (page: number, pageSize: number) => request.get<GetAssetListResponseData>(`${import.meta.env.VITE_API_BASE_URL}/data_resources/list?page=${page}&page_size=${pageSize}`);

/**
 * @description 根据id删除数据资源
 * @param id 数据资源id
 * @returns 是否删除成功
 */
export const deleteAssetById = (id: number) => request.delete(`${import.meta.env.VITE_API_BASE_URL}/data_resources/${id}`);

/**
 * @description 添加数据资源项
 * @param options 参数
 * @returns 
 */
export const addDataAsset = (options: AddDataAssetOptions) => request.post(`${import.meta.env.VITE_API_BASE_URL}/data_resources/add`, {
    ...options
})

