import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Settings, 
  Users, 
  Trophy, 
  LayoutGrid, 
  X, 
  Save, 
  ArrowRight,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Project, TeamEvent, RestrictionRule, TeamGenderRequirement } from '../types';
import { GROUP_OPTIONS, MATCH_FORMAT_GROUPS, getMatchFormatGroupByValue } from '../constants';
import { ProjectMatrixGenerator } from './ProjectMatrixGenerator';
import { TablePagination } from './TablePagination';

const MOCK_PROJECTS: Project[] = [
  { 
    id: '1', 
    name: '男子单打', 
    short_name: '男单', 
    code: 'MS', 
    type: 'single', 
    match_format_rule: { category: '常规赛制', operator: '=', value: '男子单打' },
    group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
    fee: 100, 
    deposit: 50, 
    max_seats: 32, 
    min_seats: 8, 
    team_join: false, 
    template: '默认模板', 
    sort: 1, 
    status: 'active', 
    restrictions: [] 
  },
  { 
    id: '2', 
    name: '团体赛', 
    short_name: '团赛', 
    code: 'TEAM', 
    type: 'team', 
    fee: 500, 
    deposit: 200, 
    max_seats: 16, 
    team_size_limit: 5, 
    team_size_min: 5,
    team_size_max: 8,
    team_gender_requirement: {
      min_male: 2,
      min_female: 2,
      max_male: 5,
    },
    team_join: true, 
    template: '团体模板', 
    sort: 2, 
    status: 'active', 
    group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
    restrictions: [
      { id: 'r1', field: '户籍', operator: '=', value: '厦门市' }
    ],
    team_events: [
      { 
        id: 'te-1', 
        match_format_rule: { category: '常规赛制', operator: '=', value: '男子单打' },
        group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
        restrictions: [] 
      },
      { 
        id: 'te-2', 
        match_format_rule: { category: '常规赛制', operator: '=', value: '女子单打' },
        group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
        restrictions: [] 
      },
      { 
        id: 'te-3', 
        match_format_rule: { category: '常规赛制', operator: '=', value: '混合双打' },
        group_rule: { category: '年龄组', operator: 'in', values: ['公开组'] },
        restrictions: [] 
      },
    ]
  },
];

const TEMPLATE_CONFIGS: Record<string, string[]> = {
  '默认模板': ['选手姓名', '手机号', '性别'],
  '团体模板': ['领队姓名', '领队手机', '队伍名称', '选手信息 (姓名, 手机, 性别, 证件号)'],
  '精英赛模板': ['选手姓名', '手机号', '性别', '证件信息', '衣服尺码', '积分证明'],
};

const COMPOSITE_AGE_FIELDS = ['组合总年龄', '男性年龄', '女性年龄'];

const isCompositeAgeField = (field: string) => COMPOSITE_AGE_FIELDS.includes(field);

const getRestrictionOperatorOptions = (field: string) => {
  if (isCompositeAgeField(field)) {
    return [
      { value: '<=', label: '<=' },
      { value: '>=', label: '>=' },
      { value: '=', label: '=' },
      { value: '<', label: '<' },
      { value: '>', label: '>' },
    ] as const;
  }

  return [
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: 'contains', label: '包含' },
  ] as const;
};

const formatRestrictionRule = (rule: RestrictionRule) => {
  const value = isCompositeAgeField(rule.field) && rule.value ? `${rule.value}岁` : rule.value;
  const operatorLabel = rule.operator === 'contains' ? '包含' : rule.operator;
  return `${rule.field}${operatorLabel}${value}`;
};

const getRestrictionHint = (field: string) => {
  if (field === '组合总年龄') return '适用于双打或多人组合项目，按同一报名项目内所有选手年龄合计校验。';
  if (field === '男性年龄') return '适用于混双等含男性选手的项目，按男性选手年龄单独校验。';
  if (field === '女性年龄') return '适用于混双等含女性选手的项目，按女性选手年龄单独校验。';
  return '';
};

