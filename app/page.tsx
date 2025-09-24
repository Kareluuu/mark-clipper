"use client";

import React, { useEffect, useState } from "react";
import { useClips } from "../lib/useClips";
import { useEditClip } from "../lib/useEditClip";
import { useCategories } from "../lib/useCategories";
import { Card, Nav, EditModal, CategoryModal } from "./components";
import styles from "./page.module.css";
import AuthGuard from "@/lib/components/AuthGuard";

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonContent}>
        {/* 标题骨架 - 第一个元素 */}
        <div className={styles.skeletonTitle}></div>
        
        {/* 分割线 */}
        <div className={styles.skeletonDivider}></div>
        
        {/* 文本内容骨架 - 全宽 */}
        <div className={styles.skeletonText}></div>
        
        {/* 文本内容骨架 - 短宽度 */}
        <div className={styles.skeletonTextShort}></div>
      </div>
    </div>
  );
}

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

function Divider() {
  return (
    <div className={styles.divider}>
      <div className={styles.dividerLine}></div>
    </div>
  );
}

function EmptyState() {
  const handleInstallExtension = () => {
    window.open("https://chromewebstore.google.com/detail/pfgnjcdecedfbgkpgfbnmiddpdlanapk?utm_source=item-share-cb", "_blank");
  };

  const onboardingCards = [
    // 卡片1: 欢迎卡片
    <div key="welcome" className={styles.onboardingCard}>
      <div className={styles.cardContent}>
        <QuoteIcon />
        <div className={styles.cardTextContent}>
          <h2 className={styles.cardTitle}>Welcome to Marks!</h2>
          <p className={styles.cardDescription}>
            <span className={styles.textZinc600}>I am a SaaS application that allows you to </span>
            <span className={styles.textBold}>mark any useful information on the web</span>
            <span className={styles.textZinc800}>.</span>
            <span className={styles.textZinc600}> Please follow the steps below to complete your first task!</span>
          </p>
        </div>
      </div>
    </div>,

    // 卡片2: 安装扩展卡片
    <div key="install" className={styles.onboardingCard}>
      <div className={styles.cardContent}>
        <QuoteIcon />
        <div className={styles.cardTextContent}>
          <h2 className={styles.cardTitle}>STEP.1</h2>
          <p className={styles.cardDescription}>
            Please install the Marks Clipper chrome extension first.
          </p>
        </div>
        <Divider />
        <button 
          className={styles.installButton}
          onClick={handleInstallExtension}
        >
          <span className={styles.installButtonText}>Install Chrome Extension</span>
        </button>
      </div>
    </div>,

    // 卡片3: 使用说明卡片
    <div key="usage" className={styles.onboardingCard}>
      <div className={styles.cardContent}>
        <QuoteIcon />
        <div className={styles.cardTextContent}>
          <h2 className={styles.cardTitle}>STEP.2</h2>
          <p className={styles.cardDescription}>
            Once the extension is installed, simply use your cursor to copy any piece of content, and it will be marked and saved here!
          </p>
        </div>
        <Divider />
        <h3 className={styles.cardSubtitle}>Well, let us do it!</h3>
      </div>
    </div>
  ];

  return (
    <MasonryLayout>
      {onboardingCards}
    </MasonryLayout>
  );
}

