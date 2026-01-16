import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Input, Space, Typography, Button } from "antd";
import type { InputProps } from "antd";
import type { TextAreaProps } from "antd/es/input";

const { Text } = Typography;

export type DoubleValue = [string, string]; // [topValue, jsCode]

export type DoubleInputRef = {
    focusFirst: () => void;
    focusSecond: () => void;
    blur: () => void;
    getValue: () => DoubleValue; // 返回已确认的正式值
    getDraft: () => DoubleValue; // 返回草稿值
};

export type JsValidationIssue = {
    type: "syntax" | "length" | "forbidden";
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
};

export type JsValidationConfig = {
    maxLength?: number;
    forbidden?: (string | RegExp)[];
    strict?: boolean;
    debounceMs?: number;
};

export type DoubleInputProps = {
    value?: DoubleValue;
    defaultValue?: DoubleValue;
    onChange?: (val: DoubleValue) => void;      // 仅“确认”后触发（requireConfirm=true）
    onConfirm?: (val: DoubleValue) => void;     // 点击确认后的回调（先于 onChange 或同时）
    onCancel?: (val: DoubleValue) => void;      // 点击取消，草稿回滚后的回调

    placeholder?: [string?, string?];
    disabled?: boolean;
    allowClear?: boolean;
    status?: InputProps["status"];
    size?: InputProps["size"];
    topInputProps?: Omit<InputProps, "value" | "defaultValue" | "onChange">;
    textareaProps?: Omit<TextAreaProps, "value" | "onChange">;
    onPressEnter?: (val: DoubleValue) => void;

    jsValidation?: JsValidationConfig;
    bottomLabel?: React.ReactNode;

    /** 是否必须点击确认才更新正式值（默认 true） */
    requireConfirm?: boolean;
    /** 有错误时禁用确认（默认 true） */
    disableConfirmOnError?: boolean;
    /** 按钮文案 */
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;

    className?: string;
    style?: React.CSSProperties;
};

type InputRef = React.ComponentRef<typeof Input>;

