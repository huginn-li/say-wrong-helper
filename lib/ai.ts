// AI 回复生成函数

export interface AIRequestParams {
  target: string;
  targetLabel: string;
  scene: string;
  sceneLabel: string;
  whatWasSaid: string;
  fears: string[];
  severity: number;
}

export interface AIResponse {
  comfort: string;
  话术: string;
  重构: string;
  _raw?: string;
  _debug?: any;
}

// Kimi 专用系统提示 - 简洁直接，减少思考痕迹
const KIMI_SYSTEM_PROMPT = `你是用户最贴心的闺蜜/兄弟。按下面格式直接输出，不要说思考过程：

1️⃣ 先抱抱你
[安慰的话，像朋友一样吐槽+共情]

2️⃣ 如果补救，你可以说
轻松版：「带自嘲的话术」
真诚版：「简单直接的话术」

3️⃣ 换个角度想
[让对方觉得"好像确实没那么严重"的话]

要求：
- 话术要用「」包裹
- 禁止："表达""本意""澄清""歉意""不够清楚"
- 要像微信聊天一样自然、随意`;

// 其他 provider 的详细系统提示
const SYSTEM_PROMPT = `你是用户最铁的闺蜜/兄弟，说话接地气、不装X。

## ⚠️ 最重要：话术必须像真人微信聊天

我看你之前的回复太像客服了！这种绝对不行：
❌ 「刚才我可能表达得不够清楚，我的本意是...如果让你感到不舒服，我很抱歉」
❌ 「关于刚才的事情，我想向您澄清一下」
❌ "表达" "本意" "澄清" "歉意" 这些词一律不准用！

## 正确示范（要像这样说）

**朋友间会说的话：**
- 「卧槽我刚才说啥了，你别往心里去啊」
- 「完了完了，我那句话有歧义，我的锅我的锅」
- 「哎呀我刚才嘴比脑子快，其实是想夸你来着」
- 「别理我，我脑子刚才抽抽了🤦」

**职场里会说的话：**
- 「领导，刚那个数据我说岔了，实际是...」
- 「抱歉啊，刚那句话我没表达好，我是想说...」
- 「刚汇报有个数错了，我重新发您正确的」

**对伴侣会说的话：**
- 「宝贝我错了，刚那句话没过脑子，你别生气嘛」
- 「完了，我是不是说错话了？我其实是想说...」

**区别：真人说的话更短、更随意、带点小情绪。**

## 回复结构

### 1️⃣ 先抱抱你（安慰）
像朋友一样吐槽+共情，比如：
"害，谁还没个嘴瓢的时候。上次我xxx，现在不也活得好好的"

### 2️⃣ 如果补救，你可以说 ⚠️ 重点
必须给2个版本：

**版本A - 轻松版（适合关系好的）**
- 带点自嘲、小情绪、emoji
- 像随手发的微信
- 例：「完了完了，我那句话有歧义，你别想多啊哈哈」

**版本B - 真诚版（适合正式点的）**
- 简单直接，不绕弯子
- 承认错误+说明意图
- 例：「抱歉啊，刚那句话我说得不对，我是想说...」

**绝对禁止的词：** "表达" "本意" "澄清" "歉意" "不够清楚"

### 3️⃣ 换个角度想
给一个小观察，让对方觉得"好像确实没那么严重"

## 检查清单（输出前自检）
- [ ] 话术里有没有"表达""本意""澄清""歉意"这些词？有就换掉！
- [ ] 读起来像不像微信聊天？不像就改！
- [ ] 超过30字了吗？超过了就删！

记住：用户要的是能直接复制发出去的"人话"，不是作文！`;

// 构建用户提示词
function buildUserPrompt(params: AIRequestParams): string {
  return `对方身份: ${params.targetLabel}
场景: ${params.sceneLabel}
说错的话: ${params.whatWasSaid}
担心的问题: [${params.fears.join(', ')}]
焦虑程度: ${params.severity}/5

⚠️ 重要提醒：
不要说"刚才我可能表达得不够清楚，我的本意是...如果让你感到不舒服，我很抱歉"这种套路话！
要说像朋友间会说的那种自然的话，带点小情绪、小口头禅都可以。`;
}

// Kimi 专用简化用户提示
function buildKimiUserPrompt(params: AIRequestParams): string {
  return `场景：${params.sceneLabel}，对${params.targetLabel}说错话："${params.whatWasSaid}"，担心：${params.fears.join('、')}，焦虑程度${params.severity}/5。给我三段式回复。`;
}

