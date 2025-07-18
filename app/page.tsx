"use client";

import React, { useEffect, useState } from "react";
import { useClips } from "../lib/useClips";

// 移除未使用的图片变量

function Logo() {
  return (
    <div className="h-19 w-auto">
      <img 
        alt="logo" 
        className="h-full w-auto object-contain" 
        src="/markat_logo.svg" 
      />
    </div>
  );
}

function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  return (
    <button
      className="relative flex items-center justify-center rounded-md w-14 h-14 hover:bg-zinc-100 transition p-0"
      style={{ minWidth: 56, minHeight: 56 }}
      onClick={onRefresh}
    >
      <img src="/button_icon_refresh.svg" alt="refresh" className="w-9 h-9" />
    </button>
  );
}

function CopyButton() {
  return (
    <button
      className="bg-zinc-900 flex flex-row items-center justify-center gap-2.5 px-4 py-2 rounded-md h-9"
      style={{ minHeight: 36, minWidth: 36 }}
    >
      <img src="/button_icon_copy.svg" alt="copy" className="w-5 h-5" />
      <span className="text-neutral-50 text-sm font-medium leading-5">Copy</span>
    </button>
  );
}

function Card({ title, text_plain }: { title: string; text_plain: string }) {
  return (
    <div className="bg-[#b1cd93] w-full p-6 mb-4">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row gap-2.5 w-full">
          <h2 className="text-[24px] font-bold text-black">{title}</h2>
        </div>
        <div className="flex flex-row gap-2.5 w-full">
          <p className="text-[16px] text-black">{text_plain}</p>
        </div>
        <div className="flex flex-row justify-end w-full">
          <CopyButton />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#E4E4E7] w-full p-6 mb-4 animate-pulse rounded-md">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row gap-2.5 w-full">
          <div className="h-7 w-2/3 bg-[#D4D4D8] rounded"></div>
        </div>
        <div className="flex flex-row gap-2.5 w-full">
          <div className="h-5 w-full bg-[#D4D4D8] rounded"></div>
        </div>
        <div className="flex flex-row justify-end w-full">
          <div className="h-9 w-20 bg-[#71717A] rounded"></div>
        </div>
      </div>
    </div>
  );
}

function Toast({ type, show }: { type: 'success' | 'fail'; show: boolean }) {
  // 动画：translate-y-12 -> translate-y-0 (出现)，translate-y-0 -> translate-y-12 (消失)
  return (
    <div
      className={`fixed bottom-0 left-0 w-full flex justify-center z-50 pointer-events-none transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-12'
      }`}
      style={{ height: 48 }}
    >
      <div
        className={
          type === 'success'
            ? 'bg-zinc-900 text-neutral-50 w-full flex items-center justify-center h-full px-0 py-0'
            : 'bg-red-500 text-neutral-50 w-full flex items-center justify-center h-full px-0 py-0'
        }
        style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: 14, lineHeight: '20px', height: 48 }}
      >
        <span className="text-sm font-semibold leading-5 select-none">
          {type === 'success' ? 'Updated!' : 'Please try again.'}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  // 删除 useSWR 相关内容，改为调用 useClips
  const { data: clips, error, isLoading, mutate } = useClips();
  const [skeletonCount, setSkeletonCount] = useState(4);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'fail' }>({ show: false, type: 'success' });

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

  // 首次加载时 skeletonCount 处理
  useEffect(() => {
    if (clips) setSkeletonCount(clips.length || 4);
  }, [clips]);

  return (
    <div className="bg-neutral-50 min-h-screen w-full flex flex-col items-center">
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col gap-6 pt-6 px-4 sm:px-6">
        <div className="flex flex-row items-center justify-between w-full h-16 sm:h-20 md:h-24 sticky top-0 z-10 bg-neutral-50">
          <div className="h-12 sm:h-16 md:h-20 flex items-center">
            <Logo />
          </div>
          <RefreshButton onRefresh={handleRefresh} />
        </div>
        <div className="flex flex-col gap-4 w-full">
          {isLoading ? (
            <div className="text-center text-gray-400">加载中...</div>
          ) : error ? (
            <div className="text-center text-red-400">加载失败</div>
          ) : !clips ? (
            Array.from({ length: skeletonCount }).map((_, idx) => <SkeletonCard key={idx} />)
          ) : (
            clips.map((clip) => (
              <Card key={clip.id} title={clip.title} text_plain={clip.text_plain} />
            ))
          )}
        </div>
      </div>
      <Toast type={toast.type} show={toast.show} />
    </div>
  );
}
