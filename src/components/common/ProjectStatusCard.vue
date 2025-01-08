<script setup lang="ts">
import type { Project } from '@/apis/projectTypes';
import { ref, watch } from 'vue';

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
</script>

<template>
    <el-card class="project-card" shadow="hover">
        <div class="card-content-container" flex items-center justify-between>
            <div class="left-container" w="100%">
                <div class="title">
                    <span class="project-name" text="20px">{{ props.data.name }}</span>
                    <span class="file-name" text="14px #cccccc">({{ props.data.static_file.original_filename }})</span>
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
            <div class="right-container" w="0%">

            </div>
        </div>
    </el-card>
</template>

<style lang="scss" scoped></style>
