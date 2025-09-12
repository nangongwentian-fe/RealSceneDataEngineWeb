import { request } from ".";
import type { LoginRequest, LoginResponseData, GetUserInfoResponseData } from "./userTypes";

/**
 * 将对象转为 x-www-form-urlencoded
 */
const toUrlEncoded = (data: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([k,v])=>{
        if(v!==undefined&&v!==null) params.append(k,String(v));
    });
    return params;
};

/**
 * 用户登录
 */
export const login = (loginData: LoginRequest) =>
    request.post<LoginResponseData>(
        `${window.realSceneDataEngineConfig.apiBaseUrl}/login`,
        toUrlEncoded(loginData),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => 
    request.get<GetUserInfoResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/user-info`);

/**
 * 用户退出登录
 */
export const logout = () => 
    request.post(`${window.realSceneDataEngineConfig.apiBaseUrl}/logout`);

export const sendCode = (email: string) =>
  request.post(`${window.realSceneDataEngineConfig.apiBaseUrl}/register/send-code`, { email });

export const registerApi = (data: { name?: string; email: string; password: string; code: string; }) =>
  request.post<LoginResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/register`, data);

/**
 * 刷新token
 */
export const refreshToken = () =>
    request.post<LoginResponseData>(`${window.realSceneDataEngineConfig.apiBaseUrl}/auth/refresh-token`);