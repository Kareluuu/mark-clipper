"use client";

import React from "react";
import { Hash } from "lucide-react";
import { Clip } from "@/lib/useClips";
import { getThemeConfig } from '@/lib/themes/themeConfig';
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

  // 处理Ref点击跳转
  const handleRefClick = () => {
    if (clip.url) {
      window.open(clip.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={style} className={`${styles.card} ${styles[theme.key]}`}>
      <div className={styles.cardContent}>
        {/* 主要内容区域 */}
        <div className={styles.cardMainSection}>
          {/* 引用图标 */}
          <QuoteIcon />

          {/* Category badge - 只有当category不是default时才显示 */}
          {clip.category !== 'default' && (
            <CategoryBadge category={clip.category} />
          )}

          {/* 主要内容文本 */}
          <div className={styles.cardTextRow}>
            <p className={styles.cardText}>{clip.text_plain}</p>
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