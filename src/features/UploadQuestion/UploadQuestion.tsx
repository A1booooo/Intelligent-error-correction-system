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
import { Plus } from 'lucide-react';

export default function UploadQuestionPage() {
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [aiSolution, setAiSolution] = useState('');
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

  const quickQuestions = [
    '继续一种新题继续表达系统',
    '请再做一种考试重点',
    '有哪一个考察重点和解析？',
  ];

  const handleErrorReasonChange = (reasonId: string) => {
    setErrorReasons((prev) => ({
      ...prev,
      [reasonId]: !prev[reasonId as keyof typeof prev],
    }));
  };

  return (
    <div className="bg-background p-6 h-[93svh]">
      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
          </Card>

          {/* AI题解卡片 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">AI题解</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <Textarea
                placeholder="AI生成的题解将显示在这里..."
                value={aiSolution}
                onChange={(e) => setAiSolution(e.target.value)}
                className="min-h-[200px] resize-none"
              />
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

        {/* 右侧区域 - AI问答区 */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">AI问答区</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {/* 说明文字 */}
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground h-full">
                欢迎使用智能错题提问系统，请您根据什么问题提问
                {/* 快捷问题按钮 */}
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
                {/* 对话展示区域 */}
                <div className="space-y-3">
                  <div className="h-32 rounded-lg bg-muted p-4">
                    {/* 对话内容占位 */}
                  </div>
                  <div className="h-32 rounded-lg bg-muted p-4">
                    {/* 对话内容占位 */}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              {/* 添加提问按钮 */}
              <Button className="w-full shadow-md">
                <Plus className="size-4 mr-2" />
                请用自然语言提问
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
