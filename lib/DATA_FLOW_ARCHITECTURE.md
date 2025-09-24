# 数据流架构设计

## 🏗️ 分层架构总览

```
┌─────────────────────────────────────────────────────────┐
│ 🖥️  UI组件层 (Card.tsx, EditModal.tsx)                  │
│ - React组件渲染                                          │
│ - useMemo性能优化                                        │
│ - 用户交互处理                                           │
├─────────────────────────────────────────────────────────┤
│ 🎯 内容策略层 (contentStrategy.ts)                        │
│ - getDisplayContent() - 显示策略                         │
│ - getEditContent() - 编辑策略                            │
│ - 业务逻辑决策                                           │
├─────────────────────────────────────────────────────────┤
│ ⚡ 性能优化层 (contentCache.ts)                           │
│ - LRU缓存管理                                            │
│ - 转译结果缓存                                           │
│ - 内存优化                                              │
├─────────────────────────────────────────────────────────┤
│ 🔧 转译工具层 (htmlTranslator.ts)                        │
│ - HTML → Quill格式转换                                   │
│ - 纯文本提取                                             │
│ - 格式映射规则                                           │
├─────────────────────────────────────────────────────────┤
│ 📊 Hook数据层 (useClips.ts, useEditClip.ts)              │
│ - SWR数据获取                                            │
│ - 状态管理                                              │
│ - 只返回原始数据                                         │
├─────────────────────────────────────────────────────────┤
│ 🌐 API服务层 (/api/clips/route.ts)                       │
│ - HTTP请求处理                                           │
│ - 数据库操作                                             │
│ - 返回原始html_raw和text_plain                           │
├─────────────────────────────────────────────────────────┤
│ 💾 数据存储层 (Supabase)                                │
│ - 原始数据存储                                           │
│ - html_raw, text_plain字段                             │
│ - 用户认证和权限                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔄 数据流向

### 1. **数据获取流程**
```typescript
Database → API Layer → Hook Layer → Strategy Layer → UI Layer
   ↓           ↓          ↓            ↓             ↓
原始数据   →  原始响应  →  原始状态   →   转译处理   →  渲染显示
```

### 2. **具体示例**
```typescript
// 1️⃣ 数据库存储
{
  html_raw: '<h1>标题</h1><p>内容</p>',
  text_plain: '标题\n内容'
}

// 2️⃣ API返回 (不做任何处理)
return NextResponse.json(data); // 原样返回

// 3️⃣ Hook获取 (不做任何处理)
const { clips } = useClips(); // 返回原始数据

// 4️⃣ 策略层处理
const content = getDisplayContent(clip); // 按需转译

// 5️⃣ UI层渲染
<div dangerouslySetInnerHTML={{ __html: content }} />
```

## 🎯 各层职责明确

### 📊 Hook层 (`useClips.ts`) - 数据获取专家
```typescript
export function useClips(category?: string | null) {
  // ✅ 只负责数据获取，不进行转译
  const { data, error, mutate } = useSWR<Clip[]>(apiUrl, fetcher);

  return {
    clips: data || [],        // ✅ 返回原始数据
    isLoading: !error && !data,
    error,
    mutate
  };
}
```

**职责**：
- ✅ SWR数据获取和缓存
- ✅ 网络错误处理
- ✅ 认证状态管理
- ❌ **不进行**内容转译
- ❌ **不进行**格式处理

### 🌐 API层 (`/api/clips/route.ts`) - 数据传输专家
```typescript
// ✅ 返回完整的原始数据
.select('id, title, text_plain, html_raw, created_at, url, theme_name, category')
```

**职责**：
- ✅ HTTP请求处理
- ✅ 数据库CRUD操作
- ✅ 用户认证验证
- ✅ 返回原始`html_raw`和`text_plain`
- ❌ **不进行**内容转译
- ❌ **不进行**格式预处理

### 🎯 策略层 (`contentStrategy.ts`) - 业务逻辑专家
```typescript
export function getDisplayContent(clip: Clip): string {
  // ✅ 负责转译决策和处理
  if (clip.html_raw) {
    return translateHtmlToQuillCached(clip.html_raw);
  }
  return clip.text_plain || '';
}
```

**职责**：
- ✅ 内容获取策略决策
- ✅ HTML转译调用
- ✅ 错误处理和回退
- ✅ 缓存优化调用

### 🖥️ UI层 (Components) - 渲染专家
```typescript
// ✅ 按需转译，内存缓存
const displayContent = useMemo(() => {
  return getDisplayContent(clip);
}, [clip.html_raw, clip.text_plain]);
```

**职责**：
- ✅ React性能优化
- ✅ 用户交互处理
- ✅ 渲染逻辑
- ✅ 调用策略层函数

## 📈 优势说明

### 1. **关注点分离**
- 每层只负责自己的核心职责
- 修改一层不影响其他层
- 易于测试和维护

### 2. **性能优化**
- Hook层：SWR缓存网络请求
- 策略层：LRU缓存转译结果
- UI层：useMemo缓存渲染内容

### 3. **可扩展性**
- 新增转译策略无需修改数据层
- 新增缓存算法无需修改业务逻辑
- 新增UI组件可复用所有策略

### 4. **数据一致性**
- 数据库存储原始数据
- 转译在客户端按需进行
- 避免数据冗余和不一致

## 🔍 架构验证清单

### ✅ Hook层检查
- [ ] useClips只返回原始数据
- [ ] 不包含任何转译逻辑
- [ ] 专注于SWR配置和错误处理
- [ ] 保持函数纯净和可测试

### ✅ API层检查  
- [ ] 返回完整的html_raw字段
- [ ] 不进行任何格式预处理
- [ ] 保持服务端单一职责
- [ ] 只负责数据CRUD操作

### ✅ 策略层检查
- [ ] 包含所有转译逻辑
- [ ] 提供多种内容获取策略
- [ ] 集成缓存优化
- [ ] 完整的错误处理

### ✅ UI层检查
- [ ] 使用useMemo优化性能
- [ ] 调用策略层函数
- [ ] 专注于渲染和交互
- [ ] 不直接调用转译函数

## 🚀 最佳实践总结

1. **数据向上流，处理向下流**
   - 原始数据从底层向上传递
   - 转译处理在需要时向下调用

2. **按需转译，智能缓存**
   - 只在显示时进行转译
   - 多层缓存优化性能

3. **职责清晰，依赖明确**
   - 每层职责单一明确
   - 依赖关系清晰可控

4. **可测试，可维护**
   - 每层都可独立测试
   - 修改影响范围最小

这种架构设计确保了系统的可扩展性、可维护性和高性能！🎯
