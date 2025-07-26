<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { upload } from '@/apis/staticFile';
import { addDataAsset } from '@/apis/assets';

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
            destroy-on-close
        >
            <el-form :model="form" label-width="auto">
                <el-form-item label="数据资源名称:" required>
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="上传视频文件:" required>
                    <div class="upload-video-file-container" h="200px" w="full" border="2px dashed #cccccc" rounded="6px" flex items-center justify-center relative v-show="!form.video">
                        <div class="upload-tip-container" flex flex-col items-center>
                            <el-icon size="28"><VideoCamera /></el-icon>
                            上传视频文件
                        </div>
                        <input type="file" absolute left-0 top-0 right-0 bottom-0 opacity-0 accept="video/mp4" @change="handleFileUpload"  />
                    </div>
                    <el-card class="data-asset-list-item" shadow="hover" w="full"  v-show="form.video">
                        <div class="card-content-container" flex items-center justify-between>
                            <div class="left-container">
                                <div class="title">
                                    <span class="asset-name" text=" #222222">{{ form.video?.name }}</span>
                                </div>
                            </div>
                            <div class="right-container">
                                <el-tooltip
                                    class="box-item"
                                    effect="dark"
                                    content="删除当前数据资源"
                                    placement="bottom"
                                >
                                    <el-button :icon="Delete" @click="handleDeleteDataAssetBtnClick"></el-button>
                                </el-tooltip>
                            </div>
                        </div>
                    </el-card>
                </el-form-item>
                <!-- 上传进度条 -->
                <el-form-item v-if="adding" label="上传进度:" label-width="auto" class="upload-progress-item">
                    <div class="progress-container">
                        <el-progress :percentage="uploadProgress" style="flex:1" />
                        <span class="progress-size">{{ humanFileSize(uploadLoaded) }} / {{ humanFileSize(uploadTotal) }}</span>
                    </div>
                </el-form-item>
            </el-form> 
            <div class="btn-container" flex justify-center>
                <el-button type="primary" w="160px" size="large" @click="handleAddDataAsset" :loading="adding">新增</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.upload-progress-item {
  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
  }
}

.progress-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.progress-size {
  margin-left: 12px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}
</style>
