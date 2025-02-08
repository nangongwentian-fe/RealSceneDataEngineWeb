<script setup lang="ts">
import { deleteProject, threeDGSToObj } from '@/apis/project';
import type { Project } from '@/apis/projectTypes';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const props = defineProps<{
    data: Project
}>()
const emits = defineEmits<{
    deleteProjectSuccess: []
}>()
const handleViewProject = () => {
    window.open(`${import.meta.env.VITE_3DGS_VIEWER_URL}?load=${import.meta.env.VITE_API_BASE_URL}/files/${props.data.processed_file.result_url}`, "_blank")
}
const handleDownloadThreeDGSData = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/files/${props.data.processed_file.result_url}`, "_blank")
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
</script>

<template>
    <el-card class="project-card" shadow="hover" :style="{
        maxWidth: '360px',
    }" cursor="pointer" @click="handleViewProject">
        <img src="@/assets/images/project-preview.jpg" h="200px" w="100%" >
        <div class="info-container" py="10px" flex items-center justify-between>
            <div class="left-container" max-w="50%">
                <div class="name">{{ props.data.name }}</div>
            </div>
            <div class="right-container">
                <el-popover placement="bottom-start" trigger="hover" width="220">
                    <template #reference>
                        <el-icon size="20"><MoreFilled /></el-icon>
                    </template>
                    <div class="btn-container">
                        <el-button text @click="handleDownloadThreeDGSData" w="full" m="0">导出3dgs数据</el-button>
                        <el-button text @click="handleExportToObj" w="full" m="0">转化成Mesh导出(Obj格式)</el-button>
                        <el-button text @click="handleDeleteProject" w="full" m="0">删除项目</el-button>
                    </div>
                </el-popover>
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
    </el-card>
</template>

<style lang="scss" scoped>
.btn-container {
    .el-button+.el-button {
        margin: 0;
    }
}
</style>
