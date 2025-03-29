export const useUpdateProjectListSSEHook = (params: UpdateProjectListSSEHookParams) => {
    // 创建 SSE 连接
    const eventSource = new EventSource(`${window.realSceneDataEngineConfig.apiBaseUrl}/sse/projects`);

    // 连接打开时
    eventSource.onopen = () => {
        console.log('SSE 连接已建立');
    };

    // 接收消息时
    eventSource.onmessage = (event) => {
        if (event.data === 'connected') {
            console.log('SSE 连接成功');
            return;
        }
        
        params.updateProjectList();
    };
    
    // 连接错误时
    eventSource.onerror = (error) => {
        console.error('SSE 连接错误:', error);
        // EventSource 有自动重连机制，但如果需要自定义重连逻辑可在此添加
    };

    return {

    }
}

export interface UpdateProjectListSSEHookParams {
    updateProjectList: () => void;
}
