"use client";

import React, { useState } from "react";
import { Trash, SquarePen, Copy } from "lucide-react";
import styles from "./ActionButtons.module.css";

export interface EditButtonProps {
  onEdit: () => void;
  isLoading?: boolean;
}

export function EditButton({ onEdit, isLoading = false }: EditButtonProps) {
  return (
    <button
      className={styles.editButton}
      onClick={onEdit}
      disabled={isLoading}
    >
      <SquarePen className={styles.editButtonIcon} size={20} />
    </button>
  );
}

export interface DeleteButtonProps {
  onDelete: () => void;
  isLoading?: boolean;
}

export function DeleteButton({ onDelete, isLoading = false }: DeleteButtonProps) {
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
        <Trash className={styles.deleteButtonIcon} size={20} />
      )}
    </button>
  );
}

export interface CopyButtonProps {
  textToShare: string;
}

export function CopyButton({ textToShare }: CopyButtonProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (isCopying) return;
    
    setIsCopying(true);
    
    try {
      // 检查是否支持Web Share API
      if (navigator.share && navigator.canShare) {
        const shareData = {
          text: textToShare
        };

        // 检查数据是否可以分享
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      
      // Fallback: 复制到剪贴板
      await navigator.clipboard.writeText(textToShare);
      
      // 显示提示（可以考虑添加一个简单的toast提示）
      console.log('Content copied to clipboard');
      
    } catch (error) {
      console.error('Copy failed:', error);
      
      // 如果Web Share API失败，尝试复制到剪贴板
      try {
        await navigator.clipboard.writeText(textToShare);
        console.log('Content copied to clipboard');
      } catch (clipboardError) {
        console.error('Clipboard copy also failed:', clipboardError);
        
        // 最后的fallback：使用旧的复制方法
        const textArea = document.createElement('textarea');
        textArea.value = textToShare;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <button 
      className={styles.copyButton}
      onClick={handleCopy}
      disabled={isCopying}
    >
      <Copy className={styles.copyButtonIcon} size={20} />
    </button>
  );
} 