import { request } from './index';

export const listUsers = () => request.get('/users');
export const updateUserTags = (userId: number, tagIds: number[]) =>
  request.put(`/users/${userId}/tags`, tagIds);
