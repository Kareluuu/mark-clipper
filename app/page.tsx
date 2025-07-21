"use client";

import React, { useEffect, useState } from "react";
import { useClips } from "../lib/useClips";
import logoStyles from "./components/Logo.module.css";
import styles from "./page.module.css";
import UserMenu from "./components/UserMenu";
import AuthGuard from "@/lib/components/AuthGuard";

function Logo() {
  return (
    <div className={logoStyles.logo}>
      <img 
        alt="logo" 
        className={logoStyles.logoImage} 
        src="/markat_logo.svg" 
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
      <img src="/button_icon_refresh.svg" alt="refresh" className={styles.refreshButtonIcon} />
    </button>
  );
}

function CopyButton() {
  return (
    <button className={styles.copyButton}>
      <img src="/button_icon_copy.svg" alt="copy" className={styles.copyButtonIcon} />
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

function Card({ id, title, text_plain, onDelete, isDeleting }: { 
  id: number; 
  title: string; 
  text_plain: string; 
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        {/* 主要内容区域 */}
        <div className={styles.cardMainSection}>
          {/* 引用图标 */}
          <img 
            className={styles.cardIcon}
            src="/quote.svg" 
            alt="quote" 
          />

          {/* 主要内容文本 */}
          <div className={styles.cardTextRow}>
            <p className={styles.cardText}>{text_plain}</p>
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
              <div className={styles.cardTitle}>{title}</div>
            </div>
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className={styles.cardActionsRow}>
          <DeleteButton onDelete={() => onDelete(id)} isLoading={isDeleting} />
          <CopyButton />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitleRow}>
          <div className={styles.skeletonTitle}></div>
        </div>
        <div className={styles.skeletonTextRow}>
          <div className={styles.skeletonText}></div>
        </div>
        <div className={styles.skeletonActionsRow}>
          <div className={styles.skeletonButton}></div>
        </div>
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

  // 刷新按钮逻辑，调用 mutate 重新请求
  const handleRefresh = async () => {
    setSkeletonCount(clips?.length || 4);
    setToast({ show: false, type: 'success' });
    try {
      await mutate();
      setToast({ show: true, type: 'success' });
    } catch {
      setToast({ show: true, type: 'fail' });
    }
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
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
    } catch (error) {
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
            {isLoading ? (
              <div className={styles.loadingText}>加载中...</div>
            ) : error ? (
              <div className={styles.errorText}>加载失败</div>
            ) : !clips ? (
              Array.from({ length: skeletonCount }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : (
              clips.map((clip) => (
                <Card 
                  key={clip.id} 
                  id={clip.id} 
                  title={clip.title} 
                  text_plain={clip.text_plain} 
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
