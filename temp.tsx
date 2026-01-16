const { Card, Avatar, Input, Typography, List, Button } = CbtaiAntd;
const handleInputChange = (id, newValue) => {
    console.log('[输入框状态变更]', {
        itemId: id,
        新值: newValue,
        变更时间: new Date().toLocaleTimeString()
    });
    setCbtState(prev => ({
        ...prev,
        dataSourceState: JSON.stringify((JSON.parse(prev?.dataSourceState || "[]")).map(item =>
            item.id === id ? { ...item, answer: newValue } : item
        ))
    }));
    console.log('datasource',cbtState)
};

return React.createElement(
    List.Item,
    { key: item.id, style: { marginBottom: 8 } },
    React.createElement(
        Card,
        { style: { width: '100%', padding: 10 } },
        React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
            React.createElement(
                Avatar,
                { style: { backgroundColor: '#1677ff' }, size: 28 },
                item.id
            ),
            React.createElement(Typography.Text, { style: { fontSize: 14 } }, item.name),
            React.createElement(Button, {
                ghost: true
            }, "🔊")
        ),
        React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 } },
            React.createElement(Input, {
                style: { flex: 1 },
                defaultValue: item.answer,
                onChange: (e) => handleInputChange(item.id, e.target.value)
            })
        )
    )
);
