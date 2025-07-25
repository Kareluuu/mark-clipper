'use client';

import React, { useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

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

// 将HTML转换为纯文本的工具函数
export const htmlToPlainText = (html: string): string => {
  if (typeof window === 'undefined') return html;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
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
  // 简化的Quill工具栏配置 - 只保留基本功能
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote'],
      ['clean']
    ],
  }), []);

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'blockquote'
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
        /* 简化工具栏样式 */
        .ql-toolbar .ql-formats {
          margin-right: 8px !important;
        }
        .ql-toolbar button {
          padding: 4px 6px !important;
          margin: 0 1px !important;
        }
        .ql-toolbar button:hover {
          background-color: #f3f4f6 !important;
        }
        .ql-toolbar button.ql-active {
          background-color: #e5e7eb !important;
        }
      `}</style>
    </div>
  );
}

export default QuillEditor; 