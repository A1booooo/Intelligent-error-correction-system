import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StopCircle, Loader2 } from 'lucide-react';
import { useStreamingAI } from '@/hooks/useStreamingAI';
import ChatBox from '@/components/common/ChatBox';
import { useEffect } from 'react';

export default function QuestionDetailPage() {
  const { result } = useLocation().state;
  const [originalQuestion] = useState(result);
  console.log(originalQuestion);

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

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReasonDetail, setOtherReasonDetail] = useState('');

  const errorReasonsList = [
    { id: 'careless', label: '粗心马虎', color: 'bg-primary' },
    { id: 'knowledgeGap', label: '知识点不熟悉', color: 'bg-primary' },
    { id: 'calculationError', label: '计算错误', color: 'bg-primary' },
    { id: 'timeShortage', label: '时间不够', color: 'bg-primary' },
    { id: 'other', label: '其他', color: 'bg-primary' },
  ];

  /* const quickQuestions = [
    '继续一种新题继续表达系统',
    '请再做一种考试重点',
    '有哪一个考察重点和解析？',
  ]; */

  // 提交题目获取AI解答
  const handleGetAISolution = async () => {
    if (!originalQuestion.trim()) {
      alert('请先输入题目内容');
      return;
    }

    await streamAIResponse(originalQuestion);
  };

  useEffect(() => {
    if (originalQuestion) {
      streamAIResponse(originalQuestion);
    }
  }, []);

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
            <CardContent className="overflow-y-auto min-h-[200px]"></CardContent>
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
              <div className="flex flex-col gap-3 relative">
                {errorReasonsList.map((reason) => (
                  <div key={reason.id} className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setSelectedReason(reason.id)}
                    >
                      <div className={`size-2 rounded-full ${reason.color}`} />
                      <label className="flex flex-1 items-center gap-2 cursor-pointer">
                        <span className="text-sm text-foreground">
                          {reason.label}
                        </span>
                      </label>
                      <Textarea
                        placeholder="请输入具体的错误原因..."
                        value={otherReasonDetail}
                        onChange={(e) => setOtherReasonDetail(e.target.value)}
                        className={`w-[73%] h-[45px] absolute left-17 transition-opacity duration-300 ${reason.id === 'other' && selectedReason === 'other' ? 'opacity-100' : 'opacity-0'}`}
                      />
                      <div
                        className={`flex size-4 items-center justify-center rounded-full border border-primary ${
                          selectedReason === reason.id
                            ? 'bg-primary text-primary-foreground duration-300'
                            : 'opacity-50 duration-300'
                        }`}
                      >
                        {selectedReason === reason.id && (
                          <div className="size-2 rounded-full bg-current" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <Textarea
                placeholder="请输入笔记"
                className="h-[125px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* 右侧区域 - AI问答区 */}
        <div className="lg:col-span-4 space-y-6 min-h-0">
          <Card className="shadow-lg h-full flex flex-col min-h-0">
            <CardHeader>
              <CardTitle className="text-lg">AI问答区</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 min-h-0">
              <ChatBox />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
