import { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Search, BookOpen, Send, Home, Clock, Menu,
  Edit2, Plus, Award, LayoutGrid, RotateCcw, RotateCw,
  User, Loader2, Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { AiChatPanel } from '@/components/business/AiChatPanel';

import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { useKnowledgePage } from '@/hooks/useKnowledgePage';

import { addSonPoint, deletePoint } from '@/services/apis/KnowledgePointApi/KnowledgePointApi';
import { generateQuestion } from '@/services/apis/questionapi/questionapi';

const scrollbarStyle = `
  .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const SUBJECT_PARENT_ID_MAP: Record<string, number> = {
  '数学': -1,
  '物理': -2,
  '化学': -3,
  '英语': -4,
  '政治': -5,
  '历史': -6,
  '语文': -7,
};

interface InternalLearningViewProps {
  title: string;
  description: string;
  mistakeIds: (string | number)[];
  relatedData: { questions: Array<{ id: string | number; question: string }>; note: string | null } | null;
  onBack: () => void;
}

const InternalLearningView = ({ title, description, onBack, mistakeIds, relatedData }: InternalLearningViewProps) => {
  const [generatedQuestion, setGeneratedQuestion] = useState<{ questionId: string; questionContent: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestion = async () => {
    if (mistakeIds.length === 0) {
      setError('暂无相关错题，无法生成练习题目');
      return;
    }

    const mistakeQuestionId = mistakeIds[0];

    setIsGenerating(true);
    setError(null);
    setGeneratedQuestion(null);

    try {
      const res = await generateQuestion(mistakeQuestionId);
      if (res.code === 200 && res.data) {
        setGeneratedQuestion(res.data);
      } else {
        setError(res.info || '生成题目失败');
      }
    } catch (e: any) {
      console.error('生成题目失败:', e);
      setError(e.message || '生成题目失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-60px)] bg-slate-50 flex overflow-hidden font-sans">
      <style>{scrollbarStyle}</style>
      <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 shrink-0 z-20 h-full">
        <Button variant="ghost" size="icon" onClick={onBack} title="返回图谱"><Home className="w-5 h-5 text-slate-500" /></Button>
        <div className="w-8 h-[1px] bg-slate-200" />
        <Button variant="ghost" size="icon"><Clock className="w-5 h-5 text-slate-400" /></Button>
        <Button variant="ghost" size="icon"><BookOpen className="w-5 h-5 text-slate-400" /></Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon"><Menu className="w-5 h-5 text-slate-400" /></Button>
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="text-lg font-bold text-slate-800">智能错题系统</div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs">你好，同学</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center"><User className="w-4 h-4 text-slate-600" /></div>
          </div>
        </div>
        <div className="flex-1 p-4 flex gap-4 overflow-hidden h-full">
          <div className="flex-[1.5] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
            <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-white shrink-0">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800 text-sm">知识点讲解 - {title}</span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scroll min-h-0">
              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-xl font-medium text-slate-800 mb-4 text-center">AI 生成笔记</h2>

                {/* 知识点描述 */}
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 text-slate-600 leading-relaxed text-base">
                  {description || '暂无详细描述'}
                </div>

                {/* 相关错题 */}
                {relatedData && relatedData.questions && relatedData.questions.length > 0 && (
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">相关错题</h3>
                    <div className="space-y-4">
                      {relatedData.questions.map((question, index) => (
                        <div key={`${question.id}-${index}`} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div className="text-xs text-slate-500 mb-2 font-medium">错题 #{question.id}</div>
                          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {question.question}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 笔记 */}
                {relatedData && relatedData.note && (
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">笔记</h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {relatedData.note}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 min-w-[320px] h-full overflow-hidden">
            <div className="flex-1 min-h-0 h-1/2">
              <AiChatPanel mode="embedded" className="h-full border border-slate-200 shadow-sm" />
            </div>
            <div className="flex-1 min-h-0 h-1/2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="h-12 border-b border-slate-100 bg-white flex justify-between items-center px-4 shrink-0">
                <span className="font-bold text-slate-800 text-sm">举一反三</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateQuestion}
                  disabled={isGenerating || mistakeIds.length === 0}
                  className="h-7 text-xs"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    '生成新题'
                  )}
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
                    {error}
                  </div>
                )}
                {generatedQuestion ? (
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-800 mb-2">练习题目</div>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {generatedQuestion.questionContent}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    {mistakeIds.length === 0
                      ? '暂无相关错题，无法生成练习题目'
                      : '点击"生成新题"按钮，AI将为您生成相关练习题目'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KnowledgePage() {
  const [currentSubject, setCurrentSubject] = useState('数学');

  const {
    nodes, edges, onNodesChange, onEdgesChange, onNodeClick,
    selectedNodeId, isLoading, refreshGraph, refreshNode, updateNodeLabel,
    undo, redo, canUndo, canRedo
  } = useKnowledgeGraph(currentSubject);

  // 详情 Hook
  const {
    activeTitle, setActiveTitle, setActiveId, description,
    stats, statistic, relatedPoints, relatedData, noteInput, setNoteInput,
    mistakeIds, isMastered,
    handleMarkMastered, handleSaveNote, handleRename,
    refreshTreeTrigger
  } = useKnowledgePage();

  const [isLearningMode, setIsLearningMode] = useState(false);

  // UI 状态
  const [isRenameMode, setIsRenameMode] = useState(false);
  const [tempName, setTempName] = useState('');

  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isAddRootOpen, setIsAddRootOpen] = useState(false);

  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');

  // 提交中状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 联动逻辑
  useEffect(() => {
    if (selectedNodeId) {
      setActiveId(selectedNodeId);
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node && node.data.label) {
        setActiveTitle(node.data.label);
      }
      setIsRenameMode(false);
    }
  }, [selectedNodeId, setActiveId, nodes, setActiveTitle]);

  // 全局刷新逻辑
  useEffect(() => {
    if (refreshTreeTrigger > 0) {
      if (selectedNodeId) {
        refreshNode(selectedNodeId);
      } else {
        refreshGraph();
      }
    }
  }, [refreshTreeTrigger, refreshGraph, refreshNode, selectedNodeId]);

  const submitRename = async () => {
    if (!tempName.trim()) {
      setIsRenameMode(false);
      return;
    }

    await handleRename(tempName);

    if (selectedNodeId) {
      updateNodeLabel(selectedNodeId, tempName);
    }

    setIsRenameMode(false);
  };

  // 添加子节点
  const submitAddChild = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const parentId = selectedNodeId;
    if (!parentId) {
      alert('请先选中父节点');
      setIsSubmitting(false);
      return;
    }

    if (!newNodeName.trim()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        pointId: String(parentId),
        pointName: newNodeName,
        pointDesc: newNodeDesc || '',
        sonPoints: []
      };


      const res = await addSonPoint(parentId, requestData);


      if (res && res.code === 200) {
        await refreshNode(parentId);
        setIsAddChildOpen(false);
        setNewNodeName('');
        setNewNodeDesc('');
      } else {
        alert('创建失败：' + (res?.info || '未知错误'));
      }
    } catch (e) {
      alert('网络或服务出错');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除节点
  const handleDeleteNode = async () => {
    if (!selectedNodeId || isDeleting) return;

    if (!confirm(`确定要删除知识点"${activeTitle}"吗？此操作不可撤销。`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deletePoint(selectedNodeId);
      if (res && res.code === 200) {
        setActiveId(null);
        refreshGraph();
        alert('删除成功');
      } else {
        alert('删除失败：' + (res?.info || '未知错误'));
      }
    } catch (e) {
      console.error('删除节点失败:', e);
      alert('删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  // 添加根节点
  const submitAddRoot = async () => {
    if (!newNodeName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const rootParentId = SUBJECT_PARENT_ID_MAP[currentSubject];

    if (rootParentId === undefined) {
      alert("该科目ID未配置");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await addSonPoint(rootParentId, {
        pointName: newNodeName,
        pointDesc: newNodeDesc || '根节点',
        sonPoints: [],
        pointId: null
      });
      if (res && res.code === 200) {
        setIsAddRootOpen(false);
        setNewNodeName('');
        setNewNodeDesc('');
        refreshGraph();
      } else {
        alert('创建根节点失败：' + (res?.info || '未知错误'));
      }
    } catch (e) {
      console.error('submitAddRoot error', e);
      refreshGraph();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLearningMode) {
    return (
      <InternalLearningView
        title={activeTitle}
        description={description}
        mistakeIds={mistakeIds}
        relatedData={relatedData}
        onBack={() => setIsLearningMode(false)}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-65px)] w-full bg-slate-50 overflow-hidden relative font-sans">
      <style>{scrollbarStyle}</style>

      {/* Header Search */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="relative w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="搜索..." className="pl-9 bg-white shadow-sm border-slate-200 rounded-full h-9 text-sm focus-visible:ring-blue-500" />
        </div>

        <Select value={currentSubject} onValueChange={setCurrentSubject}>
          <SelectTrigger className="w-[100px] bg-white shadow-sm border-slate-200 rounded-full h-9 text-sm">
            <SelectValue placeholder="科目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="数学">数学</SelectItem>
            <SelectItem value="物理">物理</SelectItem>
            <SelectItem value="语文">语文</SelectItem>
          </SelectContent>
        </Select>

        {/* 撤销/重做 */}
        <div className="flex bg-white rounded-full shadow-md p-0.5 border border-slate-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-l-full hover:bg-slate-100 text-slate-600 disabled:opacity-30"
            onClick={undo}
            disabled={!canUndo}
            title="撤销"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="w-[1px] bg-slate-200 my-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-r-full hover:bg-slate-100 text-slate-600 disabled:opacity-30"
            onClick={redo}
            disabled={!canRedo}
            title="重做"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        <Button
          size="icon"
          className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md text-white border-0"
          onClick={() => setIsAddRootOpen(true)}
          title="创建根节点"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Graph Area */}
      <div className="flex-1 h-full relative border-r border-slate-200">
        {isLoading && nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <LayoutGrid className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600 mb-2">
              当前科目【{currentSubject}】暂无知识点
            </p>
            <p className="text-sm text-slate-400 mb-6">创建一个根节点开始构建知识图谱</p>

            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg gap-2 pl-4 pr-5"
              onClick={() => setIsAddRootOpen(true)}
            >
              <Plus className="w-5 h-5" />
              创建第一个知识点
            </Button>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            className="bg-slate-50"
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Background color="#94a3b8" gap={24} size={1} />
            <Controls className="bg-white shadow-md border-slate-100 rounded-lg m-2" />
            <MiniMap className="bg-white border-slate-200 shadow-md rounded-lg m-4" nodeColor={(n) => n.type === 'input' ? '#3b82f6' : '#e2e8f0'} />
          </ReactFlow>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-[380px] h-full bg-white shadow-xl flex flex-col z-20 shrink-0 relative transition-all duration-300">
        {selectedNodeId ? (
          <div className="flex flex-col h-full bg-white relative">
            <div className="flex-1 overflow-y-auto px-5 py-6 pb-20 custom-scroll min-h-0">
              <div className="space-y-6">
                {/* Title & Actions */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-black text-slate-900">知识点</h2>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className={`h-8 w-8 ${isMastered ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400 hover:text-yellow-500'}`}
                        onClick={handleMarkMastered}
                        title="标记为已掌握"
                      >
                        <Award className="w-5 h-5 fill-current" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600"
                        onClick={() => setIsAddChildOpen(true)}
                        title="添加子知识点"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        onClick={handleDeleteNode}
                        disabled={isDeleting}
                        title="删除知识点"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 leading-relaxed">
                    {isRenameMode ? (
                      <div className="flex gap-2 items-center mb-2">
                        <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-8 text-sm font-bold" autoFocus />
                        <Button size="sm" onClick={submitRename} className="h-8 bg-blue-600 text-white">保存</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsRenameMode(false)} className="h-8">取消</Button>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-base">{activeTitle}</span>
                        <button type="button" className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none" onClick={() => { setTempName(activeTitle); setIsRenameMode(true); }}>
                          <Edit2 className="w-3 h-3 text-slate-300 hover:text-blue-500" />
                        </button>
                      </div>
                    )}
                    <p className="line-clamp-6 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 text-slate-600">
                      {description || "暂无定义描述..."}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-2">笔记</h2>
                  <Textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onBlur={handleSaveNote}
                    placeholder="在此处记录你的理解..."
                    className="resize-none border-slate-200 focus:border-blue-500 h-24 text-sm bg-slate-50/50"
                  />
                </div>

                {/* Stats */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-3">掌握情况</h2>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>关联错题</span>
                      <span className="font-bold text-slate-900">{stats?.count || 0} 道</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>熟练度</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((stats?.degreeOfProficiency || 0) * 100).toFixed(0)}%` }} />
                        </div>
                        <span className="font-medium text-slate-900">{((stats?.degreeOfProficiency || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>最近复习</span>
                      <span className="font-bold text-slate-900">{stats?.lastReviewTime || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Tooltip */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-3">提示</h2>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {stats ? (
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">熟练度：</span>
                          <span className="font-medium text-slate-900">{((stats.degreeOfProficiency || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">关联错题数量：</span>
                          <span className="font-medium text-slate-900">{stats.count || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">最近复习时间：</span>
                          <span className="font-medium text-slate-900">{stats.lastReviewTime || '暂无'}</span>
                        </div>
                        {statistic?.message && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="text-slate-500 mb-1">统计信息：</div>
                            <div className="font-medium text-slate-900 text-xs">{statistic.message}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-2">暂无提示</div>
                    )}
                  </div>
                </div>

                {/* Related */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-2">关联</h2>
                  <div className="flex flex-wrap gap-2">
                    {relatedPoints && relatedPoints.length > 0 ? relatedPoints.map((p) => (
                      <Badge key={p.id} variant="secondary" className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal cursor-pointer text-xs">
                        {p.keyPoints}
                      </Badge>
                    )) : (
                      <span className="text-xs text-slate-400">无直接关联</span>
                    )}
                  </div>
                </div>

                {/* Related Questions */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-3">相关错题</h2>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {relatedData && relatedData.questions && relatedData.questions.length > 0 ? (
                      <div className="space-y-3">
                        {relatedData.questions.map((question, index) => (
                          <div key={`${question.id}-${index}`} className="pb-3 border-b border-slate-200 last:border-b-0 last:pb-0">
                            <div className="text-xs text-slate-500 mb-1">错题 #{question.id}</div>
                            <div className="text-sm text-slate-700 leading-relaxed">{question.question}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-2">暂无相关错题</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent z-10">
              <Button
                className="w-full h-11 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                onClick={() => setIsLearningMode(true)}
              >
                <Send className="w-4 h-4 fill-current" />
                进入知识点
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-xs text-slate-500">点击左侧节点查看详情</p>
          </div>
        )}
      </div>

      {/* --- Modals --- */}

      {/* 1. 添加子节点 */}
      {isAddChildOpen && (
        <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center p-4 backdrop-blur-[1px]">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs p-5 border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">添加子知识点</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">名称</label>
                <Input value={newNodeName} onChange={e => setNewNodeName(e.target.value)} placeholder="例如：勾股定理" autoFocus />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">描述 (可选)</label>
                <Textarea value={newNodeDesc} onChange={e => setNewNodeDesc(e.target.value)} className="h-20 resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                {/* 提交添加子节点 */}
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={submitAddChild} disabled={!newNodeName.trim() || isSubmitting}>确认添加</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsAddChildOpen(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 添加根节点 */}
      {isAddRootOpen && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-4">新建【{currentSubject}】根知识点</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">知识点名称</label>
                <Input value={newNodeName} onChange={e => setNewNodeName(e.target.value)} placeholder="例如：函数..." autoFocus />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">描述</label>
                <Textarea value={newNodeDesc} onChange={e => setNewNodeDesc(e.target.value)} className="h-20 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                {/* 提交添加根节点 */}
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={submitAddRoot} disabled={!newNodeName.trim() || isSubmitting}>立即创建</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsAddRootOpen(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
