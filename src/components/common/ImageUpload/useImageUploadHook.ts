import { ref, type Ref } from "vue";

export const useImageUploadHook = (params: ImageUploadHookParams) => {
    /**用于预览上传的图片的url对象 */
    const imgUrl = ref('');

    /**用于处理文件上传 */
    const handleFileChange = (e: Event) => {
        // 获取上传的文件
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            if(imgUrl.value) { // 上一个图片不需要了，所以释放资源
                URL.revokeObjectURL(imgUrl.value);
            }
            // 创建图片url
            imgUrl.value = URL.createObjectURL(file);
            // 触发上传成功事件
            params.emits('imageUploadSuccess', file);
        }
    }

    /** 清除图片 */
    const clearImage = () => {
        imgUrl.value = '';
    }

    /** 关闭按钮点击事件 */
    const handleCloseBtnClick = () => {
        // 清除input的value
        if(params.fileInputRef.value) 
            params.fileInputRef.value.value = '';
        params.emits('clearImage');
    }

    return {
        imgUrl,
        handleFileChange,
        clearImage,
        handleCloseBtnClick
    }
}

export interface ImageUploadHookParams {
    emits: ((evt: "imageUploadSuccess", args_0: File) => void) & ((evt: "clearImage") => void),
    fileInputRef: Ref<HTMLInputElement | undefined>
}