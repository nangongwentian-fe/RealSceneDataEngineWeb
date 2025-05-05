<script setup lang="ts">
import Header from '@/components/common/Header.vue';
import ProjectCard from '@/components/common/ProjectCard.vue';
import { ref } from 'vue';
import AssetsStoreDialog from '@/components/common/AssetsStoreDialog.vue';
import AddProjectDialog from '@/components/common/AddProjectDialog/AddProjectDialog.vue';
import { getProjectList } from '@/apis/project';
import type { Project } from '@/apis/projectTypes';
import { ElMessage } from 'element-plus';
import { MessageBox } from '@element-plus/icons-vue';
import ProcessingProjectDialog from '@/components/common/ProcessingProjectDialog.vue';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useUpdateProjectListSSEHook } from './useUpdateProjectListSSEHook';
import ImportProjectDialog from '@/components/common/ImportProjectDialog/index.vue';
import { useUploadProject } from './useUploadProject';

// 上传项目相关hook
const { uploadProjectDialogVisible, handleUploadProjectBtnClick } = useUploadProject();
/**
 * @description 数据资源库弹窗是否可见
 */
const assetsStoreDialogVisible = ref(false);
/**
 * @description 数据资源库按钮点击事件
 */
const handleAssetsStoreBtnClick = () => {
    assetsStoreDialogVisible.value = true;
};

const addProjectDialogVisible = ref(false);
const handleAddProjectBtnClick = () => {
    addProjectDialogVisible.value = true;
};

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const projectList = ref<Project[]>([]);
const trainedProjectList = ref<Project[]>([]);
const failedProjectList = ref<Project[]>([]);
const processingProjectList = ref<Project[]>([]);
const updateProjectList = () => {
    getProjectList(page.value, pageSize.value).then((getProjectListRes) => {
        console.log('获取项目列表成功', getProjectListRes);
        projectList.value = getProjectListRes.data.data;
        trainedProjectList.value = projectList.value.filter((project) => {
            if(project.processed_file.status === 'trained') {
                return true;
            } else {
                return false;
            }
        })
        total.value = trainedProjectList.value.length;
        failedProjectList.value = projectList.value.filter((project) => {
            if(project.processed_file.status === 'failed') {
                return true;
            } else {
                return false;
            }
        })
        processingProjectList.value = projectList.value.filter((project) => {
            if(project.processed_file.status !== 'failed' && project.processed_file.status !== 'trained') {
                return true;
            } else {
                return false;
            }
        })
    }).catch(() => {
        ElMessage.error('获取项目列表失败');
    })
}
updateProjectList();
/** 使用 SSE 更新项目列表 */
const {} = useUpdateProjectListSSEHook({
    updateProjectList
});

const processingProjectDialogVisible = ref(false);
const handleOpenProcessingProjectDialog = () => {
    processingProjectDialogVisible.value = true;
}

const handleAddProjectSuccess = () => {
    updateProjectList();
}
const handleDeleteProjectSuccess = () => {
    updateProjectList();
}
</script>

<template>
    <div class="home" w="full" h="full">
        <Header />
        <div class="page-content" h="[calc(100%-80px)]" px="28px" py="24px">
            <!-- 内容header -->
            <div class="content-header" h="48px"  mb="20px" flex items-center justify-between>
                <div class="left-container" flex items-center>
                    <div class="title" text="20px #222222">
                        项目列表
                    </div>
                </div>
                <div class="right-container" flex items-center>
                    <el-button type="primary" size="large" @click="handleAssetsStoreBtnClick">数据资源库</el-button>
                    <el-button type="primary" size="large" @click="handleAddProjectBtnClick" mr="10px">新建项目</el-button>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="如果你有已经处理好的3dgs结果"
                        placement="top"
                    >
                        <el-button type="primary" size="large" @click="handleUploadProjectBtnClick" mr="10px">导入项目</el-button>
                    </el-tooltip>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="正在处理的项目"
                        placement="bottom"
                    >
                        <el-badge :value="processingProjectList.length" mr="10px">
                            <el-button size="large" :icon="MessageBox" @click="handleOpenProcessingProjectDialog"></el-button>
                        </el-badge>
                    </el-tooltip>
                </div>
            </div>
            <!-- 项目列表 -->
            <div class="content-project-container" h="[calc(100%-48px-20px-40px)]">
                <el-scrollbar>
                    <div class="project-list" px="10px" py="10px" flex flex-wrap>
                        <ProjectCard v-for="project in trainedProjectList" :key="project.id" :data="project" mr="10px" mb="10px" @delete-project-success="handleDeleteProjectSuccess" />
                    </div>
                </el-scrollbar>
            </div>
            <div class="pagination-container" h="40px" flex items-center justify-center>
                <el-config-provider :locale="zhCn">
                    <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10, 20, 30]" background layout="total, sizes, prev, pager, next, jumper" :total="total" />
                </el-config-provider>
            </div>
        </div>
    </div>
    <!-- 数据资源库对话框组件 -->
    <AssetsStoreDialog v-model="assetsStoreDialogVisible"/>
    <AddProjectDialog v-model="addProjectDialogVisible" @add-project-success="handleAddProjectSuccess" />
    <ProcessingProjectDialog v-model="processingProjectDialogVisible"  :processing-project-list="processingProjectList" :failed-project-list="failedProjectList"/>
    <ImportProjectDialog v-model="uploadProjectDialogVisible" />
</template>

<style lang="scss" scoped></style>
