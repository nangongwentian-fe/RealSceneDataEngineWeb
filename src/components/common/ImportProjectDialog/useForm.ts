import type { UploadFile } from "element-plus";
import { reactive } from "vue"

export interface Form {
    zip: UploadFile | null;
    rootDir: string;
    name: string; // 项目名称
    coverImage: UploadFile | null; // 项目封面图
}

export const useForm = () => {
    const form = reactive<Form>({
        zip: null,
        rootDir: '',
        name: '', // 初始化项目名称为空字符串
        coverImage: null // 初始化封面图为null
    })
    return {
        form
    }
}