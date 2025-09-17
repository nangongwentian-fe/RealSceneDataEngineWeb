<script setup lang="ts">
import { deleteProject, threeDGSToObj, segmentProject} from '@/apis/project';
import type { Project } from '@/apis/projectTypes';
import { ElMessage } from 'element-plus';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
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

// 显示标签过滤
const authStore = useAuthStore();
const displayTags = computed(() => {
    if (!props.data.tags) return [];
    if (authStore.isAdmin) return props.data.tags;
    const allowed = (authStore.user as any)?.allowedTags;
    if (allowed === '*' || !Array.isArray(allowed)) return props.data.tags;
    return props.data.tags.filter(t=>allowed.includes(t.id));
});

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
    <el-card class="project-card mobile-card" 
             shadow="hover" 
             :class="['cursor-pointer', 'touch-manipulation', isMobile ? 'w-full' : 'w-320px']"
             :style="isMobile ? {} : { maxWidth: '360px' }"
             @click="handleViewProject">
        <img :src="projectImage" 
             :class="['w-full object-contain bg-gray-100', isMobile ? 'h-180px' : 'h-200px']" />
        <div class="info-container" :class="[isMobile ? 'py-3' : 'py-10px']">
            <div class="project-header" 
                 :class="['flex items-center justify-between', isMobile ? 'mb-2' : 'mb-8px']">
                <div class="left-container" :class="[isMobile ? 'max-w-70%' : 'max-w-60%']">
                    <div class="name" 
                         :class="[isMobile ? 'text-16px font-medium' : 'text-14px', 'text-gray-800', 'truncate']">
                        {{ props.data.name }}
                    </div>
                    <div class="algorithm" 
                         :class="[isMobile ? 'text-12px' : 'text-12px', 'text-gray-500', 'mt-1']">
                        算法: {{ props.data.processed_file.algorithm }}
                    </div>
                </div>
                <div class="right-container" @click.stop @mousedown.stop @mouseup.stop>
                    <el-popover :placement="isMobile ? 'bottom-end' : 'bottom-start'" 
                                :trigger="isMobile ? 'click' : 'hover'" 
                                :width="isMobile ? 200 : 240" 
                                @click.stop @mousedown.stop @mouseup.stop>
                        <template #reference>
                            <el-icon :size="isMobile ? 18 : 20" 
                                     class="touch-manipulation" 
                                     @click.stop @mousedown.stop @mouseup.stop>
                                <MoreFilled />
                            </el-icon>
                        </template>
                        <div class="btn-container" @click.stop @mousedown.stop @mouseup.stop>
                            <el-button
                                v-if="authStore.isAdmin"
                                text 
                                @click="handleEditTags" 
                                w="full" 
                                m="0" 
                                :icon="Edit" 
                                :size="isMobile ? 'default' : 'default'"
                                class="mobile-btn"
                                @click.stop @mousedown.stop @mouseup.stop>
                                <span class="truncate">编辑标签</span>
                            </el-button>
                            <el-button text 
                                       @click="handleDownloadThreeDGSData" 
                                       w="full" 
                                       m="0" 
                                       :size="isMobile ? 'default' : 'default'"
                                       class="mobile-btn"
                                       @click.stop @mousedown.stop @mouseup.stop>
                                <span class="truncate">导出3DGS数据</span>
                            </el-button>
                            <el-button text 
                                       @click="handleExportToObj" 
                                       w="full" 
                                       m="0" 
                                       :size="isMobile ? 'default' : 'default'"
                                       class="mobile-btn"
                                       @click.stop @mousedown.stop @mouseup.stop>
                                <span class="truncate">转化成Mesh导出</span>
                            </el-button>
                            <el-button text 
                                       @click="segementProjectDialogVisible = true" 
                                       w="full" 
                                       m="0" 
                                       :size="isMobile ? 'default' : 'default'"
                                       class="mobile-btn"
                                       @click.stop @mousedown.stop @mouseup.stop>
                                <span class="truncate">3DGS分割</span>
                            </el-button>
                            <el-button text 
                                       @click="handleDeleteProject" 
                                       w="full" 
                                       m="0" 
                                       :size="isMobile ? 'default' : 'default'"
                                       class="mobile-btn"
                                       @click.stop @mousedown.stop @mouseup.stop>
                                <span class="truncate">删除项目</span>
                            </el-button>
                        </div>
                    </el-popover>
                </div>
            </div>
            <div class="tags-container" 
                 v-if="props.data.tags && props.data.tags.length > 0" 
                 @click.stop @mousedown.stop @mouseup.stop>
                <el-tag
                    v-for="tag in displayTags"
                    :key="tag.id"
                    :color="tag.color"
                    :style="{ 
                        color: '#fff',
                        border: 'none',
                        fontSize: isMobile ? '10px' : '11px',
                        marginRight: '4px',
                        marginBottom: '4px'
                    }"
                    :size="isMobile ? 'small' : 'small'"
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
            :width="isMobile ? '90%' : '500px'"
            :append-to-body="true"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div :class="[isMobile ? 'text-14px' : 'text-16px', 'leading-relaxed']">
                3DGS数据正在转化Mesh中, 这个过程不会太久(小场景约30s~1min, 大场景约4min)且只有第一次转化时需要等待, 请稍等片刻...(转化完成后会自动下载)
            </div>
        </el-dialog>
        
        <el-dialog
            v-model="segementProjectDialogVisible"
            title="3DGS分割"
            :width="isMobile ? '90%' : '500px'"
            :append-to-body="true"
        >
            <template #default>
                <div :class="['flex flex-col', isMobile ? 'gap-3' : 'gap-4']">
                    <p :class="['text-gray-600', isMobile ? 'mb-1 text-14px' : 'mb-2', 'leading-relaxed']">
                        请输入要分割的场景中的对象名称,例如: 桌子、椅子、沙发等
                    </p>
                    <el-input 
                        v-model="segmentInput"
                        placeholder="请输入要分割的对象" 
                        clearable
                        class="mobile-input"
                        @keyup.enter="handleSegmentProjectConfirm"
                    />
                    <div :class="[isMobile ? 'mt-3' : 'mt-4', 'text-right', 'space-x-2']">
                        <el-button @click="segementProjectDialogVisible = false" 
                                   :size="isMobile ? 'default' : 'default'"
                                   class="mobile-btn">取消</el-button>
                        <el-button 
                            type="primary" 
                            @click="handleSegmentProjectConfirm"
                            :disabled="!segmentInput"
                            :size="isMobile ? 'default' : 'default'"
                            class="mobile-btn"
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
            :width="isMobile ? '90%' : '500px'"
            :append-to-body="true"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div class="loading-content" 
                 :class="['flex flex-col items-center', isMobile ? 'gap-3' : 'gap-4']">
                <el-icon class="is-loading" :size="isMobile ? 20 : 24"><Loading /></el-icon>
                <p :class="[isMobile ? 'text-14px' : 'text-16px']">正在进行场景分割，请稍候...</p>
                <p :class="['text-gray-500', isMobile ? 'text-12px' : 'text-sm', 'text-center', 'leading-relaxed']">
                    提示：分割过程可能需要几分钟，请勿关闭页面
                </p>
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
