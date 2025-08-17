<script setup lang="ts">
import type { Project } from '@/apis/projectTypes';
import { ref, watch } from 'vue';
import { threeDGSCancelTask } from '@/apis/project';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';

const props = defineProps<{
    data: Project
}>()
const projectStatus = ref(0);
const updateProjectStatusCode = (status: string) => {
    switch(status) {
        case "Pending":
            projectStatus.value = 1;
            break;
        case "imaged":
            projectStatus.value = 2;
            break;
        case "converted":
            projectStatus.value = 3;
            break;
        case "trained":
            projectStatus.value = 4;
            break;
    }
}
updateProjectStatusCode(props.data.processed_file.status);
const isFailed = ref(props.data.processed_file.status === 'failed');
watch(() => props.data, () => {
    updateProjectStatusCode(props.data.processed_file.status);
})

const emits = defineEmits(['taskCanceled']);

const isProcessing = computed(() => {
    return !['trained', 'failed'].includes(props.data.processed_file.status);
});

const handleCancelTask = async () => {
    try {
        await threeDGSCancelTask(props.data.processed_file.id);
        ElMessage.success('取消任务请求已发送');
        // 直接更新当前项目状态
        props.data.processed_file.status = 'failed';
        // 触发事件通知父组件刷新列表
        emits('taskCanceled');
    } catch (e) {
        ElMessage.error('取消任务失败');
    }
};
</script>

<template>
    <el-card class="project-card" shadow="hover">
        <div class="card-content-container" flex items-center justify-between>
            <!-- 修改左侧宽度为自适应 -->
            <div class="left-container" flex-1>
                <div class="title">
                    <span class="project-name" text="20px">{{ props.data.name }}</span>
                    <span class="file-name" text="14px #cccccc">({{ props.data.static_file.original_filename }})</span>
                    <span class="algorithm-tag" text="12px #666666" ml="8px">[{{ props.data.processed_file.algorithm }}]</span>
                </div>
                <div class="status-line-container" my="20px" v-show="!isFailed">
                    <el-steps :active="projectStatus" finish-status="success" align-center>
                        <el-step title="创建转化成功" />
                        <el-step title="图片转化成功" />
                        <el-step title="识别关系成功" />
                        <el-step title="转化3dgs成功" />
                    </el-steps>
                </div>
            </div>
            
            <!-- 修改右侧宽度为自适应 -->
            <div class="right-container" ml="auto">
                <el-button v-if="isProcessing" type="danger" size="small" 
                           @click.stop="handleCancelTask">取消任务</el-button>
            </div>
        </div>
    </el-card>
</template>

<style scoped>
/* 添加响应式调整 */
.project-card {
    position: relative;
}

.right-container {
    flex-shrink: 0; /* 防止按钮被压缩 */
    padding-left: 16px; /* 与左侧内容保持间距 */
}

/* 在小屏幕上调整布局 */
@media (max-width: 768px) {
    .card-content-container {
        flex-direction: column;
        align-items: flex-start;
    }
    .right-container {
        padding-left: 0;
        padding-top: 12px;
        margin-left: 0 !important;
    }
}
</style>

<style lang="scss" scoped></style>
