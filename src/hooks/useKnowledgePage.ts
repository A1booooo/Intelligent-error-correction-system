import { useState, useEffect } from 'react';
import {
  fetchDefinition,
  fetchRelatedQuestionsOrNote,
  fetchRelatedPoints,
  fetchTooltip,
  markAsMastered,
  saveNote,
  renamePoint,
  addSonPoint,
} from '@/services/apis/KnowledgePointApi/KnowledgePointApi'; 
import {   
  KnowledgePointNode,
  RelatedData,
  KnowledgeTooltip, } from '@/services/apis/KnowledgePointApi/type';

export const useKnowledgePage = () => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  
  // 详情数据
  const [description, setDescription] = useState('');
  const [isMastered, setIsMastered] = useState(false);
  const [relatedData, setRelatedData] = useState<RelatedData | null>(null);
  const [mistakeIds, setMistakeIds] = useState<number[]>([]); 
  const [relatedPoints, setRelatedPoints] = useState<KnowledgePointNode[]>([]);
  const [stats, setStats] = useState<KnowledgeTooltip | null>(null);
  
  const [noteInput, setNoteInput] = useState('');

  const [refreshTreeTrigger, setRefreshTreeTrigger] = useState(0);

  // 当 activeId 变化时，并发请求所有详情数据
  useEffect(() => {
    if (!activeId) return;

    setDescription('加载中...');
    setIsMastered(false);
    setRelatedData(null);
    setMistakeIds([]);
    setRelatedPoints([]);
    setStats(null);
    setNoteInput('');

    // 1. 获取定义 & 掌握状态 & 标题 
    fetchDefinition(activeId).then((res) => {
      if (res.code === 200 && res.data) {
        setDescription(res.data.content || '暂无详细描述');
        setIsMastered(!!res.data.isMastered);
        
        // 如果后端返回了 keyPoints (知识点名称)，同步更新标题
        // 使用类型断言或可选链确保安全
        if (res.data['keyPoints']) {
            setActiveTitle(res.data['keyPoints'] as string);
        }
      } else {
        setDescription('暂无详细描述');
      }
    }).catch(err => {
      console.error("获取定义失败", err);
      setDescription('加载失败');
    });

    // 2. 获取相关错题和笔记
    fetchRelatedQuestionsOrNote(activeId).then((res) => {
      if (res.code === 200 && res.data) {
        setRelatedData(res.data);
        setNoteInput(res.data.note || '');
        if (res.data.questions) {
          setMistakeIds(res.data.questions.map(q => q.id));
        }
      }
    });

    // 3. 获取相关知识点
    fetchRelatedPoints(activeId).then((res) => {
      if (res.code === 200 && res.data) setRelatedPoints(res.data);
    });

    // 4. 获取统计数据
    fetchTooltip(activeId).then((res) => {
      if (res.code === 200 && res.data) setStats(res.data);
    });

  }, [activeId]);

  // --- 交互操作 ---

  const handleMarkMastered = async () => {
    if (!activeId) return;
    const res = await markAsMastered(activeId);
    if (res.code === 200) {
      setIsMastered(true);
    }
  };

  const handleSaveNote = async () => {
    if (!activeId) return;
    await saveNote(activeId, noteInput);
  };

  const handleRename = async (newName: string) => {
    if (!activeId || !newName.trim()) return;
    const res = await renamePoint(activeId, newName);
    if (res.code === 200) {
      setActiveTitle(newName);
      setRefreshTreeTrigger((p) => p + 1); 
    }
  };

  const handleAddChild = async (name: string, desc: string) => {
    if (!activeId || !name.trim()) return false;
    const res = await addSonPoint(activeId, {
      pointName: name,
      pointDesc: desc,
    });
    if (res.code === 200) {
      setRefreshTreeTrigger((p) => p + 1);
      return true;
    }
    return false;
  };

  return {
    activeId,
    setActiveId,
    activeTitle,
    setActiveTitle, 
    description,
    isMastered,
    stats,
    relatedPoints,
    relatedData,
    mistakeIds,
    
    noteInput,
    setNoteInput,
    
    handleMarkMastered,
    handleSaveNote,
    handleRename,
    handleAddChild,
    
    refreshTreeTrigger
  };
};