'use client';

import React, { useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
// 导入Quill CSS样式
import 'react-quill/dist/quill.snow.css';
// 导入更强大的HTML转译工具
import { htmlToPlainText as htmlToText } from '../utils/htmlTranslator';

// 动态导入 ReactQuill，禁用 SSR，并应用polyfill
const ReactQuill = dynamic(
  () => {
    // React 19 findDOMNode polyfill - 在导入react-quill前应用
    if (typeof window !== 'undefined') {
      const findDOMNodePolyfill = (instance: unknown) => {
        if (!instance) return null;
        if (instance instanceof Element || instance instanceof Text) return instance;
        
        if (instance && typeof instance === 'object') {
          const obj = instance as Record<string, unknown>;
          // @ts-expect-error - React internals access for compatibility
          if (obj._reactInternals?.stateNode) return obj._reactInternals.stateNode;
          // @ts-expect-error - React internals access for compatibility
          if (obj._reactInternalInstance?.stateNode) return obj._reactInternalInstance.stateNode;
          if (obj.base) return obj.base;
          // @ts-expect-error - Quill editor access for compatibility
          if (obj.editor?.container) return obj.editor.container;
        }
        return null;
      };

      // 简单的polyfill应用
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ReactDOM = require('react-dom');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(ReactDOM as any).findDOMNode) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ReactDOM as any).findDOMNode = findDOMNodePolyfill;
          console.log('✅ Applied findDOMNode polyfill');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((ReactDOM as any).default && !(ReactDOM as any).default.findDOMNode) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ReactDOM as any).default.findDOMNode = findDOMNodePolyfill;
          console.log('✅ Applied findDOMNode polyfill to default');
        }
      } catch (error) {
        console.warn('Could not apply polyfill:', error);
      }
    }
    
    return import('react-quill');
  },
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" style={{ minHeight: '200px' }}></div>
  }
);

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  onTextChange?: (plainText: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// 将HTML转换为纯文本的工具函数 - 使用增强版转译器
export const htmlToPlainText = (html: string): string => {
  return htmlToText(html);
};

// 将纯文本转换为基本HTML格式的工具函数
export const plainTextToHtml = (text: string): string => {
  return text.replace(/\n/g, '<br>');
};

export function QuillEditor({ 
  value, 
  onChange, 
  onTextChange,
  placeholder = "Edit your mark...", 
  className,
  minHeight = "250px"
}: QuillEditorProps) {
  // 扩展的Quill工具栏配置 - 包含header支持
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [2, false] }],                     // 标题组 - 支持h2和normal
      ['bold', 'italic', 'underline'],              // 文本样式组
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 列表组
      ['link', 'blockquote'],                       // 特殊格式组
      ['clean']                                     // 清除格式组
    ],
  }), []);

  const formats = [
    'header',                                       // 标题格式
    'bold', 'italic', 'underline',                 // 文本样式
    'list', 'bullet',                              // 列表格式
    'link', 'blockquote'                           // 特殊格式
  ];

  // 处理内容变化
  const handleChange = useCallback((content: string) => {
    onChange(content);
    
    // 如果提供了纯文本变化回调，同时返回纯文本
    if (onTextChange) {
      const plainText = htmlToPlainText(content);
      onTextChange(plainText);
    }
  }, [onChange, onTextChange]);

  return (
    <div className={className} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'white',
          border: 'none',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: minHeight,
        }}
      />
      <style jsx global>{`
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e4e4e7 !important;
          padding: 8px 12px !important;
        }
        .ql-container {
          border: none !important;
          flex: 1 !important;
          font-size: 16px !important;
          font-family: 'Inter', sans-serif !important;
        }
        .ql-editor {
          padding: 16px !important;
          line-height: 1.6 !important;
          min-height: ${minHeight} !important;
          font-size: 16px !important;
          color: #1f2937 !important;  /* 编辑器文字颜色 - 深灰色 */
          -webkit-text-size-adjust: 100% !important;
          -webkit-user-select: text !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af !important;
          font-style: normal !important;
        }
        
        /* Header样式 */
        .ql-editor h2 {
          font-size: 1.5em !important;
          font-weight: 600 !important;
          margin: 16px 0 8px 0 !important;
          line-height: 1.4 !important;
          color: #1f2937 !important;
        }
        
        /* 工具栏样式分组 */
        .ql-toolbar .ql-formats {
          margin-right: 8px !important;
        }
        .ql-toolbar .ql-formats:last-child {
          margin-right: 0 !important;
        }
        
        /* 工具栏按钮样式 */
        .ql-toolbar button {
          padding: 4px 6px !important;
          margin: 0 1px !important;
          border-radius: 3px !important;
        }
        .ql-toolbar button:hover {
          background-color: #f3f4f6 !important;
        }
        .ql-toolbar button.ql-active {
          background-color: #e5e7eb !important;
          color: #374151 !important;
        }
        
        /* Header下拉选择器样式 */
        .ql-toolbar .ql-header {
          width: 80px !important;
        }
        .ql-toolbar .ql-header .ql-picker-label {
          padding: 4px 8px !important;
          border-radius: 3px !important;
        }
        .ql-toolbar .ql-header .ql-picker-label:hover {
          background-color: #f3f4f6 !important;
        }
        .ql-toolbar .ql-header.ql-active .ql-picker-label {
          background-color: #e5e7eb !important;
        }
        
        /* 列表样式 */
        .ql-editor ol, .ql-editor ul {
          padding-left: 24px !important;
          margin: 8px 0 !important;
        }
        .ql-editor li {
          margin: 4px 0 !important;
        }
        
        /* 引用样式 */
        .ql-editor blockquote {
          border-left: 4px solid #e5e7eb !important;
          padding-left: 16px !important;
          margin: 12px 0 !important;
          font-style: italic !important;
          color: #6b7280 !important;
        }
        
        /* 链接样式 */
        .ql-editor a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }
        .ql-editor a:hover {
          color: #1d4ed8 !important;
        }
      `}</style>
    </div>
  );
}

export default QuillEditor; 