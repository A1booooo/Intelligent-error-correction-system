import { useState } from 'react';
import { Search, ChevronDown, Trash2 } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartPieDonut } from '@/components/layout/ChartPieDonut';
import { ChartPieSimple } from '@/components/layout/ChartPieSimple';
import { ChartLineMultiple } from '@/components/layout/ChartLineMultiple';

const questionData = [
  {
    id: 1,
    subject: '数学',
    errorReason: '粗心马虎',
    date: '14.30/10.25',
    selected: false,
  },
];

export default function MyQuestionPage() {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [showCheckbox, setShowCheckbox] = useState(false);

  const onClickShowCheckbox = () => {
    const checkboxs = document.querySelectorAll('.checkbox');
    if (showCheckbox) {
      checkboxs.forEach((checkbox) => {
        (checkbox as HTMLElement).style.opacity = '1';
      });
    } else {
      checkboxs.forEach((checkbox) => {
        (checkbox as HTMLElement).style.opacity = '0';
      });
    }
    setShowCheckbox(!showCheckbox);
  };

  return (
    <div className="bg-background p-6 h-[93svh] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* 左侧筛选区域 */}
        <div className="lg:col-span-3 flex flex-col gap-4 border border-dotted rounded-lg p-4 overflow-y-auto">
          {/* 搜索框 */}
          <InputGroup className="h-12 ring-0 ring-offset-0 focus-within:ring-0 focus-within:ring-offset-0 focus-within:!ring-0 focus-within:!ring-offset-0 focus-within:!border-input">
            <InputGroupInput placeholder="搜索" className="h-full" />
            <InputGroupAddon>
              <Search className="size-5" />
            </InputGroupAddon>
          </InputGroup>

          <Collapsible open={subjectOpen} onOpenChange={setSubjectOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="w-full border-2 border-muted-foreground/25 rounded-md px-4 py-3 text-sm text-muted-foreground flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer">
                <span>按照学科分配</span>
                <ChevronDown
                  className={`size-4 transition-transform duration-300 ${subjectOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 px-2 ">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  数学
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  物理
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  化学
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  英语
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={timeOpen} onOpenChange={setTimeOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="w-full border-2 border-muted-foreground/25 rounded-md px-4 py-3 text-sm text-muted-foreground flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer">
                <span>按照时间分配</span>
                <ChevronDown
                  className={`size-4 transition-transform ${timeOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 px-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  本周
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  本月
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  本季度
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  本年
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={errorOpen} onOpenChange={setErrorOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="w-full border-2 border-muted-foreground/25 rounded-md px-4 py-3 text-sm text-muted-foreground flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer">
                <span>按照错因分类</span>
                <ChevronDown
                  className={`size-4 transition-transform ${errorOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 px-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  粗心马虎
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  知识点不熟悉
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  计算错误
                </div>
                <div className="text-sm text-muted-foreground cursor-pointer text-center border p-2">
                  时间不够
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* 中间问题列表区域 */}
        <div className="lg:col-span-6 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionData.map((question) => (
                <Card
                  key={question.id}
                  className="hover:shadow-md transition-shadow relative"
                >
                  <Checkbox
                    className="absolute top-3 right-3 cursor-pointer checkbox transition-opacity duration-150 opacity-0"
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedQuestions([
                          ...selectedQuestions,
                          question.id,
                        ]);
                      } else {
                        setSelectedQuestions(
                          selectedQuestions.filter((id) => id !== question.id),
                        );
                      }
                    }}
                  />

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="w-full aspect-video bg-muted rounded-md mb-2 flex items-center justify-center cursor-pointer">
                          <span className="text-muted-foreground text-sm">
                            题目预览
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge>{question.subject}</Badge>
                            <Badge variant="secondary">
                              {question.errorReason}
                            </Badge>
                          </div>

                          <span className="text-muted-foreground">
                            {question.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={onClickShowCheckbox}
              >
                批量操作
              </Button>
              {selectedQuestions.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedQuestions.length} 个文件
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Trash2 className="size-4 mr-1" />
                    批量删除
                  </Button>
                </>
              )}
            </div>

            {/* 分页 */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm">
                &lt;
              </Button>
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={page === 1 ? 'default' : 'outline'}
                  size="sm"
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm">
                &gt;
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧统计区域 */}
        <div className="lg:col-span-3 flex flex-col gap-4 border border-dotted rounded-lg p-4 overflow-y-auto">
          <div>
            <span className="text-lg font-semibold">错题数量总览</span>
            <div className="flex items-center justify-center">
              <ChartPieDonut />
            </div>
          </div>
          <div>
            <span className="text-lg font-semibold">知识点错误分布</span>
            <div className="flex items-center justify-center">
              <ChartPieSimple />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-lg font-semibold">复习完成率</span>
            <div className="flex items-center justify-center">
              <div className="w-full h-[200px]">
                <ChartLineMultiple />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
