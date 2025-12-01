import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StopCircle } from 'lucide-react';
import { solveStream } from '@/services/apis/aiapi';
import {
  toggleErrorReason,
  updateOtherReason,
  submitStudyNote,
} from '@/services/errorReason/errorReason';
import { AiChatPanel } from '@/components/business/AiChatPanel';

export default function QuestionDetailPage() {
  const { result } = useLocation().state;
  const [originalQuestion] = useState(result.data.questionText);

  // AI 流式解答
  const [aiSolution, setAiSolution] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 错因分析
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherReasonDetail, setOtherReasonDetail] = useState('');
  const [studyNote, setStudyNote] = useState('');
  const errorReasonsList = [
    { id: 'isCareless', label: '粗心马虎', color: 'bg-primary' },
    { id: 'isUnfamiliar', label: '知识点不熟悉', color: 'bg-primary' },
    { id: 'isCalculateErr', label: '计算错误', color: 'bg-primary' },
    { id: 'isTimeShortage', label: '时间不够', color: 'bg-primary' },
    { id: 'otherReason', label: '其他', color: 'bg-primary' },
  ];

  // 请求 AI 流式解答
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsAILoading(true);
    setAiSolution('');

    solveStream({
      question: originalQuestion,
      signal: controller.signal,
      onMessage: (text) => setAiSolution((prev) => prev + text),
      onError: (err) => {
        if (err.name !== 'AbortError') console.error('AI解答错误:', err);
        setIsAILoading(false);
      },
    }).finally(() => {
      setIsAILoading(false);
    });

    return () => {
      controller.abort();
    };
  }, [originalQuestion]);

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAILoading(false);
    }
  };

  const handleSelectReason = (reason: string) => {
    toggleErrorReason({
      questionId: result.data.questionId,
      reasonName: selectedReason,
    });
    setSelectedReason(reason);
    toggleErrorReason({
      questionId: result.data.questionId,
      reasonName: reason,
    }).then((res) => console.log('选中错因：', res));
  };

  const handleOtherReasonBlur = () => {
    if (!otherReasonDetail.trim()) return;
    updateOtherReason({
      questionId: result.data.questionId,
      otherReasonText: otherReasonDetail.trim(),
    }).then((res) => console.log('其他原因提交：', res));
  };

  const handleStudyNoteBlur = () => {
    if (!studyNote.trim()) return;
    submitStudyNote({
      questionId: result.data.questionId,
      studyNote: studyNote.trim(),
    }).then((res) => console.log('笔记提交：', res));
  };
  return (
    <div className="bg-background p-6 h-[93svh] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* 左侧区域 - 原题和AI题解 */}
        <div className="lg:col-span-5 grid grid-rows-[1fr_1fr_auto] gap-4 h-full overflow-hidden">
          {/* 原题卡片 */}
          <Card className="shadow-lg flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">原题</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              {originalQuestion}
            </CardContent>
          </Card>

          {/* AI题解卡片 */}
          <Card className="shadow-lg flex flex-col overflow-hidden">
            <CardHeader className="flex items-center justify-between flex-shrink-0">
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
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              {aiSolution ? (
                <div className="whitespace-pre-wrap text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {aiSolution}
                  </ReactMarkdown>
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
          <Card className="shadow-lg">
            <CardContent className="flex items-center justify-between p-4">
              <span>你看懂了吗？</span>
              <div className="flex gap-3">
                <Button variant="default" className="cursor-pointer">
                  看懂了 😊
                </Button>
                <Button variant="secondary" className="cursor-pointer">
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
                      onClick={() => handleSelectReason(reason.id)}
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
                        className={`w-[73%] h-[45px] absolute left-17 transition-opacity duration-300 ${
                          reason.id === 'otherReason' &&
                          selectedReason === 'otherReason'
                            ? 'opacity-100'
                            : 'opacity-0'
                        } z-0`}
                        onBlur={handleOtherReasonBlur}
                      />
                      <div
                        className={`flex size-4 items-center justify-center rounded-full border border-primary z-10 ${
                          selectedReason === reason.id
                            ? 'bg-primary text-primary-foreground duration-300'
                            : 'opacity-50 duration-300'
                        }`}
                      >
                        {selectedReason === reason.id && (
                          <div className="size-2 rounded-full bg-current z-10" />
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
                value={studyNote}
                onChange={(e) => setStudyNote(e.target.value)}
                onBlur={handleStudyNoteBlur}
              />
            </CardContent>
          </Card>
        </div>

        {/* 右侧 AI 聊天面板 */}
        <div className="lg:col-span-4 h-full overflow-hidden">
          <AiChatPanel
            mode="embedded"
            className="h-full shadow-lg border-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
