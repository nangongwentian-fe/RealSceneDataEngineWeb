<template>
    <el-dialog
        title="导入项目"
        :width="isMobile ? '95%' : '700px'"
        destroy-on-close
        :append-to-body="true"
    >
        <el-form :model="form" 
                 :label-width="isMobile ? '100px' : 'auto'"
                 class="mobile-form">
            <!-- 项目名称 -->
            <el-form-item label="项目名称" required>
                <el-input 
                    v-model="form.name" 
                    placeholder="请输入项目名称"
                    clearable
                    :size="isMobile ? 'large' : 'default'"
                    class="mobile-input"
                />
            </el-form-item>
            
            <!-- 项目封面图 -->
            <el-form-item label="项目封面图" required>
                <el-upload
                    :class="[isMobile ? 'w-full' : 'w-96%']"
                    drag
                    :on-change="handleCoverImageChange"
                    :before-upload="beforeCoverImageUpload"
                    :auto-upload="false"
                    :file-list="coverImageList"
                    :on-remove="handleCoverImageRemove"
                    accept=".jpg,.jpeg,.png"
                >
                    <el-icon class="el-icon--upload" :size="isMobile ? 32 : 48">
                        <picture-filled />
                    </el-icon>
                    <div class="el-upload__text" 
                         :class="[isMobile ? 'text-14px' : 'text-16px']">
                        <span class="hidden sm:inline">拖拽到这里, 或者 <em>点击上传</em></span>
                        <span class="sm:hidden"><em>点击上传</em></span>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip" 
                             :class="[isMobile ? 'text-12px' : 'text-14px']">
                            只支持上传JPG/PNG格式的图片，且大小不超过2MB
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
            
            <!-- 3DGS结果压缩包 -->
            <el-form-item required>
                <template #label>
                    <div class="label flex items-center">
                        <span :class="[isMobile ? 'mr-1' : 'mr-2']">
                            <span class="hidden sm:inline">3DGS结果压缩包</span>
                            <span class="sm:hidden">压缩包</span>
                        </span>
                        <el-popover
                            :width="isMobile ? 300 : 340"
                            :placement="isMobile ? 'top' : 'right'"
                            popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
                        >
                            <template #reference>
                                <el-icon :size="isMobile ? 14 : 16">
                                    <QuestionFilled />
                                </el-icon>
                            </template>
                            <div :class="[isMobile ? 'text-14px' : 'text-16px']">
                                上传的zip文件请遵循如下文件结构:
                            </div>
                            <br/>
                            <div class="code-container bg-gray-100 p-2 rounded">
                                <code class="code-block" 
                                      :class="[isMobile ? 'text-12px' : 'text-14px']">
                                    {{ projectStructStr }}
                                </code>
                            </div>
                        </el-popover>
                    </div>
                </template>
                <el-upload
                    :class="[isMobile ? 'w-full' : 'w-96%']"
                    drag
                    accept=".zip"
                    :on-change="handleFileChange"
                    :before-upload="beforeUpload"
                    :auto-upload="false"
                    :file-list="fileList"
                    :on-remove="handleRemove"
                >
                    <el-icon class="el-icon--upload" :size="isMobile ? 32 : 48">
                        <upload-filled />
                    </el-icon>
                    <div class="el-upload__text" 
                         :class="[isMobile ? 'text-14px' : 'text-16px']">
                        <span class="hidden sm:inline">拖拽到这里, 或者 <em>点击上传</em></span>
                        <span class="sm:hidden"><em>点击上传</em></span>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip" 
                             :class="[isMobile ? 'text-12px' : 'text-14px']">
                            <span class="hidden sm:inline">只支持上传zip格式的文件，且只能上传一个文件</span>
                            <span class="sm:hidden">仅支持zip文件</span>
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
        </el-form>
        <div class="btn-container" 
             :class="['flex justify-center', isMobile ? 'mt-4' : 'mt-6']">
            <el-button 
                type="primary" 
                :class="[isMobile ? 'w-full' : 'w-auto']"
                :size="isMobile ? 'large' : 'default'"
                class="mobile-btn"
                :loading="uploadLoading || coverImageLoading || submitting"
                :disabled="!form.name || !form.zip || !form.coverImage || !isValidStructure || submitting"
                @click="handleUpload"
            >
                上传项目
            </el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useForm } from './useForm';
import { useUpload } from './useUpload';
import { useCoverImage } from './useCoverImage';
import { useSubmit } from './useSubmit';

/** zip文件的文件夹结构 */
const projectStructStr = `- output_dir
    - cameras.json (necessary)
    - point_cloud
        - iteration_30000 (necessary)
            - point_cloud.ply (necessary)
        - iteration_xxxx
            - point_cloud.ply
`

// 定义emit事件
const emit = defineEmits(['success', 'close']);

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

/** Form表单相关逻辑 */
const { form } = useForm();
/** 文件上传相关逻辑 */
const { fileList, uploadLoading, isValidStructure, handleFileChange, beforeUpload, handleRemove } = useUpload({ form });
/** 封面图相关逻辑 */
const { coverImageList, coverImageLoading, beforeCoverImageUpload, handleCoverImageChange, handleCoverImageRemove } = useCoverImage({ form });
/** 提交相关逻辑 */
const { submitting, handleUpload } = useSubmit({ 
    form, 
    isValidStructure, 
    fileList, 
    coverImageList, 
    emit 
});
</script>

<style lang="scss" scoped>
.code-block {
    font-family: monospace;
    white-space: pre-wrap; /* 改为 pre-wrap 而不是 pre */
    text-align: left;
    font-size: 14px;
    color: #333;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto; /* 添加水平滚动条，以防内容仍然溢出 */
    max-width: 100%; /* 确保不超过父容器宽度 */
    word-break: break-word; /* 允许在单词内换行 */
}
</style>