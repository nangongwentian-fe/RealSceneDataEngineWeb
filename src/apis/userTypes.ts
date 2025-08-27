/**
 * 用户角色枚举
 */
export enum UserRole {
    ADMIN = 'admin'
}

/**
 * 用户信息接口
 */
export interface User {
    id: number;
    username: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponseData {
    code: number;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

/**
 * 用户信息响应数据
 */
export interface GetUserInfoResponseData {
    code: number;
    message: string;
    data: User;
}

/**
 * 通用API响应接口
 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

