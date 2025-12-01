import { useState, useEffect } from 'react';

import {
  fetchDefinition,
  fetchRelatedQuestionsOrNote,
  fetchRelatedPoints,
  fetchTooltip,
  fetchStatistic,
  markAsMastered,
  saveNote,
  renamePoint,
  addSonPoint,
} from '@/services/apis/KnowledgePointApi/KnowledgePointApi';

import {
  KnowledgePointNode,
  RelatedData,
  KnowledgeTooltip,
  KnowledgeStatistic,
} from '@/services/apis/KnowledgePointApi/type';

export const useKnowledgePage = () => {
  const [activeId, setActiveId] = useState<number | string | null>(null);
  const [activeTitle, setActiveTitle] = useState('');

  // 详情数据 State
  const [description, setDescription] = useState('');
  const [isMastered, setIsMastered] = useState(false);
  const [relatedData, setRelatedData] = useState<RelatedData | null>(null);
  const [mistakeIds, setMistakeIds] = useState<any>([]);
  const [relatedPoints, setRelatedPoints] = useState<KnowledgePointNode[]>([]);
  const [stats, setStats] = useState<KnowledgeTooltip | null>(null);
  const [statistic, setStatistic] = useState<KnowledgeStatistic | null>(null);
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
    setStatistic(null);
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

    // 3. 并发获取其他数据 (错题、统计、关联等)
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

    // 同时获取提示信息和统计信息，合并数据
    Promise.all([
      fetchTooltip(activeId),
      fetchStatistic(activeId)
    ]).then(([tooltipRes, statisticRes]) => {
      // 处理统计信息
      let statisticData: KnowledgeStatistic | null = null;
      let countFromStatistic: number | undefined = undefined;

      if (statisticRes.code === 200 && statisticRes.data) {
        // 处理统计信息可能是字符串的情况
        if (typeof statisticRes.data === 'string') {
          statisticData = { message: statisticRes.data } as KnowledgeStatistic;
          const countMatch = statisticRes.data.match(/(\d+)/);
          countFromStatistic = countMatch ? parseInt(countMatch[1], 10) : 0;
        } else {
          // 如果是对象，正常处理
          statisticData = statisticRes.data as KnowledgeStatistic;
          countFromStatistic = statisticData.count;
        }
        setStatistic(statisticData);
      }

      // 处理提示信息
      if (tooltipRes.code === 200 && tooltipRes.data) {
        const tooltipData = tooltipRes.data;
        if (countFromStatistic !== undefined) {
          setStats({ ...tooltipData, count: countFromStatistic });
        } else {
          setStats(tooltipData);
        }
      }
    });

  }, [activeId]);

  // --- 交互逻辑保持不变 ---
  const handleMarkMastered = async () => {
    if (!activeId) return;
    try {
      const res = await markAsMastered(activeId);
      if (res.code === 200) {
        setIsMastered(true);
        fetchTooltip(activeId).then((tooltipRes) => {
          if (tooltipRes.code === 200 && tooltipRes.data) {
            setStats(tooltipRes.data);
          }
        });
      } else {
        console.error('标记为已掌握失败:', res.info || '未知错误');
      }
    } catch (e) {
      console.error('标记为已掌握异常:', e);
    }
  };

  const handleSaveNote = async () => {
    if (!activeId) return;
    try {
      const res = await saveNote(activeId, noteInput);
      if (res.code === 200) {
      } else {
        console.error('保存笔记失败:', res.info || '未知错误');
      }
    } catch (e) {
      console.error('保存笔记异常:', e);
    }
  };

  const handleRename = async (newName: string) => {
    if (!activeId || !newName.trim()) return;
    try {
      const res = await renamePoint(activeId, newName);
      if (res.code === 200) {
        setActiveTitle(newName);
        setRefreshTreeTrigger(prev => prev + 1);
      } else {
        console.error('重命名失败:', res.info || '未知错误');
      }
    } catch (e) {
      console.error('重命名异常:', e);
    }
  };

  const handleAddChild = async (name: string, desc: string) => {
    if (!activeId || !name.trim()) return false;
    try {
      const res = await addSonPoint(activeId, {
        pointId: String(activeId),
        pointName: name,
        pointDesc: desc,
        sonPoints: []
      });
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
    statistic,
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
