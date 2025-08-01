-- 数据库迁移：为clips表添加category字段
-- 执行日期：2024年

-- 1. 为clips表添加category字段，类型为VARCHAR(30)，默认值为'default'
ALTER TABLE clips 
ADD COLUMN category VARCHAR(30) DEFAULT 'default' NOT NULL;

-- 2. 为现有记录更新category字段值为'default'
-- 注意：由于我们设置了DEFAULT 'default'，新记录会自动获得默认值
-- 但为了确保现有记录也有正确的值，我们执行更新操作
UPDATE clips 
SET category = 'default' 
WHERE category IS NULL OR category = '';

-- 3. 添加索引以提高查询性能（可选）
CREATE INDEX IF NOT EXISTS idx_clips_category ON clips(category);

-- 4. 验证迁移结果
-- 检查是否有任何记录的category字段为空
SELECT COUNT(*) as null_category_count 
FROM clips 
WHERE category IS NULL OR category = '';

-- 显示category字段的统计信息
SELECT category, COUNT(*) as count 
FROM clips 
GROUP BY category 
ORDER BY count DESC; 