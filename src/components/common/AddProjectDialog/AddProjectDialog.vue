<script setup lang="ts">
import ImageUpload from '@/components/common/ImageUpload/ImageUpload.vue';
import { useAddProjectFormHook } from './useAddProjectFormHook';
import { useDialogHook } from './useDialogHook';
import { useAddProjectHook } from './useAddProjectHook';
import { ref } from 'vue';
import type { FormInstance } from 'element-plus';

/** 当前dialog的是否打开了 */
const visible = defineModel({ type: Boolean, required: true});

const emits = defineEmits<{
    'addProjectSuccess': []
}>()

/** 图片上传组件的ref */
const imageUploadRef = ref<InstanceType<typeof ImageUpload>>();

/** 新增项目表单  */
const formRef = ref<FormInstance>();
/** 新增项目相关的表单hook  */
const { 
    form, 
    formRules,
    dataAssetList, 
    updateAssetList, 
    onDataAssetSelectChange, 
    curDataAssetImagePreviewList, 
    getImageUrl, 
    onDataAssetImagePreviewClick,
    clearDataAssetsSelected,
    clearUploadedImage,
    selectedDataAssetImagePreview,
    dataAssetMap,
    algorithmOptions
} = useAddProjectFormHook({
    imageUploadRef
});

/** 对话框hook  */
const { handleDialogOpen, handleDialogClose, addDialogCloseTask } = useDialogHook({ updateAssetList });

/** 新增项目hook  */
const { adding, handleAddProject, onProjectCoverUploadSuccess } = useAddProjectHook({
    form,
    formInstance: formRef,
    addDialogCloseTask,
    dialogVisible: visible,
    dataAssetList,
    emits,
    clearDataAssetsSelected,
    selectedDataAssetImagePreview,
    dataAssetMap
});

</script>

<template>
    <div class="add-project-dialog-container">
        <el-dialog
            v-model="visible"
            title="新建项目"
            destroy-on-close
            @open="handleDialogOpen"
            @close="handleDialogClose"
        >
            <el-form :model="form" :rules="formRules" ref="formRef" label-width="auto">
                <el-form-item label="项目名称:" prop="projectName" required>
                    <el-input v-model="form.projectName" placeholder="请输入项目名称"></el-input>
                </el-form-item>
                <el-form-item label="选择一个数据资源用于创建项目:" prop="dataAsset" required>
                    <el-select
                        v-model="form.dataAsset"
                        placeholder="请创建数据源才能创建项目"
                        :disabled="dataAssetList.length === 0"
                        @change="onDataAssetSelectChange"
                    >
                        <el-option
                            v-for="item in dataAssetList"
                            :key="item.id"
                            :label="`${item.name}(${item.static_file.original_filename})`"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="选择算法:" prop="algorithm" required>
                    <el-select v-model="form.algorithm" placeholder="请选择算法">
                        <el-option v-for="item in algorithmOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="项目封面:" prop="projectCoverFile">
                    <div class="content-container" w="100%">
                        <ImageUpload w="318px" h="200px" @image-upload-success="onProjectCoverUploadSuccess" @clear-image="clearUploadedImage" ref="imageUploadRef" />
                        <div class="data-assets-image-preivew-list-container" w="100%" mt="10px" v-show="!form.projectCoverFile">
                            <img 
                                :src="getImageUrl(item.filename)" 
                                alt="数据资源封面图" 
                                h="120px" 
                                w="180px" 
                                object="contain" 
                                border="3px solid #ccc" 
                                cursor="pointer" 
                                block 
                                v-for="item in curDataAssetImagePreviewList" 
                                :key="item.filename" 
                                m-r="6px" 
                                m-b="6px" 
                                @click="onDataAssetImagePreviewClick(item)"
                                :style="{
                                    'border-color': selectedDataAssetImagePreview?.id === item.id ? '#ff0000' : '#ccc'
                                }"
                            />
                        </div>
                    </div>
                </el-form-item>
            </el-form>
            <div class="btn-container" flex justify-center>
                <el-button type="primary" w="160px" size="large" @click="handleAddProject" :loading="adding">新增</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.data-assets-image-preivew-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
</style>
