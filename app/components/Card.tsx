"use client";

import React from "react";
import Image from "next/image";
import { Clip } from "@/lib/useClips";
import { getThemeConfig } from '@/lib/themes/themeConfig';
import { EditButton, DeleteButton, CopyButton } from "./ActionButtons";
import styles from "./Card.module.css";

export interface CardProps {
  clip: Clip;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  isDeleting?: boolean;
}

export function Card({ clip, onDelete, onEdit, isDeleting = false }: CardProps) {
  const theme = getThemeConfig(clip.theme_name);
  const style = theme.cssVariables as React.CSSProperties;

  return (
    <div style={style} className={`${styles.card} ${styles[theme.key]}`}>
      <div className={styles.cardContent}>
        {/* 主要内容区域 */}
        <div className={styles.cardMainSection}>
          {/* 引用图标 */}
          <Image 
            className={styles.cardIcon}
            src="/quote.svg" 
            alt="quote"
            width={20}
            height={20}
          />

          {/* 主要内容文本 */}
          <div className={styles.cardTextRow}>
            <p className={styles.cardText}>{clip.text_plain}</p>
          </div>

          {/* 分割线 */}
          <div className={styles.cardDivider}></div>

          {/* Ref区域 */}
          <div className={styles.cardRefSection}>
            {/* Ref标签 */}
            <div className={styles.cardRefBadge}>
              <div className={styles.cardRefText}>Ref</div>
            </div>
            
            {/* 标题 */}
            <div className={styles.cardTitleRow}>
              <div className={styles.cardTitle}>{clip.title}</div>
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