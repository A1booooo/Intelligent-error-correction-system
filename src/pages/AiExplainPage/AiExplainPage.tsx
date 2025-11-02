import { useState } from "react";
import { getAiExplanation } from "@/services/apis/aiapi";

export default function AiExplainPage() {
  const [question, setQuestion] = useState("已识别的题目内容示例：x² - 4x + 3 = 0，求解x。");
  const [answer, setAnswer] = useState("学生答案：x=3");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    try {
      setLoading(true);
      const res = await getAiExplanation({ question, answer });
      setAnalysis(res.data);
    } catch (error) {
      console.error("AI讲解失败:", error);
      setAnalysis("生成讲解时出错，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800"> AI题目讲解与错因分析</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <label className="block mb-2 text-gray-700">
          <strong>题目：</strong>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            rows={3}
          />
        </label>
        <label className="block text-gray-700">
          <strong>你的答案：</strong>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </label>
      </div>

      <button
        onClick={handleExplain}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "AI生成中..." : "生成AI讲解"}
      </button>

      {analysis && (
        <div className="mt-6 bg-white p-5 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">AI讲解与错因分析</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
}