<script setup lang="ts">
import { deleteProject, threeDGSToObj, segmentProject} from '@/apis/project';
import type { Project } from '@/apis/projectTypes';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { MoreFilled, Edit, Loading } from '@element-plus/icons-vue';
import ProjectTagSelector from './ProjectTagSelector.vue';

const props = defineProps<{
    data: Project
}>()
const emits = defineEmits<{
    deleteProjectSuccess: []
    tagsUpdated: []
}>()
const handleViewProject = () => {
    window.open(`${window.realSceneDataEngineConfig.threeDGSViewer}?load=${window.realSceneDataEngineConfig.apiBaseUrl}/files/${props.data.processed_file.result_url}`, "_blank")
}
const handleDownloadThreeDGSData = () => {
    window.open(`${window.realSceneDataEngineConfig.apiBaseUrl}/files/${props.data.processed_file.result_url}`, "_blank")
}
const handleDeleteProject = () => {
    deleteProject(props.data.id).then((deleteProjectRes) => {
        console.log('删除项目:', deleteProjectRes);
        ElMessage.success('删除项目成功');
        emits('deleteProjectSuccess')
    }).catch(() => {
        ElMessage.error('删除项目失败');
    })
}

const handleExportToObj = () => {
    threeDGSToObjLoadingDialogVisible.value = true;
    threeDGSToObj(props.data.id).then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        const contentDisposition = res.headers['content-disposition'];
        let fileName = `${props.data.name}.zip`;
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
        }
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        ElMessage.success('导出成功');
    }).catch(() => {
        ElMessage.error('导出失败');
    }).finally(() => {
        threeDGSToObjLoadingDialogVisible.value = false;
    })
}

const threeDGSToObjLoadingDialogVisible = ref(false);
const segementProjectDialogVisible = ref(false);
const segmentLoadingDialogVisible = ref(false);
const segmentInput = ref(''); 
const tagSelectorVisible = ref(false);

const handleSegmentProjectConfirm = () => {
    if (!segmentInput.value) {
        ElMessage.error('请输入要分割的对象');
        return;
    }
    segementProjectDialogVisible.value = false;
    segmentLoadingDialogVisible.value = true;
    segmentProject(props.data.id, segmentInput.value)
        .then((res) => {
            const downloadUrl = `${window.realSceneDataEngineConfig.apiBaseUrl}/files/${res.data}`;
            // 创建一个临时链接来触发文件下载
            const link = document.createElement('a');
            link.href = downloadUrl;
            // 使用项目名称和分割对象构建文件名
            const fileName = `${props.data.name}_${segmentInput.value}_segment.ply`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            link.remove();
            ElMessage.success('分割任务提交成功');
            
            segmentInput.value = '';
        })
        .catch((error) => {
            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 404:
                        ElMessage.error(data.detail || '项目或处理文件未找到');
                        break;
                    case 200:
                        ElMessage.warning(data.detail || '该对象的分割文件已存在');
                        segmentInput.value = '';
                        break;
                    default:
                        ElMessage.error('分割任务提交失败');
                }
            } else {
                ElMessage.error('分割任务提交失败');
            }
        })
        .finally(() => {
            segmentLoadingDialogVisible.value = false;
        });
}

const projectImage = computed(() => {
    return `${window.realSceneDataEngineConfig.apiBaseUrl}/files/${props.data.cover_image.filename}`
})

const handleEditTags = (event: Event) => {
    event.stopPropagation();
    tagSelectorVisible.value = true;
};

const handleTagsUpdated = () => {
    emits('tagsUpdated');
};
</script>

