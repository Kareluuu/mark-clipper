"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useClips, Clip } from "../lib/useClips";
import { getThemeConfig } from '@/lib/themes/themeConfig';
import logoStyles from "./components/Logo.module.css";
import styles from "./page.module.css";
import UserMenu from "./components/UserMenu";
import AuthGuard from "@/lib/components/AuthGuard";

function Logo() {
  return (
    <div className={logoStyles.logo}>
      <Image 
        alt="logo" 
        className={logoStyles.logoImage} 
        src="/markat_logo.svg"
        width={120}
        height={40}
        priority
      />
    </div>
  );
}

function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  return (
    <button
      className={styles.refreshButton}
      onClick={onRefresh}
    >
      <Image src="/button_icon_refresh.svg" alt="refresh" className={styles.refreshButtonIcon} width={16} height={16} />
    </button>
  );
}

function CopyButton() {
  return (
    <button className={styles.copyButton}>
      <Image src="/button_icon_copy.svg" alt="copy" className={styles.copyButtonIcon} width={16} height={16} />
      <span className={styles.copyButtonText}>Copy</span>
    </button>
  );
}

function DeleteButton({ onDelete, isLoading }: { onDelete: () => void; isLoading: boolean }) {
  return (
    <button
      className={styles.deleteButton}
      onClick={onDelete}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className={styles.deleteLoading}>
          <div className={styles.xlviLoader}>
            <div className={styles.xlviBox}></div>
            <div className={styles.xlviBox}></div>
            <div className={styles.xlviBox}></div>
          </div>
        </div>
      ) : (
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={styles.deleteButtonIcon}
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
        </svg>
      )}
    </button>
  );
}

function Card({ clip, onDelete, isDeleting }: { 
  clip: Clip; 
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
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
          <CopyButton />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={`${styles.skeletonCard} ${styles.skeletonShimmer}`}>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitleRow}>
          <div className={`${styles.skeletonTitle} ${styles.skeletonShimmer}`}></div>
        </div>
        <div className={styles.skeletonTextRow}>
          <div className={`${styles.skeletonText} ${styles.skeletonShimmer}`}></div>
        </div>
        <div className={styles.skeletonActionsRow}>
          <div className={`${styles.skeletonButton} ${styles.skeletonShimmer}`}></div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      {/* 手势图标 */}
      <div className={styles.emptyStateIcon}>👋</div>
      
      {/* 主要内容 */}
      <div className={styles.emptyStateContent}>
        {/* 标题 */}
        <h1 className={styles.emptyStateTitle}>Welcome to MarkAT!</h1>
        
        {/* 描述 */}
        <div className={styles.emptyStateDescription}>
          I am a SaaS application that allows you to{' '}
          <span style={{ fontWeight: 'bold', color: '#18181b' }}>mark any useful information on the web</span>.{' '}
          Please follow the steps below to complete your first task!
        </div>
        
        {/* 步骤 */}
        <div className={styles.emptyStateSteps}>
          {/* Step 1 */}
          <div className={styles.emptyStateStep}>
            <div className={styles.emptyStateStepBadge}>
              <p className={styles.emptyStateStepBadgeText}>Step 1</p>
            </div>
            <p className={styles.emptyStateStepDescription}>
              Download and install the MarkAT Chrome extension.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className={styles.emptyStateStep}>
            <div className={styles.emptyStateStepBadge}>
              <p className={styles.emptyStateStepBadgeText}>Step 2</p>
            </div>
            <p className={styles.emptyStateStepDescription}>
              Once the extension is installed, simply use your cursor to copy any piece of content, 
              and it will be marked and saved here!
            </p>
          </div>
        </div>
        
        {/* Call to action */}
        <p className={styles.emptyStateCallToAction}>Well, let us do it!</p>
      </div>
    </div>
  );
}

function Toast({ type, show }: { type: 'success' | 'fail' | 'deleted' | 'delete-fail'; show: boolean }) {
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return { className: styles.toastSuccess, text: 'Updated!' };
      case 'fail':
        return { className: styles.toastError, text: 'Please try again.' };
      case 'deleted':
        return { className: styles.toastSuccess, text: 'Deleted!' };
      case 'delete-fail':
        return { className: styles.toastError, text: 'Please try again.' };
      default:
        return { className: styles.toastSuccess, text: 'Updated!' };
    }
  };

  const { className, text } = getToastConfig();

  return (
    <div className={`${styles.toast} ${show ? styles.toastVisible : styles.toastHidden}`}>
      <div className={`${styles.toastContent} ${className}`}>
        <span className={styles.toastText}>
          {text}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  // 删除 useSWR 相关内容，改为调用 useClips
  const { data: clips, error, isLoading, mutate } = useClips();
  const [skeletonCount, setSkeletonCount] = useState(4);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'fail' | 'deleted' | 'delete-fail' }>({ show: false, type: 'success' });
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // 刷新按钮逻辑，调用 mutate 重新请求
  const handleRefresh = async () => {
    setRefreshing(true);
    setSkeletonCount(clips?.length || 4);
    setToast({ show: false, type: 'success' });
    try {
      await mutate();
      setToast({ show: true, type: 'success' });
    } catch {
      setToast({ show: true, type: 'fail' });
    }
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
    setRefreshing(false);
  };

  // 删除卡片逻辑
  const handleDelete = async (id: number) => {
    // 设置loading状态
    setDeletingIds(prev => new Set(prev).add(id));
    setToast({ show: false, type: 'deleted' });
    
    try {
      const response = await fetch(`/api/clips/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 删除成功，重新获取数据并显示成功Toast
        await mutate();
        setToast({ show: true, type: 'deleted' });
      } else {
        // 删除失败，显示失败Toast
        setToast({ show: true, type: 'delete-fail' });
      }
    } catch {
      // 网络错误等，显示失败Toast
      setToast({ show: true, type: 'delete-fail' });
    } finally {
      // 清除loading状态
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
    
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
  };

  // 首次加载时 skeletonCount 处理
  useEffect(() => {
    if (clips) setSkeletonCount(clips.length || 4);
  }, [clips]);

  return (
    <AuthGuard requireAuth={true}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.stickyHeader}>
            <div className={styles.logoContainer}>
              <Logo />
            </div>
            <div className={styles.headerActions}>
              <RefreshButton onRefresh={handleRefresh} />
              <UserMenu />
            </div>
          </div>
          <div className={styles.clipsContainer}>
            {(isLoading || refreshing) ? (
              Array.from({ length: skeletonCount }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : error ? (
              <div className={styles.errorText}>加载失败</div>
            ) : !clips ? (
              Array.from({ length: skeletonCount }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : clips.length === 0 ? (
              <EmptyState />
            ) : (
              clips.map((clip) => (
                <Card 
                  key={clip.id} 
                  clip={clip} 
                  onDelete={handleDelete}
                  isDeleting={deletingIds.has(clip.id)}
                />
              ))
            )}
          </div>
        </div>
        <Toast type={toast.type} show={toast.show} />
      </div>
    </AuthGuard>
  );
}
