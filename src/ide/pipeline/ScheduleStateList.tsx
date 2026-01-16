import React, {useState} from "react";
import {Table, Card, Tag, Space, Typography, Collapse, Switch, message} from "antd";
import {
    ScheduleExecuteStateProps,
    ExecuteState,
    ScheduleProps,
    ExecuteTaskStateDao,
    Param,
    changeScheduleStateRecord, ProjectData
} from "@/tools";
import {useAppConfig, useProject} from "@/context";
import {useLocation, useNavigate} from "react-router-dom";

const {Text} = Typography;
const {Panel} = Collapse;

export const ScheduleStateList: React.FC<ScheduleExecuteStateProps> = ({headers, scheduleProps}) => {
    const {appConfig} = useAppConfig();
    const {projectConfig} = useProject();
    // 渲染任务列表
    const renderTaskList = (tasks: ExecuteTaskStateDao[]) => (
        <Table
            dataSource={tasks}
            columns={[
                {
                    title: "任务名称",
                    dataIndex: "task_name",
                    key: "task_name",
                },
                {
                    title: "HTTP 链接",
                    dataIndex: "http_url",
                    key: "http_url",
                },
                {
                    title: "输入参数",
                    dataIndex: "comes",
                    key: "comes",
                    render: (comes: Record<string, any>) => (
                        <Space direction="vertical">
                            {Object.entries(comes).map(([key, value]) => (
                                <Text key={key}>{`${key}: ${JSON.stringify(value)}`}</Text>
                            ))}
                        </Space>
                    ),
                },
                {
                    title: "输出参数",
                    dataIndex: "goes",
                    key: "goes",
                    render: (goes: Record<string, any>) => (
                        <Space direction="vertical">
                            {Object.entries(goes).map(([key, value]) => (
                                <Text key={key}>{`${key}: ${JSON.stringify(value)}`}</Text>
                            ))}
                        </Space>
                    ),
                },
            ]}
            size="small"
            pagination={false}
        />
    );
    // 渲染运行状态
    const renderRunState = (runState: ScheduleProps[]) => (
        <Collapse>
            {runState.map((state, index) => (
                <Panel
                    header={`管道 ID: ${state.current_pipe_id}`}
                    key={index}
                >
                    <Space direction="vertical" className="w-full">
                        <Card size="small" title="输入参数">
                            <Space direction="vertical">
                                {Object.entries(state.comes).map(([key, value]) => (
                                    <Text key={key}>{`${key}: ${JSON.stringify(value)}`}</Text>
                                ))}
                            </Space>
                        </Card>

                        <Card size="small" title="输出参数">
                            <Space direction="vertical">
                                {Object.entries(state.goes).map(([key, value]) => (
                                    <Text key={key}>{`${key}: ${JSON.stringify(value)}`}</Text>
                                ))}
                            </Space>
                        </Card>

                        <Card size="small" title="配置">
                            <Space direction="vertical">
                                {Object.entries(state.config).map(([key, value]) => (
                                    <Text key={key}>{`${key}: ${JSON.stringify(value)}`}</Text>
                                ))}
                            </Space>
                        </Card>

                        <Card size="small" title="任务列表">
                            {renderTaskList(state.task_list)}
                        </Card>
                    </Space>
                </Panel>
            ))}
        </Collapse>
    );
    // 处理记录的改变
    const [isRecords, setIsRecords] = useState<boolean[]>(scheduleProps.map(item => item.is_record));
    const handleRecordChange = (checked: boolean, record: any, index:number) => {
        changeScheduleStateRecord(appConfig.userID, projectConfig.project_id, record.main_pipe_id, checked).then((value) => {
            setIsRecords(prevState => {
                const newRecords = [...prevState];
                newRecords[index] = value['is_record'] as boolean;
                return newRecords;
            })
        })
    };
    return (
        <Table
            dataSource={scheduleProps}
            columns={[
                {
                    title: "管道 ID",
                    dataIndex: "main_pipe_id",
                    key: "main_pipe_id",
                },
                {
                    title: "记录状态",
                    dataIndex: "is_record",
                    key: "is_record",
                    render: (_: boolean, record: any, index) => (
                        <Switch
                            checked={isRecords[index]}
                            checkedChildren="记录中"
                            unCheckedChildren="未记录"
                            onChange={(checked) => handleRecordChange(checked, record, index)}
                        />
                    ),
                },
                {
                    title: "执行时间",
                    dataIndex: "datetime",
                    key: "datetime",
                },
                {
                    title: "运行状态",
                    dataIndex: "run_state",
                    key: "run_state",
                    render: renderRunState,
                },
            ]}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
            }}
        />
    );
};
