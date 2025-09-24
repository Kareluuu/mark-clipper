"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Clip } from "@/lib/types";
import { QuillEditor, plainTextToHtml } from "@/lib/components/QuillEditor";
import { getEditContent } from '@/lib/utils/contentStrategy';
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
  const renderCountRef = useRef(0);
  const hasContentChangedRef = useRef(false); // 使用 ref 来避免严格模式的影响
  
  // 编辑器内容状态管理
  const [editorContent, setEditorContent] = useState<string>('');
  const [isEditorInitialized, setIsEditorInitialized] = useState<boolean>(false);
  const [plainTextContent, setPlainTextContent] = useState<string>('');
  const [hasContentChanged, setHasContentChanged] = useState<boolean>(false);
  
  // 追踪组件渲染次数
  renderCountRef.current += 1;
  
  // 编辑时获取合适的初始内容（按需转译）
  const initialContent = useMemo(() => {
    if (!clip) return '';
    return getEditContent(clip, {
      preserveFormatting: true // 编辑时保持原始格式完整性
    });
  }, [clip?.html_raw, clip?.text_plain]);

  // 初始化编辑器内容 - 只在真正需要初始化时才重置状态
  useEffect(() => {
    if (clip && isOpen) {
      console.log(`🔧 EditModal ${clip.id} 初始化:`, {
        initialContentLength: initialContent.length,
        clipHtmlRawLength: (clip.html_raw || '').length
      });
      
      setEditorContent(initialContent);
      setPlainTextContent(clip.text_plain || '');
      hasContentChangedRef.current = false;
      setHasContentChanged(false);
      setIsEditorInitialized(true); // 标记编辑器已初始化
    } else if (!isOpen) {
      // 模态框关闭时重置初始化状态
      setIsEditorInitialized(false);
    }
  }, [clip?.id, isOpen, initialContent]); // 添加 isOpen 和 initialContent 依赖
  
  // 可选：监控 hasContentChanged 状态变化（调试时启用）
  // useEffect(() => {
  //   console.log(`📊 EditModal ${clip?.id} hasContentChanged 状态变化:`, hasContentChanged);
  // }, [hasContentChanged, clip?.id]);
  
  // 处理编辑器内容变化 - 使用 useRef 避免闭包问题
  const handleEditorChange = useCallback((htmlContent: string) => {
    setEditorContent(htmlContent);
    
    // 只有在编辑器初始化完成后才进行变化检测
    if (!isEditorInitialized) {
      console.log(`⏳ EditModal ${clip?.id} 编辑器尚未初始化完成，跳过变化检测`);
      return;
    }
    
    // 检测HTML内容是否发生变化
    const originalHtml = clip?.html_raw || '';
    const htmlChanged = htmlContent !== originalHtml;
    const initialChanged = htmlContent !== initialContent;
    
    console.log(`🔍 EditModal ${clip?.id} 变化检测:`, {
      htmlChanged,
      initialChanged,
      willActivate: htmlChanged || initialChanged,
      htmlContentLength: htmlContent.length,
      originalLength: originalHtml.length,
      initialLength: initialContent.length,
      htmlContent: htmlContent.substring(0, 100),
      originalHtml: originalHtml.substring(0, 100),
      initialContent: initialContent.substring(0, 100)
    });
    
    // 更新状态，同时更新 ref 和 state 来避免严格模式影响
    if (htmlChanged || initialChanged) {
      hasContentChangedRef.current = true;
      setHasContentChanged(true);
      console.log(`✅ EditModal ${clip?.id} 检测到内容变化，启用保存按钮`);
    } else {
      hasContentChangedRef.current = false;
      setHasContentChanged(false);
      console.log(`❌ EditModal ${clip?.id} 未检测到内容变化，禁用保存按钮`);
    }
  }, [clip?.html_raw, initialContent, isEditorInitialized, clip?.id]);
  
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
    console.log(`🔄 EditModal ${clip?.id} handleSubmit 被调用:`, {
      hasClip: !!clip,
      isSubmitting,
      hasContentChanged,
      hasContentChangedRef: hasContentChangedRef.current,
      plainTextLength: plainTextContent?.length || 0,
      editorContentLength: editorContent?.length || 0
    });

    if (!clip || isSubmitting) {
      console.log(`❌ EditModal ${clip?.id} 提交条件不满足:`, {
        hasClip: !!clip,
        isSubmitting
      });
      return;
    }
    
    // 检查是否有内容变化，避免无意义的保存请求
    if (!hasContentChanged && !hasContentChangedRef.current) {
      console.log(`❌ EditModal ${clip?.id} 没有检测到内容变化，关闭模态框`);
      onClose();
      return;
    }
    
    console.log(`📡 EditModal ${clip?.id} 开始提交编辑:`, {
      plainText: plainTextContent,
      plainTextLength: plainTextContent?.length || 0,
      htmlContent: editorContent,
      htmlLength: editorContent?.length || 0,
      title: clip.title
    });
    
    if (onSubmit) {
      try {
        await onSubmit({
          text_plain: plainTextContent, // 纯文本内容
          html_raw: editorContent,      // 🚨 新增：保存HTML内容
          title: clip.title
        });
        console.log(`✅ EditModal ${clip?.id} 提交成功`);
        // onSubmit中已经处理了关闭逻辑，这里不需要再次调用onClose
      } catch (error) {
        console.error(`❌ EditModal ${clip?.id} 提交失败:`, error);
        // 错误处理已经在hook中完成，这里只是记录日志
      }
    } else {
      console.warn(`⚠️ EditModal ${clip?.id} onSubmit 函数未提供`);
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
              onClick={(e) => {
                console.log(`🖱️ EditModal ${clip?.id} Save按钮被点击:`, {
                  isDisabled: isSubmitting || !hasContentChangedRef.current,
                  isSubmitting,
                  hasContentChangedRef: hasContentChangedRef.current,
                  hasContentChanged,
                  buttonEnabled: hasContentChangedRef.current && !isSubmitting
                });
                if (!isSubmitting && hasContentChangedRef.current) {
                  handleSubmit();
                } else {
                  console.log(`⚠️ EditModal ${clip?.id} 按钮被点击但被禁用状态阻止执行`);
                }
              }}
              disabled={isSubmitting || !hasContentChangedRef.current}
              style={{
                opacity: (hasContentChangedRef.current && !isSubmitting) ? 1 : 0.7,
                backgroundColor: (hasContentChangedRef.current && !isSubmitting) ? '#18181b' : '#71717a',
                cursor: (isSubmitting || !hasContentChangedRef.current) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Saving...' : hasContentChangedRef.current ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 使用Portal渲染到body
  return createPortal(modalContent, document.body);
} 