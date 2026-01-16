// 错误提示 UI
export const DevPageFallback = ({ error }: { error: Error }) => (
    <div style={{ color: 'red', padding: '1rem' }}>
        <h2>⚠️ 页面加载失败</h2>
        <pre>{error.message}</pre>
    </div>
);
