<script setup lang="ts">
import type { Project } from '@/apis/projectTypes';
import ProjectStatusCard from './ProjectStatusCard.vue';

const visible = defineModel({ type: Boolean, required: true});
const props = defineProps<{
    processingProjectList: Project[],
    failedProjectList: Project[]
}>()

const emits = defineEmits(['refreshList']);

const handleTaskCanceled = () => {
    // 触发刷新列表事件
    emits('refreshList');
};
</script>

<template>
    <div class="processing-project-dialog-container">
        <el-dialog
            v-model="visible"
            title="正在处理中的项目列表"
            destroy-on-close
        >
        <el-tabs tab-position="left" style="height: 600px">
            <el-tab-pane label="正在转化">
                <div class="pane-content" h="600px" v-show="props.processingProjectList.length > 0">
                    <el-scrollbar>
                        <div class="tip text-red" v-show="props?.processingProjectList?.length > 0">任务正在自动排队处理, 请耐心等待...</div>
                        <div class="processing-projest-list" px="10px" py="10px">
                            <ProjectStatusCard v-for="project in props.processingProjectList" :key="project.id" mb="10px" :data="project" @task-canceled="handleTaskCanceled" />
                        </div>
                    </el-scrollbar>
                </div>
                <el-empty description="目前没有正在转化的项目哦，快去新建一个项目吧" h="600px" v-show="props.processingProjectList.length == 0" />
            </el-tab-pane>
            <el-tab-pane label="转化失败">
                <div class="pane-content" h="600px" v-show="props.failedProjectList.length > 0">
                    <el-scrollbar>
                        <div class="failed-project-list" px="10px" py="10px">
                            <ProjectStatusCard v-for="project in props.failedProjectList" :key="project.id" mb="10px" :data="project" @task-canceled="handleTaskCanceled" />
                        </div>
                    </el-scrollbar>
                </div>
                <el-empty description="目前还没有转化失败的项目哦，这引擎也太棒了吧" h="600px" v-show="props.failedProjectList.length == 0" />
            </el-tab-pane>
        </el-tabs>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped></style>
