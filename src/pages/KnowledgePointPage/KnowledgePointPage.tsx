import { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Search, BookOpen,
  Send, Home, Clock, Menu, User,
  Sparkles, AlertCircle, Save, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { AiChatPanel } from '@/components/business/AiChatPanel';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { useKnowledgePage } from '@/hooks/useKnowledgePage';
import { questionApi, GenerationData } from '@/services/apis/questionapi';

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

interface InternalLearningViewProps {
  title: string;
  description: string;
  mistakeIds: number[]; 
  onBack: () => void;
}

// --- 全屏内页视图 ---
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
      const res = await questionApi.generate(randomId);
      if (res.code === 200) {
        setQuestionData(res.data);
        setPracticeStep('answering');
        setUserAnswer('');
        setJudgeResult(null);
      } else {
        setErrorMessage(`生成失败: ${res.info}`);
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
      const res = await questionApi.judge(questionData.questionId, userAnswer);
      if (res.code === 200) {
        setPracticeStep('result');
        const isExampleCorrect = Math.random() > 0.5; 
        setJudgeResult(isExampleCorrect ? 'correct' : 'wrong');
      } else {
        setErrorMessage(`判题失败: ${res.info}`);
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
      const res = await questionApi.record(questionData.questionId);
      if (res.code !== 200) setErrorMessage(`录入失败: ${res.info}`);
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
      
      {/* 1. 左侧导航  */}
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

      {/* 2. 主体内容  */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="text-lg font-bold text-slate-800">智能错题系统</div>
          <div className="flex items-center gap-3">
             <span className="text-slate-500 text-xs">你好，某某</span>
             <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
               <User className="w-4 h-4 text-slate-600" />
             </div>
          </div>
        </div>

        {/* 核心工作区 */}
        <div className="flex-1 p-4 flex gap-4 overflow-hidden h-full">
          
          {/* 左侧卡片：知识点讲解 */}
          <div className="flex-[1.5] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
             <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-white shrink-0">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-sm">知识点讲解 - {title}</span>
             </div>
             
             {/* 内容区域 */}
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

          {/* 右侧两栏：垂直排列，占据剩余宽度 */}
          <div className="flex-1 flex flex-col gap-4 min-w-[320px] h-full overflow-hidden">
             
             {/* 右上：AI 问答区 (高度 50%) */}
             {/* flex-1 min-h-0 确保均分高度且不溢出 */}
             <div className="flex-1 min-h-0 h-1/2"> 
               <AiChatPanel mode="embedded" className="h-full border border-slate-200 shadow-sm" />
             </div>

             {/* 右下：举一反三 */}
             <div className="flex-1 min-h-0 h-1/2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                 <div className="h-12 border-b border-slate-100 bg-white flex justify-between items-center px-4 shrink-0">
                   <span className="font-bold text-slate-800 text-sm">举一反三</span>
                   {practiceStep !== 'idle' && practiceStep !== 'loading' && (
                     <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400" onClick={handleReset}>重置</Button>
                   )}
                </div>
                
                {/* 练习内容区 */}
                <div className="flex-1 flex flex-col p-4 bg-slate-50/30 overflow-y-auto custom-scroll relative min-h-0">
                   
                   {errorMessage && (
                     <div className="mb-2 bg-red-50 text-red-600 px-3 py-2 rounded-md text-xs flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2 shrink-0">
                       <AlertCircle className="w-4 h-4 shrink-0" />
                       <span>{errorMessage}</span>
                     </div>
                   )}

                   {/* 状态视图 */}
                   {practiceStep === 'idle' && (
                     <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-3">基于错题 {mistakeIds[0]} 生成变式题</p>
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
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onNodeClick, 
    selectedNodeId, isLoading 
  } = useKnowledgeGraph();
  
  const {
    activeTitle, setActiveId, description, viewStats, relatedPoints,
    noteInput, setNoteInput, handleSaveNote, mistakeIds
  } = useKnowledgePage();

  const [isLearningMode, setIsLearningMode] = useState(false);

  useEffect(() => {
    if (selectedNodeId) {
      setActiveId(Number(selectedNodeId));
    }
  }, [selectedNodeId, setActiveId]);

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
        <Select defaultValue="math">
          <SelectTrigger className="w-[100px] bg-white shadow-sm border-slate-200 rounded-full h-9 text-sm">
            <SelectValue placeholder="科目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">数学</SelectItem>
            <SelectItem value="physics">物理</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Graph */}
      <div className="flex-1 h-full relative border-r border-slate-200">
        {isLoading ? (
           <div className="flex items-center justify-center h-full">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  
                  <div>
                    <h2 className="text-lg font-black text-slate-900 mb-2">知识点</h2>
                    <div className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800 block mb-1">{activeTitle}</span>
                      <p className="line-clamp-6">{description}</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900 mb-2">笔记</h2>
                    <Textarea 
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      onBlur={handleSaveNote}
                      placeholder="记录笔记..."
                      className="resize-none border-slate-200 focus:border-blue-500 h-24 text-sm bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900 mb-3">错题统计</h2>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <div className="flex justify-between items-center text-xs text-slate-600">
                          <span>错题数</span>
                          <span className="font-bold text-slate-900">{viewStats?.count || 0}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs text-slate-600">
                          <span>主要错因</span>
                          <span className="font-medium text-slate-900">{viewStats?.reason || '-'}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs text-slate-600">
                          <span>复盘</span>
                          <span className="font-bold text-slate-900">{viewStats?.review || 0}次</span>
                       </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900 mb-2">关联</h2>
                    <div className="flex flex-wrap gap-2">
                      {relatedPoints.length > 0 ? relatedPoints.map((p) => (
                        <Badge key={p.id} variant="secondary" className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal cursor-pointer text-xs">
                          {p.keyPoints}
                        </Badge>
                      )) : (
                        <span className="text-xs text-slate-400">无</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* 底部按钮 - 绝对定位固定在底部 */}
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
    </div>
  );
}