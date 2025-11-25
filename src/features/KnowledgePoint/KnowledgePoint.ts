import { useState, useEffect } from 'react';
import {
  knowledgeApi,
  KnowledgePointNode,
  RelatedData,
} from '@/services/apis/KnowledgePointApi';
export const useKnowledgePage = () => {
  const [rootPoints, setRootPoints] = useState<KnowledgePointNode[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [refreshTreeTrigger, setRefreshTreeTrigger] = useState(0);

  const [description, setDescription] = useState('');
  const [relatedData, setRelatedData] = useState<RelatedData | null>(null);
  const [relatedPoints, setRelatedPoints] = useState<KnowledgePointNode[]>([]);
  const [isMastered, setIsMastered] = useState(false);

  const [noteInput, setNoteInput] = useState('');

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildDesc, setNewChildDesc] = useState('');
  const [operatingId, setOperatingId] = useState<number | null>(null);

  useEffect(() => {
    //暂写死 "数学"
    knowledgeApi.fetchRootPoints({ subject: '数学' }).then((res) => {
      if (res.success) setRootPoints(res.data);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;

    setDescription('加载中...');
    setRelatedData(null);
    setNoteInput('');
    setRelatedPoints([]);

    knowledgeApi
      .fetchDefinition(activeId)
      .then((res) => {
        if (res.success) {
          setDescription(res.data.content || '暂无详细描述');
          setIsMastered(!!res.data.isMastered);
        } else {
          setDescription('暂无详细描述 (未找到定义)');
        }
      })
      .catch(() => setDescription('暂无详细描述'));

    knowledgeApi.fetchRelatedQuestionsOrNote(activeId).then((res) => {
      if (res.success) {
        setRelatedData(res.data);
        setNoteInput(res.data.note || '');
      }
    });

    knowledgeApi.fetchRelatedPoints(activeId).then((res) => {
      if (res.success) setRelatedPoints(res.data);
    });
  }, [activeId]);

  const handleMarkMastered = async () => {
    if (!activeId) return;
    const res = await knowledgeApi.markAsMastered(activeId);
    if (res.success) {
      setIsMastered(true);
    }
  };

  const handleSaveNote = async () => {
    if (!activeId) return;
    await knowledgeApi.saveNote(activeId, noteInput);
  };

  const handleRename = async () => {
    if (!activeId || !newName.trim()) return;
    const res = await knowledgeApi.renamePoint(activeId, newName);
    if (res.success) {
      setActiveTitle(newName);
      setRefreshTreeTrigger((p) => p + 1);
      knowledgeApi.fetchRootPoints({ subject: '数学' }).then((r) => {
        if (r.success) setRootPoints(r.data);
      });
      setIsRenameOpen(false);
    }
  };

  const handleAddChild = async () => {
    if (!operatingId || !newChildName.trim()) return;
    const res = await knowledgeApi.addSonPoint(operatingId, {
      pointName: newChildName,
      pointDesc: newChildDesc,
    });
    if (res.success) {
      setRefreshTreeTrigger((p) => p + 1);
      setIsAddChildOpen(false);
      setNewChildName('');
      setNewChildDesc('');
    }
  };

  const openAddChildDialog = (parentId: number) => {
    setOperatingId(parentId);
    setIsAddChildOpen(true);
  };

  const openRenameDialog = () => {
    setNewName(activeTitle);
    setIsRenameOpen(true);
  };

  return {
    rootPoints,
    activeId,
    activeTitle,
    setActiveTitle,
    setActiveId,
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
  };
};