// 智能解析 Kimi 响应（处理 reasoning_content）
function parseKimiResponse(rawContent: string): AIResponse {
  // 找分隔标记
  let content = rawContent;
  const markers = ['开始写：', '开始写:', '输出：', '输出:', '回复：', '回复:', '最终结果：', '最终结果:'];
  for (const marker of markers) {
    const idx = rawContent.indexOf(marker);
    if (idx !== -1) {
      content = rawContent.substring(idx + marker.length).trim();
      break;
    }
  }
  
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('```'));
  
  let comfort = '';
  let 话术 = '';
  let 重构 = '';
  let currentSection = '';
  
  for (const line of lines) {
    // 检测段落标记
    if (line.match(/^1[.、️]\s*/) || line.includes('抱抱') || line.includes('先抱抱')) {
      currentSection = 'comfort';
      continue;
    }
    if (line.match(/^2[.、️]\s*/) || line.includes('话术') || line.includes('补救') || line.includes('你可以说')) {
      currentSection = '话术';
      continue;
    }
    if (line.match(/^3[.、️]\s*/) || line.includes('角度') || line.includes('换个角度')) {
      currentSection = '重构';
      continue;
    }
    
    // 收集内容
    if (currentSection === 'comfort' && !line.match(/^[123]/)) {
      comfort += line + ' ';
    } else if (currentSection === '话术') {
      const match = line.match(/「([^」]+)」/);
      if (match && !话术) {
        话术 = match[0];
      }
    } else if (currentSection === '重构' && !line.match(/^[123]/)) {
      重构 += line + ' ';
    }
  }
  
  // 兜底策略
  if (!comfort) {
    for (const line of lines) {
      if (line.length >= 10 && !line.includes('要求') && !line.includes('禁止') && !line.includes('「')) {
        comfort = line;
        break;
      }
    }
  }
  
  if (!话术) {
    for (const line of lines) {
      const match = line.match(/「([^」]+)」/);
      if (match) {
        话术 = match[0];
        break;
      }
    }
  }
  
  if (!重构) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.length >= 15 && !line.includes('「') && !line.match(/^[123]/)) {
        重构 = line;
        break;
      }
    }
  }
  
  return {
    comfort: comfort.trim() || '说错话真的太正常了，别太自责啦！谁还没个嘴瓢的时候呢。',
    话术: 话术 || '「卧槽我刚才秃噜嘴了，你别往心里去啊」',
    重构: 重构.trim() || '试着换个角度想：对方可能根本没注意到这句话，就算注意到了，过几天也就忘了。',
    _raw: rawContent
  };
}

// DeepSeek API 调用
export async function generateResponseDeepSeek(
  params: AIRequestParams,
  apiKey: string
): Promise<AIResponse> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(params) }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return parseAIResponse(content);
}

// Claude API 调用
export async function generateResponseClaude(
  params: AIRequestParams,
  apiKey: string
): Promise<AIResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildUserPrompt(params) }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  return parseAIResponse(content);
}

// OpenAI API 调用
export async function generateResponseOpenAI(
  params: AIRequestParams,
  apiKey: string
): Promise<AIResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(params) }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return parseAIResponse(content);
}

// 硅基流动 API 调用
export async function generateResponseSiliconFlow(
  params: AIRequestParams,
  apiKey: string,
  model: string = 'deepseek-ai/DeepSeek-V3'
): Promise<AIResponse> {
  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(params) }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return parseAIResponse(content);
}

