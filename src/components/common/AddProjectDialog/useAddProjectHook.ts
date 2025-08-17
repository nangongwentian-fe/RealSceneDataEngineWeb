import { addProject } from "@/apis/project";
import { ref, type Ref } from "vue";
import type { AddProjectForm } from "./useAddProjectFormHook";
import { ElMessage, type FormInstance } from "element-plus";
import type { DataAsset, DataAssetsImagePreview } from "@/apis/assetsTypes";
import { upload } from "@/apis/staticFile";

export const useAddProjectHook = (params: AddProjectHookParams) => {
    /** 是否正在新增项目 */
    const adding = ref(false);

    /** 项目封面上传成功 */
    const onProjectCoverUploadSuccess = (imageFile: File) => {
        params.form.projectCoverFile = imageFile;
        // 清除数据资源选择框的选中数据
        params.clearDataAssetsSelected();
    }

    /** 新增项目 */
    const handleAddProject = () => {
        if(!params.formInstance.value) {
            ElMessage.error('formInstance 实例不存在')
            return;
        }

        // 表单验证
        params.formInstance.value.validate((valid) => {
            if(valid && params.form.dataAsset) { // 表单验证通过
                adding.value = true;
                if(params.form.projectCoverFile) { // 用户上传的图片
                    // 上传图片
                    upload(params.form.projectCoverFile).then((uploadRes) => {
                        // 判断此时用户选择的dataAsset是否值合法
                        if(params.form.dataAsset) {
                            // 获取选择的id对应的数据资源
                            const dataAsset = params.dataAssetMap.get(params.form.dataAsset);
                            if(dataAsset) { // 如果数据资源存在
                                addProject(params.form.projectName, dataAsset.static_file.id, uploadRes.data.id, params.form.algorithm).then((addProjectRes) => {
                                    console.log('新增项目成功', addProjectRes);
                                    ElMessage.success('新增项目成功');
                                    adding.value = false;
                                    params.dialogVisible.value = false;
                                    params.form.projectName = "";
                                    params.form.dataAsset = params.dataAssetList.value[0].id;
                                    params.emits('addProjectSuccess')
                                }).catch(() => {
                                    ElMessage.error('新增项目失败，请重新尝试')
                                })
                            } else {
                                ElMessage.error('选择的数据资源不存在')
                            }
                        }
                    })
                } else if(params.selectedDataAssetImagePreview.value) { // 用户选择的数据资源封面图
                    const dataAsset = params.dataAssetMap.get(params.form.dataAsset);
                    if(dataAsset) {
                        addProject(params.form.projectName, dataAsset.static_file.id, params.selectedDataAssetImagePreview.value.id, params.form.algorithm).then((addProjectRes) => {
                            console.log('新增项目成功', addProjectRes);
                            ElMessage.success('新增项目成功');
                            adding.value = false;
                            params.dialogVisible.value = false;
                            params.form.projectName = "";
                            params.form.dataAsset = params.dataAssetList.value[0].id;
                            params.emits('addProjectSuccess')
                        }).catch(() => {
                            ElMessage.error('新增项目失败，请重新尝试')
                        })
                    } else {
                        ElMessage.error('选择的数据资源不存在')
                    }
                }
            }
        })
    }

    // 新增关闭对话框时重置项目封面文件
    params.addDialogCloseTask(() => {
        params.form.projectCoverFile = null;
    })

    return {
        adding,
        handleAddProject,
        onProjectCoverUploadSuccess,
    }
}

export interface AddProjectHookParams {
    form: AddProjectForm,
    formInstance: Ref<FormInstance | undefined>,
    addDialogCloseTask: (task: () => void) => void,
    dialogVisible: Ref<boolean>,
    dataAssetList: Ref<DataAsset[]>,
    emits: (evt: "addProjectSuccess", args_0: void) => void,
    clearDataAssetsSelected: () => void,
    selectedDataAssetImagePreview: Ref<DataAssetsImagePreview | undefined>,
    dataAssetMap: Map<number, DataAsset>
}
