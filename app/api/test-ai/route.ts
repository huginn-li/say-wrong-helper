import { NextRequest, NextResponse } from "next/server";

// 智能解析 Kimi 的思考内容，提取三段式回复
function parseKimiResponse(rawContent: string) {
  // 找实际的回复部分（通常在 "开始写：" 或 "回复：" 之后）
  let content = rawContent;
  
  // 找分隔标记
  const markers = ['开始写：', '开始写:', '输出：', '输出:', '回复：', '回复:', '最终结果：', '最终结果:'];
  for (const marker of markers) {
    const idx = rawContent.indexOf(marker);
    if (idx !== -1) {
      content = rawContent.substring(idx + marker.length).trim();
      break;
    }
  }
  
  // 按行分割并过滤
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('```'));
  
  let comfort = '';
  let 话术 = '';
  let 重构 = '';
  
  // 状态机解析
  let currentSection = '';
  
  for (const line of lines) {
    // 检测段落标记
    if (line.match(/^1[.、️]\s*/) || line.includes('抱抱') || line.includes('先抱抱') || line.includes('安慰')) {
      currentSection = 'comfort';
      continue;
    }
    if (line.match(/^2[.、️]\s*/) || line.includes('话术') || line.includes('补救') || line.includes('你可以说')) {
      currentSection = '话术';
      continue;
    }
    if (line.match(/^3[.、️]\s*/) || line.includes('角度') || line.includes('换个角度') || line.includes('想想')) {
      currentSection = '重构';
      continue;
    }
    
    // 收集内容
    if (currentSection === 'comfort') {
      // 跳过标记行本身
      if (!line.match(/^[123][.、️]/) && !line.includes('️')) {
        comfort += line + ' ';
      }
    } else if (currentSection === '话术') {
      // 提取引号内容
      const match = line.match(/「([^」]+)」/);
      if (match && !话术) {
        话术 = match[0]; // 保留完整的「内容」
      }
    } else if (currentSection === '重构') {
      if (!line.match(/^[123][.、️]/)) {
        重构 += line + ' ';
      }
    }
  }
  
  // 清理
  comfort = comfort.trim();
  重构 = 重构.trim();
  
  // 兜底策略
  if (!comfort) {
    // 找第一个有效的句子（至少10字，不是指令）
    for (const line of lines) {
      if (line.length >= 10 && !line.includes('要求') && !line.includes('禁止') && !line.includes('「')) {
        comfort = line;
        break;
      }
    }
  }
  
  if (!话术) {
    // 找任何带引号的内容
    for (const line of lines) {
      const match = line.match(/「([^」]+)」/);
      if (match) {
        话术 = match[0]; // 保留完整的「内容」
        break;
      }
    }
  }
  
  if (!重构) {
    // 找最后一段非指令内容
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.length >= 15 && !line.includes('「') && !line.match(/^[123]/)) {
        重构 = line;
        break;
      }
    }
  }
  
  return {
    comfort: comfort || '说错话真的太正常了，别太自责啦！谁还没个嘴瓢的时候呢。',
    话术: 话术 || '「卧槽我刚才秃噜嘴了，你别往心里去啊」',
    重构: 重构 || '试着换个角度想：对方可能根本没注意到这句话，就算注意到了，过几天也就忘了。'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, apiKey, model, ...params } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key 不能为空" },
        { status: 400 }
      );
    }

    if (provider !== 'kimi') {
      return NextResponse.json(
        { error: `Provider ${provider} not supported` },
        { status: 400 }
      );
    }

    // 调用 Kimi API
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'kimi-k2.5',
        messages: [
          { 
            role: 'system', 
            content: '你是用户最贴心的闺蜜/兄弟。按下面格式直接输出，不要说思考过程：\n\n1️⃣ 先抱抱你\n[安慰的话，像朋友一样吐槽+共情]\n\n2️⃣ 如果补救，你可以说\n轻松版：「带自嘲的话术」\n真诚版：「简单直接的话术」\n\n3️⃣ 换个角度想\n[让对方觉得"好像确实没那么严重"的话]' 
          },
          { 
            role: 'user', 
            content: `场景：${params.sceneLabel || params.scene}，对${params.targetLabel || params.target}说错话："${params.whatWasSaid}"，担心：${(params.fears || []).join('、')}。给我三段式回复。` 
          }
        ],
        temperature: 1,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Kimi API Error:', error);
      throw new Error(`API failed: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;
    
    // Kimi K2.5 可能返回 reasoning_content
    const rawContent = message.content || message.reasoning_content || '';
    
    console.log('Raw content length:', rawContent.length);
    console.log('First 300 chars:', rawContent.substring(0, 300));
    
    // 解析
    const result = parseKimiResponse(rawContent);
    
    console.log('Parsed:', result);

    return NextResponse.json({
      ...result,
      _raw: rawContent.substring(0, 500),
      _debug: { 
        provider, 
        model, 
        rawLength: rawContent.length,
        hasContent: !!message.content,
        hasReasoning: !!message.reasoning_content
      }
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
