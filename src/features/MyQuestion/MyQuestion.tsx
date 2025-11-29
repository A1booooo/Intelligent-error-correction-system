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
import { AnalysisData } from '@/services/myQuestion/type';

interface QuestionBackendItem {
  id: number;
  subject: string;
  is_careless: boolean;
  is_knowledge_gap: boolean;
  is_calculation_error: boolean;
  is_time_shortage: boolean;
  update_time: string;
  question_content: string;
}

interface QuestionItem {
  id: number;
  subject: string;
  errorReason: string;
  date: string;
  content: string;
}

interface Filters {
  subjects: string[];
  errorTypes: string[];
  timeRanges: string[];
  page: number;
  size: number;
}

interface QuestionListResponse {
  content?: QuestionBackendItem[];
  [key: string]: unknown;
}

interface ApiResponse {
  code: number;
  message?: string;
  data?: unknown;
}

export default function MyQuestionPage() {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    page: '1' as string,
  });
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1,
  );
  const [filters, setFilters] = useState<Filters>({
    subjects: [],
    errorTypes: [],
    timeRanges: [],
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

  const mapErrorReason = (item: QuestionBackendItem) => {
    if (item.is_careless) {
      return '粗心马虎';
    } else if (item.is_knowledge_gap) {
      return '知识点不熟悉';
    } else if (item.is_calculation_error) {
      return '计算错误';
    } else if (item.is_time_shortage) {
      return '时间不够';
    } else {
      return '其他';
    }
  };

  const toggleFilterValue = (key: keyof Filters, value: string) => {
    setFilters((prev: Filters) => {
      const arr = prev[key] as string[];
      const exists = arr.includes(value);

      return {
        ...prev,
        [key]: exists ? arr.filter((v) => v !== value) : [...arr, value],
        page: 1,
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const params = {
        subjects: filters.subjects,
        errorTypes: filters.errorTypes,
        timeRanges: filters.timeRanges,
        page: filters.page - 1,
        size: filters.size,
      };

      try {
        const res = (await getQuestionList(params)) as QuestionListResponse;

        // Check if res and res.content exist
        if (res && res.content && Array.isArray(res.content)) {
          const mapped = res.content.map((item: QuestionBackendItem) => ({
            id: item.id,
            subject: item.subject,
            errorReason: mapErrorReason(item),
            date: item.update_time,
            content: item.question_content,
          }));
          setQuestionData(mapped);
        } else {
          console.warn('API response structure unexpected:', res);
          setQuestionData([]);
        }

        const statistics = await getStatistics();
        if (statistics) {
          setStatistics(statistics);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setQuestionData([]);
      }
    };

    fetchData();
  }, [filters]);

  useEffect(() => {
    setSearchParams({ page: currentPage.toString() });
    setFilters({ ...filters, page: currentPage });
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(Number(searchParams.get('page')) || 1);
    setFilters({ ...filters, page: Number(searchParams.get('page')) || 1 });
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    setCurrentPage(currentPage - 1);
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
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('数学') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('subjects', '数学')}
                >
                  数学
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('物理') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('subjects', '物理')}
                >
                  物理
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('化学') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('subjects', '化学')}
                >
                  化学
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.subjects.includes('英语') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('subjects', '英语')}
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
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRanges.includes('THIS_WEEK') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('timeRanges', 'THIS_WEEK')}
                >
                  本周
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRanges.includes('THIS_MONTH') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('timeRanges', 'THIS_MONTH')}
                >
                  本月
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRanges.includes('THIS_QUARTER') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() =>
                    toggleFilterValue('timeRanges', 'THIS_QUARTER')
                  }
                >
                  本季度
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.timeRanges.includes('THIS_YEAR') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('timeRanges', 'THIS_YEAR')}
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
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorTypes.includes('粗心马虎') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('errorTypes', '粗心马虎')}
                >
                  粗心马虎
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorTypes.includes('知识点不熟悉') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() =>
                    toggleFilterValue('errorTypes', '知识点不熟悉')
                  }
                >
                  知识点不熟悉
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorTypes.includes('计算错误') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('errorTypes', '计算错误')}
                >
                  计算错误
                </div>
                <div
                  className={`text-sm text-muted-foreground cursor-pointer text-center border p-2 ${filters.errorTypes.includes('时间不够') ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleFilterValue('errorTypes', '时间不够')}
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
              {questionData.map((question: QuestionItem) => (
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
                      className={` ${currentPage - 1 + index === currentPage ? 'bg-primary text-primary-foreground pointer-events-none' : 'cursor-pointer'} ${currentPage - 1 + index === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                      onClick={() => handlePageChange(currentPage - 1 + index)}
                    >
                      {currentPage - 1 + index}
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
