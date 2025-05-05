import { ref } from "vue";

/** 上传项目相关hook */
export const useUploadProject = () => {
    /** 上传项目弹窗可视性 */
    const uploadProjectDialogVisible = ref(false);

    /** 处理上传项目的click */
    const handleUploadProjectBtnClick = () => {
        uploadProjectDialogVisible.value = true;
    }
    return {
        uploadProjectDialogVisible,
        handleUploadProjectBtnClick
    }
}