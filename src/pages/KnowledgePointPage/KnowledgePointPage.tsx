import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  ListTree,
  CheckCircle2,
  FileText,
  AlertCircle,
  BarChart3,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// 引入 Hook 和 API 类型
import { useKnowledgePage } from '@/features/KnowledgePoint/KnowledgePoint';
import {
  knowledgeApi,
  KnowledgePointNode,
  KnowledgeTooltip,
} from '@/services/apis/KnowledgePointApi';

// --- 1. 定义 TreeNode 的 Props 类型 ---
interface TreeNodeProps {
  node: KnowledgePointNode;
  level?: number;
  activeId: number | null;
  onSelect: (id: number) => void;
  onAddChild: (id: number) => void;
  refreshTrigger: number;
}

// --- 子组件: 递归树节点 ---
const TreeNode = ({
  node,
  level = 0,
  activeId,
  onSelect,
  onAddChild,
  refreshTrigger,
}: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // 明确泛型类型
  const [children, setChildren] = useState<KnowledgePointNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tooltipData, setTooltipData] = useState<KnowledgeTooltip | null>(null);

  const loadChildren = async () => {
    if (loaded && children.length > 0) return;
    setIsLoading(true);
    try {
      const res = await knowledgeApi.fetchChildPoints(node.id);
      if (res.success) {
        setChildren(res.data);
        setLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 监听外部刷新触发重载
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      knowledgeApi
        .fetchChildPoints(node.id)
        .then((res) => {
          if (isMounted && res.success) setChildren(res.data);
        })
        .catch((err) => console.error(err));
    }
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, isOpen, node.id]);

  const loadTooltip = async (open: boolean) => {
    if (open && !tooltipData) {
      try {
        const res = await knowledgeApi.fetchTooltip(node.id);
        if (res.success) setTooltipData(res.data);
      } catch (error) {
        console.error('Tooltip load failed', error);
      }
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadChildren();
    }
  };

  return (
    <div className="select-none">
      <TooltipProvider delayDuration={300}>
        <Tooltip onOpenChange={loadTooltip}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'group flex items-center py-2 px-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors text-sm mb-0.5',
                activeId === node.id
                  ? 'bg-primary/5 text-primary font-medium'
                  : 'text-slate-600',
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => onSelect(node.id)}
            >
              <div
                className="mr-1 p-0.5 hover:bg-slate-200 rounded cursor-pointer"
                onClick={handleToggle}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <span className="truncate flex-1">{node.keyPoints}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-blue-100 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(node.id);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-white text-slate-800 border shadow-lg p-3 z-50"
          >
            {tooltipData ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3 h-3 text-blue-500" />
                  <span>
                    熟练度: {(tooltipData.degreeOfProficiency * 100).toFixed(0)}
                    %
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3 h-3 text-green-500" />
                  <span>复习: {tooltipData.count}次</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{tooltipData.lastReviewTime}</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">加载中...</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <div className="border-l border-slate-100 ml-4">
          {isLoading && (
            <div className="pl-6 py-1 text-xs text-slate-400">加载中...</div>
          )}
          {!isLoading &&
            children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                activeId={activeId}
                onSelect={onSelect}
                onAddChild={onAddChild}
                refreshTrigger={refreshTrigger}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// --- 主页面 ---
export default function KnowledgePointPage() {
  const {
    rootPoints,
    activeId,
    activeTitle,
    setActiveId,
    setActiveTitle,
    description,
    relatedData,
    relatedPoints,
    isMastered,
    noteInput,
    setNoteInput,
    isRenameOpen,
    setIsRenameOpen,
    isAddChildOpen,
    setIsAddChildOpen,
    newName,
    setNewName,
    newChildName,
    setNewChildName,
    newChildDesc,
    setNewChildDesc,
    refreshTreeTrigger,
    handleMarkMastered,
    handleSaveNote,
    handleRename,
    handleAddChild,
    openAddChildDialog,
    openRenameDialog,
  } = useKnowledgePage();

  return (
    <div className="flex flex-col flex-1 h-full p-6 gap-6 overflow-hidden bg-slate-50/50">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-slate-900">知识点库</h2>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden min-h-0">
        {/* 左侧：树形结构卡片 */}
        <Card className="col-span-4 lg:col-span-3 h-full flex flex-col border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="py-4 px-4 border-b bg-white shrink-0">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <ListTree className="w-4 h-4" /> 知识架构
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full p-3">
              {rootPoints.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  activeId={activeId}
                  onSelect={(id: number) => {
                    setActiveId(id);
                    setActiveTitle(node.keyPoints);
                  }}
                  onAddChild={openAddChildDialog}
                  refreshTrigger={refreshTreeTrigger}
                />
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 右侧：详情卡片 */}
        <Card className="col-span-8 lg:col-span-9 h-full flex flex-col border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          {activeId ? (
            <>
              <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between bg-white shrink-0 space-y-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-800 truncate max-w-[300px]">
                    {activeTitle || `知识点 ID: ${activeId}`}
                  </h2>
                  {isMastered ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                      已掌握
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-slate-500 border-slate-200"
                    >
                      未掌握
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={openRenameDialog}
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-primary" />
                  </Button>
                </div>
                <Button
                  // 修复：使用箭头函数包装，避免类型报错，并移除 @ts-ignore
                  onClick={() => handleMarkMastered()}
                  disabled={isMastered}
                  size="sm"
                  className={cn(
                    'shadow-sm',
                    isMastered
                      ? 'bg-green-600 hover:bg-green-600 opacity-90'
                      : '',
                  )}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isMastered ? '已掌握' : '标记掌握'}
                </Button>
              </CardHeader>

              <CardContent className="p-0 flex-1 overflow-hidden">
                <Tabs defaultValue="info" className="h-full flex flex-col">
                  <div className="px-6 border-b bg-white shrink-0">
                    <TabsList className="bg-transparent h-11 w-full justify-start gap-8 p-0">
                      <TabsTrigger
                        value="info"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-slate-500 rounded-none h-full bg-transparent px-0 pb-0 font-medium shadow-none"
                      >
                        详解
                      </TabsTrigger>
                      <TabsTrigger
                        value="questions"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-slate-500 rounded-none h-full bg-transparent px-0 pb-0 font-medium shadow-none"
                      >
                        相关错题
                        {relatedData?.questions?.length ? (
                          <span className="ml-2 bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full border border-red-100">
                            {relatedData.questions.length}
                          </span>
                        ) : null}
                      </TabsTrigger>
                      <TabsTrigger
                        value="notes"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-slate-500 rounded-none h-full bg-transparent px-0 pb-0 font-medium shadow-none"
                      >
                        我的笔记
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden bg-slate-50/30">
                    <ScrollArea className="h-full">
                      {/* Tab 1: 详解 */}
                      <TabsContent value="info" className="p-6 m-0 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                          <h3 className="font-semibold mb-3 flex items-center text-slate-900 text-sm">
                            <FileText className="w-4 h-4 mr-2 text-primary" />{' '}
                            核心概念
                          </h3>
                          <div className="text-slate-600 text-sm leading-7 whitespace-pre-wrap">
                            {description}
                          </div>
                        </div>
                        {relatedPoints.length > 0 && (
                          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <h3 className="font-semibold mb-3 text-slate-900 text-sm">
                              关联知识点
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {relatedPoints.map((p) => (
                                <Button
                                  key={p.id}
                                  variant="secondary"
                                  size="sm"
                                  className="text-slate-600 bg-slate-100 hover:bg-slate-200 h-8 text-xs"
                                  onClick={() => setActiveId(p.id)}
                                >
                                  {p.keyPoints}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab 2: 错题 */}
                      <TabsContent value="questions" className="p-6 m-0">
                        <div className="space-y-3">
                          {relatedData?.questions?.map((q) => (
                            <div
                              key={q.id}
                              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-red-50 rounded-md shrink-0">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800 mb-1 group-hover:text-primary transition-colors text-sm">
                                    题目 ID: {q.id}
                                  </div>
                                  <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                    {q.content}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {!relatedData?.questions?.length && (
                            <div className="text-center py-10 text-slate-400">
                              暂无相关错题
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Tab 3: 笔记 */}
                      <TabsContent value="notes" className="p-6 m-0 h-full">
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4">
                          <h3 className="font-semibold text-slate-900 text-sm">
                            学习笔记
                          </h3>
                          <Textarea
                            className="min-h-[300px] resize-y bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-primary"
                            placeholder="在此记录你的思考..."
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                          />
                          <div className="flex justify-end">
                            {/* 修复：使用箭头函数包装 */}
                            <Button
                              onClick={() => handleSaveNote()}
                              className="shadow-sm"
                            >
                              保存笔记
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </ScrollArea>
                  </div>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ListTree className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-sm font-medium">请在左侧选择知识点查看详情</p>
            </div>
          )}
        </Card>

        {/* 弹窗组件 */}
        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>重命名知识点</DialogTitle>
            </DialogHeader>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新名称"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                取消
              </Button>
              <Button onClick={handleRename}>确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加子知识点</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="知识点名称"
              />
              <Input
                value={newChildDesc}
                onChange={(e) => setNewChildDesc(e.target.value)}
                placeholder="简要描述 (可选)"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddChildOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleAddChild}>添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
