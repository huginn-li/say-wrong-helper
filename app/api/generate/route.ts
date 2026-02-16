import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const { targetLabel, sceneLabel, whatWasSaid, fears, severity } = body;
    
    // 2. 检查 API Key
    const apiKey = process.env.KIMI_API_KEY;
    
    // 3. 如果没有 API Key，返回测试数据
    if (!apiKey) {
      return NextResponse.json({
        comfort: '（测试模式）说错话真的太正常了，别太自责啦！谁还没个嘴瓢的时候呢。',
        话术: '「哎呀我刚才嘴瓢了，你别往心里去啊」',
        重构: '（测试模式）试着换个角度想：对方可能根本没注意到这句话。',
        _debug: 'API Key not configured'
      });
    }
    
    // 4. 调用 Kimi API
    try {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'kimi-k2.5',
          messages: [
            { 
              role: 'system', 
              content: '你是用户的闺蜜。直接输出：1先抱抱你 2话术（用「」） 3换个角度想。不要说思考过程。' 
            },
            { 
              role: 'user', 
              content: `${sceneLabel}对${targetLabel}说错："${whatWasSaid}"，担心${fears.join('、')}，焦虑${severity}/5。给三段式回复。` 
            }
          ],
          temperature: 1,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ 
          error: `Kimi API error: ${response.status}`, 
          details: errorText 
        }, { status: 502 });
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || '';
      
      // 5. 简单解析
      const result = parseResponse(rawContent);
      
      return NextResponse.json(result);
      
    } catch (apiError: any) {
      return NextResponse.json({ 
        error: "API call failed", 
        message: apiError.message 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Server error", 
      message: error.message 
    }, { status: 500 });
  }
}

// 简化解析
function parseResponse(raw: string) {
  const lines = raw.split('\n').filter(l => l.trim());
  
  let comfort = '';
  let 话术 = '';
  let 重构 = '';
  
  // 找第一段（安慰）
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^1[.、]/) || line.includes('抱抱')) {
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        if (!lines[j].match(/^[23][.、]/) && !lines[j].includes('话术')) {
          comfort += lines[j] + ' ';
        }
      }
      break;
    }
  }
  
  // 找话术
  for (const line of lines) {
    const match = line.match(/「([^」]+)」/);
    if (match) {
      话术 = match[0];
      break;
    }
  }
  
  // 找第三段（重构）
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].includes('「') && lines[i].length > 20) {
      重构 = lines[i];
      break;
    }
  }
  
  return {
    comfort: comfort.trim() || '说错话太正常了，别太自责！',
    话术: 话术 || '「哎呀我刚才嘴瓢了，你别往心里去啊」',
    重构: 重构 || '换个角度想：对方可能根本没注意到。'
  };
}
