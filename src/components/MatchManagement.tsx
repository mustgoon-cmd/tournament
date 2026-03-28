import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, Clock, MapPin, Users, ChevronRight, ChevronLeft,
  Play, CheckCircle2, AlertCircle, Layout, List, Trophy, 
  ChevronDown, ChevronUp, MoreHorizontal, Edit3, Trash2, 
  ArrowRight, User, Shield, Info, ExternalLink, X, Save,
  GitBranch, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchSession, PhaseType, SubMatch } from '../types';

// Mock Data
const MOCK_MATCHES: MatchSession[] = [
  {
    id: 'M001',
    code: 'BS-U12-G1-1',
    project_id: 'P001',
    project_name: '男子单打 (U12)',
    phase_id: 'PH001',
    phase_name: '第一阶段 - 小组赛',
    phase_type: PhaseType.GROUP_ROUND_ROBIN,
    round_index: 0,
    round_name: '第1轮',
    match_index: 0,
    participant_a: '张三',
    participant_a_source: 'A组种子',
    participant_a_seed: 1,
    participant_b: '李四',
    participant_b_source: 'B组抽签',
    status: 'COMPLETED',
    project_type: 'single',
    score: '21-15, 21-18',
    winner: '张三',
    court: '1号场地',
    match_date: '2024-05-20',
    start_time: '09:00',
    match_order: 1,
    referee_name: '王裁判',
    remarks: '比赛顺利',
    winner_to: 'M020',
    progression_status: 'COMPLETED'
  },
  {
    id: 'M002',
    code: 'BS-U12-G1-2',
    project_id: 'P001',
    project_name: '男子单打 (U12)',
    phase_id: 'PH001',
    phase_name: '第一阶段 - 小组赛',
    phase_type: PhaseType.GROUP_ROUND_ROBIN,
    round_index: 0,
    round_name: '第1轮',
    match_index: 1,
    participant_a: '王五',
    participant_a_source: 'C组种子',
    participant_a_seed: 2,
    participant_b: '赵六',
    participant_b_source: 'D组抽签',
    status: 'ONGOING',
    project_type: 'single',
    score: '11-10',
    court: '2号场地',
    match_date: '2024-05-20',
    start_time: '09:30',
    match_order: 2,
    referee_name: '陈裁判',
    progression_status: 'PENDING'
  },
  {
    id: 'M003',
    code: 'BT-OPEN-E1-1',
    project_id: 'P002',
    project_name: '男子团体 (公开组)',
    phase_id: 'PH002',
    phase_name: '第二阶段 - 淘汰赛',
    phase_type: PhaseType.ELIMINATION,
    round_index: 0,
    round_name: '1/8决赛',
    match_index: 0,
    participant_a: '先锋队',
    participant_a_source: 'A组第1',
    participant_b: '勇士队',
    participant_b_source: 'B组第2',
    status: 'PENDING',
    project_type: 'team',
    court: '3号场地',
    match_date: '2024-05-21',
    start_time: '10:00',
    match_order: 1,
    referee_name: '刘裁判',
    winner_to: 'M050',
    loser_to: 'L010',
    progression_status: 'PENDING',
    sub_matches: [
      {
        id: 'SM001',
        tie_id: 'M003',
        sub_event_id: 'SE001',
        sub_event_name: '第一单打',
        participant_a: '张三',
        participant_b: '李四',
        status: 'PENDING',
        order: 1
      },
      {
        id: 'SM002',
        tie_id: 'M003',
        sub_event_id: 'SE002',
        sub_event_name: '第一双打',
        participant_a: '王五/赵六',
        participant_b: '孙七/周八',
        status: 'PENDING',
        order: 2
      }
    ]
  },
  {
    id: 'M005',
    code: 'BD-U12-E1-1',
    project_id: 'P003',
    project_name: '男子双打 (U12)',
    phase_id: 'PH004',
    phase_name: '第一阶段 - 淘汰赛',
    phase_type: PhaseType.ELIMINATION,
    round_index: 0,
    round_name: '1/16决赛',
    match_index: 0,
    participant_a: '张三/李四',
    participant_b: '王五/赵六',
    status: 'PENDING',
    project_type: 'single',
    court: '4号场地',
    match_date: '2024-05-20',
    start_time: '11:00',
    match_order: 3,
    progression_status: 'PENDING'
  },
  {
    id: 'M006',
    code: 'GS-U12-E1-1',
    project_id: 'P004',
    project_name: '女子单打 (U12)',
    phase_id: 'PH005',
    phase_name: '第一阶段 - 淘汰赛',
    phase_type: PhaseType.ELIMINATION,
    round_index: 0,
    round_name: '1/16决赛',
    match_index: 0,
    participant_a: '小红',
    participant_b: '小绿',
    status: 'PENDING',
    project_type: 'single',
    court: '5号场地',
    match_date: '2024-05-20',
    start_time: '11:30',
    match_order: 4,
    progression_status: 'PENDING'
  },
  {
    id: 'M007',
    code: 'XD-U12-E1-1',
    project_id: 'P005',
    project_name: '混合双打 (U12)',
    phase_id: 'PH006',
    phase_name: '第一阶段 - 淘汰赛',
    phase_type: PhaseType.ELIMINATION,
    round_index: 0,
    round_name: '1/16决赛',
    match_index: 0,
    participant_a: '张三/小红',
    participant_b: '李四/小绿',
    status: 'PENDING',
    project_type: 'single',
    court: '6号场地',
    match_date: '2024-05-20',
    start_time: '12:00',
    match_order: 5,
    progression_status: 'PENDING'
  }
];

