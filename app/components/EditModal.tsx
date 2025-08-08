"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Clip } from "@/lib/useClips";
import { QuillEditor, plainTextToHtml } from "@/lib/components/QuillEditor";
import styles from "./EditModal.module.css";

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: Clip | null;
  onSubmit?: (updatedClip: Partial<Clip>) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditModal({ isOpen, onClose, clip, onSubmit, isSubmitting = false }: EditModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // 编辑器内容状态管理
  const [editorContent, setEditorContent] = useState<string>('');
  const [plainTextContent, setPlainTextContent] = useState<string>('');
  const [hasContentChanged, setHasContentChanged] = useState<boolean>(false);
  
  // 初始化编辑器内容
  useEffect(() => {
    if (clip && isOpen) {
      const initialHtml = clip.html_raw && clip.html_raw.trim().length > 0
        ? clip.html_raw
        : plainTextToHtml(clip.text_plain || '');
      setEditorContent(initialHtml);
      setPlainTextContent(clip.text_plain || '');
      setHasContentChanged(false);
    }
  }, [clip, isOpen]);
  
  // 处理编辑器内容变化
  const handleEditorChange = useCallback((htmlContent: string) => {
    setEditorContent(htmlContent);
  }, []);
  
  // 处理纯文本内容变化
  const handleTextChange = useCallback((plainText: string) => {
    setPlainTextContent(plainText);
    // 检测内容是否发生变化
    setHasContentChanged(plainText !== (clip?.text_plain || ''));
  }, [clip?.text_plain]);

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

  // 处理提交
  const handleSubmit = async () => {
    if (!clip || isSubmitting) return;
    
    // 检查是否有内容变化，避免无意义的保存请求
    if (!hasContentChanged) {
      console.log('No content changes detected, closing modal');
      onClose();
      return;
    }
    
    console.log('Submitting edited clip:', clip.id, 'with new content:', plainTextContent);
    
    if (onSubmit) {
      try {
        await onSubmit({
          text_plain: plainTextContent,
          html_raw: editorContent,
          title: clip.title
        });
        // onSubmit中已经处理了关闭逻辑，这里不需要再次调用onClose
      } catch (error) {
        console.error('Submit failed:', error);
        // 错误处理已经在hook中完成，这里只是记录日志
      }
    }
  };

  // 如果未打开或没有clip数据，不渲染
  if (!isOpen || !clip) {
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
          {/* 头部区域 */}
          <div className={styles.modalHeader}>
            <h1 id="modal-title" className={styles.modalTitle}>
              Edit this mark.
            </h1>
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
          </div>

          {/* Ref区域 */}
          <div className={styles.refSection}>
            <div className={styles.refBadge}>
              <span className={styles.refBadgeText}>Ref</span>
            </div>
            <p className={styles.refTitle}>{clip.title}</p>
          </div>

          {/* Quill富文本编辑器 */}
          <div className={styles.editorArea}>
            <QuillEditor
              value={editorContent}
              onChange={handleEditorChange}
              onTextChange={handleTextChange}
              placeholder="Edit your mark..."
              minHeight="200px"
            />
          </div>

          {/* 底部按钮 */}
          <div className={styles.modalFooter}>
            <button 
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting || !hasContentChanged}
              style={{
                opacity: (hasContentChanged && !isSubmitting) ? 1 : 0.7,
                backgroundColor: (hasContentChanged && !isSubmitting) ? '#18181b' : '#71717a',
                cursor: (isSubmitting || !hasContentChanged) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Saving...' : hasContentChanged ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 使用Portal渲染到body
  return createPortal(modalContent, document.body);
} 