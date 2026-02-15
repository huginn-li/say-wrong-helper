"use client";

import { useState } from "react";

// Kimi 官方模型列表
const KIMI_MODELS = [
  { value: "kimi-k2.5", label: "Kimi K2.5（官方推荐）" },
  { value: "kimi-k2-turbo-preview", label: "Kimi K2 Turbo（文档示例）" },
  { value: "kimi-k2", label: "Kimi K2（上一代）" },
  { value: "kimi-latest", label: "Kimi Latest（自动最新）" },
  { value: "moonshot-v1-8k", label: "Moonshot V1-8K（旧版）" },
  { value: "moonshot-v1-32k", label: "Moonshot V1-32K（旧版）" },
  { value: "moonshot-v1-128k", label: "Moonshot V1-128K（旧版）" },
];

// 硅基流动支持的模型列表（2025年最新）
const SILICON_FLOW_MODELS = [
  { value: "deepseek-ai/DeepSeek-V3", label: "DeepSeek-V3（最新，推荐）" },
  { value: "deepseek-ai/DeepSeek-R1", label: "DeepSeek-R1（推理能力强）" },
  { value: "THUDM/GLM-4-32B-0414", label: "GLM-4-32B（智谱最新）" },
  { value: "THUDM/GLM-Z1-32B-0414", label: "GLM-Z1-32B（推理版）" },
  { value: "Qwen/Qwen2.5-72B-Instruct", label: "通义千问 2.5-72B" },
  { value: "Qwen/QwQ-32B", label: "QwQ-32B（千问推理）" },
  { value: "meta-llama/Llama-4-Maverick-17B-128E-Instruct", label: "Llama-4-Maverick（Meta最新）" },
  { value: "deepseek-ai/DeepSeek-V2.5", label: "DeepSeek-V2.5（经典版）" },
];

