'use client'

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { RefreshCcw, Hash } from "lucide-react";
import UserMenu from "./UserMenu";
import styles from "./Nav.module.css";

interface NavProps {
  onRefresh: () => void;
  onCategoriesClick?: () => void;
  selectedCategory?: string | null;
}

function Logo() {
  return (
    <div className={styles.logoContainer}>
      <Image 
        alt="logo" 
        className={styles.logoImage} 
        src="/nav_logo.svg"
        width={100}
        height={20}
        priority
      />
    </div>
  );
}

function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  return (
    <button className={styles.refreshButton} onClick={onRefresh}>
      <RefreshCcw className={styles.refreshButtonIcon} size={20} />
    </button>
  );
}

function CategoriesButton({ 
  onCategoriesClick, 
  selectedCategory,
  navRef
}: { 
  onCategoriesClick?: () => void;
  selectedCategory?: string | null;
  navRef: React.RefObject<HTMLDivElement | null>;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [displayText, setDisplayText] = useState<string>('');

  // 防抖函数
  const debounce = useCallback((func: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(func, delay);
    };
  }, []);

  // 计算单个字符的平均宽度（基于当前字体）
  const getCharacterWidth = useCallback((): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 8; // 默认值
    
    context.font = '500 14px Geist, sans-serif'; // 匹配CSS中的字体设置
    return context.measureText('中').width; // 使用中文字符测量，更准确
  }, []);

  // 动态计算可用宽度和文本截断
  const calculateLayout = useCallback(() => {
    if (!navRef.current || !buttonRef.current || !selectedCategory) return;

    const navWidth = navRef.current.offsetWidth;
    const navPadding = 32; // 1rem * 2 = 32px (左右padding)
    const gap = 24; // 1.5rem = 24px (gap between elements)
    
    // 计算其他固定元素的宽度
    const logoWidth = 100; // logoContainer fixed width
    const refreshButtonWidth = 36; // refreshButton fixed width
    const userMenuWidth = 36; // 估计UserMenu宽度
    const iconWidth = 20; // Hash icon width
    const buttonPadding = 24; // 0.5rem + 1rem = 24px (按钮内padding)
    
    // 计算category按钮文本可用的最大宽度
    const usedWidth = navPadding + logoWidth + gap + refreshButtonWidth + gap + iconWidth + buttonPadding + gap + userMenuWidth;
    const availableTextWidth = navWidth - usedWidth;
    
    // 确保最小宽度和最大宽度限制
    const minTextWidth = 40; // 最小文本宽度
    const maxTextWidthWhenSpaceEnough = getCharacterWidth() * 10; // 10个字符的宽度
    
    let finalMaxWidth: number;
    let finalDisplayText: string;
    
    if (availableTextWidth >= maxTextWidthWhenSpaceEnough) {
      // 宽度足够，限制在10个字符
      finalMaxWidth = maxTextWidthWhenSpaceEnough;
      finalDisplayText = selectedCategory.length > 10 
        ? selectedCategory.slice(0, 10) + '...' 
        : selectedCategory;
    } else if (availableTextWidth >= minTextWidth) {
      // 宽度不足，填充剩余空间
      finalMaxWidth = availableTextWidth;
      const charWidth = getCharacterWidth();
      const maxChars = Math.floor(availableTextWidth / charWidth) - 1; // 减1为省略号留空间
      
      if (maxChars > 0 && selectedCategory.length > maxChars) {
        finalDisplayText = selectedCategory.slice(0, maxChars) + '...';
      } else {
        finalDisplayText = selectedCategory;
      }
    } else {
      // 宽度太小，使用最小宽度
      finalMaxWidth = minTextWidth;
      finalDisplayText = selectedCategory.slice(0, 1) + '...';
    }
    
    setMaxWidth(finalMaxWidth);
    setDisplayText(finalDisplayText);
  }, [selectedCategory, navRef, getCharacterWidth]);

  // 防抖的计算函数
  const debouncedCalculateLayout = useCallback(
    debounce(calculateLayout, 100),
    [calculateLayout, debounce]
  );

  // 监听窗口大小变化和nav宽度变化
  useEffect(() => {
    if (!selectedCategory) return;

    // 初始计算
    calculateLayout();

    // ResizeObserver监听nav宽度变化
    let resizeObserver: ResizeObserver | null = null;
    
    if (navRef.current) {
      resizeObserver = new ResizeObserver(() => {
        debouncedCalculateLayout();
      });
      resizeObserver.observe(navRef.current);
    }

    // 监听窗口大小变化
    const handleResize = () => {
      debouncedCalculateLayout();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedCategory, calculateLayout, debouncedCalculateLayout, navRef]);

  const isSelected = selectedCategory !== null && selectedCategory !== undefined;

  return (
    <button 
      ref={buttonRef}
      className={`${styles.categoriesButton} ${isSelected ? styles.categoriesButtonSelected : ''}`} 
      onClick={onCategoriesClick}
      style={isSelected && maxWidth ? {
        '--category-text-max-width': `${maxWidth}px`
      } as React.CSSProperties : undefined}
    >
      <Hash className={styles.categoriesButtonIcon} size={20} />
      {isSelected && (
        <span className={styles.categoriesButtonText}>
          {displayText}
        </span>
      )}
    </button>
  );
}

export default function Nav({ onRefresh, onCategoriesClick, selectedCategory }: NavProps) {
  const navRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={navRef} className={styles.nav} data-nav>
      <Logo />
      <div className={styles.actionsGroup}>
        <RefreshButton onRefresh={onRefresh} />
        <CategoriesButton 
          onCategoriesClick={onCategoriesClick} 
          selectedCategory={selectedCategory}
          navRef={navRef}
        />
        <UserMenu />
      </div>
    </div>
  );
} 