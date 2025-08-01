'use client'

import React from "react";
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
  selectedCategory 
}: { 
  onCategoriesClick?: () => void;
  selectedCategory?: string | null;
}) {
  // 截断逻辑：最多10个字符，超出部分用省略号
  const truncateText = (text: string, maxLength: number = 10): string => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const isSelected = selectedCategory !== null && selectedCategory !== undefined;
  const displayText = isSelected ? truncateText(selectedCategory) : null;

  return (
    <button 
      className={`${styles.categoriesButton} ${isSelected ? styles.categoriesButtonSelected : ''}`} 
      onClick={onCategoriesClick}
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
  return (
    <div className={styles.nav} data-nav>
      <Logo />
      <div className={styles.actionsGroup}>
        <RefreshButton onRefresh={onRefresh} />
        <CategoriesButton 
          onCategoriesClick={onCategoriesClick} 
          selectedCategory={selectedCategory}
        />
        <UserMenu />
      </div>
    </div>
  );
} 