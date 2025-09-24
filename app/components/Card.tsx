"use client";

import React, { useMemo } from "react";
import { Hash } from "lucide-react";
import { Clip } from "@/lib/types";
import { getThemeConfig } from '@/lib/themes/themeConfig';
import { getDisplayContentSync } from '@/lib/utils/contentStrategy';
import { useRenderingPerformance } from '@/lib/utils/renderingPerformanceMonitor';
import { determineRenderStrategy } from '@/lib/utils/contentOptimization';
import { EditButton, DeleteButton, CopyButton } from "./ActionButtons";
import styles from "./Card.module.css";

// 新的Quote图标组件（使用public/Quote icon.svg的内联版本）
function QuoteIcon() {
  return (
    <div className={styles.quoteIcon}>
      <svg width="31" height="18" viewBox="0 0 31 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 0C4.02944 0 0 4.02944 0 9H9V0Z" fill="currentColor"/>
        <rect y="9" width="9" height="9" fill="currentColor"/>
        <path d="M9 9L13.5 9V13.5V18L9 18V9Z" fill="currentColor"/>
        <path d="M26.5 0C21.5294 0 17.5 4.02944 17.5 9H26.5V0Z" fill="currentColor"/>
        <rect x="17.5" y="9" width="9" height="9" fill="currentColor"/>
        <path d="M26.5 9L31 9V13.5V18L26.5 18V9Z" fill="currentColor"/>
      </svg>
    </div>
  );
}

// Category badge组件 (使用lucide-react的Hash图标)
function CategoryBadge({ category }: { category: string }) {
  return (
    <div className={styles.categoryBadge}>
      <Hash size={14} strokeWidth={3} />
      <span>{category}</span>
    </div>
  );
}

export interface CardProps {
  clip: Clip;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  isDeleting?: boolean;
}

export function Card({ clip, onDelete, onEdit, isDeleting = false }: CardProps) {
  const theme = getThemeConfig(clip.theme_name);
  const style = theme.cssVariables as React.CSSProperties;

  // 性能监控 - 为每个Card实例分配唯一ID
  const componentId = `card-${clip.id}`;
  const { elementRef } = useRenderingPerformance(componentId, clip);

  // 按需转译，使用内存缓存优化性能
  const displayContent = useMemo(() => {
    const result = getDisplayContentSync(clip, { 
      fallbackToPlainText: true,
      logErrors: true  // 启用日志以便调试
    });
    
    // 调试信息
    if (clip.html_raw && clip.html_raw.includes('<h1')) {
      console.log(`🔍 Card调试 Clip ${clip.id}:`, {
        原始HTML: clip.html_raw.substring(0, 200),
        处理结果: result.substring(0, 200),
        是否还有h1: result.includes('<h1'),
        是否有h2: result.includes('<h2'),
        是否有style: result.includes('style=')
      });
    }
    
    return result;
  }, [clip.html_raw, clip.text_plain, clip.title]);

  // 获取纯文本内容用于回退显示（完整内容，不截断）
  const plainTextContent = useMemo(() => {
    return clip.text_plain || clip.title || '';
  }, [clip.text_plain, clip.title]);

  // 检查是否有HTML内容（用于决定渲染方式）
  const hasHtmlContent = useMemo(() => {
    // 检查转译后的displayContent是否包含HTML标签
    if (!displayContent || displayContent.trim() === '') {
      return false;
    }
    
    // 简单检查是否包含HTML标签
    const hasHtmlTags = /<[^>]+>/g.test(displayContent);
    
    return hasHtmlTags;
  }, [displayContent, clip.id]);

  // 分析内容复杂度并确定渲染策略
  const renderStrategy = useMemo(() => {
    return determineRenderStrategy(clip);
  }, [clip.html_raw, clip.text_plain]);

  // 处理Ref点击跳转
  const handleRefClick = () => {
    if (clip.url) {
      window.open(clip.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      ref={elementRef}
      style={style} 
      className={`${styles.card} ${styles[theme.key]}`}
      data-complexity={renderStrategy.useVirtualization ? 'extreme' : 'normal'}
    >
      <div className={styles.cardContent}>
        {/* 主要内容区域 */}
        <div className={styles.cardMainSection}>
          {/* 引用图标 */}
          <QuoteIcon />

          {/* Category badge - 只有当category不是default时才显示 */}
          {clip.category !== 'default' && (
            <CategoryBadge category={clip.category} />
          )}

          {/* 主要内容文本 - 支持HTML渲染和纯文本显示 */}
          <div className={styles.cardTextRow}>
            {hasHtmlContent ? (
              // 渲染HTML内容
              <div 
                className={`${styles.cardText} ${styles.htmlContent}`}
                dangerouslySetInnerHTML={{ __html: displayContent }}
              />
            ) : (
              // 渲染完整的纯文本内容
              <p className={styles.cardText}>{plainTextContent}</p>
            )}
          </div>

          {/* 分割线 */}
          <div className={styles.cardDivider}></div>

          {/* Ref区域 - 修改为一行显示并支持点击 */}
          <div 
            className={styles.cardRefSection}
            onClick={handleRefClick}
            style={{ cursor: clip.url ? 'pointer' : 'default' }}
          >
            {/* Ref标签 */}
            <div className={styles.cardRefBadge}>
              <div className={styles.cardRefText}>Ref</div>
            </div>
            
            {/* 标题 - 修改为一行显示，超出时省略 */}
            <div className={styles.cardTitleRow}>
              <div className={styles.cardTitle} title={clip.title}>{clip.title}</div>
            </div>
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className={styles.cardActionsRow}>
          <DeleteButton onDelete={() => onDelete(clip.id)} isLoading={isDeleting} />
          <div className={styles.cardActionsRight}>
            <EditButton onEdit={() => onEdit(clip.id)} isLoading={isDeleting} />
            <CopyButton textToShare={clip.text_plain} />
          </div>
        </div>
      </div>
    </div>
  );
} 