function Toast({ type, show }: { type: 'success' | 'fail' | 'deleted' | 'delete-fail'; show: boolean }) {
  const [navWidth, setNavWidth] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // 检测是否为桌面端
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // 获取Nav宽度
  useEffect(() => {
    const getNavWidth = () => {
      const navElement = document.querySelector('[data-nav]') as HTMLElement;
      if (navElement) {
        const width = navElement.offsetWidth;
        setNavWidth(width);
      }
    };

    // 初始获取
    getNavWidth();

    // 监听窗口大小变化
    window.addEventListener('resize', getNavWidth);
    
    // 监听DOM变化（以防Nav内容变化）
    const observer = new MutationObserver(getNavWidth);
    const navElement = document.querySelector('[data-nav]');
    if (navElement) {
      observer.observe(navElement, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
    }

    return () => {
      window.removeEventListener('resize', getNavWidth);
      observer.disconnect();
    };
  }, []);

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

  // 计算Toast样式
  const toastStyle: React.CSSProperties = {
    width: isDesktop && navWidth ? `${navWidth}px` : undefined,
  };

  return (
    <div 
      className={`${styles.toast} ${show ? styles.toastVisible : styles.toastHidden}`}
      style={toastStyle}
    >
      <div className={`${styles.toastContent} ${className}`}>
        <div className={styles.toastWrapper}>
          <div className={styles.toastHeading}>
        <span className={styles.toastText}>
          {text}
        </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 双列瀑布流布局组件
function MasonryLayout({ children }: { children: React.ReactNode[] }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop || !children.length) {
    return <>{children}</>;
  }

  // 将卡片分成两列：左列（偶数索引）和右列（奇数索引）
  const leftColumn = children.filter((_, index) => index % 2 === 0);
  const rightColumn = children.filter((_, index) => index % 2 === 1);

  return (
    <>
      <div className={styles.masonryColumn}>
        {leftColumn}
      </div>
      <div className={styles.masonryColumn}>
        {rightColumn}
      </div>
    </>
  );
}

export default function Home() {
  // 数据获取
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { clips, error, isLoading, mutate } = useClips(selectedCategory);
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  // 编辑状态管理 - 使用专门的hook
  const {
    isOpen: editModalOpen,
    editingClip,
    isSubmitting: editSubmitting,
    openEdit,
    closeEdit,
    submitEdit,
  } = useEditClip(
    // 成功回调
    () => {
      console.log('Edit success');
      setToast({ show: true, type: 'success' });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
    },
    // 错误回调
    (error) => {
      console.error('Edit error:', error);
      setToast({ show: true, type: 'fail' });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
    },
    // mutate函数
    mutate
  );
  
  // UI状态管理
  const [skeletonCount, setSkeletonCount] = useState(4);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'fail' | 'deleted' | 'delete-fail' }>({ show: false, type: 'success' });
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  
  // CategoryModal状态管理
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

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

  // Categories按钮点击处理函数
  const handleCategoriesClick = () => {
    setCategoryModalOpen(true);
  };

  // 处理Category选择
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    console.log('Selected category:', category);
  };

  // 关闭CategoryModal
  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
  };

  // 编辑卡片逻辑 - 使用hook中的函数
  const handleEdit = (id: number) => {
    const clipToEdit = clips?.find(clip => clip.id === id);
    if (clipToEdit) {
      openEdit(clipToEdit);
    }
  };

  // 删除卡片逻辑
  const handleDelete = async (id: number) => {
    // 设置loading状态
    setDeletingIds(prev => new Set(prev).add(id));
    setToast({ show: false, type: 'deleted' });
    
    try {
      // 使用新的API客户端
      const { deleteClip } = await import('@/lib/api/clips');
      await deleteClip(id);
      
      // 删除成功，重新获取数据并显示成功Toast
      await mutate();
      setToast({ show: true, type: 'deleted' });
    } catch (error) {
      console.error('Delete failed:', error);
      // 删除失败，显示失败Toast
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
          <div className={styles.clipsContainer}>
            {(isLoading || refreshing || !clips) ? (
              <MasonryLayout>
                {Array.from({ length: skeletonCount }).map((_, idx) => <SkeletonCard key={idx} />)}
              </MasonryLayout>
            ) : error ? (
              <div className={styles.errorText}>加载失败</div>
            ) : clips.length === 0 ? (
              <EmptyState />
            ) : (
              <MasonryLayout>
                {clips.map((clip) => (
                <Card 
                  key={clip.id} 
                  clip={clip} 
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  isDeleting={deletingIds.has(clip.id)}
                />
                ))}
              </MasonryLayout>
            )}
          </div>
        </div>
        
                  {/* Nav组件 */}
          <Nav 
            onRefresh={handleRefresh} 
            onCategoriesClick={handleCategoriesClick} 
            selectedCategory={selectedCategory}
          />
        
        {/* Toast */}
        <Toast type={toast.type} show={toast.show} />
        
        {/* 编辑模态框 */}
        <EditModal
          isOpen={editModalOpen}
          onClose={closeEdit}
          clip={editingClip}
          onSubmit={submitEdit}
          isSubmitting={editSubmitting}
        />
        
        {/* Categories模态框 */}
        <CategoryModal
          isOpen={categoryModalOpen}
          onClose={handleCloseCategoryModal}
          onCategorySelect={handleCategorySelect}
          categories={categories}
          selectedCategory={selectedCategory}
          isLoading={categoriesLoading}
        />
      </div>
    </AuthGuard>
  );
}
