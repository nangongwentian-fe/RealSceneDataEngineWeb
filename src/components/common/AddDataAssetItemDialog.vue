<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { Delete, VideoCamera } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { upload } from '@/apis/staticFile';
import { addDataAsset } from '@/apis/assets';

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

const visible = defineModel({ type: Boolean, required: true});
const emits = defineEmits<{
    'addSuccess': []
}>();
const form = reactive<{
    name: string,
    video: File | null
}>({
    name: '',
    video: null
})
// 上传进度 0-100
const uploadProgress = ref(0);
const uploadLoaded = ref(0);
const uploadTotal = ref(0);

// 文件大小格式化
const humanFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
};
// 处理文件上传
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        form.video = target.files[0];
    }
}
const handleDeleteDataAssetBtnClick = () => {
    form.video = null;
}
const adding = ref(false);
const handleAddDataAsset = () => {
    if(!form.name || form.video == null) {
        ElMessage.error('数据不能为空')
        return;
    }
    adding.value = true;
    // 开始上传文件并监听进度
    upload(form.video!, ({ loaded, total, percent }) => {
        uploadProgress.value = percent;
        uploadLoaded.value = loaded;
        uploadTotal.value = total;
    }).then((uploadRes) => {
        console.log('视频上传结果:', uploadRes);
        const videoFileId = uploadRes.data.id;
        addDataAsset({
            name: form.name,
            static_file_id: videoFileId
        }).then((addDataAssetRes) => {
            console.log('数据资源添加结果:', addDataAssetRes);
            ElMessage.success('数据资源添加成功');
            adding.value = false;
            form.name = '';
            form.video = null;
            visible.value = false;
            emits('addSuccess');
        }).catch(() => {
            ElMessage.error('数据资源添加失败，请重新尝试')
        })
    }).catch(() => {
        ElMessage.error('视频文件上传失败，请重新尝试')
    })
    .finally(() => {
        // 上传完成或失败后重置进度
        uploadProgress.value = 0;
        uploadLoaded.value = 0;
        uploadTotal.value = 0;
    })
}
</script>

<template>
    <div class="add-data-assets-item-dialog-container">
        <el-dialog
            v-model="visible"
            title="新增数据资源"
            :width="isMobile ? '95%' : '600px'"
            :top="isMobile ? '5vh' : '15vh'"
            destroy-on-close
            :append-to-body="true"
        >
            <el-form :model="form" 
                     :label-width="isMobile ? '100px' : 'auto'"
                     :label-position="isMobile ? 'top' : 'right'"
                     class="mobile-form">
                <el-form-item label="数据资源名称:" required>
                    <el-input v-model="form.name"
                              placeholder="请输入数据资源名称"
                              :size="isMobile ? 'large' : 'default'"
                              class="mobile-input"></el-input>
                </el-form-item>
                <el-form-item :label="isMobile ? '上传视频:' : '上传视频文件:'" required>
                    <div class="upload-video-file-container" 
                         :class="[
                             'w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative cursor-pointer hover:border-blue-400 transition-colors',
                             isMobile ? 'h-150px' : 'h-200px'
                         ]" 
                         v-show="!form.video">
                        <div class="upload-tip-container flex flex-col items-center text-center">
                            <el-icon :size="isMobile ? 24 : 28" class="text-gray-400 mb-2">
                                <VideoCamera />
                            </el-icon>
                            <span :class="[
                                'text-gray-600',
                                isMobile ? 'text-14px' : 'text-16px'
                            ]">
                                {{ isMobile ? '点击上传视频' : '上传视频文件' }}
                            </span>
                            <span v-if="!isMobile" class="text-12px text-gray-400 mt-1">
                                支持 MP4 格式
                            </span>
                        </div>
                        <input type="file" 
                               class="absolute inset-0 opacity-0 cursor-pointer" 
                               accept="video/mp4" 
                               @change="handleFileUpload" />
                    </div>
                    <el-card class="data-asset-list-item mobile-card" 
                             shadow="hover" 
                             :class="['w-full', isMobile ? 'mobile-file-card' : '']"  
                             v-show="form.video">
                        <div class="card-content-container" 
                             :class="[
                                 'flex justify-between',
                                 isMobile ? 'flex-col gap-3' : 'items-center'
                             ]">
                            <div class="left-container" :class="[isMobile ? 'flex-1' : '']">
                                <div class="title">
                                    <span class="asset-name" 
                                          :class="[
                                              'text-gray-800',
                                              isMobile ? 'text-14px' : 'text-16px'
                                          ]">
                                        {{ form.video?.name }}
                                    </span>
                                </div>
                            </div>
                            <div class="right-container" :class="[isMobile ? 'flex justify-end' : '']">
                                <el-tooltip
                                    class="box-item"
                                    effect="dark"
                                    content="删除当前数据资源"
                                    :placement="isMobile ? 'top' : 'bottom'"
                                >
                                    <el-button :icon="Delete" 
                                               :size="isMobile ? 'default' : 'default'"
                                               class="mobile-btn"
                                               @click="handleDeleteDataAssetBtnClick">
                                        <span v-if="isMobile" class="ml-1">删除</span>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </div>
                    </el-card>
                </el-form-item>
                <!-- 上传进度条 -->
                <el-form-item v-if="adding" 
                              :label="isMobile ? '进度:' : '上传进度:'" 
                              class="upload-progress-item">
                    <div class="progress-container" 
                         :class="[isMobile ? 'flex-col gap-2' : 'flex-row']">
                        <el-progress :percentage="uploadProgress" 
                                     :class="[isMobile ? 'w-full' : 'flex-1']" />
                        <span class="progress-size" 
                              :class="[
                                  isMobile ? 'text-12px text-center' : 'text-12px ml-3'
                              ]">
                            {{ humanFileSize(uploadLoaded) }} / {{ humanFileSize(uploadTotal) }}
                        </span>
                    </div>
                </el-form-item>
            </el-form> 
            <div class="btn-container" 
                 :class="[
                     'flex justify-center',
                     isMobile ? 'mt-4' : 'mt-6'
                 ]">
                <el-button type="primary" 
                           :size="isMobile ? 'large' : 'large'"
                           :class="[
                               'mobile-btn',
                               isMobile ? 'w-full' : 'w-160px'
                           ]"
                           @click="handleAddDataAsset" 
                           :loading="adding">
                    {{ adding ? '上传中...' : '新增' }}
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.mobile-form {
    // 移动端表单优化
    @media (max-width: 768px) {
        :deep(.el-form-item__label) {
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        :deep(.el-form-item) {
            margin-bottom: 20px;
        }
    }
}

.upload-video-file-container {
    transition: border-color 0.3s ease;
    
    &:hover {
        border-color: #409eff !important;
    }
}

.mobile-file-card {
    @media (max-width: 768px) {
        :deep(.el-card__body) {
            padding: 16px;
        }
    }
}

.upload-progress-item {
    :deep(.el-form-item__content) {
        display: flex;
        align-items: center;
    }
    
    // 移动端进度条样式
    @media (max-width: 768px) {
        :deep(.el-form-item__content) {
            flex-direction: column;
            align-items: stretch;
        }
    }
}

.progress-container {
    display: flex;
    align-items: center;
    width: 100%;
    
    // 移动端进度条容器
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }
}

.progress-size {
    margin-left: 12px;
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    
    // 移动端进度文字
    @media (max-width: 768px) {
        margin-left: 0;
        text-align: center;
    }
}

.btn-container {
    margin-top: 24px;
    
    // 移动端按钮容器
    @media (max-width: 768px) {
        margin-top: 20px;
        padding: 0 16px;
    }
}
</style>
