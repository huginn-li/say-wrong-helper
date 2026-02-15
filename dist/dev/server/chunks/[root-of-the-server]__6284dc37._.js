module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/generate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(request) {
    try {
        const body = await request.json();
        const { targetLabel, sceneLabel, whatWasSaid, fears, severity } = body;
        // 从环境变量读取 API Key
        const apiKey = process.env.KIMI_API_KEY;
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "服务器未配置 API Key",
                needKey: true
            }, {
                status: 500
            });
        }
        // 更严格的系统提示，减少思考痕迹
        const systemPrompt = `你是用户最贴心的闺蜜/兄弟。直接输出三段式回复，不要说任何思考过程、分析、或检查清单。

【输出格式】
1️⃣ 先抱抱你
（写3-4句话，像朋友一样吐槽+共情，用"你"称呼用户）

2️⃣ 如果补救，你可以说  
轻松版：「自然、带点小自嘲的话，像微信聊天」
真诚版：「简单直接的话，承认+说明」

3️⃣ 换个角度想
（写2-3句话，让对方觉得这事没那么严重）

【绝对禁止】
- 禁止出现：思考过程、分析、检查清单、禁止词汇列表
- 禁止出现："焦虑X/5"、"需要共情"、"草稿"、"替代表达"
- 禁止出现：第1点、第2点、或者任何分析性语言
- 话术必须用「」包裹，不要带"轻松版："或"真诚版："前缀

【正确示例】
1️⃣ 先抱抱你
天啊我太懂你了！那种话一出口就后悔的感觉，简直想当场消失...

2️⃣ 如果补救，你可以说
「哎呀我刚才嘴比脑子快，你别往心里去啊」
「不好意思，刚那句话我说得不对，我是想说...」

3️⃣ 换个角度想
其实对方可能根本没注意到，就算注意到了，过几天也就忘了。`;
        const userPrompt = `场景：${sceneLabel}，对${targetLabel}说错话："${whatWasSaid}"，担心：${fears.join('、')}，焦虑程度${severity}/5。

直接给我三段式回复，不要说思考过程。`;
        // 调用 Kimi API
        const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'kimi-k2.5',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 1,
                max_tokens: 500
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Kimi API Error:', response.status, errorText);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `AI 服务暂时不可用 (${response.status})`
            }, {
                status: 502
            });
        }
        const data = await response.json();
        const message = data.choices[0].message;
        const rawContent = message.content || message.reasoning_content || '';
        // 解析响应
        const result = parseKimiResponse(rawContent);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error("Generate API Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || "服务器内部错误"
        }, {
            status: 500
        });
    }
}
// 智能解析 - 提取干净的内容
function parseKimiResponse(rawContent) {
    // 1. 先去掉可能的思考过程（找实际回复开始的位置）
    let content = rawContent;
    // 找 "开始写"、"回复"、"输出" 等标记后的内容
    const markers = [
        '开始写：',
        '开始写:',
        '输出：',
        '输出:',
        '回复：',
        '回复:',
        '最终结果：',
        '最终结果:',
        '【回复】',
        '【输出】'
    ];
    for (const marker of markers){
        const idx = content.indexOf(marker);
        if (idx !== -1) {
            content = content.substring(idx + marker.length).trim();
            break;
        }
    }
    // 2. 去掉代码块标记
    content = content.replace(/```[\s\S]*?```/g, '');
    // 3. 按行分割并清理
    const lines = content.split('\n').map((l)=>l.trim()).filter((l)=>l);
    let comfort = '';
    let 话术A = '';
    let 话术B = '';
    let 重构 = '';
    let currentSection = '';
    for (const line of lines){
        const lowerLine = line.toLowerCase();
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
        // 跳过分析性内容
        if (lowerLine.includes('思考') || lowerLine.includes('分析') || lowerLine.includes('检查') || lowerLine.includes('禁止') || lowerLine.includes('草稿') || lowerLine.includes('焦虑') && lowerLine.includes('/') || lowerLine.includes('需要') && lowerLine.includes('共情') || line.match(/^\d+[.、]\s*$/)) {
            continue;
        }
        // 收集内容
        if (currentSection === 'comfort') {
            if (!line.match(/^[123]/)) {
                comfort += line + ' ';
            }
        } else if (currentSection === '话术') {
            // 提取引号内容
            const match = line.match(/「([^」]+)」/);
            if (match) {
                if (!话术A) {
                    话术A = match[1];
                } else if (!话术B) {
                    话术B = match[1];
                }
            }
        } else if (currentSection === '重构') {
            if (!line.match(/^[123]/) && !line.includes('「')) {
                重构 += line + ' ';
            }
        }
    }
    // 清理
    comfort = cleanText(comfort);
    重构 = cleanText(重构);
    // 组装话术（两个版本合并）
    let 话术 = '';
    if (话术A && 话术B) {
        话术 = `「${话术A}」`;
    } else if (话术A) {
        话术 = `「${话术A}」`;
    } else if (话术B) {
        话术 = `「${话术B}」`;
    }
    // 兜底策略
    if (!comfort) {
        for (const line of lines){
            if (line.length >= 15 && !line.includes('「') && !line.includes('思考') && !line.includes('分析') && !line.match(/^[123]/)) {
                comfort = line;
                break;
            }
        }
    }
    if (!话术) {
        for (const line of lines){
            const match = line.match(/「([^」]+)」/);
            if (match && match[1].length < 50) {
                话术 = `「${match[1]}」`;
                break;
            }
        }
    }
    if (!重构) {
        for(let i = lines.length - 1; i >= 0; i--){
            const line = lines[i];
            if (line.length >= 20 && line.length < 150 && !line.includes('「') && !line.match(/^[123]/) && !line.includes('思考')) {
                重构 = line;
                break;
            }
        }
    }
    return {
        comfort: comfort || '说错话真的太正常了，谁还没个嘴瓢的时候呢。别太自责了！',
        话术: 话术 || '「哎呀我刚才嘴瓢了，你别往心里去啊」',
        重构: 重构 || '试着换个角度想：对方可能根本没注意到这句话，就算注意到了，过几天也就忘了。'
    };
}
// 清理文本
function cleanText(text) {
    return text.replace(/\s+/g, ' ').replace(/轻松版[：:]?\s*/gi, '').replace(/真诚版[：:]?\s*/gi, '').replace(/版本[AB][：:]?\s*/gi, '').replace(/\(适合[^)]+\)/g, '').replace(/[（(]带?有?小?自?嘲?[）)]/g, '').replace(/[（(]简单?直接?[）)]/g, '').trim();
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6284dc37._.js.map