"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Brain, ArrowRight, RotateCcw, Share2, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";

// 问卷步骤类型
type Step = 0 | 1 | 2 | 3 | 4;

// 用户输入数据
interface UserInput {
  target: string;
  targetLabel: string;
  scene: string;
  sceneLabel: string;
  whatWasSaid: string;
  fears: string[];
  severity: number;
}

// AI响应
interface AIResponse {
  comfort: string;
  话术: string;
  重构: string;
}

// 等待时的滚动安慰语
const WAITING_MESSAGES = [
  "深呼吸，一切都会过去的...",
  "你知道吗？80%的尴尬时刻对方根本记不住",
  "嘴瓢是人类的出厂设置，别责怪自己",
  "此刻的焦虑，24小时后就会淡很多",
  "对方可能正忙着想自己的事呢",
  "真正的关系经得起一句说错的话",
  "你已经在反思了，这说明你很在意",
  "很多人都有过类似的经历",
  "尴尬的感觉不会一直持续的",
  "试着对自己温柔一点...",
  "这句话不会定义你的全部",
  "明天醒来，这事可能就很小了",
  "你的价值不取决于这一句话",
  "给自己一点时间和空间",
  "焦虑是暂时的，会过去的",
];

export default function Home() {
  const [step, setStep] = useState<Step>(0);
  const [input, setInput] = useState<UserInput>({
    target: "",
    targetLabel: "",
    scene: "",
    sceneLabel: "",
    whatWasSaid: "",
    fears: [],
    severity: 3,
  });
  const [result, setResult] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 等待动画相关
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showWaitingMessage, setShowWaitingMessage] = useState(false);

  // 等待时的字幕滚动效果
  useEffect(() => {
    if (!isLoading) {
      setShowWaitingMessage(false);
      return;
    }
    
    setShowWaitingMessage(true);
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % WAITING_MESSAGES.length);
    }, 3000); // 每3秒换一条
    
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleNext = async () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step);
    } else {
      // 最后一步：调用 AI
      setIsLoading(true);
      setError(null);
      setCurrentMessageIndex(0);
      
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetLabel: input.targetLabel,
            sceneLabel: input.sceneLabel,
            whatWasSaid: input.whatWasSaid,
            fears: input.fears,
            severity: input.severity,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '请求失败');
        }
        
        setResult(data);
        setStep(4);
      } catch (err: any) {
        console.error('AI Error:', err);
        setError(err.message || '请求失败，请检查网络');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRestart = () => {
    setStep(0);
    setInput({
      target: "",
      targetLabel: "",
      scene: "",
      sceneLabel: "",
      whatWasSaid: "",
      fears: [],
      severity: 3,
    });
    setResult(null);
    setError(null);
  };

  const handleShare = async () => {
    const element = document.getElementById("result-card");
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = "我的安慰卡片.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // 步骤1：选择对象
  const Step1Target = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-stone-800">这句话是对谁说的？</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: "colleague", label: "同事", emoji: "👔" },
          { id: "friend", label: "朋友", emoji: "🧑‍🤝‍🧑" },
          { id: "leader", label: "领导", emoji: "👨‍💼" },
          { id: "family", label: "家人", emoji: "🏠" },
          { id: "stranger", label: "陌生人", emoji: "🚶" },
          { id: "partner", label: "伴侣", emoji: "💕" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setInput({ ...input, target: item.id, targetLabel: item.label })}
            className={`p-4 rounded-2xl border-2 transition-all ${
              input.target === item.id
                ? "border-amber-400 bg-amber-50"
                : "border-stone-200 hover:border-amber-200"
            }`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="mt-2 text-stone-700">{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // 步骤2：输入内容
  const Step2Content = () => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isComposingRef = useRef(false);
    const [charCount, setCharCount] = useState(input.whatWasSaid.length);

    const updateCharCount = () => {
      const value = textareaRef.current?.value || '';
      setCharCount(value.length);
    };

    const sceneOptions = [
      { value: "meeting", label: "会议/正式场合" },
      { value: "chat", label: "闲聊/聚会" },
      { value: "wechat", label: "微信/线上聊天" },
      { value: "work", label: "工作协作中" },
      { value: "public", label: "公开场合" },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-stone-800">发生了什么？</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-2">当时是什么场景？</label>
            <select
              value={input.scene}
              onChange={(e) => {
                const option = sceneOptions.find(o => o.value === e.target.value);
                setInput({ ...input, scene: e.target.value, sceneLabel: option?.label || '' });
              }}
              className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none"
            >
              <option value="">请选择...</option>
              {sceneOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-2">你说了什么话？（简单描述）</label>
            <textarea
              ref={textareaRef}
              defaultValue={input.whatWasSaid}
              onInput={() => updateCharCount()}
              onChange={(e) => {
                if (!isComposingRef.current) {
                  const value = e.target.value;
                  if (value.length > 100) {
                    e.target.value = value.slice(0, 100);
                    setInput({ ...input, whatWasSaid: value.slice(0, 100) });
                  } else {
                    setInput({ ...input, whatWasSaid: value });
                  }
                  updateCharCount();
                }
              }}
              onCompositionStart={() => { isComposingRef.current = true; }}
              onCompositionEnd={(e) => {
                isComposingRef.current = false;
                const value = e.currentTarget.value;
                if (value.length > 100) {
                  e.currentTarget.value = value.slice(0, 100);
                  setInput({ ...input, whatWasSaid: value.slice(0, 100) });
                } else {
                  setInput({ ...input, whatWasSaid: value });
                }
                updateCharCount();
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value !== input.whatWasSaid) {
                  if (value.length > 100) {
                    e.target.value = value.slice(0, 100);
                    setInput({ ...input, whatWasSaid: value.slice(0, 100) });
                  } else {
                    setInput({ ...input, whatWasSaid: value });
                  }
                  updateCharCount();
                }
              }}
              placeholder="例如：不小心说错了一个数据..."
              className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-amber-400 outline-none h-24 resize-none"
            />
            <p className="text-xs text-stone-400 mt-1 text-right">{charCount}/100</p>
          </div>
        </div>
      </div>
    );
  };

  // 步骤3：恐惧和严重程度
  const Step3Fear = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-stone-800">你在担心什么？</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-3">多选：你担心对方觉得你...（可多选）</label>
          <div className="flex flex-wrap gap-2">
            {[
              "太冒失/没礼貌",
              "能力不行",
              "情商低",
              "在针对TA",
              "不靠谱",
              "太较真",
            ].map((fear) => (
              <button
                key={fear}
                onClick={() => {
                  const newFears = input.fears.includes(fear)
                    ? input.fears.filter((f) => f !== fear)
                    : [...input.fears, fear];
                  setInput({ ...input, fears: newFears });
                }}
                className={`px-4 py-2 rounded-full border-2 transition-all ${
                  input.fears.includes(fear)
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-stone-200 text-stone-600 hover:border-amber-200"
                }`}
              >
                {fear}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-3">这种焦虑程度有多严重？</label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-400">还好</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setInput({ ...input, severity: star })}
                  className={`text-2xl transition-all ${
                    star <= input.severity ? "text-amber-400" : "text-stone-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-sm text-stone-400">快崩溃了</span>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );

  // 步骤4：结果页
  const Step4Result = () => {
    if (!result) return null;
    
    return (
      <div className="space-y-6">
        {/* 结果卡片 - 优化截图排版 */}
        <div id="result-card" className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-3xl p-6 space-y-6 border border-amber-100">
          {/* 顶部装饰 */}
          <div className="text-center pb-4 border-b border-amber-200/50">
            <span className="text-3xl">🤗</span>
            <p className="text-sm text-stone-500 mt-2">说错话急救包 · 专属安慰</p>
          </div>
          
          {/* 心理安慰 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-800 mb-2">先抱抱你 💝</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{result.comfort}</p>
            </div>
          </div>

          {/* 话术建议 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-800 mb-2">如果补救，你可以说 💬</h3>
              <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                <p className="text-stone-700 leading-relaxed font-medium">{result.话术}</p>
              </div>
            </div>
          </div>

          {/* 认知重构 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-800 mb-2">换个角度想 🌱</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{result.重构}</p>
            </div>
          </div>
          
          {/* 底部装饰 */}
          <div className="text-center pt-4 border-t border-amber-200/50">
            <p className="text-xs text-stone-400">一切都会好起来的 ✨</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-stone-200 text-stone-600 hover:bg-stone-50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            再试一次
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-800 text-white hover:bg-stone-700 transition-all"
          >
            <Share2 className="w-4 h-4" />
            保存卡片
          </button>
        </div>
      </div>
    );
  };

  // 首页
  const HomePage = () => (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-200 to-rose-200 rounded-full flex items-center justify-center">
          <span className="text-4xl">🤗</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-800">说错话急救包</h1>
        <p className="text-stone-600 px-4">
          社交焦虑缓解助手<br />
          帮你把尴尬瞬间变成"没事啦"
        </p>
      </div>
      <button
        onClick={() => setStep(1)}
        className="inline-flex items-center gap-2 px-8 py-4 bg-stone-800 text-white rounded-2xl hover:bg-stone-700 transition-all"
      >
        开始
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  // 步骤配置
  const steps = [
    { component: HomePage, canProceed: () => true },
    { component: Step1Target, canProceed: () => !!input.target },
    { component: Step2Content, canProceed: () => !!input.scene && !!input.whatWasSaid.trim() },
    { component: Step3Fear, canProceed: () => input.fears.length > 0 },
    { component: Step4Result, canProceed: () => true },
  ];

  const CurrentStep = steps[step].component;
  const canProceed = steps[step].canProceed();

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-sm p-6"
          >
            <CurrentStep />
          </motion.div>
        </AnimatePresence>

        {/* 导航按钮 */}
        {step > 0 && step < 4 && (
          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep((prev) => (prev - 1) as Step)}
                  className="px-6 py-3 rounded-xl border-2 border-stone-200 text-stone-600 hover:bg-stone-50 transition-all"
                >
                  返回
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  canProceed && !isLoading
                    ? "bg-stone-800 text-white hover:bg-stone-700"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    {step === 3 ? '生成回复' : '下一步'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            
            {/* 等待时的滚动字幕 */}
            {isLoading && showWaitingMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentMessageIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-sm text-amber-700"
                    >
                      {WAITING_MESSAGES[currentMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <p className="text-xs text-stone-400 mt-2">正在为你生成专属安慰...</p>
              </motion.div>
            )}
          </div>
        )}

        {/* 进度指示器 */}
        {step > 0 && step < 4 && (
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i <= step ? "bg-amber-400 w-6" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
