import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import {
  getQuestionList,
  deleteQuestion,
  getStatistics,
} from '@/services/myQuestion/myQuestion';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { AnalysisData, QuestionItem } from '@/services/myQuestion/type';

interface Filters {
  keyword: string;
  subjects: string[];
  errorType: string;
  timeRange: string;
  page: number;
  size: number;
}

interface QuestionBackendItem {
  id: number;
  question_content: string;
  subject: string;
  update_time: string;
  is_careless: number;
  is_unfamiliar: number;
  is_calculate_err: number;
  is_time_shortage: number;
  other_reason: string;
  knowledge_desc: string | null;
  errorReason: string;
}

export default function MyQuestionPage() {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionBackendItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    page: '1' as string,
  });
  const [filters, setFilters] = useState<Filters>({
    keyword: '',
    subjects: [],
    errorType: '',
    timeRange: 'THIS_WEEK',
    page: 1,
    size: 6,
  });
  const [statistics, setStatistics] = useState<AnalysisData>({
    subjectDistribution: [],
    knowledgeDistribution: [],
    reviewTrend: [],
  });

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

  const mapErrorReason = (item: QuestionItem) => {
    if (item.is_careless === 1) {
      return '粗心马虎';
    } else if (item.is_unfamiliar === 1) {
      return '知识点不熟悉';
    } else if (item.is_calculate_err === 1) {
      return '计算错误';
    } else if (item.is_time_shortage === 1) {
      return '时间不够';
    } else {
      return '其他';
    }
  };

  const toggleSubjectValue = (value: string) => {
    setFilters((prev: Filters) => {
      const arr = prev.subjects;
      const exists = arr.includes(value);

      return {
        ...prev,
        subjects: exists ? arr.filter((v) => v !== value) : [...arr, value],
        page: 1,
      };
    });
  };

  const setSingleFilterValue = (
    key: 'errorType' | 'timeRange',
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
      page: 1,
    }));
  };

  // 初始化：从 URL 设置 filters
  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const params = {
        keyword: filters.keyword,
        subject: filters.subjects[0] ?? '',
        errorType: filters.errorType,
        timeRange: filters.timeRange,
        page: filters.page - 1,
        size: filters.size,
      };
      console.log(params);

      try {
        const res = await getQuestionList(params);
        console.log(res);
        const content = res?.data?.content ?? [];
        const mapped = content.map((item: QuestionItem) => ({
          id: item.id,
          subject: item.subject ?? '未分类',
          update_time: item.update_time,
          question_content: item.question_content,
          is_careless: item.is_careless,
          is_unfamiliar: item.is_unfamiliar,
          is_calculate_err: item.is_calculate_err,
          is_time_shortage: item.is_time_shortage,
          other_reason: item.other_reason,
          knowledge_desc: item.knowledge_desc,
          errorReason: mapErrorReason(item),
        }));

        setQuestionData(mapped);

        const stat = await getStatistics();
        console.log(stat);
        if (stat) setStatistics(stat.data);
      } catch (e) {
        if (axios.isCancel(e)) {
          // 请求取消通常由快速切换筛选条件触发，这里静默处理以避免干扰
          return;
        }
        console.error('fetch error', e);
      }
    };

    fetchData();
  }, [filters]);

  useEffect(() => {
    setSearchParams({ page: String(filters.page) });
  }, [filters.page]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleNext = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handlePrevious = () => {
    setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleDelete = () => {
    deleteQuestion(selectedQuestions).then((res) => {
      console.log(res);
    });
  };

  return (
    <div className="bg-background p-6 h-[93svh] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        <div className="lg:col-span-3 flex flex-col gap-4 border border-dotted rounded-lg p-4 overflow-y-auto">
          {/* 搜索框 */}
          <InputGroup className="h-12 ring-0 ring-offset-0 focus-within:ring-0 focus-within:ring-offset-0 focus-within:!ring-0 focus-within:!ring-offset-0 focus-within:!border-input">
            <InputGroupInput
              placeholder="搜索"
              className="h-full"
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
            />
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
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('数学') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleSubjectValue('数学')}
                >
                  数学
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('物理') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleSubjectValue('物理')}
                >
                  物理
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('化学') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleSubjectValue('化学')}
                >
                  化学
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('英语') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleSubjectValue('英语')}
                >
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
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRange === 'THIS_WEEK' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setSingleFilterValue('timeRange', 'THIS_WEEK')}
                >
                  本周
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRange === 'THIS_MONTH' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() =>
                    setSingleFilterValue('timeRange', 'THIS_MONTH')
                  }
                >
                  本月
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRange === 'THIS_QUARTER' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() =>
                    setSingleFilterValue('timeRange', 'THIS_QUARTER')
                  }
                >
                  本季度
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRange === 'THIS_YEAR' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setSingleFilterValue('timeRange', 'THIS_YEAR')}
                >
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
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorType === '粗心马虎' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setSingleFilterValue('errorType', '粗心马虎')}
                >
                  粗心马虎
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorType === '知识点不熟悉' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() =>
                    setSingleFilterValue('errorType', '知识点不熟悉')
                  }
                >
                  知识点不熟悉
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorType === '计算错误' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setSingleFilterValue('errorType', '计算错误')}
                >
                  计算错误
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorType === '时间不够' ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setSingleFilterValue('errorType', '时间不够')}
                >
                  时间不够
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="lg:col-span-6 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionData.map((question: QuestionBackendItem) => (
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
                          <span className="text-muted-foreground text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                            {question.question_content}
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
                            {question.update_time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

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
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4 mr-1" />
                    批量删除
                  </Button>
                </>
              )}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevious}
                    className="cursor-pointer"
                  />
                </PaginationItem>
                {new Array(3).fill(1).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      className={` ${filters.page - 1 + index === filters.page ? 'bg-primary text-primary-foreground pointer-events-none' : 'cursor-pointer'} ${filters.page - 1 + index === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                      onClick={() => handlePageChange(filters.page - 1 + index)}
                    >
                      {filters.page - 1 + index}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={handleNext}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4 border border-dotted rounded-lg p-4 overflow-y-auto">
          <div>
            <span className="text-lg font-semibold">错题数量总览</span>
            <div className="flex items-center justify-center">
              <ChartPieDonut data={statistics.subjectDistribution} />
            </div>
          </div>
          <div>
            <span className="text-lg font-semibold">知识点错误分布</span>
            <div className="flex items-center justify-center">
              <ChartPieSimple data={statistics.knowledgeDistribution} />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-lg font-semibold">复习完成率</span>
            <div className="flex items-center justify-center">
              <div className="w-full h-[200px]">
                <ChartLineMultiple data={statistics.reviewTrend} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
