import React, { Component, ReactNode } from "react";
import { Alert } from "antd";

interface ErrorBoundaryProps {
  children: ReactNode; // 子组件
}

interface ErrorBoundaryState {
  hasError: boolean; // 是否发生错误
  error: Error | null; // 错误信息
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // 当子组件抛出错误时更新状态
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  // 错误记录可以发送到日志服务器
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    // 这里可以添加日志上报逻辑，比如将错误发送到远程服务
    // logErrorToService(error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      // 如果发生错误，渲染错误提示
      return (
        <Alert
          message="An error occurred"
          description={error?.message || "Something went wrong"}
          type="error"
          showIcon
        />
      );
    }

    // 如果没有错误，渲染正常子组件
    return this.props.children;
  }
}

export default ErrorBoundary;