export interface Tag {
    id: number;
    name: string;
    color: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectTag {
    id: number;
    project_id: number;
    tag_id: number;
    created_at: string;
}

export interface CreateTagRequest {
    name: string;
    color: string;
    description?: string;
}

export interface UpdateTagRequest {
    name?: string;
    color?: string;
    description?: string;
}

export interface GetTagsResponseData {
    code: number;
    data: Tag[];
    msg: string;
}

export interface CreateTagResponseData {
    code: number;
    data: Tag;
    msg: string;
}

export interface UpdateTagResponseData {
    code: number;
    data: Tag;
    msg: string;
}

export interface DeleteTagResponseData {
    code: number;
    msg: string;
}

export interface AddTagToProjectResponseData {
    code: number;
    msg: string;
}

export interface RemoveTagFromProjectResponseData {
    code: number;
    msg: string;
}