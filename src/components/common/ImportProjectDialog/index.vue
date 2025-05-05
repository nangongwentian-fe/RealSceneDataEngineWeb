<template>
    <el-dialog
        title="导入项目"
        destroy-on-close
    >
        <el-form :model="form" label-width="auto">
            <!-- 项目名称 -->
            <el-form-item label="项目名称" required>
                <el-input 
                    v-model="form.name" 
                    placeholder="请输入项目名称"
                    clearable
                />
            </el-form-item>
            
            <!-- 项目封面图 -->
            <el-form-item label="项目封面图" required>
                <el-upload
                    w="96%"
                    drag
                    :on-change="handleCoverImageChange"
                    :before-upload="beforeCoverImageUpload"
                    :auto-upload="false"
                    :file-list="coverImageList"
                    :on-remove="handleCoverImageRemove"
                    accept=".jpg,.jpeg,.png"
                >
                    <el-icon class="el-icon--upload"><picture-filled /></el-icon>
                    <div class="el-upload__text">
                        拖拽到这里, 或者 <em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            只支持上传JPG/PNG格式的图片，且大小不超过2MB
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
            
            <!-- 3DGS结果压缩包 -->
            <el-form-item required>
                <template #label>
                    <div class="label" flex items-center>
                        <span mr-2>3DGS结果压缩包</span>
                        <el-popover
                            :width="340"
                            placement="right"
                            popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
                        >
                            <template #reference>
                                <el-icon><QuestionFilled /></el-icon>
                            </template>
                            <div>上传的zip文件请遵循如下文件结构:</div>
                            <br/>
                            <div class="code-container" bg="#f5f5f5">
                                <code class="code-block">
                                    {{ projectStructStr }}
                                </code>
                            </div>
                        </el-popover>
                    </div>
                </template>
                <el-upload
                    w="96%"
                    drag
                    accept=".zip"
                    :on-change="handleFileChange"
                    :before-upload="beforeUpload"
                    :auto-upload="false"
                    :file-list="fileList"
                    :on-remove="handleRemove"
                >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        拖拽到这里, 或者 <em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            只支持上传zip格式的文件，且只能上传一个文件
                        </div>
                    </template>
                </el-upload>
            </el-form-item>
        </el-form>
        <div class="btn-container" flex justify-center>
            <el-button 
                type="primary" 
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