<template>
    <el-card class="project-card" shadow="hover" :style="{
        maxWidth: '360px',
    }" cursor="pointer" @click="handleViewProject" w="320px">
        <img :src="projectImage" h="200px" w="100%" object-contain bg="#f4f4f4" />
        <div class="info-container" py="10px">
            <div class="project-header" flex items-center justify-between mb="8px">
                <div class="left-container" max-w="60%">
                    <div class="name">{{ props.data.name }}</div>
                    <div class="algorithm" style="font-size: 12px; color: #888;">算法: {{ props.data.processed_file.algorithm }}</div>
                </div>
                <div class="right-container" @click.stop @mousedown.stop @mouseup.stop>
                    <el-popover placement="bottom-start" trigger="hover" width="240" @click.stop @mousedown.stop @mouseup.stop>
                        <template #reference>
                            <el-icon size="20" @click.stop @mousedown.stop @mouseup.stop><MoreFilled /></el-icon>
                        </template>
                        <div class="btn-container" @click.stop @mousedown.stop @mouseup.stop>
                            <el-button text @click="handleEditTags" w="full" m="0" :icon="Edit" @click.stop @mousedown.stop @mouseup.stop>编辑标签</el-button>
                            <el-button text @click="handleDownloadThreeDGSData" w="full" m="0" @click.stop @mousedown.stop @mouseup.stop>导出3dgs数据</el-button>
                            <el-button text @click="handleExportToObj" w="full" m="0" @click.stop @mousedown.stop @mouseup.stop>转化成Mesh导出(Obj格式)</el-button>
                            <el-button text @click="segementProjectDialogVisible = true" w="full" m="0" @click.stop @mousedown.stop @mouseup.stop>3dgs分割</el-button>
                            <el-button text @click="handleDeleteProject" w="full" m="0" @click.stop @mousedown.stop @mouseup.stop>删除项目</el-button>
                        </div>
                    </el-popover>
                </div>
            </div>
            <div class="tags-container" v-if="props.data.tags && props.data.tags.length > 0" @click.stop @mousedown.stop @mouseup.stop>
                <el-tag
                    v-for="tag in props.data.tags"
                    :key="tag.id"
                    :color="tag.color"
                    :style="{ 
                        color: '#fff',
                        border: 'none',
                        fontSize: '11px',
                        marginRight: '4px',
                        marginBottom: '4px'
                    }"
                    size="small"
                    @click.stop
                    @mousedown.stop
                    @mouseup.stop
                >
                    {{ tag.name }}
                </el-tag>
            </div>
        </div>
        <el-dialog
            v-model="threeDGSToObjLoadingDialogVisible"
            title="Tips"
            width="500"
            :append-to-body="true"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            3DGS数据正在转化Mesh中, 这个过程不会太久(小场景约30s~1min, 大场景约4min)且只有第一次转化时需要等待, 请稍等片刻...(转化完成后会自动下载)
        </el-dialog>
        
        <el-dialog
            v-model="segementProjectDialogVisible"
            title="3DGS分割"
            width="500"
            :append-to-body="true"
        >
            <template #default>
                <div flex="~ col" gap="4">
                    <p text="gray-600" mb="2">请输入要分割的场景中的对象名称,例如: 桌子、椅子、沙发等</p>
                    <el-input 
                        v-model="segmentInput"
                        placeholder="请输入要分割的对象" 
                        clearable
                        @keyup.enter="handleSegmentProjectConfirm"
                    />
                    <div mt="4" text-right>
                        <el-button @click="segementProjectDialogVisible = false">取消</el-button>
                        <el-button 
                            type="primary" 
                            @click="handleSegmentProjectConfirm"
                            :disabled="!segmentInput"
                        >
                            确认分割
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
        
        <el-dialog
            v-model="segmentLoadingDialogVisible"
            title="分割进行中"
            width="500"
            :append-to-body="true"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div class="loading-content" flex="~ col" items-center gap="4">
                <el-icon class="is-loading" size="24"><Loading /></el-icon>
                <p>正在进行场景分割，请稍候...</p>
                <p text="gray-500" text-sm>提示：分割过程可能需要几分钟，请勿关闭页面</p>
            </div>
        </el-dialog>
        
        <ProjectTagSelector 
            v-model="tagSelectorVisible"
            :project="props.data"
            @tags-updated="handleTagsUpdated"
        />
    </el-card>
</template>

<style lang="scss" scoped>
.btn-container {
    .el-button+.el-button {
        margin: 0;
    }
}
</style>
