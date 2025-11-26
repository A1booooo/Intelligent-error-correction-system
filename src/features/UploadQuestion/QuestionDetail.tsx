import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StopCircle, Loader2 } from 'lucide-react';
import { useStreamingAI } from '@/hooks/useStreamingAI';
import { AiChatPanel } from "@/components/business/AiChatPanel";

export default function UploadQuestionPage() {
  const [originalQuestion, setOriginalQuestion] = useState('');

  const {
    content: aiSolution,
    isLoading: isAILoading,
    streamAIResponse,
    stopStreaming,
  } = useStreamingAI({
    url: '/api/ai/solve-question', // 替换为实际API地址
    onComplete: () => {
      console.log('AI解答完成');
    },
    onError: (error) => {
      console.error('AI解答错误:', error);
    },
  });

  const [errorReasons, setErrorReasons] = useState({
    careless: false,
    knowledgeGap: false,
    calculationError: false,
    timeShortage: false,
    other: false,
  });

  const errorReasonsList = [
    { id: 'careless', label: '重心马虎', color: 'bg-primary' },
    { id: 'knowledgeGap', label: '知识点不熟悉', color: 'bg-primary' },
    { id: 'calculationError', label: '计算错误', color: 'bg-primary' },
    { id: 'timeShortage', label: '时间不够', color: 'bg-primary' },
    { id: 'other', label: '其他：', color: 'bg-primary' },
  ];

  /* const quickQuestions = [
    '继续一种新题继续表达系统',
    '请再做一种考试重点',
    '有哪一个考察重点和解析？',
  ]; */

  const handleErrorReasonChange = (reasonId: string) => {
    setErrorReasons((prev) => ({
      ...prev,
      [reasonId]: !prev[reasonId as keyof typeof prev],
    }));
  };

  // 提交题目获取AI解答
  const handleGetAISolution = async () => {
    if (!originalQuestion.trim()) {
      alert('请先输入题目内容');
      return;
    }

    await streamAIResponse(originalQuestion);
  };

  return (
    <div className="bg-background p-6 h-[93svh] overflow-hidden">
      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* 左侧区域 - 原题和AI题解 */}
        <div className="lg:col-span-5 grid grid-rows-[auto_auto_0.5fr] gap-4">
          {/* 原题卡片 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">原题</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <Textarea
                placeholder="请输入题目内容..."
                value={originalQuestion}
                onChange={(e) => setOriginalQuestion(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGetAISolution}
                disabled={isAILoading || !originalQuestion.trim()}
                className="w-full"
              >
                {isAILoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '获取AI解答'
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* AI题解卡片 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">AI题解</CardTitle>
              {isAILoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopStreaming}
                  className="text-destructive"
                >
                  <StopCircle className="size-4 mr-2" />
                  停止生成
                </Button>
              )}
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {aiSolution ? (
                <div className="whitespace-pre-wrap text-foreground">
                  {aiSolution}
                  {isAILoading && (
                    <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  {isAILoading
                    ? '正在生成解答...'
                    : 'AI生成的题解将显示在这里...'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 理解确认区域 */}
          <Card className="shadow-lg">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-foreground font-medium">你看懂了吗？</span>
              <div className="flex gap-3">
                <Button variant="default" className="shadow-md">
                  看懂了 😊
                </Button>
                <Button variant="secondary" className="shadow-md">
                  没看懂 😢
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 中间区域 - 错因分析和知识点 */}
        <div className="lg:col-span-3 grid grid-rows-[1fr_1fr_1fr] gap-4">
          {/* 错因分析 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">错因分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {errorReasonsList.map((reason) => (
                <div key={reason.id} className="flex items-center gap-3">
                  <div className={`size-2 rounded-full ${reason.color}`} />
                  <label
                    htmlFor={reason.id}
                    className="flex flex-1 items-center gap-2 cursor-pointer"
                  >
                    <span className="text-sm text-foreground">
                      {reason.label}
                    </span>
                  </label>
                  <Checkbox
                    checked={
                      errorReasons[reason.id as keyof typeof errorReasons]
                    }
                    onCheckedChange={() => handleErrorReasonChange(reason.id)}
                    id={reason.id}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 知识点归属 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">知识点归属</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                深度识别中...
              </div>
            </CardContent>
          </Card>

          {/* 注意事项 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">注意事项</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                深度学习中...
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 h-full overflow-hidden">
          <AiChatPanel mode="embedded" className="h-full shadow-lg border-slate-200" />
      </div>
    </div>
    </div>
  );
}
