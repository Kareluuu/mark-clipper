-- 数据库迁移：为clips表添加html_raw字段
-- 执行日期：2024年
-- 用途：支持Quill富文本编辑器的HTML内容存储

-- 1. 为clips表添加html_raw字段，用于存储Quill生成的HTML内容
ALTER TABLE clips 
ADD COLUMN html_raw TEXT DEFAULT NULL;

-- 2. 添加注释说明字段用途
COMMENT ON COLUMN clips.html_raw IS 'Quill富文本编辑器生成的HTML内容，用于在卡片中渲染富文本格式';

-- 3. 创建索引（可选，如果需要根据HTML内容进行搜索）
-- CREATE INDEX IF NOT EXISTS idx_clips_html_raw_gin ON clips USING gin(to_tsvector('english', html_raw));

-- 4. 验证迁移结果
-- 检查html_raw字段是否成功添加
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clips' AND column_name = 'html_raw';

-- 5. 显示clips表的所有字段，确认迁移成功
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clips' 
ORDER BY ordinal_position;