// Kimi (Moonshot) API 调用 - 新版，处理 reasoning_content
export async function generateResponseKimi(
  params: AIRequestParams,
  apiKey: string,
  model: string = 'kimi-k2.5'
): Promise<AIResponse> {
  console.log(`[Kimi] Calling API with model: ${model}`);
  
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: KIMI_SYSTEM_PROMPT },
        { role: 'user', content: buildKimiUserPrompt(params) }
      ],
      temperature: 1, // Kimi 必须 temperature=1
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Kimi] API Error:', response.status, errorText);
    let errorMessage = `Kimi API request failed: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch (e) {
      // 解析失败，使用原始错误信息
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const message = data.choices[0].message;
  
  // Kimi K2.5 可能返回 reasoning_content 而不是 content
  const rawContent = message.content || message.reasoning_content || '';
  const hasReasoning = !!message.reasoning_content;
  
  console.log('[Kimi] Response length:', rawContent.length, 'Has reasoning:', hasReasoning);
  
  // 使用专用解析器
  const result = parseKimiResponse(rawContent);
  
  return {
    ...result,
    _debug: {
      provider: 'kimi',
      model,
      hasReasoning,
      contentLength: message.content?.length || 0,
      reasoningLength: message.reasoning_content?.length || 0
    }
  };
}

// 主调用函数（根据配置选择 provider）
export async function generateAIResponse(
  params: AIRequestParams,
  config: {
    provider: 'deepseek' | 'claude' | 'openai' | 'siliconflow' | 'kimi';
    apiKey: string;
    model?: string;
  }
): Promise<AIResponse> {
  try {
    switch (config.provider) {
      case 'deepseek':
        return await generateResponseDeepSeek(params, config.apiKey);
      case 'claude':
        return await generateResponseClaude(params, config.apiKey);
      case 'openai':
        return await generateResponseOpenAI(params, config.apiKey);
      case 'siliconflow':
        return await generateResponseSiliconFlow(params, config.apiKey, config.model);
      case 'kimi':
        return await generateResponseKimi(params, config.apiKey, config.model);
      default:
        throw new Error('Unknown AI provider');
    }
  } catch (error: any) {
    console.error(`[AI] Error (${config.provider}):`, error.message);
    throw error;
  }
}

// 通用解析 AI 响应
function parseAIResponse(content: string): AIResponse {
  console.log('[Parse] Content length:', content.length);
  
  // 按段落分割（双换行或数字标题）
  const sections = content.split(/\n\n|\n(?=\d[.、]|\d️⃣|###|##|先|如果|换)/).filter(s => s.trim());
  
  // 默认值
  let comfort = '';
  let 话术 = '';
  let 重构 = '';
  
  // 智能提取
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    const lowerSection = section.toLowerCase();
    
    if (lowerSection.includes('抱抱') || lowerSection.includes('安慰') || 
        section.startsWith('1') || section.startsWith('1️⃣') || i === 0) {
      comfort = extractRealContent(section);
    } else if (lowerSection.includes('补救') || lowerSection.includes('可以说') || 
               lowerSection.includes('话术') || section.startsWith('2') || section.startsWith('2️⃣') || 
               section.includes('「') || section.includes('"')) {
      const quoteMatch = section.match(/[「"""]([^"""」]+)["""」]/);
      话术 = quoteMatch ? '「' + quoteMatch[1] + '」' : extractRealContent(section);
    } else if (lowerSection.includes('角度') || lowerSection.includes('想想') || 
               section.startsWith('3') || section.startsWith('3️⃣') || i >= 2) {
      重构 = extractRealContent(section);
    }
  }
  
  // 兜底
  if (!comfort && sections.length > 0) comfort = extractRealContent(sections[0]);
  if (!话术 && sections.length > 1) {
    const quoteMatch = sections[1].match(/[「"""]([^"""」]+)["""」]/);
    话术 = quoteMatch ? '「' + quoteMatch[1] + '」' : extractRealContent(sections[1]);
  }
  if (!重构 && sections.length > 2) 重构 = extractRealContent(sections[2]);
  
  if (!话术) {
    const quoteMatch = content.match(/[「"""]([^"""」]+)["""」]/);
    if (quoteMatch) 话术 = '「' + quoteMatch[1] + '」';
  }
  
  return {
    comfort: comfort || '别太在意，说错话是常有的事，对方可能不会放在心上。',
    话术: 话术 || '「哎呀我刚才嘴瓢了，你别往心里去啊」',
    重构: 重构 || '试着想想：对方可能根本没有注意到这句话，或者很快就忘记了。',
    _raw: content
  };
}

// 提取真实内容（去掉标题）
function extractRealContent(text: string): string {
  return text
    .replace(/^#{1,6}\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^\d[.、]\s*/, '')
    .replace(/^\d️⃣\s*/, '')
    .replace(/^先抱抱你[：:]?/i, '')
    .replace(/^如果补救.*你可以说[：:]?/i, '')
    .replace(/^换个角度想[：:]?/i, '')
    .replace(/^安慰[：:]?/i, '')
    .replace(/^话术[：:]?/i, '')
    .replace(/^[：:]/, '')
    .trim();
}
