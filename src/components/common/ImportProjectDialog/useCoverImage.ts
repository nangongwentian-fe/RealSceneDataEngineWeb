import { ElMessage } from 'element-plus';
import type { UploadFile, UploadProps, UploadUserFile } from 'element-plus';
import type { Form } from './useForm';
import { ref } from 'vue';

interface Props {
    form: Form;
}

export const useCoverImage = (props: Props) => {
    // 封面图文件列表引用
    const coverImageList = ref<UploadUserFile[]>([]);
    // 封面图上传加载状态
    const coverImageLoading = ref(false);

    /** 封面图上传前的验证 */
    const beforeCoverImageUpload: UploadProps['beforeUpload'] = (file) => {
        // 验证文件类型
        const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type) || 
            file.name.endsWith('.jpg') || 
            file.name.endsWith('.jpeg') || 
            file.name.endsWith('.png');
        if (!isJpgOrPng) {
            ElMessage.error('封面图只能上传 JPG/PNG 格式的图片!');
            return false;
        }
        
        // 验证文件大小（限制为2MB）
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            ElMessage.error('封面图大小不能超过 2MB!');
            return false;
        }
        
        // 验证通过后，清空之前的文件列表，确保只有一个文件
        coverImageList.value = [];
        return true;
    }

    /** 封面图变更时的处理 */
    const handleCoverImageChange = (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
        // 如果有多个文件，只保留最新上传的文件
        if (uploadFiles.length > 1) {
            // 移除之前的文件
            coverImageList.value = [uploadFile];
        } else {
            coverImageList.value = uploadFiles;
        }

        // 更新表单中的zip文件
        props.form.coverImage = coverImageList.value.length > 0 ? coverImageList.value[0] as UploadFile : null;
        
    }

    /** 移除封面图时的处理 */
    const handleCoverImageRemove = () => {
        // 清空文件列表
        coverImageList.value = [];
        // 清空表单中的封面图
        props.form.coverImage = null;
    }

    return {
        coverImageList,
        coverImageLoading,
        beforeCoverImageUpload,
        handleCoverImageChange,
        handleCoverImageRemove
    }
}