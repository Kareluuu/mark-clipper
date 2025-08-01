"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Hash, Check } from "lucide-react";
import styles from "./CategoryModal.module.css";

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (category: string | null) => void;
  categories?: string[];
  selectedCategory?: string | null;
  isLoading?: boolean;
}

export function CategoryModal({ 
  isOpen, 
  onClose, 
  onCategorySelect, 
  categories = [],
  selectedCategory = null,
  isLoading = false 
}: CategoryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC键关闭功能
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // 防止背景滚动
      document.body.classList.add(styles.modalOpen);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.classList.remove(styles.modalOpen);
    };
  }, [isOpen, onClose]);

  // 背景点击关闭功能
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // 处理category选择 - 直接选择并关闭
  const handleCategoryClick = useCallback((category: string | null) => {
    onCategorySelect(category);
    onClose();
  }, [onCategorySelect, onClose]);

  // 如果未打开，不渲染
  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      {/* 背景模糊遮罩 */}
      <div className={styles.backdrop} aria-hidden="true" />
      
      {/* 模态框主容器 */}
      <div 
        ref={modalRef}
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.editorContainer}>
          {/* 关闭按钮 - 绝对定位在右上角 */}
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg 
              className={styles.closeButtonIcon}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Categories区域 - 包含标题和所有内容，整体沉底 */}
          <div className={styles.categoriesArea}>
            {/* 标题 */}
            <div className={styles.modalHeader}>
              <h1 id="modal-title" className={styles.modalTitle}>
                Categories
              </h1>
            </div>

            {/* Category按钮组 */}
            {isLoading ? (
              // Loading skeleton
              <div className={styles.categoryGrid}>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className={styles.categoryButtonSkeleton} />
                ))}
              </div>
            ) : (
              <div className={styles.categoryGrid}>
                {/* User created categories */}
                {categories.map((category) => (
                  <CategoryButton
                    key={category}
                    category={category}
                    isSelected={selectedCategory === category}
                    onClick={() => handleCategoryClick(category)}
                  />
                ))}
              </div>
            )}

            {/* View All 按钮 */}
            <div className={styles.viewAllSection}>
              <ViewAllButton 
                onClick={() => handleCategoryClick(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 使用Portal渲染到body
  return createPortal(modalContent, document.body);
}

// Category按钮组件
function CategoryButton({ 
  category, 
  isSelected,
  onClick 
}: { 
  category: string; 
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button 
      className={`${styles.categoryButton} ${isSelected ? styles.categoryButtonSelected : ''}`}
      onClick={onClick}
    >
      <div className={styles.categoryButtonContent}>
        {isSelected ? (
          <Check className={styles.categoryButtonIcon} size={16} />
        ) : (
          <Hash className={styles.categoryButtonIcon} size={16} />
        )}
        <span className={styles.categoryButtonText}>{category}</span>
      </div>
    </button>
  );
}

// View All按钮组件
function ViewAllButton({ 
  onClick 
}: { 
  onClick: () => void;
}) {
  return (
    <button 
      className={styles.viewAllButton}
      onClick={onClick}
    >
      <div className={styles.viewAllButtonContent}>
        <span className={styles.viewAllButtonText}>View All</span>
      </div>
    </button>
  );
}