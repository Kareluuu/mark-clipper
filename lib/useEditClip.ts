import { useState, useCallback } from 'react';
import { Clip } from './useClips';

export interface EditState {
  isOpen: boolean;
  editingClip: Clip | null;
  isSubmitting: boolean;
}

export interface EditActions {
  openEdit: (clip: Clip) => void;
  closeEdit: () => void;
  submitEdit: (updatedClip: Partial<Clip>) => Promise<void>;
}

export interface UseEditClipReturn extends EditState, EditActions {}

export function useEditClip(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
  mutate?: () => Promise<unknown>
) {
  // 编辑状态管理
  const [editState, setEditState] = useState<EditState>({
    isOpen: false,
    editingClip: null,
    isSubmitting: false,
  });

  // 打开编辑功能
  const openEdit = useCallback((clip: Clip) => {
    console.log('Opening edit for clip:', clip.id);
    setEditState({
      isOpen: true,
      editingClip: clip,
      isSubmitting: false,
    });
  }, []);

  // 关闭编辑功能
  const closeEdit = useCallback(() => {
    console.log('Closing edit modal');
    setEditState({
      isOpen: false,
      editingClip: null,
      isSubmitting: false,
    });
  }, []);

  // 提交编辑功能
  const submitEdit = useCallback(async (updatedClip: Partial<Clip>) => {
    if (!editState.editingClip) {
      console.error('No clip is being edited');
      return;
    }

    const clipId = editState.editingClip.id;
    console.log('Submitting edit for clip:', clipId, updatedClip);

    // 设置提交中状态
    setEditState(prev => ({
      ...prev,
      isSubmitting: true,
    }));

    try {
      // 使用新的API客户端
      const { updateClip } = await import('@/lib/api/clips');
      
      await updateClip(clipId, updatedClip);

      console.log('✅ Clip updated successfully');

      // 重新获取数据
      if (mutate) {
        await mutate();
      }

      // 关闭编辑模态框
      closeEdit();

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Failed to update clip:', error);
      
      // 重置提交状态但保持模态框打开
      setEditState(prev => ({
        ...prev,
        isSubmitting: false,
      }));

      // 调用错误回调
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }, [editState.editingClip, closeEdit, mutate, onSuccess, onError]);

  return {
    // 状态
    isOpen: editState.isOpen,
    editingClip: editState.editingClip,
    isSubmitting: editState.isSubmitting,
    
    // 操作
    openEdit,
    closeEdit,
    submitEdit,
  };
} 