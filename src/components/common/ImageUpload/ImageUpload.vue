<template>
    <!-- 上传图片的容器 -->
    <div 
        class="image-upload-container" 
        min-w="100px" 
        min-h="80px" 
        border-dashed 
        border="#cccccc"
        rounded="md" 
        flex 
        justify-center 
        items-center 
        relative
    >
        <!-- 上传图片的提示,如果有图片了就不需要这个dom了-->
        <div class="tip" flex flex-col items-center v-show="!imgUrl">
            <el-icon :size="20" color="#999"><Plus /></el-icon>
            <div>点击上传</div>
        </div>
        <!-- 上传图片的input -->
        <input type="file" accept="image/*" absolute top="0" left="0" bottom="0" right="0" opacity-0 cursor="pointer" ref="fileInputRef" @change="handleFileChange">
        <!-- 上传的图片 -->
        <img v-show="imgUrl" :src="imgUrl" alt="项目封面" w="100%" h="100%" object-cover>
        <div class="close-btn" w="30px" h="30px" bg="#ccc" rounded="50%" absolute top-0 right-0 flex items-center justify-center @click="handleCloseBtnClick" translate-x="50%" translate-y="-50%" cursor="pointer" v-show="imgUrl">
            <el-icon color="#fff"><CloseBold /></el-icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useImageUploadHook } from './useImageUploadHook';

const emits = defineEmits<{
    imageUploadSuccess: [File],
    clearImage: []
}>()
const fileInputRef = ref<HTMLInputElement>();
// 用于上传图片的钩子
const { imgUrl, handleFileChange, clearImage, handleCloseBtnClick } = useImageUploadHook({
    emits,
    fileInputRef
});
defineExpose({
    clearImage
})
</script>

<style lang="scss" scoped>

</style>