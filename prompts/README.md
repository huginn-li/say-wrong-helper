# 说错话急救包 - AI 提示词文档

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `system-prompt.md` | 完整的系统提示词模板 |
| `../lib/ai.ts` | API 调用封装代码 |
| `../app/test-prompt/page.tsx` | 提示词测试页面 |

## 🚀 快速开始

### 1. 测试提示词效果

启动项目后访问：
```
http://localhost:3000/test-prompt
```

输入你的 API Key 即可测试不同场景下的 AI 回复效果。

### 2. 支持的 AI 提供商

| 提供商 | 优点 | 价格 | 推荐度 |
|--------|------|------|--------|
| **Kimi** | 中文最强，长文本，国内快 | ¥0.003-0.006/千字符 | ⭐⭐⭐⭐⭐ |
| **硅基流动** | 国内快，模型多，支持 DeepSeek | ¥0.001-0.002/千字符 | ⭐⭐⭐⭐⭐ |
| **DeepSeek** | 中文好，便宜 | ¥0.001-0.002/千字符 | ⭐⭐⭐⭐ |
| **Claude** | 效果最好 | 有免费额度 | ⭐⭐⭐⭐ |
| **OpenAI** | 稳定 | $0.002-0.03/千token | ⭐⭐⭐ |

### 3. 获取 API Key

- **Kimi（推荐）**: https://platform.moonshot.cn/ - 注册送 150元额度
- **硅基流动**: https://cloud.siliconflow.cn/ - 注册就送 2000万 Token
- **DeepSeek**: https://platform.deepseek.com/
- **Claude**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/

### 4. Kimi 配置说明

Kimi 是月之暗面出品的大模型，**中文理解和生成能力最强**：

**支持的模型：**
- `kimi-k2.5` - ⭐ 最新推荐，综合性能最强
- `kimi-k2` - 上一代，稳定可靠
- `kimi-latest` - 自动使用最新版本

**API 文档：** https://platform.moonshot.cn/docs
**Base URL：** `https://api.moonshot.cn/v1`

**配置示例：**
```bash
AI_PROVIDER=kimi
AI_API_KEY=sk-你的KimiKey
AI_MODEL=kimi-k2.5
```

### 5. 硅基流动配置说明

### 6. 硅基流动配置说明

硅基流动是国内优秀的 AI 模型聚合平台：

**支持的模型（2025年最新）：**
- `deepseek-ai/DeepSeek-V3` - ⭐ 最新推荐，性能更强
- `deepseek-ai/DeepSeek-R1` - 推理能力突出，适合复杂场景
- `THUDM/GLM-4-32B-0414` - 智谱最新大模型
- `THUDM/GLM-Z1-32B-0414` - 智谱推理版
- `Qwen/Qwen2.5-72B-Instruct` - 阿里通义千问
- `Qwen/QwQ-32B` - 千问推理模型
- `meta-llama/Llama-4-Maverick-17B-128E-Instruct` - Meta Llama 4
- 更多模型查看：https://siliconflow.cn/models

**API 格式：** 兼容 OpenAI
**Base URL：** `https://api.siliconflow.cn/v1`

**配置示例：**
```bash
AI_PROVIDER=siliconflow
AI_API_KEY=sk-你的硅基流动Key
AI_MODEL=deepseek-ai/DeepSeek-V2.5
```

## 📝 提示词核心设计

### 角色设定
```
温暖、细腻的朋友，不是心理咨询师
理解高敏感人群的社交焦虑
回复像知心姐姐/哥哥
```

### 三段式结构
1. **先抱抱你** - 情感安慰，让对方感到被理解
2. **如果补救，你可以说** - 实用话术，1-2句自然的话
3. **换个角度想** - 认知重构，打破灾难化思维

### 场景适配
- **职场** - 专业但不生硬
- **朋友** - 轻松随意，可用幽默
- **家人/伴侣** - 温暖亲密
- **陌生人** - 强调对方已忘记

## 🎨 提示词优化建议

### 如果你想调整语气
编辑 `system-prompt.md` 中的风格指南部分：

```markdown
## 回复风格指南

### 语气
- 温暖、轻柔、不带评判
- 像朋友聊天，不是心理咨询师
- 可以适当使用 emoji 增加亲切感
```

### 如果你想调整长度
修改字数限制：

```markdown
### 长度
- 每段 2-4 句话
- 总共不超过 200 字
```

### 如果你想添加新场景
在场景适配部分添加：

```markdown
### 新场景（如：网络社群）
- 特点：...
- 话术建议：...
```

## ✅ 测试用例

项目包含 3 个测试用例：

1. **职场场景** - 同事/会议/说错话
2. **朋友场景** - 朋友/闲聊/开玩笑
3. **亲密关系** - 伴侣/微信/忘记纪念日

## 🔧 集成到主应用

将 `lib/ai.ts` 中的 `generateAIResponse` 函数集成到主应用：

```tsx
import { generateAIResponse } from '@/lib/ai';

// 在生成结果时调用
const result = await generateAIResponse(
  {
    target: input.target,
    targetLabel: '领导',
    scene: input.scene,
    sceneLabel: '会议',
    whatWasSaid: input.whatWasSaid,
    fears: input.fears,
    severity: input.severity,
  },
  { provider: 'deepseek', apiKey: 'your-api-key' }
);
```

## 📊 预期效果

好的 AI 回复应该：
- ✅ 让用户感到被理解
- ✅ 提供具体可用的话术
- ✅ 帮助用户换个角度看问题
- ✅ 语气温暖，不机械
- ✅ 长度适中，不啰嗦

## 🐛 常见问题

### Q: AI 回复太生硬？
A: 检查 temperature 参数，建议 0.7-0.8，不要低于 0.5

### Q: 回复太长？
A: 在 system prompt 中强调"每段不超过2-3句话"

### Q: 话术不够自然？
A: 添加更多场景示例到 prompt 中

### Q: 中文显示有问题？
A: 确保 API 请求设置 `Content-Type: application/json; charset=utf-8`
