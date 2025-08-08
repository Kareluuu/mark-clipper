'use client';

import React from 'react';

interface RichTextRendererProps {
  htmlContent?: string | null;
  fallbackText?: string | null;
  className?: string;
}

/**
 * 富文本渲染组件 - 用于在卡片中渲染Quill编辑器生成的HTML内容
 * 
 * @param htmlContent - Quill生成的HTML内容（存储在html_raw字段中）
 * @param fallbackText - 回退的纯文本内容（存储在text_plain字段中）
 * @param className - 自定义CSS类名
 */
export function RichTextRenderer({ 
  htmlContent, 
  fallbackText, 
  className = '' 
}: RichTextRendererProps) {
  // 如果有HTML内容，优先使用HTML渲染
  if (htmlContent && htmlContent.trim()) {
    return (
      <div 
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{
          // 继承父级的字体和颜色
          color: 'inherit',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          lineHeight: 'inherit'
        }}
      />
    );
  }
  
  // 回退到纯文本渲染
  return (
    <div className={className}>
      {fallbackText || ''}
    </div>
  );
}

/**
 * Quill样式 - 用于渲染Quill格式的HTML内容
 * 这些样式确保富文本内容在卡片中正确显示
 */
export const QuillContentStyles = () => (
  <style jsx global>{`
    .rich-text-content {
      /* 基础文本样式 */
      word-wrap: break-word;
      overflow-wrap: break-word;
      /* 强制继承父级颜色，覆盖Quill默认样式 */
      color: inherit !important;
    }
    
    /* 强制覆盖Quill默认的段落颜色 */
    .rich-text-content * {
      color: inherit !important;
    }
    
    /* Quill格式化样式 */
    .rich-text-content strong {
      font-weight: 600;
    }
    
    .rich-text-content em {
      font-style: italic;
    }
    
    .rich-text-content u {
      text-decoration: underline;
    }
    
    /* 列表样式 */
    .rich-text-content ol,
    .rich-text-content ul {
      margin: 0.5em 0;
      padding-left: 1.2em;
    }
    
    .rich-text-content ol li,
    .rich-text-content ul li {
      margin: 0.2em 0;
      line-height: inherit;
    }
    
    .rich-text-content ol {
      list-style-type: decimal;
    }
    
    .rich-text-content ul {
      list-style-type: disc;
    }
    
    /* 引用样式 */
    .rich-text-content blockquote {
      border-left: 3px solid #ccc;
      margin: 0.5em 0;
      padding-left: 1em;
      font-style: italic;
      color: inherit;
      opacity: 0.9;
    }
    
    /* 链接样式 */
    .rich-text-content a {
      color: inherit;
      text-decoration: underline;
      word-break: break-all;
    }
    
    .rich-text-content a:hover {
      color: inherit;
      opacity: 0.8;
    }
    
    /* 段落间距 */
    .rich-text-content p {
      margin: 0.3em 0;
      line-height: inherit;
    }
    
    .rich-text-content p:first-child {
      margin-top: 0;
    }
    
    .rich-text-content p:last-child {
      margin-bottom: 0;
    }
    
    /* 处理空段落 */
    .rich-text-content p:empty {
      margin: 0;
      height: 0;
    }
    
    /* 换行处理 */
    .rich-text-content br {
      line-height: inherit;
    }
  `}</style>
);

export default RichTextRenderer;
