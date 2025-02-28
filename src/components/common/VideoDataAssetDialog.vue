<script setup lang="ts">
import type { StaticFile } from '@/apis/staticFileTypes';
import { computed } from 'vue';

const visible = defineModel({ type: Boolean, required: true});
const props = defineProps<{
    data: StaticFile
}>()
const videoUrl = computed(() => {
    return `${window.realSceneDataEngineConfig.apiBaseUrl}/files/${props.data.filename}`;
})
</script>

<template>
    <div class="video-data-asset-dialog-container">
        <el-dialog
            v-model="visible"
            title="查看数据资源"
            destroy-on-close
        >
            <div class="content-container" flex justify-center>
                <video :src="videoUrl" h="600px" w="full" controls="true" muted="true" autoplay="true"></video>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped></style>
