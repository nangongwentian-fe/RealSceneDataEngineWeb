<script setup lang="ts">
import { getAssetListAll } from '@/apis/assets';
import type { DataAsset } from '@/apis/assetsTypes';
import { addProject } from '@/apis/project';
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';

const visible = defineModel({ type: Boolean, required: true});
const emits = defineEmits<{
    'addProjectSuccess': []
}>()
const form = reactive<{
    projectName: string,
    dataAssetId: number
}>({
    projectName: '',
    dataAssetId: -1
})
const dataAssetList = ref<DataAsset[]>([]);
/**
 * @description 更新数据资源列表
 */
 const updateAssetList = async () => {
    const getAssetListResponse = await getAssetListAll();
    console.log('数据资源列表:', getAssetListResponse);
    dataAssetList.value = getAssetListResponse.data.data;
    form.dataAssetId = dataAssetList.value[0].static_file.id;
};
updateAssetList();
const adding = ref(false);
const handleAddProject = () => {
    if(!form.projectName || form.dataAssetId == -1) {
        ElMessage.error('所有数据都必须填写')
        return;
    }
    adding.value = true;
    addProject(form.projectName, form.dataAssetId).then((addProjectRes) => {
        console.log('新增项目成功', addProjectRes);
        ElMessage.success('新增项目成功');
        adding.value = false;
        visible.value = false;
        form.projectName = "";
        form.dataAssetId = dataAssetList.value[0].static_file.id;
        emits('addProjectSuccess')
    }).catch(() => {
        ElMessage.error('新增项目失败，请重新尝试')
    })
}
const handleDialogOpen = () => {
    updateAssetList();
}
</script>

<template>
    <div class="add-project-dialog-container">
        <el-dialog
            v-model="visible"
            title="新建项目"
            destroy-on-close
            @open="handleDialogOpen"
        >
            <el-form :model="form" label-width="auto">
                <el-form-item label="项目名称:" required>
                    <el-input v-model="form.projectName" placeholder="请输入项目名称"></el-input>
                </el-form-item>
                <el-form-item label="选择一个数据资源用于创建项目:" required>
                    <el-select
                        v-model="form.dataAssetId"
                        placeholder="Select"
                    >
                        <el-option
                            v-for="item in dataAssetList"
                            :key="item.id"
                            :label="`${item.name}(${item.static_file.original_filename})`"
                            :value="item.static_file.id"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="btn-container" flex justify-center>
                <el-button type="primary" w="160px" size="large" @click="handleAddProject" :loading="adding">新增</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped></style>
