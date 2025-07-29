'use client'

import React from "react";
import Image from "next/image";
import { RefreshCcw } from "lucide-react";
import UserMenu from "./UserMenu";
import styles from "./Nav.module.css";

interface NavProps {
  onRefresh: () => void;
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

export default function Nav({ onRefresh }: NavProps) {
  return (
    <div className={styles.nav} data-nav>
      <Logo />
      <div className={styles.actionsGroup}>
        <RefreshButton onRefresh={onRefresh} />
        <UserMenu />
      </div>
    </div>
  );
} 