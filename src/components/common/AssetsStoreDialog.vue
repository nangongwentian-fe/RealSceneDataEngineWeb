<script setup lang="ts">
import { getAssetList } from '@/apis/assets';
import type { DataAsset } from '@/apis/assetsTypes';
import { ref } from 'vue';
import DataAssetListItem from './DataAssetListItem.vue';
import AddDataAssetItemDialog from './AddDataAssetItemDialog.vue';

const visible = defineModel({ type: Boolean, required: true});
/**
 * @description 当前页码
 */
const page = ref(1);
/**
 * @description 每页数据资源数量
 */
const pageSize = ref(10);
/**
 * @description 数据资源总数
 */
const total = ref(0);
/**
 * @description 数据资源列表
 */
const assetList = ref<DataAsset[]>([]);
/**
 * @description 更新数据资源列表
 */
const updateAssetList = async () => {
    const getAssetListResponse = await getAssetList(page.value, pageSize.value);
    console.log('数据资源列表:', getAssetListResponse);
    // 使用后端返回的总数，如果没有则使用当前页数据长度
    total.value = getAssetListResponse.data.total || getAssetListResponse.data.data.length;
    assetList.value = getAssetListResponse.data.data;
};
updateAssetList();
/**
 * @description 数据资源库弹窗打开事件
 */
const handleDialogOpen = () => {
    updateAssetList();
};
/**
 * @description 数据资源列表项删除成功事件
 */
const handleDataAssetItemDeleteSuccess = () => {
    updateAssetList();
};
/**
 * @description 新增数据资源按钮点击事件
 */
const addDataAssetItemDialogVisible = ref(false);
/**
 * @description 新增数据资源按钮点击事件
 */
const handleAddDataAssetItemBtnClick = () => {
    addDataAssetItemDialogVisible.value = true;
};
/**
 * @description 新增数据资源成功事件
 */
const addDataAssetItemSuccess = () => {
    updateAssetList();
};
</script>

<template>
    <div class="assets-store-dialog-container">
        <el-dialog
            v-model="visible"
            title="数据资源库"
            destroy-on-close
            @open="handleDialogOpen"
        >
            <div class="header-container" flex items-center justify-between>
                <div class="left-container">

                </div>
                <div class="right-container">
                    <el-button type="primary" @click="handleAddDataAssetItemBtnClick">新增数据</el-button>
                </div>
            </div>
            <div class="data-asset-list-container" h="500px">
                <el-scrollbar>
                    <div class="data-asset-list" py="10px" px="10px">
                        <DataAssetListItem v-for="dataAsset in assetList" :key="dataAsset.id" :data="dataAsset" @delete-success="handleDataAssetItemDeleteSuccess" mb="10px" />
                    </div>
                </el-scrollbar>
            </div>
            <div class="pagination-container" flex justify-center>
                <el-pagination 
                    v-model:current-page="page"
                    background 
                    layout="prev, pager, next" 
                    :total="total"
                    @current-change="updateAssetList"
                />
            </div>
            <!-- 新增数据资源弹窗 -->
            <AddDataAssetItemDialog v-model="addDataAssetItemDialogVisible" @add-success="addDataAssetItemSuccess" />
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped></style>