export default function TestPromptPage() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"deepseek" | "claude" | "openai" | "siliconflow" | "kimi">("kimi");
  const [model, setModel] = useState("kimi-k2.5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    target: "leader",
    targetLabel: "领导",
    scene: "meeting",
    sceneLabel: "会议/正式场合",
    whatWasSaid: "汇报时不小心说错了一个数据",
    fears: ["能力不行", "不靠谱"],
    severity: 4,
  });

  const testConnection = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setDebugInfo(null);

    try {
      const response = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          provider,
          apiKey,
          model: provider === "siliconflow" || provider === "kimi" ? model : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setResult(data);
      
      // 显示调试信息
      if (data._debug) {
        setDebugInfo({
          warning: data._debug.isDefault ? "⚠️ API 调用失败，返回默认回复" : "✅ API 调用成功",
          suggestion: data._debug.isDefault 
            ? "请检查：1. API Key 是否正确 2. 网络连接 3. 查看服务器日志" 
            : "AI 正常生成回复",
          provider: data._debug.provider,
          model: data._debug.model,
          message: data._debug.message,
          raw: data
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">🧪 提示词测试页面</h1>

        {/* API 配置 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">API 配置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-stone-600 mb-2">选择 AI 提供商</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
              >
                <option value="kimi">🌙 Kimi (推荐，中文强)</option>
                <option value="siliconflow">硅基流动 (模型多)</option>
                <option value="deepseek">DeepSeek 官方</option>
                <option value="claude">Claude</option>
                <option value="openai">OpenAI GPT</option>
              </select>
            </div>

            {/* Kimi 模型选择 */}
            {provider === "kimi" && (
              <div>
                <label className="block text-sm text-stone-600 mb-2">选择 Kimi 模型</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
                >
                  <option value="kimi-k2.5">Kimi K2.5（最新推荐）</option>
                  <option value="kimi-k2">Kimi K2（上一代）</option>
                  <option value="kimi-latest">Kimi Latest（自动最新）</option>
                </select>
                <p className="text-xs text-stone-400 mt-1">
                  推荐 Kimi K2.5，中文理解和生成能力最强
                </p>
              </div>
            )}

            {/* 硅基流动模型选择 */}
            {provider === "siliconflow" && (
              <div>
                <label className="block text-sm text-stone-600 mb-2">选择模型</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
                >
                  {SILICON_FLOW_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-stone-400 mt-1">
                  推荐 DeepSeek-V2.5，中文理解和生成效果最好
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-stone-600 mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的 API Key"
                className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
              />
              <p className="text-xs text-stone-400 mt-1">
                仅用于测试，不会保存。建议用临时 Key。
              </p>
            </div>
          </div>
        </div>

        {/* 测试场景 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">测试场景</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-stone-600 mb-2">对方身份</label>
              <select
                value={formData.target}
                onChange={(e) => {
                  const labels: Record<string, string> = {
                    colleague: "同事",
                    friend: "朋友",
                    leader: "领导",
                    family: "家人",
                    stranger: "陌生人",
                    partner: "伴侣",
                  };
                  setFormData({
                    ...formData,
                    target: e.target.value,
                    targetLabel: labels[e.target.value],
                  });
                }}
                className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
              >
                <option value="colleague">同事</option>
                <option value="friend">朋友</option>
                <option value="leader">领导</option>
                <option value="family">家人</option>
                <option value="stranger">陌生人</option>
                <option value="partner">伴侣</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-stone-600 mb-2">说错的话</label>
              <input
                type="text"
                value={formData.whatWasSaid}
                onChange={(e) =>
                  setFormData({ ...formData, whatWasSaid: e.target.value })
                }
                className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-600 mb-2">担心的问题（用逗号分隔）</label>
              <input
                type="text"
                value={formData.fears.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fears: e.target.value.split(",").map((f) => f.trim()),
                  })
                }
                className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 测试按钮 */}
        <button
          onClick={testConnection}
          disabled={loading || !apiKey}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
        >
          {loading ? "测试中..." : "测试 AI 回复"}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* 调试信息 */}
        {debugInfo && (
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-yellow-800 font-medium mb-2">{debugInfo.warning}</p>
            <p className="text-yellow-700 text-sm mb-2">{debugInfo.suggestion}</p>
            <details>
              <summary className="text-sm text-yellow-600 cursor-pointer">查看调试详情</summary>
              <pre className="mt-2 p-4 bg-yellow-100 rounded-xl text-xs text-yellow-800 overflow-auto">
                {JSON.stringify(debugInfo.raw, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* 测试结果 */}
        {result && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">AI 回复结果</h3>
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 rounded-xl">
                <h4 className="font-semibold text-rose-800 mb-2">💝 先抱抱你</h4>
                <p className="text-stone-700">{result.comfort}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">💬 如果补救，你可以说</h4>
                <p className="text-stone-700">{result.话术}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <h4 className="font-semibold text-emerald-800 mb-2">🌱 换个角度想</h4>
                <p className="text-stone-700">{result.重构}</p>
              </div>
            </div>

            {/* 原始响应 */}
            <details className="mt-4">
              <summary className="text-sm text-stone-500 cursor-pointer">
                查看原始响应
              </summary>
              <div className="mt-2 space-y-4">
                <div className="p-4 bg-stone-100 rounded-xl">
                  <h5 className="text-xs font-semibold text-stone-600 mb-2">解析后的回复：</h5>
                  <pre className="text-xs text-stone-700 overflow-auto">
                    {JSON.stringify({
                      comfort: result.comfort,
                      话术: result.话术,
                      重构: result.重构
                    }, null, 2)}
                  </pre>
                </div>
                <div className="p-4 bg-stone-100 rounded-xl">
                  <h5 className="text-xs font-semibold text-stone-600 mb-2">调试信息：</h5>
                  <pre className="text-xs text-stone-700 overflow-auto">
                    {JSON.stringify(result._debug, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
