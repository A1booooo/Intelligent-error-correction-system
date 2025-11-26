import { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Search,  BookOpen, ArrowLeft,
  Sparkles, Repeat, PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { AiChatPanel } from '@/components/business/AiChatPanel';
import { useKnowledgeGraph } from '@/features/KnowledgePoint/useKnowledgeGraph';
import { useKnowledgePage } from '@/features/KnowledgePoint/KnowledgePoint';

export default function KnowledgePage() {
  // 1. 图谱逻辑
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onNodeClick, 
    selectedNodeId, isLoading 
  } = useKnowledgeGraph();
  
  // 2. 详情逻辑 
  const {
    activeTitle, setActiveId, description, relatedData, 
    noteInput, setNoteInput, handleSaveNote
  } = useKnowledgePage();

  // 3. 页面内部状态
  const [isLearningMode, setIsLearningMode] = useState(false);

  useEffect(() => {
    if (selectedNodeId) {
      setActiveId(Number(selectedNodeId));
      setIsLearningMode(false);
    }
  }, [selectedNodeId, setActiveId]);

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      
      <div className="absolute top-4 left-4 right-auto z-10 flex items-center gap-3">
        <div className="relative w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索知识点..." 
            className="pl-9 bg-white/80 backdrop-blur shadow-sm border-slate-200 focus-visible:ring-purple-500" 
          />
        </div>
        <Select defaultValue="math">
          <SelectTrigger className="w-[120px] bg-white/80 backdrop-blur shadow-sm border-slate-200">
            <SelectValue placeholder="选择科目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">数学</SelectItem>
            <SelectItem value="physics">物理</SelectItem>
            <SelectItem value="chemistry">化学</SelectItem>
            <SelectItem value="english">英语</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- 核心区域：思维导图 Canvas --- */}
      <div className="flex-1 h-full relative bg-slate-50/30">
        {isLoading ? (
           <div className="flex items-center justify-center h-full">
             <div className="flex flex-col items-center gap-3">
               <div className="h-8 w-8 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
               <p className="text-sm text-slate-500 font-medium">知识图谱生成中...</p>
             </div>
           </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
            className="bg-slate-50/30"
          >
            <Background color="#cbd5e1" gap={20} size={1} />
            <Controls className="bg-white shadow-sm border-slate-200 rounded-lg overflow-hidden" />
            <MiniMap 
              className="bg-white border-slate-200 shadow-sm rounded-lg overflow-hidden m-4" 
              nodeColor={(n) => n.type === 'input' ? '#7c3aed' : '#e2e8f0'}
            />
          </ReactFlow>
        )}
      </div>

      {/* --- 右侧详情面板 --- */}
      <div className="w-[400px] m-4 h-[calc(100%-2rem)] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col z-20 shrink-0 overflow-hidden transition-all duration-300">
        {selectedNodeId ? (
          isLearningMode ? (
            // === 模式 B: 深度学习模式 ===
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 shrink-0 bg-white">
                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setIsLearningMode(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="font-bold text-slate-900 truncate flex-1">
                  {activeTitle} <span className="text-purple-600 font-normal text-sm ml-1">· 深度学习</span>
                </span>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">AI 辅导中</Badge>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2 space-y-0">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <CardTitle className="text-sm font-bold">知识点讲解</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 text-sm text-slate-600 leading-relaxed">
                    {description || "正在生成知识点深度解析..."}
                    <div className="mt-2 h-2 w-24 bg-slate-100 rounded animate-pulse" />
                  </CardContent>
                </Card>

                <div className="h-[350px]">
                  <AiChatPanel mode="embedded" className="shadow-sm border-slate-200 h-full" />
                </div>

                <div className="grid grid-cols-2 gap-3 pb-4">
                  <Card className="shadow-sm border-slate-200 hover:border-purple-300 cursor-pointer transition-colors group">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                      <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Repeat className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">举一反三</span>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border-slate-200 hover:border-purple-300 cursor-pointer transition-colors group">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                      <div className="p-2 rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                        <PenTool className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">AI 自动出题</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            // === 模式 A: 概览模式 ===
            <>
              <div className="p-6 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">知识点</Badge>
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedNodeId}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {activeTitle || "未命名知识点"}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-4">
                <Card className="shadow-sm border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-600 rounded-full" />
                    <h3 className="text-sm font-semibold text-slate-800">知识点定义</h3>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                      {description || "暂无定义描述..."}
                    </p>
                  </div>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-purple-600 rounded-full" />
                      <h3 className="text-sm font-semibold text-slate-800">我的笔记</h3>
                    </div>
                    {/* @ts-ignore */}
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-purple-600" onClick={handleSaveNote}>保存</Button>
                  </div>
                  <div className="p-0">
                    <Textarea 
                      className="min-h-[100px] border-0 focus-visible:ring-0 resize-none text-sm bg-white rounded-none p-4"
                      placeholder="在此记录..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                    />
                  </div>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-600 rounded-full" />
                    <h3 className="text-sm font-semibold text-slate-800">练习数据</h3>
                  </div>
                  <div className="p-4 bg-white grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-slate-500 mb-1">关联错题</div>
                      <div className="text-lg font-bold text-slate-900">{relatedData?.questions.length || 0}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-slate-500 mb-1">复习频次</div>
                      <div className="text-lg font-bold text-slate-900">3</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 shadow-md gap-2 h-11 rounded-xl text-base font-medium transition-all active:scale-95"
                  onClick={() => setIsLearningMode(true)}
                >
                  <Sparkles className="w-5 h-5" />
                  进入知识点深度学习
                </Button>
              </div>
            </>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
            <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-medium text-slate-900 mb-1">未选择节点</h3>
            <p className="text-sm text-slate-500">点击左侧图谱节点<br/>查看详细信息</p>
          </div>
        )}
      </div>
    </div>
  );
}