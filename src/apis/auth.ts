import { request } from ".";
import type { LoginRequest, LoginResponseData, GetUserInfoResponseData } from "./userTypes";

/**
 * 用户登录
 */
export const login = (loginData: LoginRequest) => 
    request.post<LoginResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/auth/login`, loginData);

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => 
    request.get<GetUserInfoResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/auth/user-info`);

/**
 * 用户退出登录
 */
export const logout = () => 
    request.post(`${window.realSceneDataEngineConfig.apiBaseUrl}/auth/logout`);

/**
 * 刷新token
 */
export const refreshToken = () => 
    request.post<LoginResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/auth/refresh-token`);