type ViewMode = 'all' | 'bracket' | 'schedule' | 'result';

export default function MatchManagement() {
  const [matches, setMatches] = useState<MatchSession[]>(MOCK_MATCHES);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedRounds, setSelectedRounds] = useState<string[]>([]);
  const [selectedTreeNode, setSelectedTreeNode] = useState<{ type: 'all' | 'group' | 'format' | 'project', value: string }>({ type: 'all', value: 'all' });
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [treeGroupingMode, setTreeGroupingMode] = useState<'age' | 'format'>('age');
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Set<string>>(new Set(['all']));
  const [selectedProjectType, setSelectedProjectType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchReferee, setSearchReferee] = useState('');
  const [searchParticipant, setSearchParticipant] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());
  const [isQuickEditModalOpen, setIsQuickEditModalOpen] = useState(false);
  const [quickEditType, setQuickEditType] = useState<'time-location' | 'referee'>('time-location');
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempReferee, setTempReferee] = useState('');

  const openQuickEdit = (match: MatchSession, type: 'time-location' | 'referee') => {
    setEditingMatch(match);
    setQuickEditType(type);
    setTempDate(match.match_date || '');
    setTempTime(match.start_time || '');
    setTempLocation(match.court || '');
    setTempReferee(match.referee_name || '');
    setIsQuickEditModalOpen(true);
  };

  const handleQuickSave = () => {
    if (!editingMatch) return;
    const updatedMatches = matches.map(m => {
      if (m.id === editingMatch.id) {
        if (quickEditType === 'time-location') {
          return { ...m, match_date: tempDate, start_time: tempTime, court: tempLocation };
        } else {
          return { ...m, referee_name: tempReferee };
        }
      }
      return m;
    });
    setMatches(updatedMatches);
    setIsQuickEditModalOpen(false);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedMatches);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMatches(newExpanded);
  };

  const parseProjectName = (name: string) => {
    const match = name.match(/(.*)\s*\((.*)\)/);
    if (match) {
      return { format: match[1].trim(), group: match[2].trim() };
    }
    return { format: name, group: '其他' };
  };

  const toggleTreeExpand = (nodeId: string) => {
    setExpandedTreeNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const treeData = useMemo<Record<string, string[]>>(() => {
    const data: Record<string, string[]> = {};
    
    matches.forEach(m => {
      const { format, group } = parseProjectName(m.project_name);
      
      // If searching, only include if matches search query
      if (treeSearchQuery && !m.project_name.toLowerCase().includes(treeSearchQuery.toLowerCase())) {
        return;
      }

      const primaryKey = treeGroupingMode === 'age' ? group : format;
      
      if (!data[primaryKey]) data[primaryKey] = [];
      if (!data[primaryKey].includes(m.project_name)) {
        data[primaryKey].push(m.project_name);
      }
    });
    
    return data;
  }, [matches, treeSearchQuery, treeGroupingMode]);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncProgression, setSyncProgression] = useState(true);

  // Form states for modal
  const [score, setScore] = useState('');
  const [winner, setWinner] = useState('');
  const [status, setStatus] = useState('');
  const [referee, setReferee] = useState('');
  const [remarks, setRemarks] = useState('');

  const openResultModal = (match: MatchSession) => {
    setEditingMatch(match);
    setScore(match.score || '');
    setWinner(match.winner || '');
    setStatus(match.status || 'PENDING');
    setReferee(match.referee_name || '');
    setRemarks(match.remarks || '');
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async () => {
    if (!editingMatch) return;

    setIsSaving(true);
    
    // Simulate API call delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    const updatedMatches = matches.map(m => {
      if (m.id === editingMatch.id) {
        return {
          ...m,
          score,
          winner,
          status: status as any,
          referee_name: referee,
          remarks
        };
      }
      return m;
    });

    // Basic progression logic if enabled
    if (syncProgression && status === 'COMPLETED' && winner && editingMatch.winner_to) {
      const nextMatchIndex = updatedMatches.findIndex(m => m.id === editingMatch.winner_to);
      if (nextMatchIndex !== -1) {
        const nextMatch = updatedMatches[nextMatchIndex];
        // Determine if participant A or B needs updating in the next match
        if (nextMatch.participant_a_source === `${editingMatch.id}胜者`) {
          updatedMatches[nextMatchIndex] = { ...nextMatch, participant_a: winner };
        } else if (nextMatch.participant_b_source === `${editingMatch.id}胜者`) {
          updatedMatches[nextMatchIndex] = { ...nextMatch, participant_b: winner };
        }
      }
    }

    setMatches(updatedMatches);
    setIsSaving(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setIsResultModalOpen(false);
      setShowSuccess(false);
    }, 1000);
  };

  // Get unique values for filtering
  const availablePhases = useMemo(() => {
    if (selectedTreeNode.type !== 'project') return [];
    const p = new Set<string>();
    matches.filter(m => m.project_name === selectedTreeNode.value).forEach(m => p.add(m.phase_name));
    return Array.from(p);
  }, [matches, selectedTreeNode]);

  const availableRounds = useMemo(() => {
    if (selectedTreeNode.type !== 'project') return [];
    const r = new Set<string>();
    matches.filter(m => m.project_name === selectedTreeNode.value).forEach(m => r.add(m.round_name));
    return Array.from(r);
  }, [matches, selectedTreeNode]);

  const projectTypes = useMemo(() => {
    const p = new Set<string>();
    matches.forEach(m => p.add(m.project_type || ''));
    return Array.from(p).filter(Boolean);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const { format, group } = parseProjectName(m.project_name);
      
      // 1. Tree selection filtering (Always apply)
      let matchesTree = true;
      if (selectedTreeNode.type === 'group') {
        if (treeGroupingMode === 'age') {
          matchesTree = group === selectedTreeNode.value;
        } else {
          matchesTree = format === selectedTreeNode.value;
        }
      } else if (selectedTreeNode.type === 'project') {
        matchesTree = m.project_name === selectedTreeNode.value;
      }
      if (!matchesTree) return false;

      // 2. Phase and Round filtering (Only if project selected)
      if (selectedTreeNode.type === 'project') {
        const matchesPhase = selectedPhases.length === 0 || selectedPhases.includes(m.phase_name);
        if (!matchesPhase) return false;

        const matchesRound = selectedRounds.length === 0 || selectedRounds.includes(m.round_name);
        if (!matchesRound) return false;
      }

      // 3. Search filtering (Always apply)
      const matchesSearch = searchQuery === '' || 
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.participant_a || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.participant_b || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 4. View-specific or Detailed filters
      if (viewMode === 'all') {
        const matchesProjectType = selectedProjectType === 'all' || m.project_type === selectedProjectType;
        const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
        const matchesReferee = searchReferee === '' || (m.referee_name || '').toLowerCase().includes(searchReferee.toLowerCase());
        const matchesParticipant = searchParticipant === '' || 
          (m.participant_a || '').toLowerCase().includes(searchParticipant.toLowerCase()) ||
          (m.participant_b || '').toLowerCase().includes(searchParticipant.toLowerCase());
        const matchesDate = selectedDate === '' || m.match_date === selectedDate;

        return matchesProjectType && matchesStatus && matchesReferee && matchesParticipant && matchesDate;
      }
      
      const matchesStatus = 
        activeTab === 'all' || 
        viewMode !== 'schedule' ||
        (activeTab === 'pending' && m.status === 'PENDING') ||
        (activeTab === 'ongoing' && m.status === 'ONGOING') ||
        (activeTab === 'finished' && m.status === 'COMPLETED');

      return matchesStatus;
    });
  }, [matches, searchQuery, activeTab, selectedPhases, selectedRounds, viewMode, selectedProjectType, selectedStatus, searchReferee, searchParticipant, selectedDate, selectedTreeNode]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border";
    switch (status) {
      case 'PENDING':
        return <span className={`${baseClasses} bg-slate-100 text-slate-600 border-slate-200`}>未开始</span>;
      case 'ONGOING':
        return <span className={`${baseClasses} bg-amber-50 text-amber-600 border-amber-100 animate-pulse`}>进行中</span>;
      case 'COMPLETED':
        return <span className={`${baseClasses} bg-emerald-50 text-emerald-600 border-emerald-100`}>已结束</span>;
      case 'WALKOVER':
        return <span className={`${baseClasses} bg-red-50 text-red-600 border-red-100`}>弃权</span>;
      case 'WITHDRAWAL':
        return <span className={`${baseClasses} bg-slate-50 text-slate-500 border-slate-200`}>退赛</span>;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-8 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">比赛管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理赛事项目、比赛阶段及比分结果</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
          {[
            { id: 'all', label: '全部比赛', icon: Layout },
            { id: 'bracket', label: '对阵视图', icon: GitBranch },
            { id: 'schedule', label: '日程视图', icon: Calendar },
            { id: 'result', label: '成绩视图', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                viewMode === tab.id 
                  ? 'bg-white text-indigo-600 shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Column: Project Tree */}
        <div className="w-72 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-bottom border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              赛事项目
            </h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button 
                onClick={() => {
                  setTreeGroupingMode('age');
                  if (selectedTreeNode.type === 'group') setSelectedTreeNode({ type: 'all', value: 'all' });
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${treeGroupingMode === 'age' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                按组别
              </button>
              <button 
                onClick={() => {
                  setTreeGroupingMode('format');
                  if (selectedTreeNode.type === 'group') setSelectedTreeNode({ type: 'all', value: 'all' });
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${treeGroupingMode === 'format' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                按项目
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="搜索项目..."
              value={treeSearchQuery}
              onChange={(e) => setTreeSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <button
            onClick={() => setSelectedTreeNode({ type: 'all', value: 'all' })}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all mb-1 ${
              selectedTreeNode.type === 'all' 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layout className="w-4 h-4" />
            全部项目
          </button>

          {(Object.entries(treeData) as [string, string[]][]).map(([group, projects]) => {
            const isGroupExpanded = expandedTreeNodes.has(`group:${group}`);
            const isGroupSelected = selectedTreeNode.type === 'group' && selectedTreeNode.value === group;

            return (
              <div key={group} className="mb-1">
                <div 
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-xl cursor-pointer transition-all ${
                    isGroupSelected ? 'bg-indigo-50/50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    setSelectedTreeNode({ type: 'group', value: group });
                    setSelectedPhases([]);
                    setSelectedRounds([]);
                    toggleTreeExpand(`group:${group}`);
                  }}
                >
                  {isGroupExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <Shield className={`w-3.5 h-3.5 ${isGroupSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold truncate flex-1">{group}</span>
                </div>

                {isGroupExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2">
                    {projects.map(projectName => {
                      const isProjectSelected = selectedTreeNode.type === 'project' && selectedTreeNode.value === projectName;
                      return (
                        <div 
                          key={projectName}
                          className={`px-3 py-1 rounded-md cursor-pointer text-[10px] transition-all ${
                            isProjectSelected 
                              ? 'bg-emerald-50 text-emerald-700 font-bold' 
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                          onClick={() => {
                            setSelectedTreeNode({ type: 'project', value: projectName });
                            setSelectedPhases([]);
                            setSelectedRounds([]);
                          }}
                        >
                          {projectName}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Match List */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Search and Filters Area */}
        <div className="p-6 border-b border-slate-100 space-y-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="搜索场次编号、项目、选手..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer min-w-[120px]"
              >
                <option value="all">所有状态</option>
                <option value="PENDING">未开始</option>
                <option value="ONGOING">进行中</option>
                <option value="COMPLETED">已结束</option>
              </select>
              
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPhases([]);
                  setSelectedRounds([]);
                  setSelectedStatus('all');
                  setSelectedProjectType('all');
                  setSearchReferee('');
                  setSearchParticipant('');
                  setSelectedDate('');
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="重置筛选"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dynamic Phase and Round Filters (Only when a specific project is selected) */}
          {selectedTreeNode.type === 'project' && (
            <div className="space-y-3 pt-2">
              {availablePhases.length > 0 && (
                <div className="flex items-start gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 w-16 shrink-0">阶段:</span>
                  <div className="flex flex-wrap gap-2">
                    {availablePhases.map(phase => (
                      <button
                        key={phase}
                        onClick={() => {
                          setSelectedPhases(prev => 
                            prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
                          );
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                          selectedPhases.includes(phase)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                        }`}
                      >
                        {phase}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableRounds.length > 0 && (
                <div className="flex items-start gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5 w-16 shrink-0">轮次:</span>
                  <div className="flex flex-wrap gap-2">
                    {availableRounds.map(round => (
                      <button
                        key={round}
                        onClick={() => {
                          setSelectedRounds(prev => 
                            prev.includes(round) ? prev.filter(r => r !== round) : [...prev, round]
                          );
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                          selectedRounds.includes(round)
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-600'
                        }`}
                      >
                        {round}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${viewMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Main Content Area */}
          {viewMode === 'all' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">比赛信息</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">对阵双方</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">时间/地点</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">裁判/状态</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatches.map((match) => (
                      <tr key={match.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-600 font-mono">{match.code}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">{match.round_name}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 mt-1">{match.project_name}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{match.phase_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {[
                              { name: match.participant_a, source: match.participant_a_source },
                              { name: match.participant_b, source: match.participant_b_source }
                            ].map((p, i) => (
                              <div key={i} className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${p.name?.includes('待定') ? 'bg-slate-300' : 'bg-indigo-500'}`} />
                                  <span className={`text-sm ${p.name?.includes('待定') ? 'text-slate-400 italic' : 'font-bold text-slate-900'}`}>
                                    {p.name || '待定'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 ml-3.5">
                                  <Info className="w-3 h-3 text-slate-300" />
                                  <span className="text-[10px] text-slate-400">
                                    来源: {p.source || '抽签填入'}
                                    {p.source?.includes('胜者') && <span className="ml-1 text-indigo-400">(晋级)</span>}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {match.match_date && match.start_time ? (
                            <div className="flex flex-col gap-1 group relative">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-mono">{match.match_date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-mono">{match.start_time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[10px]">{match.court}</span>
                              </div>
                              <button 
                                onClick={() => openQuickEdit(match, 'time-location')}
                                className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => openQuickEdit(match, 'time-location')}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-[10px] font-bold"
                            >
                              <Calendar className="w-3 h-3" />
                              设置时间/地点
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {match.referee_name ? (
                              <div className="flex items-center gap-1.5 group relative">
                                <Shield className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-600">{match.referee_name}</span>
                                <button 
                                  onClick={() => openQuickEdit(match, 'referee')}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-all ml-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => openQuickEdit(match, 'referee')}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-[10px] font-bold"
                              >
                                <User className="w-3 h-3" />
                                指派裁判
                              </button>
                            )}
                            {getStatusBadge(match.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openResultModal(match)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                            >
                              成绩录入
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === 'bracket' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <GitBranch className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">对阵图视图</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mt-2">
                  正在根据当前阶段生成对阵图。淘汰赛阶段将以树状结构展示晋级路径。
                </p>
              </div>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">
                生成对阵图
              </button>
            </div>
          ) : viewMode === 'schedule' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12"></th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">场次信息</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">对阵双方</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">时间/地点</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">裁判/状态</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatches.map((match) => (
                      <React.Fragment key={match.id}>
                        <tr className={`hover:bg-slate-50/50 transition-colors ${expandedMatches.has(match.id) ? 'bg-indigo-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => toggleExpand(match.id)}
                              className="p-1 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-indigo-100"
                            >
                              {expandedMatches.has(match.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-indigo-600 font-mono">{match.code}</span>
                              <span className="text-sm font-bold text-slate-900 mt-0.5">{match.project_name}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">{match.phase_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${match.winner === match.participant_a ? 'bg-indigo-500' : 'bg-slate-200'}`}></span>
                                <span className={`text-sm ${match.winner === match.participant_a ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                  {match.participant_a || '待定'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${match.winner === match.participant_b ? 'bg-indigo-500' : 'bg-slate-200'}`}></span>
                                <span className={`text-sm ${match.winner === match.participant_b ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                  {match.participant_b || '待定'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-mono">{match.match_date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-mono">{match.start_time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[10px]">{match.court}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-600">{match.referee_name || '未指派'}</span>
                              </div>
                              {getStatusBadge(match.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openResultModal(match)}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                              >
                                成绩录入
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedMatches.has(match.id) && (
                            <tr>
                              <td colSpan={6} className="px-6 py-0 border-none">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="py-6 pl-12 pr-6 grid grid-cols-3 gap-8 bg-slate-50/50 border-b border-slate-100">
                                    {/* Match Progression */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="h-1 w-4 bg-indigo-600 rounded-full" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">晋级路径</p>
                                      </div>
                                      <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                                        <div className="relative">
                                          <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white"></div>
                                          <p className="text-[10px] text-slate-400">上一场次</p>
                                          <p className="text-xs font-bold text-slate-600">第一轮</p>
                                        </div>
                                        <div className="relative">
                                          <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white"></div>
                                          <p className="text-[10px] text-indigo-400 font-bold">当前场次</p>
                                          <p className="text-xs font-bold text-indigo-600">{match.code}</p>
                                        </div>
                                        <div className="relative">
                                          <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white"></div>
                                          <p className="text-[10px] text-slate-400">下一场次</p>
                                          <p className="text-xs font-bold text-slate-600">{match.winner_to || '决赛/结束'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Sub-matches / Sets */}
                                    <div className="space-y-4 col-span-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="h-1 w-4 bg-indigo-600 rounded-full" />
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分局/小项比分</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">赛制: BO3</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        {match.sub_matches?.map((sub, idx) => (
                                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                            <div className="flex flex-col">
                                              <span className="text-[10px] font-bold text-slate-400">第 {idx + 1} 局</span>
                                              <span className="text-xs text-slate-600 mt-0.5">{sub.sub_event_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                              <span className="text-sm font-mono font-bold text-slate-400">
                                                -
                                              </span>
                                              <span className="text-slate-300 text-[10px]">:</span>
                                              <span className="text-sm font-mono font-bold text-slate-400">
                                                -
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                        {(!match.sub_matches || match.sub_matches.length === 0) && (
                                          <div className="col-span-2 py-8 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-200">
                                            <p className="text-xs text-slate-400">暂无分局数据</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination / Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  显示 <span className="font-bold text-slate-700">{filteredMatches.length}</span> 场比赛中的 <span className="font-bold text-slate-700">1-{filteredMatches.length}</span> 场
                </p>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-100">1</button>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">成绩公示视图</h3>
                    <p className="text-slate-500 text-xs">展示已结束比赛的最终比分及获胜者</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                  <FileText className="w-3.5 h-3.5" />
                  导出成绩册
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">场次编号</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">项目/阶段</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">对阵双方</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">比分</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">获胜者</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatches.filter(m => m.status === 'COMPLETED' || m.status === 'WALKOVER').map((match) => (
                      <tr key={match.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-indigo-600 font-mono">{match.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{match.project_name}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{match.phase_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{match.participant_a}</span>
                            <span className="text-slate-300 font-black italic text-[10px]">VS</span>
                            <span>{match.participant_b}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                            {match.score || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                              <Trophy className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">{match.winner || '--'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(match.status)}
                        </td>
                      </tr>
                    ))}
                    {filteredMatches.filter(m => m.status === 'COMPLETED' || m.status === 'WALKOVER').length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Info className="w-8 h-8 opacity-20" />
                            <p className="text-sm">暂无已完成的比赛成绩</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
        </div>
      </div>
    </div>

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {isQuickEditModalOpen && editingMatch && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {quickEditType === 'time-location' ? '设置时间/地点' : '指派裁判'}
                </h3>
                <button 
                  onClick={() => setIsQuickEditModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {quickEditType === 'time-location' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">比赛日期</label>
                      <input 
                        type="date" 
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">开始时间</label>
                      <input 
                        type="time" 
                        value={tempTime}
                        onChange={(e) => setTempTime(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">比赛地点/场地</label>
                      <input 
                        type="text" 
                        value={tempLocation}
                        onChange={(e) => setTempLocation(e.target.value)}
                        placeholder="例如: 1号场地"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">裁判姓名</label>
                    <input 
                      type="text" 
                      value={tempReferee}
                      onChange={(e) => setTempReferee(e.target.value)}
                      placeholder="输入裁判姓名"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsQuickEditModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold"
                >
                  取消
                </button>
                <button 
                  onClick={handleQuickSave}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  保存设置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Result Entry Modal */}
      <AnimatePresence>
        {isResultModalOpen && editingMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">录入比赛成绩</h3>
                  <p className="text-sm text-slate-500 mt-1">{editingMatch.code} - {editingMatch.project_name}</p>
                </div>
                <button 
                  onClick={() => setIsResultModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Matchup Header */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{editingMatch.participant_a || '待定'}</span>
                    <span className="text-[10px] text-slate-400">{editingMatch.participant_a_source}</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 px-4">
                    <span className="text-xl font-black text-slate-300 italic">VS</span>
                    <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold">
                      {editingMatch.phase_name}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{editingMatch.participant_b || '待定'}</span>
                    <span className="text-[10px] text-slate-400">{editingMatch.participant_b_source}</span>
                  </div>
                </div>

                {/* Score & Winner */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-indigo-600 rounded-full" />
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">比赛比分</label>
                    </div>
                    <input 
                      type="text" 
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="例如: 21-15, 21-18"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-indigo-600 rounded-full" />
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">胜出选手</label>
                    </div>
                    <select 
                      value={winner}
                      onChange={(e) => setWinner(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">请选择胜出者</option>
                      <option value={editingMatch.participant_a}>{editingMatch.participant_a}</option>
                      <option value={editingMatch.participant_b}>{editingMatch.participant_b}</option>
                    </select>
                  </div>
                </div>

                {/* Status & Referee */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-indigo-600 rounded-full" />
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">比赛状态</label>
                    </div>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="PENDING">未开始</option>
                      <option value="ONGOING">进行中</option>
                      <option value="COMPLETED">已结束</option>
                      <option value="WALKOVER">弃权</option>
                      <option value="WITHDRAWAL">退赛</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-3 bg-indigo-600 rounded-full" />
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">主裁判</label>
                    </div>
                    <input 
                      type="text" 
                      value={referee}
                      onChange={(e) => setReferee(e.target.value)}
                      placeholder="裁判姓名"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-3 bg-indigo-600 rounded-full" />
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">备注说明</label>
                  </div>
                  <textarea 
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="填写弃权、退赛原因或其他备注信息..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                {/* Progression Info */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-emerald-200">
                      <ArrowRight className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">晋级流转</p>
                      <p className="text-[10px] text-emerald-600">胜者晋级至: {editingMatch.winner_to || '无'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="progression" 
                      checked={syncProgression}
                      onChange={(e) => setSyncProgression(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500" 
                    />
                    <label htmlFor="progression" className="text-[10px] font-bold text-emerald-700">同步完成晋级流转</label>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setIsResultModalOpen(false)}
                  className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all text-sm"
                  disabled={isSaving}
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveResult}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-8 py-2 rounded-xl font-bold transition-all shadow-lg text-sm ${
                    showSuccess 
                      ? 'bg-emerald-500 text-white shadow-emerald-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : showSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? '正在保存...' : showSuccess ? '已保存' : '保存成绩'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
