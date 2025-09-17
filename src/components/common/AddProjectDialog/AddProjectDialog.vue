<script setup lang="ts">
import ImageUpload from '@/components/common/ImageUpload/ImageUpload.vue';
import { useAddProjectFormHook } from './useAddProjectFormHook';
import { useDialogHook } from './useDialogHook';
import { useAddProjectHook } from './useAddProjectHook';
import { ref, onMounted, onUnmounted } from 'vue';
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

// 移动端检测
const isMobile = ref(false);

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});

</script>

<template>
    <div class="add-project-dialog-container">
        <el-dialog
            v-model="visible"
            title="新建项目"
            :width="isMobile ? '95%' : '800px'"
            destroy-on-close
            :append-to-body="true"
            @open="handleDialogOpen"
            @close="handleDialogClose"
        >
            <el-form :model="form" 
                     :rules="formRules" 
                     ref="formRef" 
                     :label-width="isMobile ? '88px' : '120px'"
                     class="mobile-form">
                <el-form-item label="项目名称:" prop="projectName" required>
                    <el-input v-model="form.projectName" 
                              placeholder="请输入项目名称"
                              class="mobile-input"
                              :size="isMobile ? 'large' : 'default'"></el-input>
                </el-form-item>
                <el-form-item :label="isMobile ? '数据资源:' : '选择一个数据资源用于创建项目:'" 
                              prop="dataAsset" 
                              required>
                    <el-select
                        v-model="form.dataAsset"
                        placeholder="请创建数据源才能创建项目"
                        :disabled="dataAssetList.length === 0"
                        :size="isMobile ? 'large' : 'default'"
                        class="mobile-input w-full"
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
                    <el-select v-model="form.algorithm" 
                               placeholder="请选择算法"
                               :size="isMobile ? 'large' : 'default'"
                               class="mobile-input w-full">
                        <el-option v-for="item in algorithmOptions" 
                                   :key="item.value" 
                                   :label="item.label" 
                                   :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="项目封面:" prop="projectCoverFile">
                    <div class="content-container w-full">
                        <ImageUpload :w="isMobile ? '100%' : '318px'" 
                                     :h="isMobile ? '160px' : '200px'" 
                                     @image-upload-success="onProjectCoverUploadSuccess" 
                                     @clear-image="clearUploadedImage" 
                                     ref="imageUploadRef" />
                        <div class="data-assets-image-preview-list-container w-full mt-2" 
                             v-show="!form.projectCoverFile">
                            <div class="preview-grid" 
                                 :class="[
                                     'grid gap-2',
                                     isMobile ? 'grid-cols-2' : 'grid-cols-3'
                                 ]">
                                <img 
                                    v-for="item in curDataAssetImagePreviewList" 
                                    :key="item.filename"
                                    :src="getImageUrl(item.filename)" 
                                    alt="数据资源封面图" 
                                    :class="[
                                        'object-contain border-3 cursor-pointer block mobile-touchable rounded transition-all duration-200',
                                        isMobile ? 'h-80px w-full' : 'h-120px w-180px',
                                        selectedDataAssetImagePreview?.id === item.id ? 'selected-image' : 'unselected-image'
                                    ]"
                                    :style="{
                                        'border-color': selectedDataAssetImagePreview?.id === item.id ? '#409eff' : '#dcdfe6',
                                        'border-width': selectedDataAssetImagePreview?.id === item.id ? '4px' : '2px',
                                        'box-shadow': selectedDataAssetImagePreview?.id === item.id ? '0 0 16px rgba(64, 158, 255, 0.5), inset 0 0 20px rgba(64, 158, 255, 0.1)' : 'none'
                                    }"
                                    @click="onDataAssetImagePreviewClick(item)"
                                />
                            </div>
                        </div>
                    </div>
                </el-form-item>
            </el-form>
            <div class="btn-container" 
                 :class="['flex justify-center', isMobile ? 'mt-4' : 'mt-6']">
                <el-button type="primary" 
                           :class="[isMobile ? 'w-full' : 'w-160px']"
                           :size="isMobile ? 'large' : 'large'"
                           class="mobile-btn"
                           @click="handleAddProject" 
                           :loading="adding">新增</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.data-assets-image-preview-list-container {
    .preview-grid {
        @media (max-width: 768px) {
            gap: 8px;
        }
    }
}

// 封面选中状态样式
.selected-image {
    border-color: #409eff !important;
    border-width: 4px !important;
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.5), inset 0 0 20px rgba(64, 158, 255, 0.1) !important;
    transform: scale(1.05);
    position: relative;
    
    &::after {
        content: '✓';
        position: absolute;
        top: 4px;
        right: 4px;
        background: #409eff;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
}

.unselected-image {
    &:hover {
        border-color: #c0c4cc !important;
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

// 移动端表单优化
@media (max-width: 768px) {
    .mobile-form {
        .el-form-item__label {
            font-size: 14px;
            line-height: 1.4;
        }
        
        .el-select,
        .el-input {
            width: 100%;
        }
    }
    
    .content-container {
        .preview-grid img {
            border-radius: 6px;
            transition: all 0.2s ease;
            
            &:active {
                transform: scale(0.95);
            }
            
            &.selected-image {
                transform: scale(1.08);
                
                &::after {
                    width: 24px;
                    height: 24px;
                    font-size: 14px;
                    top: 6px;
                    right: 6px;
                }
            }
        }
    }
}
</style>