export const RegistrationProjects: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'team'>('single');
  const [pageMode, setPageMode] = useState<'list' | 'matrix-generator'>('list');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  
  // Search draft states
  const [searchNameDraft, setSearchNameDraft] = useState('');
  const [searchFormatDraft, setSearchFormatDraft] = useState('');
  const [searchGroupDraft, setSearchGroupDraft] = useState('');
  const [searchStatusDraft, setSearchStatusDraft] = useState('');
  // Applied search states
  const [searchName, setSearchName] = useState('');
  const [searchFormat, setSearchFormat] = useState('');
  const [searchGroup, setSearchGroup] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isBatchAddingTeamEvents, setIsBatchAddingTeamEvents] = useState(false);
  const [batchTeamGroups, setBatchTeamGroups] = useState<string[]>(['公开组']);
  const [batchTeamFormats, setBatchTeamFormats] = useState<string[]>(['男子单打', '女子单打', '混合双打']);

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

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchType = p.type === activeTab;
      const matchName = p.name.toLowerCase().includes(searchName.toLowerCase());
      const matchStatus = searchStatus === '' || p.status === searchStatus;
      
      if (activeTab === 'single') {
        const matchFormat = searchFormat === '' || (p.match_format_rule?.value === searchFormat);
        const matchGroup = searchGroup === '' || (p.group_rule?.values.includes(searchGroup));
        return matchType && matchName && matchStatus && matchFormat && matchGroup;
      }
      
      return matchType && matchName && matchStatus;
    });
  }, [projects, activeTab, searchName, searchFormat, searchGroup, searchStatus]);

  const applySearch = () => {
    setSearchName(searchNameDraft);
    setSearchFormat(searchFormatDraft);
    setSearchGroup(searchGroupDraft);
    setSearchStatus(searchStatusDraft);
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchNameDraft('');
    setSearchFormatDraft('');
    setSearchGroupDraft('');
    setSearchStatusDraft('');
    setSearchName('');
    setSearchFormat('');
    setSearchGroup('');
    setSearchStatus('');
    setCurrentPage(1);
  };
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const normalizedPage = Math.min(currentPage, totalPages);
  const pagedProjects = filteredProjects.slice((normalizedPage - 1) * pageSize, normalizedPage * pageSize);

  const currentEditFormatGroup = useMemo(() => {
    if (!editingProject || editingProject.type !== 'single') return MATCH_FORMAT_GROUPS[0].name;
    return getMatchFormatGroupByValue(
      editingProject.match_format_rule?.value,
      editingProject.match_format_rule?.category,
    );
  }, [editingProject]);

  const currentEditFormatOptions = useMemo(() => {
    return MATCH_FORMAT_GROUPS.find((group) => group.name === currentEditFormatGroup)?.options || [];
  }, [currentEditFormatGroup]);

  const currentTeamSizeMode = useMemo<'fixed' | 'range'>(() => {
    if (!editingProject || editingProject.type !== 'team') return 'fixed';
    const min = editingProject.team_size_min;
    const max = editingProject.team_size_max;
    if (min !== undefined && max !== undefined && min !== max) return 'range';
    return 'fixed';
  }, [editingProject]);

  const formatTeamSizeRule = (project: Project) => {
    const min = project.team_size_min ?? project.team_size_limit;
    const max = project.team_size_max ?? project.team_size_limit;
    if (!min && !max) return '--';
    if (min && max) {
      return min === max ? `${min} 人/队` : `${min}-${max} 人/队`;
    }
    if (min) return `至少 ${min} 人/队`;
    return `最多 ${max} 人/队`;
  };

  const formatGenderRequirement = (requirement?: TeamGenderRequirement) => {
    if (!requirement) return [];
    const items: string[] = [];
    if (requirement.min_male) items.push(`至少${requirement.min_male}男`);
    if (requirement.min_female) items.push(`至少${requirement.min_female}女`);
    if (requirement.max_male) items.push(`至多${requirement.max_male}男`);
    if (requirement.max_female) items.push(`至多${requirement.max_female}女`);
    return items;
  };

  const normalizeProjectBeforeSave = (project: Project): Project => {
    if (project.type !== 'team') return project;

    const sizeMin = project.team_size_min ? Math.max(1, project.team_size_min) : undefined;
    const sizeMax = project.team_size_max ? Math.max(1, project.team_size_max) : undefined;
    const normalizedMin = sizeMin && sizeMax ? Math.min(sizeMin, sizeMax) : sizeMin;
    const normalizedMax = sizeMin && sizeMax ? Math.max(sizeMin, sizeMax) : sizeMax;

    const genderRule = project.team_gender_requirement || {};
    const normalizedGenderRule: TeamGenderRequirement = {
      min_male: genderRule.min_male ? Math.max(0, genderRule.min_male) : undefined,
      max_male: genderRule.max_male ? Math.max(0, genderRule.max_male) : undefined,
      min_female: genderRule.min_female ? Math.max(0, genderRule.min_female) : undefined,
      max_female: genderRule.max_female ? Math.max(0, genderRule.max_female) : undefined,
    };

    if (
      normalizedGenderRule.min_male &&
      normalizedGenderRule.max_male &&
      normalizedGenderRule.min_male > normalizedGenderRule.max_male
    ) {
      [normalizedGenderRule.min_male, normalizedGenderRule.max_male] = [
        normalizedGenderRule.max_male,
        normalizedGenderRule.min_male,
      ];
    }

    if (
      normalizedGenderRule.min_female &&
      normalizedGenderRule.max_female &&
      normalizedGenderRule.min_female > normalizedGenderRule.max_female
    ) {
      [normalizedGenderRule.min_female, normalizedGenderRule.max_female] = [
        normalizedGenderRule.max_female,
        normalizedGenderRule.min_female,
      ];
    }

    const hasGenderRule = Object.values(normalizedGenderRule).some((value) => value !== undefined && value !== 0);

    return {
      ...project,
      team_size_min: normalizedMin,
      team_size_max: normalizedMax,
      team_size_limit: normalizedMin && normalizedMax && normalizedMin === normalizedMax ? normalizedMin : undefined,
      team_gender_requirement: hasGenderRule ? normalizedGenderRule : undefined,
    };
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该项目吗？')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCopy = (project: Project) => {
    const newProject = { ...project, id: Date.now().toString(), name: `${project.name} (副本)` };
    setProjects(prev => [...prev, newProject]);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      const normalizedProject = normalizeProjectBeforeSave(editingProject);
      if (projects.find(p => p.id === editingProject.id)) {
        setProjects(prev => prev.map(p => p.id === editingProject.id ? normalizedProject : p));
      } else {
        setProjects(prev => [...prev, normalizedProject]);
      }
      setIsModalOpen(false);
      setEditingProject(null);
    }
  };

  if (pageMode === 'matrix-generator') {
    return (
      <ProjectMatrixGenerator
        onBack={() => setPageMode('list')}
        onGenerate={(newProjects) => {
          setProjects((prev) => [...prev, ...newProjects]);
          setPageMode('list');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">报名项目管理</h2>
                <p className="text-xs text-slate-500 mt-0.5">配置及管理比赛的报名项目、费用、席位及关联模板</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 w-fit">
                <button 
                  onClick={() => setActiveTab('single')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'single' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  单项项目
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'team' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  团体项目
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {activeTab === 'single' && (
                  <button 
                    onClick={() => setPageMode('matrix-generator')}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    矩阵生成
                  </button>
                )}
                <button 
                  onClick={() => {
                    setEditingProject({
                      id: Date.now().toString(),
                      name: '',
                      short_name: '',
                      code: '',
                      type: activeTab,
                      fee: 0,
                      deposit: 0,
                      max_seats: 100,
                      min_seats: 0,
                      team_join: false,
                      team_size_min: activeTab === 'team' ? 1 : undefined,
                      team_size_max: activeTab === 'team' ? 1 : undefined,
                      team_gender_requirement: activeTab === 'team' ? {} : undefined,
                      template: '默认模板',
                      sort: 1,
                      status: 'active',
                      group_rule: { category: '', operator: 'in', values: [] },
                      match_format_rule: activeTab === 'single' ? { category: MATCH_FORMAT_GROUPS[0].name, operator: '=', value: '' } : undefined,
                      restrictions: []
                    });
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-md shadow-indigo-100"
                >
                  <Plus className="w-4 h-4" />
                  新建{activeTab === 'single' ? '单项' : '团体'}项目
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索项目名称..."
            value={searchNameDraft}
            onChange={(e) => setSearchNameDraft(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none"
          />
        </div>
        {activeTab === 'single' && (
          <>
            <select 
              value={searchFormatDraft}
              onChange={(e) => setSearchFormatDraft(e.target.value)}
              className="min-w-[220px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none"
            >
              <option value="">所有比赛形式</option>
              {MATCH_FORMAT_GROUPS.map((group) => (
                <optgroup key={group.id} label={group.name}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select 
              value={searchGroupDraft}
              onChange={(e) => setSearchGroupDraft(e.target.value)}
              className="min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none"
            >
              <option value="">所有组别</option>
              <option value="U8">U8</option>
              <option value="U10">U10</option>
              <option value="U12">U12</option>
              <option value="U14">U14</option>
              <option value="U16">U16</option>
            </select>
          </>
        )}
        <select 
          value={searchStatusDraft}
          onChange={(e) => setSearchStatusDraft(e.target.value)}
          className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none"
        >
          <option value="">所有状态</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
        <button
          onClick={applySearch}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          筛选
        </button>
        <button
          onClick={resetSearch}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          重置
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-[1520px] w-full text-sm text-left">
            <thead className="text-slate-500 bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">项目名称</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">简称</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">代码</th>
                {activeTab === 'single' ? (
                  <>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">基础报名费</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">押金</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">席位限制</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">需加入队伍</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">团队规模</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">席位限制</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">基础报名费</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">押金</th>
                  </>
                )}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">限制规则</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">关联报名模板</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">排序</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap">状态</th>
                <th className="sticky right-0 z-10 w-[220px] bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-right shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-400 italic">
                    暂无匹配的项目数据
                  </td>
                </tr>
              ) : (
                pagedProjects.map(p => (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'single' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {activeTab === 'single' ? <Trophy className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <span className="font-bold text-slate-900 whitespace-nowrap">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">{p.short_name}</td>
                      <td className="px-6 py-4 text-[10px] font-mono text-slate-400 whitespace-nowrap">{p.code}</td>
                      {activeTab === 'single' ? (
                        <>
                          <td className="px-6 py-4 text-indigo-600 font-bold whitespace-nowrap">¥{p.fee}</td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">¥{p.deposit}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-slate-600">最多: {p.max_seats}</span>
                              <span className="text-[10px] text-slate-400">最少: {p.min_seats || '--'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => {
                                setProjects(prev => prev.map(item => item.id === p.id ? { ...item, team_join: !item.team_join } : item));
                              }}
                              className={`w-10 h-5 rounded-full transition-all relative ${p.team_join ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${p.team_join ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                            <div className="flex flex-col">
                              <span>{formatTeamSizeRule(p)}</span>
                              <span className="text-[10px] text-slate-400">
                                {formatGenderRequirement(p.team_gender_requirement).length > 0
                                  ? formatGenderRequirement(p.team_gender_requirement).join(' / ')
                                  : '不限性别组合'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-slate-600">最多: {p.max_seats} 队</span>
                              <span className="text-[10px] text-slate-400">最少: {p.min_seats || '--'} 队</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-indigo-600 font-bold whitespace-nowrap">¥{p.fee}</td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">¥{p.deposit}</td>
                        </>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 min-w-[120px]">
                          {p.restrictions.length > 0 ? (
                            p.restrictions.map(r => (
                              <span key={r.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] border border-slate-200 whitespace-nowrap">
                                {formatRestrictionRule(r)}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">无</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{p.template}</td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{p.sort}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {p.status === 'active' ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="sticky right-0 z-10 w-[220px] bg-white px-6 py-4 text-right whitespace-nowrap shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)] transition-colors group-hover:bg-slate-50">
                        <div className="flex flex-nowrap justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingProject(p);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                            编辑
                          </button>
                          <button 
                            onClick={() => handleCopy(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:text-slate-700"
                          >
                            <Copy className="w-4 h-4" />
                            复制
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                    {p.type === 'team' && expandedProjects.has(p.id) && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="pl-14 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">包含单项项目</h4>
                              <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">共 {p.team_events?.length || 0} 个项目</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {p.team_events?.map((te, idx) => (
                                <div key={te.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">{te.match_format_rule?.value}</span>
                                    <span className="text-[10px] font-mono text-slate-300">#{idx + 1}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    组别: {te.group_rule?.values.join(', ') || '未设置'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 italic">
                                    限制: {te.restrictions.length > 0 ? te.restrictions.map((r) => formatRestrictionRule(r)).join('; ') : '无'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={filteredProjects.length}
          page={normalizedPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemLabel="个项目"
          compact
        />
      </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'single' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{editingProject.id ? '编辑' : '新建'}{activeTab === 'single' ? '单项' : '团体'}项目</h2>
                    <p className="text-xs text-slate-500 mt-0.5">请填写项目的详细配置信息</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Side: Form Fields */}
                    <div className="lg:col-span-7 space-y-10">
                      {/* Basic Info Section */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-500 pl-3 uppercase tracking-wider">基础信息</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">项目名称</label>
                            <input 
                              required
                              type="text" 
                              value={editingProject.name}
                              onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                              placeholder="例如：男子单打"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">简称</label>
                            <input 
                              type="text" 
                              value={editingProject.short_name}
                              onChange={(e) => setEditingProject({...editingProject, short_name: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">代码</label>
                            <input 
                              type="text" 
                              value={editingProject.code}
                              onChange={(e) => setEditingProject({...editingProject, code: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                            />
                          </div>
                          {activeTab === 'single' && (
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
                                      onClick={() => setEditingProject({
                                        ...editingProject,
                                        match_format_rule: {
                                          category: group.name,
                                          operator: '=',
                                          value: '',
                                        }
                                      })}
                                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                        currentEditFormatGroup === group.name
                                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                          : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                      }`}
                                    >
                                      {group.name}
                                    </button>
                                  ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                                  {currentEditFormatOptions.map((option) => {
                                    const selected = editingProject.match_format_rule?.value === option.value;
                                    return (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setEditingProject({
                                          ...editingProject,
                                          match_format_rule: {
                                            category: currentEditFormatGroup,
                                            operator: '=',
                                            value: option.value,
                                          }
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
                                {Object.keys(GROUP_OPTIONS).map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setEditingProject({
                                      ...editingProject,
                                      group_rule: {
                                        category: cat,
                                        operator: 'in',
                                        values: [],
                                      }
                                    })}
                                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                      editingProject.group_rule?.category === cat
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>

                              {editingProject.group_rule?.category === '自定义' ? (
                                <input
                                  type="text"
                                  placeholder="输入自定义组别名称"
                                  value={editingProject.group_rule?.values?.[0] || ''}
                                  onChange={(e) => setEditingProject({
                                    ...editingProject,
                                    group_rule: {
                                      ...(editingProject.group_rule || { category: '自定义', operator: 'in' }),
                                      values: [e.target.value.trim()],
                                    }
                                  })}
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                  {(editingProject.group_rule?.category
                                    ? GROUP_OPTIONS[editingProject.group_rule.category] || []
                                    : []
                                  ).map((g) => {
                                    const selected = editingProject.group_rule?.values?.[0] === g;
                                    return (
                                      <button
                                        key={g}
                                        type="button"
                                        onClick={() => setEditingProject({
                                          ...editingProject,
                                          group_rule: {
                                            ...(editingProject.group_rule || { category: '', operator: 'in' }),
                                            values: [g],
                                          }
                                        })}
                                        className={`rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-all ${
                                          selected
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40'
                                        }`}
                                      >
                                        {g}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fee & Quota Section */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-500 pl-3 uppercase tracking-wider">费用与名额</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">基础报名费 (¥)</label>
                            <input 
                              type="number" 
                              value={editingProject.fee}
                              onChange={(e) => setEditingProject({...editingProject, fee: Number(e.target.value)})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">押金 (¥)</label>
                            <input 
                              type="number" 
                              value={editingProject.deposit}
                              onChange={(e) => setEditingProject({...editingProject, deposit: Number(e.target.value)})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">最大席位 ({activeTab === 'single' ? '人' : '队'})</label>
                            <input 
                              type="number" 
                              value={editingProject.max_seats}
                              onChange={(e) => setEditingProject({...editingProject, max_seats: Number(e.target.value)})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">最少立项人数 ({activeTab === 'single' ? '人' : '队'})</label>
                            <input 
                              type="number" 
                              value={editingProject.min_seats}
                              onChange={(e) => setEditingProject({...editingProject, min_seats: Number(e.target.value)})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          {activeTab === 'team' && (
                            <>
                              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-800">团队规模限制</h4>
                                    </div>
                                    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const baseValue = editingProject.team_size_min ?? editingProject.team_size_max ?? editingProject.team_size_limit ?? 1;
                                          setEditingProject({
                                            ...editingProject,
                                            team_size_min: baseValue,
                                            team_size_max: baseValue,
                                            team_size_limit: baseValue,
                                          });
                                        }}
                                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                                          currentTeamSizeMode === 'fixed'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                      >
                                        固定人数
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const baseMin = editingProject.team_size_min ?? editingProject.team_size_limit ?? 1;
                                          const rawMax = editingProject.team_size_max ?? editingProject.team_size_limit;
                                          const baseMax =
                                            rawMax !== undefined && rawMax > baseMin
                                              ? rawMax
                                              : baseMin + 1;
                                          setEditingProject({
                                            ...editingProject,
                                            team_size_min: Math.min(baseMin, baseMax),
                                            team_size_max: Math.max(baseMin, baseMax),
                                            team_size_limit: undefined,
                                          });
                                        }}
                                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                                          currentTeamSizeMode === 'range'
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                      >
                                        人数范围
                                      </button>
                                    </div>
                                  </div>

                                  {currentTeamSizeMode === 'fixed' ? (
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">固定人数</label>
                                      <input 
                                        type="number"
                                        min="1"
                                        value={editingProject.team_size_min ?? editingProject.team_size_max ?? editingProject.team_size_limit ?? ''}
                                        onChange={(e) => {
                                          const nextValue = Number(e.target.value) || undefined;
                                          setEditingProject({
                                            ...editingProject,
                                            team_size_min: nextValue,
                                            team_size_max: nextValue,
                                            team_size_limit: nextValue,
                                          });
                                        }}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                      />
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">人数下限</label>
                                        <input 
                                          type="number" 
                                          min="1"
                                          value={editingProject.team_size_min ?? ''}
                                          onChange={(e) => setEditingProject({...editingProject, team_size_min: Number(e.target.value) || undefined})}
                                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">人数上限</label>
                                        <input 
                                          type="number" 
                                          min="1"
                                          value={editingProject.team_size_max ?? ''}
                                          onChange={(e) => setEditingProject({...editingProject, team_size_max: Number(e.target.value) || undefined, team_size_limit: undefined})}
                                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-800">队伍性别约束</h4>
                                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                                      按需开启需要的约束项，未开启的条件默认不限制。
                                    </p>
                                  </div>
                                  <div className="shrink-0 whitespace-nowrap rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600">
                                    可选配置
                                  </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                  {[
                                    { key: 'min_male', label: '最少男性人数', hint: '例如至少 2 名男性' },
                                    { key: 'max_male', label: '最多男性人数', hint: '例如最多 4 名男性' },
                                    { key: 'min_female', label: '最少女性人数', hint: '例如至少 1 名女性' },
                                    { key: 'max_female', label: '最多女性人数', hint: '例如最多 3 名女性' },
                                  ].map((rule) => {
                                    const currentValue = editingProject.team_gender_requirement?.[rule.key as keyof TeamGenderRequirement];
                                    const enabled = currentValue !== undefined;

                                    return (
                                      <div key={rule.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between gap-3">
                                          <div>
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{rule.label}</label>
                                            <p className="mt-1 text-[11px] text-slate-400">{rule.hint}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setEditingProject({
                                              ...editingProject,
                                              team_gender_requirement: {
                                                ...(editingProject.team_gender_requirement || {}),
                                                [rule.key]: enabled ? undefined : 1,
                                              }
                                            })}
                                            className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                          >
                                            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${enabled ? 'left-5.5' : 'left-0.5'}`} />
                                          </button>
                                        </div>

                                        {enabled && (
                                          <div className="mt-4">
                                            <input
                                              type="number"
                                              min="0"
                                              value={currentValue ?? ''}
                                              onChange={(e) => setEditingProject({
                                                ...editingProject,
                                                team_gender_requirement: {
                                                  ...(editingProject.team_gender_requirement || {}),
                                                  [rule.key]: Number(e.target.value) || undefined,
                                                }
                                              })}
                                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Advanced Rules Section */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-l-4 border-indigo-500 pl-3 uppercase tracking-wider">高级规则与配置</h3>
                        <div className="space-y-6">
                          {activeTab === 'single' && (
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                    <Users className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="text-sm font-bold text-slate-700">报名需加入队伍</span>
                                    <p className="text-[10px] text-slate-400">开启后，则报名页面队伍为必填项</p>
                                  </div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setEditingProject({...editingProject, team_join: !editingProject.team_join})}
                                  className={`w-12 h-6 rounded-full transition-all relative ${editingProject.team_join ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProject.team_join ? 'right-1' : 'left-1'}`} />
                                </button>
                              </div>
                              {editingProject.team_join && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-4 border-t border-slate-200 space-y-2"
                                >
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">每队最多报名人数</label>
                                  <input 
                                    type="number" 
                                    value={editingProject.max_members_per_team}
                                    onChange={(e) => setEditingProject({...editingProject, max_members_per_team: Number(e.target.value)})}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                  />
                                </motion.div>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">关联报名模板</label>
                              <select 
                                value={editingProject.template}
                                onChange={(e) => setEditingProject({...editingProject, template: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                              >
                                <option value="默认模板">默认模板</option>
                                <option value="团体模板">团体模板</option>
                                <option value="精英赛模板">精英赛模板</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">项目状态</label>
                              <select 
                                value={editingProject.status}
                                onChange={(e) => setEditingProject({...editingProject, status: e.target.value as 'active' | 'inactive'})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                              >
                                <option value="active">启用</option>
                                <option value="inactive">禁用</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">附加限制规则</label>
                              <button 
                                type="button"
                                onClick={() => {
                                  const newRule: RestrictionRule = { id: Date.now().toString(), field: '户籍', operator: '=', value: '' };
                                  setEditingProject({...editingProject, restrictions: [...(editingProject.restrictions || []), newRule]});
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                添加规则
                              </button>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] leading-5 text-slate-500">
                              支持常规字段限制，也支持组合年龄类规则，例如：组合总年龄小于等于 90 岁、男性年龄小于等于 35 岁、女性年龄小于等于 30 岁。
                            </div>
                            <div className="space-y-3">
                              {(editingProject.restrictions || []).length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                  <p className="text-[10px] text-slate-400">暂无限制规则</p>
                                </div>
                              ) : (
                                editingProject.restrictions.map((rule, idx) => (
                                  <div key={rule.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                    <select 
                                      value={rule.field}
                                      onChange={(e) => {
                                        const newRestrictions = [...editingProject.restrictions];
                                        newRestrictions[idx].field = e.target.value;
                                        newRestrictions[idx].operator = isCompositeAgeField(e.target.value) ? '<=' : '=';
                                        newRestrictions[idx].value = '';
                                        setEditingProject({...editingProject, restrictions: newRestrictions});
                                      }}
                                      className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700"
                                    >
                                      <optgroup label="基础字段">
                                        <option value="户籍">户籍</option>
                                        <option value="年龄">年龄</option>
                                        <option value="积分">积分</option>
                                        <option value="性别">性别</option>
                                        <option value="地区">地区</option>
                                      </optgroup>
                                      <optgroup label="组合年龄">
                                        <option value="组合总年龄">组合总年龄</option>
                                        <option value="男性年龄">男性年龄</option>
                                        <option value="女性年龄">女性年龄</option>
                                      </optgroup>
                                    </select>
                                    <select 
                                      value={rule.operator}
                                      onChange={(e) => {
                                        const newRestrictions = [...editingProject.restrictions];
                                        newRestrictions[idx].operator = e.target.value as any;
                                        setEditingProject({...editingProject, restrictions: newRestrictions});
                                      }}
                                      className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700"
                                    >
                                      {getRestrictionOperatorOptions(rule.field).map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <input 
                                      type={isCompositeAgeField(rule.field) ? 'number' : 'text'}
                                      value={rule.value}
                                      onChange={(e) => {
                                        const newRestrictions = [...editingProject.restrictions];
                                        newRestrictions[idx].value = e.target.value;
                                        setEditingProject({...editingProject, restrictions: newRestrictions});
                                      }}
                                      placeholder={isCompositeAgeField(rule.field) ? '请输入年龄值' : '值'}
                                      className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-700"
                                    />
                                    {isCompositeAgeField(rule.field) && (
                                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                                        岁
                                      </span>
                                    )}
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newRestrictions = editingProject.restrictions.filter((_, i) => i !== idx);
                                        setEditingProject({...editingProject, restrictions: newRestrictions});
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-600 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                    {getRestrictionHint(rule.field) && (
                                      <p className="px-1 text-[10px] leading-5 text-slate-400">
                                        {getRestrictionHint(rule.field)}
                                      </p>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Preview Panel */}
                    <div className="lg:col-span-5">
                      <div className="sticky top-0 space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-l-4 border-emerald-500 pl-3 uppercase tracking-wider">前端报名预览</h3>
                        <div className="bg-slate-100 rounded-[2.5rem] p-4 border-8 border-slate-900 shadow-2xl aspect-[9/19] max-w-[320px] mx-auto relative overflow-hidden">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />
                          <div className="bg-white h-full rounded-[1.5rem] overflow-hidden flex flex-col">
                            <div className="bg-indigo-600 px-4 pt-8 pb-4 text-white">
                              <h4 className="text-sm font-bold truncate">{editingProject.name || '项目名称'}</h4>
                              <p className="text-[10px] opacity-80 mt-0.5">请填写以下信息完成报名</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                              {TEMPLATE_CONFIGS[editingProject.template]?.map((field, idx) => (
                                <div key={idx} className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field}</label>
                                  <div className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-3 text-slate-300 text-xs italic">
                                    请输入{field}...
                                  </div>
                                </div>
                              ))}
                              <div className="pt-4 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500">报名费用</span>
                                  <span className="font-bold text-slate-900">¥{editingProject.fee + editingProject.deposit}</span>
                                </div>
                                <button type="button" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">
                                  立即支付并报名
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">
                          * 预览效果仅供参考，实际以移动端渲染为准
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    保存项目配置
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
