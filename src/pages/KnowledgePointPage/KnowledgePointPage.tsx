import { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Search, BookOpen,
  Send, Home, Clock, Menu, User,
  Sparkles, AlertCircle, Save, CheckCircle, XCircle,
  Edit2, Plus, Award
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { AiChatPanel } from '@/components/business/AiChatPanel';

import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { useKnowledgePage } from '@/hooks/useKnowledgePage';

import { generateQuestion, judgeQuestion, recordQuestion } from '@/services/apis/questionapi/questionapi';
import { GenerationData } from '@/services/apis/questionapi/type';

const scrollbarStyle = `
  .custom-scroll::-webkit-scrollbar {
      width: 4px;
      height: 4px;
  }
  .custom-scroll::-webkit-scrollbar-track {
      background: transparent;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
  }
`;

// --- 全屏内页视图 (保持不变) ---
interface InternalLearningViewProps {
  title: string;
  description: string;
  mistakeIds: number[]; 
  onBack: () => void;
}

const InternalLearningView = ({ title, description, mistakeIds, onBack }: InternalLearningViewProps) => {
  const [practiceStep, setPracticeStep] = useState<'idle' | 'loading' | 'answering' | 'result'>('idle');
  const [questionData, setQuestionData] = useState<GenerationData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [judgeResult, setJudgeResult] = useState<'correct' | 'wrong' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateQuestion = async () => {
    if (mistakeIds.length === 0) {
      setErrorMessage("当前知识点暂无关联错题。");
      return;
    }
    setPracticeStep('loading');
    setErrorMessage(null);
    try {
      const randomId = mistakeIds[Math.floor(Math.random() * mistakeIds.length)];
      const res = await generateQuestion(randomId);
      if (res.code === 200) {
        setQuestionData(res.data);
        setPracticeStep('answering');
        setUserAnswer('');
        setJudgeResult(null);
      } else {
        setErrorMessage(`生成失败: ${res.info || '未知错误'}`);
        setPracticeStep('idle');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("网络请求超时，请检查服务连接");
      setPracticeStep('idle');
    }
  };

  const handleJudge = async () => {
    if (!questionData || !userAnswer.trim()) return;
    setPracticeStep('loading');
    setErrorMessage(null);
    try {
      const res = await judgeQuestion(questionData.questionId, userAnswer);
      if (res.code === 200) {
        setPracticeStep('result');
        const isCorrect = res.data.isCorrect || res.data.result === '正确'; 
        setJudgeResult(isCorrect ? 'correct' : 'wrong');
      } else {
        setErrorMessage(`判题失败: ${res.info || '未知错误'}`);
        setPracticeStep('answering');
      }
    } catch (error) {
      setErrorMessage("网络请求超时，无法提交");
      setPracticeStep('answering');
    }
  };

  const handleRecordMistake = async () => {
    if (!questionData) return;
    setIsRecording(true);
    setErrorMessage(null);
    try {
      const res = await recordQuestion(questionData.questionId);
      if (res.code !== 200) setErrorMessage(`录入失败: ${res.info || '未知错误'}`);
    } catch (error) {
      setErrorMessage("网络请求超时");
    } finally {
      setIsRecording(false);
    }
  };

  const handleReset = () => {
    setPracticeStep('idle');
    setQuestionData(null);
    setUserAnswer('');
    setErrorMessage(null);
  };

  return (
    <div className="w-full h-[calc(100vh-60px)] bg-slate-50 flex overflow-hidden font-sans">
      <style>{scrollbarStyle}</style>
      <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 shrink-0 z-20 h-full">
        <Button variant="ghost" size="icon" onClick={onBack} title="返回图谱">
          <Home className="w-5 h-5 text-slate-500" />
        </Button>
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
             <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
               <User className="w-4 h-4 text-slate-600" />
             </div>
          </div>
        </div>
        <div className="flex-1 p-4 flex gap-4 overflow-hidden h-full">
          <div className="flex-[1.5] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
             <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-white shrink-0">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-sm">知识点讲解 - {title}</span>
             </div>
             <div className="flex-1 p-6 overflow-y-auto custom-scroll min-h-0">
                <div className="max-w-4xl mx-auto">
                   <h2 className="text-xl font-medium text-slate-800 mb-4 text-center">AI 生成笔记</h2>
                   <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 text-slate-600 leading-relaxed text-base">
                     {description}
                     <br/><br/>
                     <p className="opacity-80">（此处为AI生成的详细解析内容）</p>
                   </div>
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
                   {practiceStep !== 'idle' && practiceStep !== 'loading' && (
                     <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400" onClick={handleReset}>重置</Button>
                   )}
                </div>
                <div className="flex-1 flex flex-col p-4 bg-slate-50/30 overflow-y-auto custom-scroll relative min-h-0">
                   {errorMessage && (
                     <div className="mb-2 bg-red-50 text-red-600 px-3 py-2 rounded-md text-xs flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2 shrink-0">
                       <AlertCircle className="w-4 h-4 shrink-0" />
                       <span>{errorMessage}</span>
                     </div>
                   )}
                   {practiceStep === 'idle' && (
                     <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-3">基于错题 {mistakeIds?.[0] || '暂无'} 生成变式题</p>
                          <Button onClick={handleGenerateQuestion} size="sm" className="bg-white border-slate-200 text-blue-600 hover:bg-blue-50 border shadow-sm h-9">
                            <Sparkles className="w-4 h-4 mr-2" />
                            生成 AI 练习题
                          </Button>
                        </div>
                     </div>
                   )}
                   {practiceStep === 'loading' && (
                     <div className="flex-1 flex items-center justify-center flex-col gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-xs text-slate-400">AI 思考中...</p>
                     </div>
                   )}
                   {practiceStep === 'answering' && questionData && (
                     <div className="flex flex-col h-full gap-2">
                        <div className="bg-white p-3 rounded-md border border-slate-200 text-sm text-slate-800 font-medium leading-relaxed flex-1 overflow-y-auto custom-scroll min-h-0">
                          {questionData.questionContent}
                        </div>
                        <div className="shrink-0 flex flex-col gap-2">
                            <Textarea 
                              placeholder="输入答案..." 
                              className="bg-white resize-none text-sm h-20"
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                            />
                            <Button onClick={handleJudge} disabled={!userAnswer.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">
                              提交判题
                            </Button>
                        </div>
                     </div>
                   )}
                   {practiceStep === 'result' && (
                     <div className="flex flex-col h-full items-center justify-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                           {judgeResult === 'correct' ? (
                             <CheckCircle className="w-10 h-10 text-green-500" />
                           ) : (
                             <XCircle className="w-10 h-10 text-red-500" />
                           )}
                           <span className={`text-base font-bold ${judgeResult === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                              {judgeResult === 'correct' ? '回答正确！' : '回答错误'}
                           </span>
                        </div>
                        {judgeResult === 'wrong' && (
                          <div className="w-full bg-orange-50 p-2 rounded-md border border-orange-100 flex items-center gap-2 text-orange-700 text-xs justify-center">
                             <span>建议录入错题库。</span>
                          </div>
                        )}
                        <div className="flex gap-2 w-full mt-auto shrink-0">
                           <Button variant="outline" size="sm" className="flex-1" onClick={handleReset}>再来一题</Button>
                           <Button 
                              className={`flex-1 ${isRecording ? 'opacity-70' : ''}`} 
                              variant="secondary"
                              size="sm"
                              onClick={handleRecordMistake}
                              disabled={isRecording}
                           >
                             <Save className="w-4 h-4 mr-2" />
                             录入错题
                           </Button>
                        </div>
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

// --- 主页面 ---
export default function KnowledgePage() {
  // 1. 科目状态管理
  const [currentSubject, setCurrentSubject] = useState('数学'); 

  // 2. 将科目传给图谱 Hook，Hook 内部会自动监听科目变化并请求后端
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onNodeClick, 
    selectedNodeId, isLoading, refreshGraph 
  } = useKnowledgeGraph(currentSubject); 
  
  // 3. 详情页 Hook
  const {
    activeTitle, setActiveTitle, setActiveId, description, 
    stats, relatedPoints, noteInput, setNoteInput, 
    handleSaveNote, mistakeIds,
    isMastered, handleMarkMastered, handleRename, handleAddChild,
    refreshTreeTrigger
  } = useKnowledgePage();

  const [isLearningMode, setIsLearningMode] = useState(false);
  
  // 本地 UI 状态 (添加子节点/重命名)
  const [isRenameMode, setIsRenameMode] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDesc, setNewChildDesc] = useState('');

  // 联动：选中节点更新
  useEffect(() => {
    if (selectedNodeId) {
      setActiveId(Number(selectedNodeId));
      // 优化：尝试从节点 data 中获取初始标题，避免接口延迟导致的闪烁
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node && node.data.label) {
        setActiveTitle(node.data.label);
      }
      setIsRenameMode(false);
    }
  }, [selectedNodeId, setActiveId, nodes, setActiveTitle]);

  // 联动：刷新图谱 (例如右侧添加了子节点后)
  useEffect(() => {
    if (refreshTreeTrigger > 0) {
      refreshGraph();
    }
  }, [refreshTreeTrigger, refreshGraph]);

  const submitRename = async () => {
    await handleRename(tempName);
    setIsRenameMode(false);
  };

  const submitAddChild = async () => {
    const success = await handleAddChild(newChildName, newChildDesc);
    if (success) {
      setIsAddChildOpen(false);
      setNewChildName('');
      setNewChildDesc('');
    }
  };

  if (isLearningMode) {
    return (
      <InternalLearningView 
        title={activeTitle}
        description={description}
        mistakeIds={mistakeIds}
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
        
        {/* 科目选择器 */}
        <Select 
          value={currentSubject} 
          onValueChange={(val) => setCurrentSubject(val)} // 切换科目会自动触发 Hook 刷新
        >
          <SelectTrigger className="w-[100px] bg-white shadow-sm border-slate-200 rounded-full h-9 text-sm">
            <SelectValue placeholder="科目" />
          </SelectTrigger>
          <SelectContent>

            <SelectItem value="数学">数学</SelectItem>
            <SelectItem value="物理">物理</SelectItem>
            <SelectItem value="语文">语文</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Graph Area */}
      <div className="flex-1 h-full relative border-r border-slate-200">
        {isLoading && nodes.length === 0 ? (
           <div className="flex items-center justify-center h-full">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
           </div>
        ) : nodes.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <BookOpen className="w-12 h-12 mb-3 text-slate-300" />
             <p className="text-sm font-medium">当前科目【{currentSubject}】暂无知识点数据</p>
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
              
              {/* 内容区域*/}
              <div className="flex-1 overflow-y-auto px-5 py-6 pb-20 custom-scroll min-h-0">
                <div className="space-y-6">
                  
                  {/* 1. 标题与工具栏 */}
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <h2 className="text-lg font-black text-slate-900">知识点</h2>
                       <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${isMastered ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400 hover:text-yellow-500'}`}
                            onClick={handleMarkMastered}
                            title={isMastered ? "已掌握" : "标记为已掌握"}
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
                       </div>
                    </div>

                    <div className="text-sm text-slate-600 leading-relaxed">
                      {isRenameMode ? (
                        <div className="flex gap-2 items-center mb-2">
                          <Input 
                            value={tempName} 
                            onChange={(e) => setTempName(e.target.value)}
                            className="h-8 text-sm font-bold"
                            autoFocus
                          />
                          <Button size="sm" onClick={submitRename} className="h-8 bg-blue-600 text-white">保存</Button>
                          <Button size="sm" variant="ghost" onClick={() => setIsRenameMode(false)} className="h-8">取消</Button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800 text-base">{activeTitle}</span>
                          <Edit2 
                            className="w-3 h-3 text-slate-300 cursor-pointer opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-opacity" 
                            onClick={() => {
                              setTempName(activeTitle);
                              setIsRenameMode(true);
                            }}
                          />
                        </div>
                      )}
                      
                      <p className="line-clamp-6 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 text-slate-600">
                        {description || "暂无定义描述..."}
                      </p>
                    </div>
                  </div>

                  {/* 2. 笔记区域 */}
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

                  {/* 3. 统计区域 */}
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
                                <div 
                                  className="h-full bg-blue-500 rounded-full" 
                                  style={{ width: `${stats?.degreeOfProficiency || 0}%` }} 
                                />
                             </div>
                             <span className="font-medium text-slate-900">{stats?.degreeOfProficiency || 0}%</span>
                          </div>
                       </div>
                       <div className="flex justify-between items-center text-xs text-slate-600">
                          <span>最近复习</span>
                          <span className="font-bold text-slate-900">{stats?.lastReviewTime || '-'}</span>
                       </div>
                    </div>
                  </div>

                  {/* 4. 关联区域 */}
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

                </div>
              </div>
              
              {/* 底部按钮 */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent z-10">
                <Button 
                  className="w-full h-11 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  onClick={() => setIsLearningMode(true)}
                >
                  <Send className="w-4 h-4 fill-current" />
                  进入知识点
                </Button>
              </div>

              {/* 弹窗：添加子节点 */}
              {isAddChildOpen && (
                <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center p-4 backdrop-blur-[1px]">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs p-5 border border-slate-200 animate-in zoom-in-95 duration-200">
                     <h3 className="font-bold text-slate-800 mb-4 text-lg">添加子知识点</h3>
                     <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">名称</label>
                          <Input 
                            value={newChildName} 
                            onChange={e => setNewChildName(e.target.value)} 
                            placeholder="例如：勾股定理"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">描述 (可选)</label>
                          <Textarea 
                             value={newChildDesc} 
                             onChange={e => setNewChildDesc(e.target.value)} 
                             className="h-20 resize-none"
                             placeholder="简单描述..."
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                           <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={submitAddChild} disabled={!newChildName.trim()}>确认添加</Button>
                           <Button variant="outline" className="flex-1" onClick={() => setIsAddChildOpen(false)}>取消</Button>
                        </div>
                     </div>
                  </div>
                </div>
              )}

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
    </div>
  );
}