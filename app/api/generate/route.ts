import { NextRequest, NextResponse } from "next/server";

// Edge Runtime 配置
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  // 1. 解析请求
  const body = await request.json();
  const { targetLabel, sceneLabel, whatWasSaid, fears, severity } = body;
  
  // 2. 获取 API Key
  const apiKey = process.env.KIMI_API_KEY;
  
  // 3. 如果没有 Key，返回测试数据
  if (!apiKey) {
    return NextResponse.json({
      comfort: '（测试模式）说错话真的太正常了，别太自责啦！',
      话术: '「哎呀我刚才嘴瓢了，你别往心里去啊」',
      重构: '（测试模式）换个角度想：对方可能根本没注意到。'
    });
  }
  
  // 4. 调用 Kimi API
  try {
    const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
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
            content: `你是用户的闺蜜/兄弟。按以下格式回复：
1️⃣ 先抱抱你（安慰的话）
2️⃣ 话术（用「」包裹）
3️⃣ 换个角度想（让事情看起来没那么严重）
不要说思考过程。`
          },
          {
            role: 'user',
            content: `场景：${sceneLabel}，对${targetLabel}说错话："${whatWasSaid}"，担心：${fears.join('、')}，焦虑${severity}/5。`
          }
        ],
        temperature: 1,
        max_tokens: 600,
      }),
    });
    
    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ 
        error: 'AI 服务暂时不可用', 
        status: res.status 
      }, { status: 500 });
    }
    
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // 5. 解析三段式
    const lines = content.split('\n').filter((l: string) => l.trim());
    
    let comfort = '';
    let 话术 = '';
    let 重构 = '';
    
    // 简单提取
    for (const line of lines) {
      if (line.includes('「') && line.includes('」') && !话术) {
        const match = line.match(/「([^」]+)」/);
        if (match) 话术 = match[0];
      } else if (!comfort && line.length > 10 && !line.includes('1️⃣') && !line.includes('2️⃣') && !line.includes('3️⃣')) {
        comfort = line;
      } else if (!重构 && line.length > 10 && !line.includes('「')) {
        重构 = line;
      }
    }
    
    return NextResponse.json({
      comfort: comfort || '说错话太正常了，别太自责！',
      话术: 话术 || '「哎呀我刚才嘴瓢了」',
      重构: 重构 || '换个角度想：对方可能根本没注意到。'
    });
    
  } catch (err: any) {
    return NextResponse.json({ 
      error: '服务器错误', 
      message: err.message 
    }, { status: 500 });
  }
}
