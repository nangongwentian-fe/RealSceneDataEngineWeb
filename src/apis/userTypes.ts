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
    name?: string;
    email?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
    /** 允许访问的标签列表；管理员可为 '*' */
    allowedTags: string[] | '*';
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
    access_token: string;
    token_type: 'bearer';
    role: 'admin' | 'user';
    allowedTags: number[];
}

/**
 * 用户信息响应数据
 */
export type GetUserInfoResponseData = User;

/**
 * 通用API响应接口
 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

