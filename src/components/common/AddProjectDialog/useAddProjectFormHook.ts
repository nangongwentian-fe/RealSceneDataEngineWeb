import { getAssetListAll, getDataAssetsVideoImagePreviewList } from "@/apis/assets"
import type { DataAsset, DataAssetsImagePreview } from "@/apis/assetsTypes"
import type { FormRules } from "element-plus"
import { reactive, ref, type Ref } from "vue"
import type ImageUpload from '@/components/common/ImageUpload/ImageUpload.vue';

export const useAddProjectFormHook = (params: AddProjectFormParams) => {
    /** 新增项目的表单数据 */
    const form = reactive<AddProjectForm>({
        projectName: '',
        dataAsset: undefined,
        projectCoverFile: null
    })

    const validdateProjectCover = (_rule: any, _value: string, callback: any) => {
        // 只有form.projectCoverFile(用户上传的图片)或者selectedDataAssetImagePreview.value(让用户选择的资源视频列表)不为空，才能通过表单
        if (form.projectCoverFile || selectedDataAssetImagePreview.value) {
            callback()
        } else { // 如果他们两个都是空就不能通过表单
            callback(new Error('项目封面未选择'))
        }
        
    }

    /** 新增项目的表单验证规则 */
    const formRules = reactive<FormRules<typeof form>>({
        projectName: [{ required: true, message: '项目名称不能为空' }],
        dataAsset: [{ required: true, message: '数据资源不能为空' }],
        projectCoverFile: [{ validator: validdateProjectCover, trigger: 'blur' }]
    })

    /** 数据资源列表 */
    const dataAssetList = ref<DataAsset[]>([]);
    /** 数据资源map,用于通过id快速找到对应的数据资源，减少运行时间 */
    const dataAssetMap = new Map<number, DataAsset>();
    /**
     * @description 更新数据资源列表
     */
    const updateAssetList = async () => {
        const getAssetListResponse = await getAssetListAll();
        // 更新数据资源列表
        dataAssetList.value = getAssetListResponse.data.data;
        // 清空数据资源map
        dataAssetMap.clear();
        // 更新数据资源map，方便后续通过选择的id找到对应的dataAsset
        dataAssetList.value.forEach(item => {
            dataAssetMap.set(item.id, item);
        })
        if(dataAssetList.value.length > 0) {
            form.dataAsset = dataAssetList.value[0].id;
            // 设置form的值的时候不会触发change事件，所以这里手动调用一下
            onDataAssetSelectChange(form.dataAsset);
        }
    };

    /** 当前选择的数据资源的封面图列表 */
    const curDataAssetImagePreviewList = ref<DataAssetsImagePreview[]>([]);
    /** 当前选择的数据资源的封面图 */
    const selectedDataAssetImagePreview = ref<DataAssetsImagePreview>();
    /** 数据资源选择框变化时，获取当前选择的数据资源的封面图列表 */
    const onDataAssetSelectChange = (dataAsset: number) => {
        getDataAssetsVideoImagePreviewList(dataAsset).then(dataAssetsImagePreviewRes => {
            const imagePreviewList = dataAssetsImagePreviewRes.data;
            curDataAssetImagePreviewList.value = imagePreviewList;
            selectedDataAssetImagePreview.value = undefined;
        })
    }
    /** 清除数据资源选择框的选中数据 */
    const clearDataAssetsSelected = () => {
        selectedDataAssetImagePreview.value = undefined;
    }

    /** 清除用户上传的图片 */
    const clearUploadedImage = () => {
        // 清除表单的图片文件数据
        form.projectCoverFile = null;
        // 清除图片上传组件的图片
        params.imageUploadRef.value?.clearImage();
    }
    /** 数据资源封面图点击事件 */
    const onDataAssetImagePreviewClick = (dataAssetImagePreview: DataAssetsImagePreview) => {
        if(dataAssetImagePreview === selectedDataAssetImagePreview.value) {
            selectedDataAssetImagePreview.value = undefined;
        } else {
            selectedDataAssetImagePreview.value = dataAssetImagePreview;
            // 清除图片上传组件的图片
            clearUploadedImage();
        }
    }

    /** 拼接filename获取图片url */
    const getImageUrl = (filename: string) => {
        return `${window.realSceneDataEngineConfig.apiBaseUrl}/files/${filename}`
    }

    return {
        form,
        formRules,
        dataAssetList,
        updateAssetList,
        onDataAssetSelectChange,
        curDataAssetImagePreviewList,
        getImageUrl,
        onDataAssetImagePreviewClick,
        selectedDataAssetImagePreview,
        clearDataAssetsSelected,
        clearUploadedImage,
        dataAssetMap
    }
}

export interface AddProjectForm {
    projectName: string,
    dataAsset: number | undefined,
    projectCoverFile: File | null
}

export interface AddProjectFormParams {
    imageUploadRef: Ref<InstanceType<typeof ImageUpload> | undefined>
}