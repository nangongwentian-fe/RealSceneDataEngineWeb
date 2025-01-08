<script setup lang="ts">
import { deleteProject } from '@/apis/project';
import type { Project } from '@/apis/projectTypes';
import { ElMessage } from 'element-plus';

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
                <el-popover placement="bottom-start" trigger="hover">
                    <template #reference>
                        <el-icon size="20"><MoreFilled /></el-icon>
                    </template>
                    <div class="btn-container">
                        <el-button text @click="handleDownloadThreeDGSData" w="full" m="0">导出3dgs数据</el-button>
                        <el-button text @click="handleDeleteProject" w="full" m="0">删除项目</el-button>
                    </div>
                </el-popover>
            </div>
        </div>
    </el-card>
</template>

<style lang="scss" scoped>
.btn-container {
    .el-button+.el-button {
        margin: 0;
    }
}
</style>
