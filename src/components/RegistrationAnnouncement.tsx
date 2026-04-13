import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, 
  Users, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  ChevronRight,
  User,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Megaphone,
  BarChart3,
  ChevronDown,
  Plus,
  ArrowRight,
  Upload,
  LayoutGrid,
  Edit3,
  Settings,
  Trash2,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import {
  MOCK_PROJECT_SUMMARY,
  MOCK_PARTICIPANTS,
  MOCK_ORDERS,
  GROUP_OPTIONS,
  MATCH_FORMAT_GROUPS,
  getMatchFormatGroupByValue,
  getMatchFormatOption,
} from '../constants';
import { TablePagination } from './TablePagination';

type AnnouncementTab = 'projects' | 'multi_event_stats';

interface RegistrationAnnouncementProps {
  onNavigateToRecords?: (tab: 'orders' | 'project_summary' | 'participants' | 'teams') => void;
  onNavigateToRegistration?: () => void;
  initialTab?: AnnouncementTab;
  pageVariant?: 'announcement' | 'project-filing' | 'multi-event-stats';
}

export const RegistrationAnnouncement: React.FC<RegistrationAnnouncementProps> = ({
  onNavigateToRecords,
  onNavigateToRegistration,
  initialTab = 'projects',
  pageVariant = 'announcement',
}) => {
  const [activeTab, setActiveTab] = useState<AnnouncementTab>(initialTab);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [batchGroupCategory, setBatchGroupCategory] = useState<string>('U系列');
  const [batchFormatGroup, setBatchFormatGroup] = useState<string>(MATCH_FORMAT_GROUPS[0].name);

  
  // Only show established projects
  const [establishedProjects, setEstablishedProjects] = useState(
    MOCK_PROJECT_SUMMARY.filter(p => p.status === 'ESTABLISHED' || p.establishment_status === '已立项').map(p => ({
      ...p,
      is_public: Math.random() > 0.5, // Randomly set some as public for demo
      team_events: p.type === 'team' ? [
        {
          id: 'TE-1',
          name: '男子单打',
          short_name: '男单',
          code: 'MS',
          match_format_rule: { category: '常规赛制', operator: '=', value: '男子单打' },
          group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
          restrictions: [],
          created_at: '2026-04-01 11:52:02',
        },
        {
          id: 'TE-2',
          name: '女子单打',
          short_name: '女单',
          code: 'WS',
          match_format_rule: { category: '常规赛制', operator: '=', value: '女子单打' },
          group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
          restrictions: [],
          created_at: '2026-04-01 11:58:16',
        }
      ] : []
    }))
  );

  const [projectNameSearch, setProjectNameSearch] = useState('');
  const [projectTypeSearch, setProjectTypeSearch] = useState('');
  const [projectStatusSearch, setProjectStatusSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsPageSize, setProjectsPageSize] = useState(10);
  
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [configuringTeamEvent, setConfiguringTeamEvent] = useState<any | null>(null);
  const [editingTeamEventIndex, setEditingTeamEventIndex] = useState<number | null>(null);
  const [finalizingProject, setFinalizingProject] = useState<any | null>(null);
  const [isBatchAddModalOpen, setIsBatchAddModalOpen] = useState(false);
  const [batchSelectedGroups, setBatchSelectedGroups] = useState<string[]>(['公开组']);
  const [batchSelectedFormats, setBatchSelectedFormats] = useState<string[]>(['男子单打', '女子单打', '混合双打']);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const showTabSwitcher = pageVariant === 'announcement';
  const isProjectPage = activeTab === 'projects';
  const pageMeta =
    pageVariant === 'project-filing'
      ? {
          icon: Trophy,
          title: '项目立项',
          description: '根据报名数据确认比赛项目是否立项，并维护最终选手清单',
        }
      : pageVariant === 'multi-event-stats'
      ? {
          icon: BarChart3,
          title: '兼项统计',
          description: '查看当前赛事选手兼项情况与冲突分布',
        }
      : {
          icon: Megaphone,
          title: '比赛项目管理',
          description: '管理已立项项目的公示状态及最终选手清单',
        };

  const currentBatchFormatOptions = useMemo(
    () => MATCH_FORMAT_GROUPS.find((group) => group.name === batchFormatGroup)?.options || [],
    [batchFormatGroup],
  );

  const currentBatchGroupOptions = useMemo(
    () => GROUP_OPTIONS[batchGroupCategory] || [],
    [batchGroupCategory],
  );

  const getFormatGroupName = (value?: string, category?: string) =>
    getMatchFormatGroupByValue(value, category);

  const getFormatOptionsByGroup = (groupName?: string) =>
    MATCH_FORMAT_GROUPS.find((group) => group.name === groupName)?.options || [];

  const createRestriction = () => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    field: '户籍',
    operator: '=',
    value: '',
  });

  const currentConfigFormatGroup = useMemo(() => {
    if (!configuringTeamEvent || configuringTeamEvent.type !== 'single') {
      return MATCH_FORMAT_GROUPS[0].name;
    }

    return getFormatGroupName(
      configuringTeamEvent.match_format_rule?.value,
      configuringTeamEvent.match_format_rule?.category,
    );
  }, [configuringTeamEvent]);

  const currentConfigFormatOptions = useMemo(
    () => getFormatOptionsByGroup(currentConfigFormatGroup),
    [currentConfigFormatGroup],
  );

  const createEmptyTeamEvent = () => ({
    id: `TE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    short_name: '',
    code: '',
    match_format_rule: { category: MATCH_FORMAT_GROUPS[0].name, operator: '=', value: '' },
    group_rule: { category: '', operator: 'in', values: [] },
    restrictions: [],
    created_at: new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '-'),
  });

  const formatRestrictionSummary = (restrictions: any[] = []) =>
    restrictions.length === 0
      ? '未配置'
      : restrictions.map((rule) => `${rule.field}${rule.operator}${rule.value || '未填写'}`).join('；');

  const openNewCompetitionProject = (type: 'single' | 'team') => {
    setConfiguringTeamEvent({
      id: `P-${Date.now()}`,
      isNew: true,
      name: '',
      type,
      status: '报名中',
      participants: 0,
      limit: type === 'team' ? 16 : 32,
      min_seats: type === 'team' ? 1 : undefined,
      max_seats: type === 'team' ? 4 : undefined,
      match_format_rule: { category: MATCH_FORMAT_GROUPS[0].name, operator: '=', value: '' },
      group_rule: { category: '', operator: 'in', values: [] },
      restrictions: [],
      team_events: [],
    });
  };

  const toggleExpand = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const togglePublic = (projectId: string) => {
    setEstablishedProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, is_public: !p.is_public } : p
    ));
  };

  const renderProjectInfo = () => {
    const filteredProjects = establishedProjects.filter(p => 
      p.name.toLowerCase().includes(projectNameSearch.toLowerCase()) &&
      p.type.toLowerCase().includes(projectTypeSearch.toLowerCase()) &&
      (projectStatusSearch === '' || (projectStatusSearch === 'PUBLIC' ? p.is_public : !p.is_public))
    );
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / projectsPageSize));
    const currentPage = Math.min(projectsPage, totalPages);
    const pagedProjects = filteredProjects.slice((currentPage - 1) * projectsPageSize, currentPage * projectsPageSize);

    return (
      <div className="space-y-6">
        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索项目名称..."
              value={projectNameSearch}
              onChange={(e) => setProjectNameSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索项目类型..."
              value={projectTypeSearch}
              onChange={(e) => setProjectTypeSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={projectStatusSearch}
              onChange={(e) => setProjectStatusSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">所有公示状态</option>
              <option value="PUBLIC">正在公示</option>
              <option value="PRIVATE">未公示</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Project Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <colgroup>
              <col className="w-[160px]" />
              <col className="w-[100px]" />
              <col className="w-[80px]" />
              <col className="w-[90px]" />
              <col className="w-[280px]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">项目名称</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">项目类型</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">确认人数</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">公示状态</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedProjects.map(p => (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.type === 'team' && (
                          <button onClick={() => toggleExpand(p.id)} className="text-slate-400 hover:text-indigo-600">
                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedProjects.has(p.id) ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-bold text-slate-900 whitespace-nowrap">{p.name}</span>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                            <span className="whitespace-nowrap">{p.short_name || '--'}</span>
                            <span className="whitespace-nowrap font-mono">{p.code || '--'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{p.type === 'team' ? '团体项目' : '单项项目'}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-indigo-600 font-mono whitespace-nowrap">{p.current_count}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        p.is_public ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {p.is_public ? '正在公示' : '未公示'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-nowrap items-center justify-end gap-2">
                        {p.type === 'team' && (
                          <button 
                            onClick={() => {
                              let configProject = { ...p };
                              if (p.type === 'single' && (!p.team_events || p.team_events.length === 0)) {
                                configProject.team_events = [{
                                  id: `SE-${p.id}`,
                                  name: p.name,
                                  short_name: p.short_name,
                                  code: p.code,
                                  match_format_rule: { category: '单项', operator: '=', value: p.short_name || '男单' },
                                  group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
                                  restrictions: []
                                }];
                              }
                              setEditingTeamEventIndex(null);
                              setConfiguringTeamEvent(configProject);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-all hover:text-emerald-700"
                          >
                            <Settings className="w-4 h-4" />
                            单项管理
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingProject(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                        >
                          <Edit3 className="w-4 h-4" />
                          编辑
                        </button>
                        <button 
                          onClick={() => setSelectedProject(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-all hover:text-indigo-700"
                        >
                          <Users className="w-4 h-4" />
                          选手清单
                        </button>
                        <button 
                          onClick={() => togglePublic(p.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_public 
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                              : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                          }`}
                          title={p.is_public ? "取消公示" : "设为公示"}
                        >
                          {p.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {p.type === 'team' && expandedProjects.has(p.id) && (
                    <tr className="bg-slate-50/30">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="pl-14">
                          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">包含单项</h4>
                          {p.team_events && p.team_events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {p.team_events.map((te: any, idx: number) => (
                                <div key={te.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">比赛形式: {te.match_format_rule?.value || '未设置'}</span>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{idx + 1}</span>
                                  </div>
                                  <div className="text-xs text-slate-600">组别: {te.group_rule?.values.join(', ') || '未设置'}</div>
                                  <div className="text-xs text-slate-600">附加规则: {te.restrictions?.length > 0 ? te.restrictions.map((r: any) => `${r.field}${r.operator}${r.value}`).join('; ') : '无'}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400 italic">暂未配置单项项目</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
          <TablePagination
            total={filteredProjects.length}
            page={currentPage}
            pageSize={projectsPageSize}
            onPageChange={setProjectsPage}
            onPageSizeChange={(size) => {
              setProjectsPageSize(size);
              setProjectsPage(1);
            }}
            itemLabel="个项目"
            compact
          />
        </div>
      </div>
    );
  };

  const renderMultiEventStats = () => {
    // Calculate stats from MOCK_PARTICIPANTS and MOCK_ORDERS
    const stats = MOCK_PARTICIPANTS.map(p => {
      const entries = MOCK_ORDERS.flatMap(o => o.entries).filter(e => 
        e.participant_name === p.name && e.participant_phone === p.phone
      );
      return {
        ...p,
        entries,
        eventCount: entries.length
      };
    }).filter(s => 
      s.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      s.phone.includes(participantSearch) ||
      (s.team_name && s.team_name.toLowerCase().includes(participantSearch.toLowerCase()))
    ).sort((a, b) => b.eventCount - a.eventCount);

    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索选手姓名、手机号或所属队伍..."
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">选手姓名</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">手机号</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">所属队伍</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">兼项数量</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">报名项目</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{s.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.team_name || '--'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      s.eventCount > 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {s.eventCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {s.entries.map(e => (
                        <span key={e.id} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-medium border border-slate-100">
                          {e.registration_event_name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <motion.div
        key="list"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <pageMeta.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{pageMeta.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{pageMeta.description}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {showTabSwitcher && (
                <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 w-fit">
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    比赛项目信息
                  </button>
                  <button 
                    onClick={() => setActiveTab('multi_event_stats')}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'multi_event_stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    选手兼项统计
                  </button>
                </div>
              )}
              {isProjectPage && (
                <div className="relative">
                  <button 
                    onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    <Plus className="w-4 h-4" />
                    比赛项目
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCreateDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isCreateDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[110]" 
                          onClick={() => setIsCreateDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[120] overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setIsCreateDropdownOpen(false);
                              setIsCreateTypeModalOpen(true);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Plus className="w-4 h-4" />
                            </div>
                            直接创建比赛项目
                          </button>
                          <button
                            onClick={() => {
                              setIsCreateDropdownOpen(false);
                              onNavigateToRegistration?.();
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-50"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                            从报名项目立项
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {isProjectPage ? renderProjectInfo() : renderMultiEventStats()}
              </motion.div>
            </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {isCreateTypeModalOpen && (
          <div className="fixed inset-0 z-[125] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateTypeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">选择比赛项目类型</h2>
                    <p className="text-xs text-slate-500 mt-0.5">先选择要直接添加单项项目还是团体项目</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateTypeModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid gap-4 p-8 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateTypeModalOpen(false);
                    openNewCompetitionProject('single');
                  }}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-sm border border-slate-100">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-slate-900">单项项目</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      适用于男子单打、女子双打、混合双打等独立比赛项目。
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateTypeModalOpen(false);
                    openNewCompetitionProject('team');
                  }}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-sm border border-slate-100">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-slate-900">团体项目</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      适用于俱乐部赛、校际赛等需要配置团体单项和队伍规则的项目。
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Batch Add Modal for Team Events */}
      <AnimatePresence>
        {isBatchAddModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBatchAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">批量添加单项</h2>
                    <p className="text-xs text-slate-500 mt-0.5">选择组别和形式组合生成单项</p>
                  </div>
                </div>
                <button onClick={() => setIsBatchAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">组别</label>
                      <span className="text-[11px] font-medium text-slate-400">可批量勾选多个组别</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(GROUP_OPTIONS).map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setBatchGroupCategory(category);
                            setBatchSelectedGroups([]);
                          }}
                          className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                            batchGroupCategory === category
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {batchGroupCategory === '自定义' ? (
                      <input
                        type="text"
                        placeholder="输入组别名称，多个组别用逗号分隔"
                        value={batchSelectedGroups.join('，')}
                        onChange={(e) => {
                          const values = e.target.value
                            .split(/[，,]/)
                            .map((item) => item.trim())
                            .filter(Boolean);
                          setBatchSelectedGroups(values);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {currentBatchGroupOptions.map((group) => (
                          <button
                            key={group}
                            type="button"
                            onClick={() => {
                              const next = batchSelectedGroups.includes(group)
                                ? batchSelectedGroups.filter((value) => value !== group)
                                : [...batchSelectedGroups, group];
                              setBatchSelectedGroups(next);
                            }}
                            className={`rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-all ${
                              batchSelectedGroups.includes(group)
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40'
                            }`}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">比赛形式</label>
                      <span className="text-[11px] font-medium text-slate-400">可批量勾选多个形式</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MATCH_FORMAT_GROUPS.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => {
                            setBatchFormatGroup(group.name);
                            setBatchSelectedFormats([]);
                          }}
                          className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                            batchFormatGroup === group.name
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {group.name}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {currentBatchFormatOptions.map((format) => (
                        <button
                          key={format.value}
                          type="button"
                          onClick={() => {
                            const next = batchSelectedFormats.includes(format.value)
                              ? batchSelectedFormats.filter((value) => value !== format.value)
                              : [...batchSelectedFormats, format.value];
                            setBatchSelectedFormats(next);
                          }}
                          className={`rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-all ${
                            batchSelectedFormats.includes(format.value)
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40'
                          }`}
                        >
                          {format.value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    将生成 <span className="font-bold underline">{batchSelectedGroups.length * batchSelectedFormats.length}</span> 个单项项目。
                  </p>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsBatchAddModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    const newEvents: any[] = [];
                    batchSelectedGroups.forEach(g => {
                      batchSelectedFormats.forEach(f => {
                        const formatOption = getMatchFormatOption(f);
                        newEvents.push({
                          id: Math.random().toString(36).substr(2, 9),
                          name: `${g}${f}`,
                          short_name: formatOption?.shortName || f,
                          code: formatOption?.code || '',
                          match_format_rule: { category: formatOption?.groupName || batchFormatGroup, operator: '=', value: f },
                          group_rule: { category: batchGroupCategory, operator: 'in', values: [g] },
                          restrictions: [],
                          created_at: new Date()
                            .toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            })
                            .replace(/\//g, '-')
                        });
                      });
                    });
                    if (configuringTeamEvent) {
                      setEditingTeamEventIndex(null);
                      setConfiguringTeamEvent({
                        ...configuringTeamEvent,
                        team_events: [...(configuringTeamEvent.team_events || []), ...newEvents]
                      });
                    }
                    setIsBatchAddModalOpen(false);
                    setBatchGroupCategory('U系列');
                    setBatchSelectedGroups([]);
                    setBatchSelectedFormats([]);
                    setBatchFormatGroup(MATCH_FORMAT_GROUPS[0].name);
                  }}
                  disabled={batchSelectedGroups.length === 0 || batchSelectedFormats.length === 0}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  确认添加
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Participant List Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">最终选手清单 - {selectedProject.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">立项确认人数: {selectedProject.current_count}人</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <ChevronRight className="w-6 h-6 rotate-90" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_PARTICIPANTS.slice(0, selectedProject.current_count).map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{p.team_name || '个人选手'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[10px] font-bold">已确认</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">#{String(idx + 1).padStart(3, '0')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">最后更新: 2024-03-18 10:30</span>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Project Modal */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">编辑项目</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{editingProject.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingProject(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">项目简称</label>
                  <input 
                    type="text" 
                    value={editingProject.short_name || ''}
                    onChange={(e) => setEditingProject({...editingProject, short_name: e.target.value})}
                    placeholder="例如：男单"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">代码标识</label>
                  <input 
                    type="text" 
                    value={editingProject.code || ''}
                    onChange={(e) => setEditingProject({...editingProject, code: e.target.value})}
                    placeholder="例如：MS"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setEditingProject(null)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    setEstablishedProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
                    setEditingProject(null);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存更改
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Event Configuration Modal */}
      <AnimatePresence>
        {configuringTeamEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingTeamEventIndex(null);
                setConfiguringTeamEvent(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full ${
                configuringTeamEvent.type === 'team' ? 'max-w-[1360px]' : 'max-w-3xl'
              } max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col`}
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {configuringTeamEvent.type === 'team'
                        ? '团体单项配置'
                        : configuringTeamEvent.isNew
                          ? '直接创建项目'
                          : '项目赛制配置'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {configuringTeamEvent.type === 'team'
                        ? '配置该团体项目下的单项比赛'
                        : configuringTeamEvent.isNew
                          ? '填写项目基本信息并配置赛制'
                          : configuringTeamEvent.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditingTeamEventIndex(null);
                    setConfiguringTeamEvent(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                <div className="space-y-6">
                  {/* Basic Info */}
                  {configuringTeamEvent.type !== 'team' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">比赛项目类型</label>
                        <select 
                          value={configuringTeamEvent.type}
                          onChange={(e) => setConfiguringTeamEvent({...configuringTeamEvent, type: e.target.value, team_events: []})}
                          disabled
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          <option value="single">单项项目</option>
                          <option value="team">团体项目</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">项目名称 <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={configuringTeamEvent.name}
                          onChange={(e) => setConfiguringTeamEvent({...configuringTeamEvent, name: e.target.value})}
                          placeholder="例如：特邀元老组单打"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">项目简称</label>
                        <input 
                          type="text" 
                          value={configuringTeamEvent.short_name || ''}
                          onChange={(e) => setConfiguringTeamEvent({...configuringTeamEvent, short_name: e.target.value})}
                          placeholder="例如：男单"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">项目代码</label>
                        <input 
                          type="text" 
                          value={configuringTeamEvent.code || ''}
                          onChange={(e) => setConfiguringTeamEvent({...configuringTeamEvent, code: e.target.value})}
                          placeholder="例如：MS"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">席位限制</label>
                        <input 
                          type="number" 
                          value={configuringTeamEvent.limit}
                          onChange={(e) => setConfiguringTeamEvent({...configuringTeamEvent, limit: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    {configuringTeamEvent.type === 'team' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">团队规模下限</label>
                          <input 
                            type="number" 
                            value={configuringTeamEvent.min_seats || 1}
                            onChange={(e) => setConfiguringTeamEvent({...configuringTeamEvent, min_seats: parseInt(e.target.value) || 1})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">团队规模上限</label>
                          <input 
                            type="number" 
                            value={configuringTeamEvent.max_seats || 4}
                            onChange={(e) => setConfiguringTeamEvent({...configuringTeamEvent, max_seats: parseInt(e.target.value) || 4})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    )}


                  </div>
                  )}

                  {/* Rules Configuration */}
                  {configuringTeamEvent.type !== 'team' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">赛制参数配置</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {configuringTeamEvent.type === 'single' && (
                        <>
                          <div className="md:col-span-2 space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">比赛形式</label>
                              <span className="text-[11px] font-medium text-slate-400">先选分组，再选规格</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {MATCH_FORMAT_GROUPS.map((group) => (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() => setConfiguringTeamEvent({
                                    ...configuringTeamEvent,
                                    match_format_rule: {
                                      category: group.name,
                                      operator: '=',
                                      value: '',
                                    },
                                  })}
                                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                    currentConfigFormatGroup === group.name
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                  }`}
                                >
                                  {group.name}
                                </button>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                              {currentConfigFormatOptions.map((option) => {
                                const selected = configuringTeamEvent.match_format_rule?.value === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setConfiguringTeamEvent({
                                      ...configuringTeamEvent,
                                      match_format_rule: {
                                        category: currentConfigFormatGroup,
                                        operator: '=',
                                        value: option.value,
                                      },
                                    })}
                                    className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                                      selected
                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40'
                                    }`}
                                  >
                                    <div className={`text-[13px] font-bold leading-5 ${selected ? 'text-indigo-700' : 'text-slate-800'}`}>
                                      {option.value}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="md:col-span-2 space-y-4">
                        <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">组别</label>
                            <span className="text-[11px] font-medium text-slate-400">先选系列，再选具体组别</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {Object.keys(GROUP_OPTIONS).map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => setConfiguringTeamEvent({
                                  ...configuringTeamEvent,
                                  group_rule: {
                                    category,
                                    operator: 'in',
                                    values: [],
                                  },
                                })}
                                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                  configuringTeamEvent.group_rule?.category === category
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>

                          {configuringTeamEvent.group_rule?.category === '自定义' ? (
                            <input
                              type="text"
                              placeholder="输入自定义组别名称"
                              value={configuringTeamEvent.group_rule?.values?.[0] || ''}
                              onChange={(e) => setConfiguringTeamEvent({
                                ...configuringTeamEvent,
                                group_rule: {
                                  ...(configuringTeamEvent.group_rule || { category: '自定义', operator: 'in' }),
                                  values: [e.target.value.trim()],
                                },
                              })}
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                              {(configuringTeamEvent.group_rule?.category
                                ? GROUP_OPTIONS[configuringTeamEvent.group_rule.category] || []
                                : []
                              ).map((group) => {
                                const selected = configuringTeamEvent.group_rule?.values?.[0] === group;
                                return (
                                  <button
                                    key={group}
                                    type="button"
                                    onClick={() => setConfiguringTeamEvent({
                                      ...configuringTeamEvent,
                                      group_rule: {
                                        ...(configuringTeamEvent.group_rule || { category: '', operator: 'in' }),
                                        values: [group],
                                      },
                                    })}
                                    className={`rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-all ${
                                      selected
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40'
                                    }`}
                                  >
                                    {group}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">附加限制规则</label>
                        <button
                          type="button"
                          onClick={() => setConfiguringTeamEvent({
                            ...configuringTeamEvent,
                            restrictions: [...(configuringTeamEvent.restrictions || []), createRestriction()],
                          })}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          添加规则
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(configuringTeamEvent.restrictions || []).length === 0 ? (
                          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[10px] text-slate-400">暂无限制规则</p>
                          </div>
                        ) : (
                          (configuringTeamEvent.restrictions || []).map((rule: any, idx: number) => (
                            <div key={rule.id || idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                              <select
                                value={rule.field}
                                onChange={(e) => {
                                  const nextRestrictions = [...(configuringTeamEvent.restrictions || [])];
                                  nextRestrictions[idx] = {
                                    ...nextRestrictions[idx],
                                    field: e.target.value,
                                  };
                                  setConfiguringTeamEvent({
                                    ...configuringTeamEvent,
                                    restrictions: nextRestrictions,
                                  });
                                }}
                                className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700"
                              >
                                <option value="户籍">户籍</option>
                                <option value="年龄">年龄</option>
                                <option value="积分">积分</option>
                                <option value="性别">性别</option>
                                <option value="地区">地区</option>
                              </select>
                              <select
                                value={rule.operator}
                                onChange={(e) => {
                                  const nextRestrictions = [...(configuringTeamEvent.restrictions || [])];
                                  nextRestrictions[idx] = {
                                    ...nextRestrictions[idx],
                                    operator: e.target.value,
                                  };
                                  setConfiguringTeamEvent({
                                    ...configuringTeamEvent,
                                    restrictions: nextRestrictions,
                                  });
                                }}
                                className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700"
                              >
                                <option value="=">=</option>
                                <option value="!=">!=</option>
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value="contains">包含</option>
                              </select>
                              <input
                                type="text"
                                value={rule.value}
                                onChange={(e) => {
                                  const nextRestrictions = [...(configuringTeamEvent.restrictions || [])];
                                  nextRestrictions[idx] = {
                                    ...nextRestrictions[idx],
                                    value: e.target.value,
                                  };
                                  setConfiguringTeamEvent({
                                    ...configuringTeamEvent,
                                    restrictions: nextRestrictions,
                                  });
                                }}
                                placeholder="值"
                                className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => setConfiguringTeamEvent({
                                  ...configuringTeamEvent,
                                  restrictions: (configuringTeamEvent.restrictions || []).filter((_: any, ruleIndex: number) => ruleIndex !== idx),
                                })}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Team Events (Only for Team Project) */}
                  {configuringTeamEvent.type === 'team' && (
                    <div className="px-8 py-6 space-y-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">单项列表</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            当前已配置 {(configuringTeamEvent.team_events || []).length} 个单项，可继续添加、编辑或删除。
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsBatchAddModalOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                          >
                            <LayoutGrid className="w-4 h-4" />
                            批量添加
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextEvents = [...(configuringTeamEvent.team_events || []), createEmptyTeamEvent()];
                              setConfiguringTeamEvent({
                                ...configuringTeamEvent,
                                team_events: nextEvents,
                              });
                              setEditingTeamEventIndex(nextEvents.length - 1);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            添加单项
                          </button>
                        </div>
                      </div>

                      {(!configuringTeamEvent.team_events || configuringTeamEvent.team_events.length === 0) ? (
                        <div className="text-center py-14 bg-white border border-slate-200 rounded-2xl">
                          <p className="text-sm text-slate-500">暂无单项配置，请点击上方按钮添加</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="max-w-full overflow-x-auto">
                              <div className="min-w-[1180px]">
                                <table className="w-full text-left border-collapse">
                                  <colgroup>
                                    <col className="w-[220px]" />
                                    <col className="w-[120px]" />
                                    <col className="w-[120px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[180px]" />
                                  </colgroup>
                                  <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">项目名称</th>
                                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">简称</th>
                                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">代码</th>
                                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">比赛形式</th>
                                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">附加规则限制</th>
                                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">创建时间</th>
                                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">操作</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {(configuringTeamEvent.team_events || []).map((event: any, index: number) => (
                                      <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">{event.name || '--'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{event.short_name || '--'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono whitespace-nowrap">{event.code || '--'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{event.match_format_rule?.value || '未设置'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatRestrictionSummary(event.restrictions || [])}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{event.created_at || '--'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                          <div className="flex flex-nowrap items-center justify-end gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setEditingTeamEventIndex(index)}
                                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                            >
                                              <Edit3 className="w-4 h-4" />
                                              编辑
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const nextEvents = (configuringTeamEvent.team_events || []).filter((_: any, eventIndex: number) => eventIndex !== index);
                                                setConfiguringTeamEvent({
                                                  ...configuringTeamEvent,
                                                  team_events: nextEvents,
                                                });
                                                setEditingTeamEventIndex((prev) => {
                                                  if (prev === null) return prev;
                                                  if (prev === index) return null;
                                                  return prev > index ? prev - 1 : prev;
                                                });
                                              }}
                                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:text-red-600"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                              删除
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          {editingTeamEventIndex !== null && configuringTeamEvent.team_events?.[editingTeamEventIndex] && (
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900">
                                    编辑单项：{configuringTeamEvent.team_events[editingTeamEventIndex].name || `单项${editingTeamEventIndex + 1}`}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1">修改单项名称、比赛形式与附加规则限制</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditingTeamEventIndex(null)}
                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {(() => {
                                const event = configuringTeamEvent.team_events[editingTeamEventIndex];
                                const eventFormatGroup = getFormatGroupName(
                                  event.match_format_rule?.value,
                                  event.match_format_rule?.category,
                                );
                                const eventFormatOptions = getFormatOptionsByGroup(eventFormatGroup);
                                return (
                                  <div className="p-5 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">项目名称</label>
                                        <input
                                          type="text"
                                          value={event.name || ''}
                                          onChange={(e) => {
                                            const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                            nextEvents[editingTeamEventIndex] = { ...nextEvents[editingTeamEventIndex], name: e.target.value };
                                            setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                          }}
                                          placeholder="例如：男子单打"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">简称</label>
                                        <input
                                          type="text"
                                          value={event.short_name || ''}
                                          onChange={(e) => {
                                            const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                            nextEvents[editingTeamEventIndex] = { ...nextEvents[editingTeamEventIndex], short_name: e.target.value };
                                            setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                          }}
                                          placeholder="例如：男单"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">代码</label>
                                        <input
                                          type="text"
                                          value={event.code || ''}
                                          onChange={(e) => {
                                            const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                            nextEvents[editingTeamEventIndex] = { ...nextEvents[editingTeamEventIndex], code: e.target.value.toUpperCase() };
                                            setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                          }}
                                          placeholder="例如：MS"
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">比赛形式分组</label>
                                        <select
                                          value={eventFormatGroup}
                                          onChange={(e) => {
                                            const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                            nextEvents[editingTeamEventIndex] = {
                                              ...nextEvents[editingTeamEventIndex],
                                              match_format_rule: {
                                                category: e.target.value,
                                                operator: '=',
                                                value: '',
                                              },
                                            };
                                            setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                          }}
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
                                        >
                                          <option value="">选择比赛形式分组</option>
                                          {MATCH_FORMAT_GROUPS.map((group) => (
                                            <option key={group.id} value={group.name}>
                                              {group.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">比赛形式</label>
                                        <select
                                          value={event.match_format_rule?.value || ''}
                                          onChange={(e) => {
                                            const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                            nextEvents[editingTeamEventIndex] = {
                                              ...nextEvents[editingTeamEventIndex],
                                              match_format_rule: {
                                                category: eventFormatGroup,
                                                operator: '=',
                                                value: e.target.value,
                                              },
                                            };
                                            setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                          }}
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
                                          disabled={!eventFormatGroup}
                                        >
                                          <option value="">选择比赛形式</option>
                                          {eventFormatOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                              {option.value}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">附加规则限制</label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                            nextEvents[editingTeamEventIndex] = {
                                              ...nextEvents[editingTeamEventIndex],
                                              restrictions: [...(nextEvents[editingTeamEventIndex].restrictions || []), createRestriction()],
                                            };
                                            setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                          }}
                                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                                        >
                                          添加规则
                                        </button>
                                      </div>
                                      {(event.restrictions || []).length === 0 ? (
                                        <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                                          暂无限制规则
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {(event.restrictions || []).map((rule: any, ruleIdx: number) => (
                                            <div key={rule.id || ruleIdx} className="grid grid-cols-[1fr_72px_1fr_40px] gap-2 items-center">
                                              <select
                                                value={rule.field}
                                                onChange={(e) => {
                                                  const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                                  const nextRestrictions = [...(nextEvents[editingTeamEventIndex].restrictions || [])];
                                                  nextRestrictions[ruleIdx] = { ...nextRestrictions[ruleIdx], field: e.target.value };
                                                  nextEvents[editingTeamEventIndex] = { ...nextEvents[editingTeamEventIndex], restrictions: nextRestrictions };
                                                  setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                                }}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                                              >
                                                <option value="户籍">户籍</option>
                                                <option value="年龄">年龄</option>
                                                <option value="积分">积分</option>
                                                <option value="性别">性别</option>
                                                <option value="地区">地区</option>
                                              </select>
                                              <select
                                                value={rule.operator}
                                                onChange={(e) => {
                                                  const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                                  const nextRestrictions = [...(nextEvents[editingTeamEventIndex].restrictions || [])];
                                                  nextRestrictions[ruleIdx] = { ...nextRestrictions[ruleIdx], operator: e.target.value };
                                                  nextEvents[editingTeamEventIndex] = { ...nextEvents[editingTeamEventIndex], restrictions: nextRestrictions };
                                                  setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                                }}
                                                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                                              >
                                                <option value="=">=</option>
                                                <option value="!=">!=</option>
                                                <option value=">">&gt;</option>
                                                <option value="<">&lt;</option>
                                                <option value="contains">包含</option>
                                              </select>
                                              <input
                                                type="text"
                                                value={rule.value}
                                                onChange={(e) => {
                                                  const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                                  const nextRestrictions = [...(nextEvents[editingTeamEventIndex].restrictions || [])];
                                                  nextRestrictions[ruleIdx] = { ...nextRestrictions[ruleIdx], value: e.target.value };
                                                  nextEvents[editingTeamEventIndex] = { ...nextEvents[editingTeamEventIndex], restrictions: nextRestrictions };
                                                  setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                                }}
                                                placeholder="值"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const nextEvents = [...(configuringTeamEvent.team_events || [])];
                                                  nextEvents[editingTeamEventIndex] = {
                                                    ...nextEvents[editingTeamEventIndex],
                                                    restrictions: (nextEvents[editingTeamEventIndex].restrictions || []).filter((_: any, currentRuleIdx: number) => currentRuleIdx !== ruleIdx),
                                                  };
                                                  setConfiguringTeamEvent({ ...configuringTeamEvent, team_events: nextEvents });
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-600 transition-all"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
                <button 
                  onClick={() => {
                    setEditingTeamEventIndex(null);
                    setConfiguringTeamEvent(null);
                  }}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    setEstablishedProjects(prev => prev.map(p => p.id === configuringTeamEvent.id ? configuringTeamEvent : p));
                    alert('配置已保存');
                  }}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存配置
                </button>
                {(configuringTeamEvent.isNew || configuringTeamEvent.type === 'single') && (
                  <button 
                    onClick={() => {
                      if (configuringTeamEvent.isNew) {
                        if (!configuringTeamEvent.name) {
                          alert('请输入项目名称');
                          return;
                        }
                        const newProject = { ...configuringTeamEvent };
                        delete newProject.isNew;
                        setEstablishedProjects(prev => [newProject, ...prev]);
                        alert('项目创建成功并已导入选手信息');
                      } else {
                        setEstablishedProjects(prev => prev.map(p => p.id === configuringTeamEvent.id ? configuringTeamEvent : p));
                      }
                      if (!expandedProjects.has(configuringTeamEvent.id)) {
                        toggleExpand(configuringTeamEvent.id);
                      }
                      setEditingTeamEventIndex(null);
                      setConfiguringTeamEvent(null);
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {configuringTeamEvent.isNew ? '创建并导入' : '生成对阵表'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <AnimatePresence>
          {finalizingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50">
                  <div className="flex items-center gap-2 text-amber-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold">编排定稿确认</h3>
                  </div>
                  <button 
                    onClick={() => setFinalizingProject(null)}
                    className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">即将定稿：{finalizingProject.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        定稿后，系统将根据当前配置一键生成比赛场次信息。此操作不可逆，请确认所有配置及参赛人员信息已准确无误。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setFinalizingProject(null)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => {
                      alert('已成功生成比赛场次信息！');
                      setFinalizingProject(null);
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-100 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    确认定稿并生成场次
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};
