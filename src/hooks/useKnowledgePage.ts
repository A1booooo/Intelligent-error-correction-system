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
  KnowledgeTooltip,
} from '@/services/apis/KnowledgePointApi/type';

export const useKnowledgePage = () => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  
  const [description, setDescription] = useState('');
  const [isMastered, setIsMastered] = useState(false);
  const [relatedData, setRelatedData] = useState<RelatedData | null>(null);
  const [mistakeIds, setMistakeIds] = useState<any[]>([]); 
  const [relatedPoints, setRelatedPoints] = useState<KnowledgePointNode[]>([]);
  const [stats, setStats] = useState<KnowledgeTooltip | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const [refreshTreeTrigger, setRefreshTreeTrigger] = useState(0);

  useEffect(() => {
    if (activeId === null) return;


    setDescription('加载中...');
    setIsMastered(false);
    setRelatedData(null);
    setMistakeIds([]);
    setRelatedPoints([]);
    setStats(null);
    setNoteInput('');

    // 2. 调用 fetchDefinition 获取定义和掌握状态
    const loadDefinition = async () => {
      try {
        const res = await fetchDefinition(activeId);
        if (res.code === 200 && res.data) {
          // 渲染描述
          setDescription(res.data.content || '暂无详细描述');
          
          // 渲染掌握状态 (奖章是否变黄)
          setIsMastered(!!res.data.isMastered);

          // 如果后端返回了标题，同步更新标题 (可选)
          if (res.data.keyPoints) {
            setActiveTitle(res.data.keyPoints);
          }
        } else {
          setDescription('暂无详细描述');
        }
      } catch (e) {
        console.error("获取定义失败", e);
        setDescription('加载失败');
      }
    };
    loadDefinition();

    // 3. 并发获取其他数据 (错题、统计、关联等) - 保持原样
    fetchRelatedQuestionsOrNote(activeId).then((res) => {
      if (res.code === 200 && res.data) {
        setRelatedData(res.data);
        setNoteInput(res.data.note || '');
        if (res.data.questions) {
          setMistakeIds(res.data.questions.map(q => q.id));
        }
      }
    });

    fetchRelatedPoints(activeId).then((res) => {
      if (res.code === 200 && res.data) setRelatedPoints(res.data);
    });

    fetchTooltip(activeId).then((res) => {
      if (res.code === 200 && res.data) setStats(res.data);
    });

  }, [activeId]);

  // --- 交互逻辑保持不变 ---
  const handleMarkMastered = async () => {
    if (!activeId) return;
    try {
      const res = await markAsMastered(activeId);
      if (res.code === 200) setIsMastered(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async () => {
    if (!activeId) return;
    try { await saveNote(activeId, noteInput); } catch (e) { console.error(e); }
  };

  const handleRename = async (newName: string) => {
    if (!activeId || !newName.trim()) return;
    try {
      const res = await renamePoint(activeId, newName);
      if (res.code === 200) {
        setActiveTitle(newName);
        setRefreshTreeTrigger(prev => prev + 1);
      }
    } catch (e) { console.error(e); }
  };

  const handleAddChild = async (name: string, desc: string) => {
    if (!activeId || !name.trim()) return false;
    try {
      const res = await addSonPoint(activeId, { pointName: name, pointDesc: desc, sonPoints: [], pointId: null });
      if (res && res.code === 200) {
        setRefreshTreeTrigger(prev => prev + 1);
        return true;
      }
    } catch (e) { console.error(e); }
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