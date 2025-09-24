// 基于数据库类型的业务逻辑处理
// 从 database.ts 导入数据库类型，作为业务类型的基础

import { Database } from './database';

// =============================================================================
// 数据库类型别名 - 从 database.ts 派生
// =============================================================================

/**
 * 数据库查询结果类型（对应 SELECT 操作）
 * 直接从 Database 类型派生，确保与数据库结构一致
 */
export type ClipRow = Database['public']['Tables']['clips']['Row'];

/**
 * 数据库插入类型（对应 INSERT 操作）
 * 直接从 Database 类型派生，确保与数据库结构一致
 */
export type ClipInsert = Database['public']['Tables']['clips']['Insert'];

/**
 * 数据库更新类型（对应 UPDATE 操作）
 * 直接从 Database 类型派生，确保与数据库结构一致
 */
export type ClipUpdate = Database['public']['Tables']['clips']['Update'];

// =============================================================================
// 前端业务类型 - 基于数据库类型创建的安全业务类型
// =============================================================================

/**
 * 前端业务 Clip 类型
 * - 基于 ClipRow 创建，但进行了安全处理
 * - 不包含敏感信息（如 user_id）
 * - 字段经过处理，去除 null 值
 * - 专为前端展示和业务逻辑设计
 */
export interface Clip {
  id: ClipRow['id'];                              // number
  title: string;                                  // 处理了 null，保证不为空
  text_plain: string;                             // 处理了 null，保证不为空
  created_at: ClipRow['created_at'];              // string (ISO 时间)
  url?: string;                                   // 可选字段，去除了 null
  theme_name: ClipRow['theme_name'];              // ThemeKey
  category: ClipRow['category'];                  // string
  html_raw?: ClipRow['html_raw'];                 // string | null，保持原始格式
  // 注意：不包含 user_id，确保前端数据安全
}

// =============================================================================
// 类型转换函数 - 数据库类型与前端类型之间的转换
// =============================================================================

/**
 * 将数据库查询结果转换为前端业务类型
 * - 处理 null 值，转换为合适的默认值
 * - 移除敏感信息（user_id）
 * - 确保前端类型安全
 */
export function transformClipRow(row: ClipRow): Clip {
  return {
    id: row.id,
    title: row.title || '',           // null -> 空字符串
    text_plain: row.text_plain || '', // null -> 空字符串
    created_at: row.created_at,
    url: row.url || undefined,        // null -> undefined（可选字段）
    theme_name: row.theme_name,
    category: row.category,
    html_raw: row.html_raw,           // 保持 null 可能性
  };
}

/**
 * 将前端数据转换为数据库插入类型
 * - 添加必填的 user_id
 * - 处理可选字段的默认值
 * - 确保数据库插入安全
 */
export function transformToInsert(
  data: Partial<Clip> & { user_id: string },
  options?: {
    defaultTheme?: ClipRow['theme_name'];
    defaultCategory?: string;
  }
): ClipInsert {
  const { defaultTheme = 'Olivine', defaultCategory = 'default' } = options || {};
  
  return {
    title: data.title || null,
    text_plain: data.text_plain || null,
    url: data.url || null,
    user_id: data.user_id,
    theme_name: data.theme_name || defaultTheme,
    category: data.category || defaultCategory,
    html_raw: data.html_raw || null,
  };
}

/**
 * 将前端更新数据转换为数据库更新类型
 * - 过滤掉 undefined 字段
 * - 保持 null 值（表示清空字段）
 * - 确保更新操作安全
 */
export function transformToUpdate(data: Partial<Clip>): ClipUpdate {
  const update: ClipUpdate = {};
  
  // 只包含已定义的字段
  if (data.title !== undefined) update.title = data.title || null;
  if (data.text_plain !== undefined) update.text_plain = data.text_plain || null;
  if (data.url !== undefined) update.url = data.url || null;
  if (data.theme_name !== undefined) update.theme_name = data.theme_name;
  if (data.category !== undefined) update.category = data.category;
  if (data.html_raw !== undefined) update.html_raw = data.html_raw;
  
  return update;
}

// =============================================================================
// 类型验证函数 - 运行时类型检查
// =============================================================================

/**
 * 验证对象是否符合 Clip 类型
 * - 运行时类型检查
 * - 用于 API 响应验证
 */
export function isValidClip(obj: unknown): obj is Clip {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.text_plain === 'string' &&
    typeof obj.created_at === 'string' &&
    (obj.url === undefined || typeof obj.url === 'string') &&
    typeof obj.theme_name === 'string' &&
    typeof obj.category === 'string' &&
    (obj.html_raw === undefined || obj.html_raw === null || typeof obj.html_raw === 'string')
  );
}

/**
 * 验证对象是否符合 ClipRow 类型
 * - 运行时类型检查
 * - 用于数据库查询结果验证
 */
export function isValidClipRow(obj: unknown): obj is ClipRow {
  return (
    obj &&
    typeof obj.id === 'number' &&
    (obj.title === null || typeof obj.title === 'string') &&
    (obj.text_plain === null || typeof obj.text_plain === 'string') &&
    typeof obj.created_at === 'string' &&
    (obj.url === null || typeof obj.url === 'string') &&
    typeof obj.user_id === 'string' &&
    typeof obj.theme_name === 'string' &&
    typeof obj.category === 'string' &&
    (obj.html_raw === null || typeof obj.html_raw === 'string')
  );
}

// =============================================================================
// 便捷的批量转换函数
// =============================================================================

/**
 * 批量转换数据库查询结果为前端类型
 */
export function transformClipRows(rows: ClipRow[]): Clip[] {
  return rows.map(transformClipRow);
}

/**
 * 过滤和验证 Clip 数组
 */
export function validateClips(clips: unknown[]): Clip[] {
  return clips.filter(isValidClip);
}

// =============================================================================
// 类型导出 - 便于其他文件使用
// =============================================================================

// 默认导出主要的业务类型
export default Clip;
