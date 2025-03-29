export const useDialogHook = (params: DialogHookParams) => {
    /** 任务队列 */
    const taskQueue = {
        dialogOpen: [] as (() => void)[],
        dialogClose: [] as (() => void)[]
    }
    /** 打开对话框 */
    const handleDialogOpen = () => {
        taskQueue.dialogOpen.forEach(task => task());
    }
    /** 关闭对话框 */
    const handleDialogClose = () => {
        taskQueue.dialogClose.forEach(task => task());
    }
    /** 添加对话框打开任务 */
    const addDialogOpenTask = (task: () => void) => {
        taskQueue.dialogOpen.push(task);
    }
    // 新增打开对话框时更新数据资源列表
    addDialogOpenTask(() => {
        params.updateAssetList();
    })
    /** 添加对话框关闭任务 */
    const addDialogCloseTask = (task: () => void) => {
        taskQueue.dialogClose.push(task);
    }
    return {
        handleDialogOpen,
        handleDialogClose,
        addDialogOpenTask,
        addDialogCloseTask
    }
}

export interface DialogHookParams {
    updateAssetList: () => void
}