function defaultJsValidation(): Required<JsValidationConfig> {
    return {
        maxLength: 20_000,
        forbidden: [/eval\s*\(/i, /new\s+Function\s*\(/i, /document\./i, /window\./i, /globalThis\./i],
        strict: true,
        debounceMs: 300,
    };
}

function validateJsCode(code: string, cfg: Required<JsValidationConfig>): JsValidationIssue[] {
    const issues: JsValidationIssue[] = [];
    if (!code?.trim()) return issues;

    if (code.length > cfg.maxLength) {
        issues.push({ type: "length", message: `代码长度 ${code.length} 超过限制 ${cfg.maxLength}` });
    }

    for (const rule of cfg.forbidden) {
        if (typeof rule === "string") {
            if (code.includes(rule)) issues.push({ type: "forbidden", message: `包含禁用片段：${rule}`, snippet: rule });
        } else {
            const m = code.match(rule);
            if (m) issues.push({ type: "forbidden", message: `包含禁用模式：${rule}`, snippet: m[0] });
        }
    }

    try {
        const wrapped = cfg.strict ? `"use strict";\n${code}` : code;
        // 只做语法编译检查，不执行
        // eslint-disable-next-line no-new-func
        new Function(wrapped);
    } catch (err: any) {
        const msg = String(err?.message || err);
        const stack = String(err?.stack || "");
        let line: number | undefined;
        let column: number | undefined;
        const m = stack.match(/anonymous:(\d+):(\d+)/);
        if (m) {
            line = parseInt(m[1], 10) - (cfg.strict ? 1 : 0);
            column = parseInt(m[2], 10);
        }
        issues.push({ type: "syntax", message: `语法错误：${msg}`, line, column });
    }

    return issues;
}

export const DoubleInput = React.forwardRef<DoubleInputRef, DoubleInputProps>(
    (
        {
            value,
            defaultValue = ["", ""],
            onChange,
            onConfirm,
            onCancel,
            placeholder = ["", ""],
            disabled,
            allowClear,
            status,
            size,
            topInputProps,
            textareaProps,
            onPressEnter,
            className,
            style,
            jsValidation,
            bottomLabel = "JS 代码",
            requireConfirm = true,
            disableConfirmOnError = true,
            confirmText = "确认",
            cancelText = "取消",
        },
        ref
    ) => {
        const isControlled = value !== undefined;
        const [inner, setInner] = useState<DoubleValue>(defaultValue);
        const committed = isControlled ? (value as DoubleValue) : inner;

        // 草稿态：编辑时改这里，确认后才提交到 committed
        const [draft, setDraft] = useState<DoubleValue>(committed);

        // 外部 value 变化时，同步草稿
        useEffect(() => {
            setDraft(committed);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [committed[0], committed[1]]);

        const cfg = useMemo(() => ({ ...defaultJsValidation(), ...(jsValidation || {}) }), [jsValidation]);

        const firstRef = useRef<InputRef>(null);
        const secondRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            focusFirst: () => firstRef.current?.focus(),
            focusSecond: () => secondRef.current?.focus(),
            blur: () => {
                firstRef.current?.blur();
                secondRef.current?.blur();
            },
            getValue: () => committed, // 已确认值
            getDraft: () => draft,     // 草稿值
        }));

        const setDraftPart = (idx: 0 | 1) => (next: string) => {
            const nextDraft: DoubleValue = idx === 0 ? [next, draft[1]] : [draft[0], next];
            setDraft(nextDraft);

            // 不要求确认时，实时向外同步（与旧行为一致）
            if (!requireConfirm) {
                if (!isControlled) setInner(nextDraft);
                onChange?.(nextDraft);
            }
        };

        const handleTopEnter = () => onPressEnter?.(draft);

        const handleCodeKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
            const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
            const ok = isMac ? e.metaKey && e.key === "Enter" : e.ctrlKey && e.key === "Enter";
            if (ok) {
                e.preventDefault();
                doConfirm();
            }
        };

        // 校验（针对 draft[1]）
        const [issues, setIssues] = useState<JsValidationIssue[]>([]);
        useEffect(() => {
            const t = setTimeout(() => setIssues(validateJsCode(draft[1], cfg)), cfg.debounceMs);
            return () => clearTimeout(t);
        }, [draft[1], cfg]);

        const derivedStatus: InputProps["status"] =
            status ?? (issues.length > 0 ? "error" : undefined);

        // 提交确认
        const doConfirm = () => {
            if (requireConfirm && disableConfirmOnError && issues.length > 0) return;
            onConfirm?.(draft);
            if (!isControlled) setInner(draft);
            onChange?.(draft);
        };

        // 取消恢复
        const doCancel = () => {
            setDraft(committed);
            onCancel?.(committed);
        };

        return (
            <div className={className} style={style}>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    {/* 顶部：单行输入（草稿） */}
                    <Input
                        ref={firstRef}
                        value={draft[0]}
                        onChange={(e) => setDraftPart(0)(e.target.value)}
                        placeholder={placeholder[0]}
                        disabled={disabled}
                        allowClear={allowClear}
                        status={derivedStatus}
                        size={size}
                        onPressEnter={handleTopEnter}
                        {...topInputProps}
                    />

                    {/* 标签/说明 */}
                    {bottomLabel ? (
                        <div style={{ fontSize: 12, color: "#888" }}>{bottomLabel}</div>
                    ) : null}

                    {/* 底部：多行 JS 代码（草稿） */}
                    <Input.TextArea
                        ref={secondRef}
                        value={draft[1]}
                        onChange={(e) => setDraftPart(1)(e.target.value)}
                        placeholder={placeholder[1] ?? "在此输入 JS 代码（Ctrl/⌘+Enter 确认）"}
                        disabled={disabled}
                        status={derivedStatus}
                        autoSize={{ minRows: 6, maxRows: 20 }}
                        onKeyDown={handleCodeKeyDown}
                        {...textareaProps}
                    />

                    {/* 校验信息展示（结构化） */}
                    {issues.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                            {issues.map((it, idx) => (
                                <div key={idx} style={{ lineHeight: 1.6 }}>
                                    <Text type="danger">
                                        [{it.type}]
                                        {it.line !== undefined ? ` L${it.line}` : ""}
                                        {it.column !== undefined ? ` C${it.column}` : ""}：
                                        {it.message}
                                        {it.snippet ? ` → ${it.snippet}` : ""}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 操作区：确认 / 取消 */}
                    {requireConfirm && (
                        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                            <Button onClick={doCancel} disabled={disabled}>
                                {cancelText}
                            </Button>
                            <Button
                                type="primary"
                                onClick={doConfirm}
                                disabled={disabled || (disableConfirmOnError && issues.length > 0)}
                            >
                                {confirmText}
                            </Button>
                        </Space>
                    )}
                </Space>
            </div>
        );
    }
);
