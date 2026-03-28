/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  Users, 
  Trophy, 
  Settings2, 
  Info, 
  ChevronRight,
  Clock,
  LayoutGrid,
  UserCheck,
  UserMinus,
  CheckCircle2,
  AlertCircle,
  Plus,
  PencilLine,
  FileText,
  X,
  Search,
  Tag,
  ArrowUp,
  ArrowDown,
  Trash2,
  Zap,
  Layers,
  Percent,
  DollarSign,
  Package,
  Ticket,
  Wrench,
  UserCircle,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Database,
  ChevronDown,
  Menu,
  Megaphone,
  Bell,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RegistrationConfig, 
  RegistrationChannel, 
  ListRestrictionType, 
  QuotaBasis,
  DiscountRule,
  MutuallyExclusiveGroup,
  SigningMethod,
  AgreementTemplate,
  RuleType,
  ScopeType,
  DiscountValueType,
  StackStrategy,
  RuleStatus,
  MultiEventCalcType
} from './types';

import { RegistrationRecords } from './components/RegistrationRecords';
import { RegistrationAnnouncement } from './components/RegistrationAnnouncement';
import { ProjectScheduling } from './components/ProjectScheduling';
import MatchManagement from './components/MatchManagement';
import { RegistrationProjects } from './components/RegistrationProjects';
import { VenueResourceConfig } from './components/VenueResourceConfig';
import { MatchCodeConfig } from './components/MatchCodeConfig';
import { PlayerManagement } from './components/PlayerManagement';
import { ScheduleConfig } from './components/ScheduleConfig';
import { BasicInfoConfig } from './components/BasicInfoConfig';
import { PageDecorationConfig } from './components/PageDecorationConfig';
import { TablePagination } from './components/TablePagination';
import { GroupManagement } from './components/GroupManagement';
import { InteractionHelp } from './components/InteractionHelp';
import { VenueConfig, ProjectSchedulingConfig, TournamentBasicInfo } from './types';

// Mock list data
const MOCK_LISTS = [
  { id: '1', name: '2025年度省赛精英名单', count: 150 },
  { id: '2', name: '违规禁赛黑名单-2024', count: 12 },
  { id: '3', name: '特邀嘉宾白名单', count: 45 },
  { id: '4', name: '青少年组预选名单', count: 200 },
];

const MOCK_EVENTS = [
  { id: 'e1', name: 'A组男子单打' },
  { id: 'e2', name: 'A组男子双打' },
  { id: 'e3', name: 'B组男子单打' },
  { id: 'e4', name: 'B组男子双打' },
  { id: 'e5', name: '混合双打' },
];

const MOCK_AGREEMENTS: AgreementTemplate[] = [
  { id: 'a1', name: '赛事免责声明' },
  { id: 'a2', name: '个人信息保护政策' },
  { id: 'a3', name: '参赛选手行为准则' },
  { id: 'a4', name: '肖像权授权协议' },
];

const INITIAL_MULTI_EVENT_DISCOUNT: DiscountRule = { 
  id: '1', 
  event_id: '1001',
  rule_name: '兼项优惠', 
  priority: 1, 
  rule_type: RuleType.MULTI_EVENT, 
  scope_type: ScopeType.ENTRY,
  discount_type: DiscountValueType.FIXED,
  discount_value: 50,
  stack_strategy: StackStrategy.EXCLUSIVE,
  status: RuleStatus.DISABLED, 
  start_time: '2026-03-20T09:00',
  end_time: '2026-04-20T18:00',
  applicable_scope: ['INDIVIDUAL'],
  multi_event_calc_type: MultiEventCalcType.ENTRY,
  multi_event_step_config: [
    { index: 2, discount: 50, discount_type: DiscountValueType.FIXED },
    { index: 3, discount: 100, discount_type: DiscountValueType.FIXED }
  ],
  exclusive_rule_ids: []
};

const VIEW_TITLES = {
  'basic-info': '基础信息',
  'page-decoration': '页面装修',
  settings: '报名配置',
  records: '报名记录',
  announcement: '报名公示',
  scheduling: '项目编排',
  projects: '项目配置',
  'match-management': '比赛管理',
  'player-management': '选手管理',
  'schedule-config': '赛程安排',
  'referee-management': '裁判管理',
  'venue-config': '场地资源',
} as const;

const VIEW_SECTIONS = {
  'basic-info': '基础配置',
  'page-decoration': '基础配置',
  settings: '报名管理',
  records: '报名管理',
  announcement: '报名管理',
  scheduling: '赛事编排',
  projects: '报名管理',
  'match-management': '赛事编排',
  'player-management': '赛事编排',
  'schedule-config': '赛事编排',
  'referee-management': '赛事编排',
  'venue-config': '赛事编排',
} as const;

type AppPage = 'tournament-list' | 'tournament-detail';

type TournamentListItem = {
  id: string;
  name: string;
  subtitle: string;
  organizer: string;
  province: string;
  city: string;
  venueName: string;
  venueAddress: string;
  registrationStartTime: string;
  registrationEndTime: string;
  startTime: string;
  endTime: string;
  publishStatus: boolean;
  status: string;
  stage: string;
  updatedAt: string;
};

type AdminMenuSection = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: { key: string; label: string }[];
};

type MatchFormatGroupRow = {
  id: string;
  groupName: string;
  specs: string[];
  description: string;
  createdAt: string;
};

type ScoreRuleRow = {
  id: string;
  ruleName: string;
  summary: string;
  updatedAt: string;
};

const DEFAULT_TOURNAMENT: TournamentListItem = {
  id: 'T001',
  name: '2026 城市羽毛球公开赛',
  subtitle: '城市俱乐部联赛暨全民健身系列赛',
  organizer: '深圳市羽毛球协会',
  province: '广东省',
  city: '深圳市',
  venueName: '深圳湾体育中心羽毛球馆',
  venueAddress: '深圳市南山区滨海大道3001号',
  registrationStartTime: '2026-03-20T09:00',
  registrationEndTime: '2026-04-20T18:00',
  startTime: '2026-05-01T09:00',
  endTime: '2026-05-03T18:00',
  publishStatus: true,
  status: '报名中',
  stage: '赛事筹备',
  updatedAt: '今天 14:30',
};

const TOURNAMENT_LIST: TournamentListItem[] = [
  DEFAULT_TOURNAMENT,
  {
    id: 'T002',
    name: '2026 青少年羽毛球分站赛',
    subtitle: 'U 系列分龄积分赛',
    organizer: '深圳市青少年体育联合会',
    province: '广东省',
    city: '深圳市',
    venueName: '龙岗大运中心体育馆',
    venueAddress: '深圳市龙岗区龙翔大道3001号',
    registrationStartTime: '2026-05-01T10:00',
    registrationEndTime: '2026-06-01T18:00',
    startTime: '2026-06-12T08:30',
    endTime: '2026-06-14T18:00',
    publishStatus: false,
    status: '未开始报名',
    stage: '基础配置中',
    updatedAt: '昨天 18:10',
  },
  {
    id: 'T003',
    name: '2026 企业羽毛球邀请赛',
    subtitle: '企业联队对抗交流赛',
    organizer: '南山区总工会',
    province: '广东省',
    city: '深圳市',
    venueName: '南山文体中心羽毛球馆',
    venueAddress: '深圳市南山区南山大道2001号',
    registrationStartTime: '2026-06-01T09:00',
    registrationEndTime: '2026-06-30T23:59',
    startTime: '2026-07-08T09:00',
    endTime: '2026-07-09T20:00',
    publishStatus: true,
    status: '已结束',
    stage: '归档中',
    updatedAt: '03-21 09:20',
  },
];

const MATCH_FORMAT_GROUPS: MatchFormatGroupRow[] = [
  {
    id: 'format-group-1',
    groupName: '常规赛制',
    specs: ['男子单打', '女子单打', '男子双打', '女子双打', '混合双打'],
    description: '严格限制每项规格的正赛席位与性别限制',
    createdAt: '2024-09-03 09:52:08',
  },
  {
    id: 'format-group-2',
    groupName: '开放形式',
    specs: ['单打', '双打', '三人制'],
    description: '仅限制正赛席位，不限制性别',
    createdAt: '2024-09-03 09:52:08',
  },
  {
    id: 'format-group-3',
    groupName: '三人制',
    specs: ['3男', '3女', '1男2女', '2男1女', '混合(至少1异性)'],
    description: '3v3 限制性别专用',
    createdAt: '2024-09-03 09:52:08',
  },
];

const SCORE_RULES: ScoreRuleRow[] = [
  {
    id: 'SR001',
    ruleName: '21分标准分',
    summary: '本局目标分 [20] 分，若出现平分，需领先 [2] 分获胜；如分数僵持，则先到 [30] 分者直接获胜。',
    updatedAt: '2026-03-22 14:20:36',
  },
  {
    id: 'SR002',
    ruleName: '15分单淘汰',
    summary: '本局目标分 [15] 分，若出现平分，需领先 [2] 分获胜；如分数僵持，则先到 [21] 分者直接获胜。',
    updatedAt: '2026-03-18 09:12:08',
  },
  {
    id: 'SR003',
    ruleName: '11分快节奏',
    summary: '本局目标分 [11] 分，若出现平分，需领先 [2] 分获胜；如分数僵持，则先到 [15] 分者直接获胜。',
    updatedAt: '2026-03-09 18:45:20',
  },
];

const ADMIN_MENU_SECTIONS: AdminMenuSection[] = [
  {
    key: 'tournament',
    label: '赛事管理',
    icon: Calendar,
    children: [
      { key: 'tournament-list', label: '赛事列表' },
      { key: 'match-format', label: '比赛形式' },
      { key: 'group-management', label: '组别管理' },
    ],
  },
  {
    key: 'user',
    label: '用户管理',
    icon: Users,
    children: [
      { key: 'player-management-admin', label: '选手管理' },
      { key: 'target-list', label: '目标清单' },
    ],
  },
  {
    key: 'venue',
    label: '场馆管理',
    icon: LayoutGrid,
    children: [
      { key: 'venue-list', label: '场馆列表' },
      { key: 'court-management', label: '场地管理' },
      { key: 'resource-calendar', label: '资源日历' },
      { key: 'integration-settings', label: '对接设置' },
    ],
  },
  {
    key: 'official',
    label: '技术官员',
    icon: ShieldCheck,
    children: [
      { key: 'official-list', label: '技术官员列表' },
      { key: 'official-stats', label: '执裁统计' },
    ],
  },
  {
    key: 'template',
    label: '模板中心',
    icon: FileText,
    children: [
      { key: 'score-rule-template', label: '单局计分规则' },
      { key: 'single-match-rule-template', label: '单项胜负规则' },
      { key: 'team-battle-rule-template', label: '团体对抗规则' },
      { key: 'registration-template', label: '报名模板' },
      { key: 'match-code-rule-template', label: '比赛代码规则' },
    ],
  },
  {
    key: 'workflow',
    label: '流程管理',
    icon: Wrench,
    children: [{ key: 'order-workflow', label: '订单流程' }],
  },
  {
    key: 'payment',
    label: '支付管理',
    icon: DollarSign,
    children: [
      { key: 'payment-rule-config', label: '收款规则配置' },
      { key: 'payment-records', label: '支付记录' },
      { key: 'refund-records', label: '退款记录' },
    ],
  },
  {
    key: 'system',
    label: '系统设置',
    icon: Settings,
    children: [{ key: 'operation-log', label: '操作日志' }],
  },
];

export default function App() {
  const [appPage, setAppPage] = useState<AppPage>('tournament-list');
  const [tournaments, setTournaments] = useState<TournamentListItem[]>(TOURNAMENT_LIST);
  const [adminActiveMenu, setAdminActiveMenu] = useState('tournament-list');
  const [expandedAdminMenus, setExpandedAdminMenus] = useState<string[]>(['tournament', 'user', 'venue', 'official', 'template', 'workflow', 'payment', 'system']);
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [prototypeMode, setPrototypeMode] = useState(true);
  const [tournamentListPage, setTournamentListPage] = useState(1);
  const [tournamentListPageSize, setTournamentListPageSize] = useState(10);
  const [tournamentKeywordDraft, setTournamentKeywordDraft] = useState('');
  const [tournamentKeywordFilter, setTournamentKeywordFilter] = useState('');
  const [tournamentStatusFilterDraft, setTournamentStatusFilterDraft] = useState<'all' | '未开始报名' | '报名中' | '报名截止' | '比赛进行中' | '已结束' | '已取消'>('all');
  const [tournamentStatusFilter, setTournamentStatusFilter] = useState<'all' | '未开始报名' | '报名中' | '报名截止' | '比赛进行中' | '已结束' | '已取消'>('all');
  const [matchFormatPage, setMatchFormatPage] = useState(1);
  const [matchFormatPageSize, setMatchFormatPageSize] = useState(10);
  const [scoreRuleSearchDraft, setScoreRuleSearchDraft] = useState('');
  const [scoreRuleSearchQuery, setScoreRuleSearchQuery] = useState('');
  const [scoreRulePage, setScoreRulePage] = useState(1);
  const [scoreRulePageSize, setScoreRulePageSize] = useState(10);
  const [selectedTournamentId, setSelectedTournamentId] = useState(DEFAULT_TOURNAMENT.id);
  const [viewMode, setViewMode] = useState<'basic-info' | 'page-decoration' | 'settings' | 'records' | 'announcement' | 'scheduling' | 'projects' | 'match-management' | 'player-management' | 'schedule-config' | 'referee-management' | 'venue-config'>('basic-info');
  const [recordsInitialTab, setRecordsInitialTab] = useState<'orders' | 'project_summary' | 'participants' | 'teams'>('orders');
  const [activeTab, setActiveTab] = useState<'config' | 'discount' | 'restriction' | 'signing'>('config');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['basic', 'registration', 'scheduling']);

  const [venueConfig, setVenueConfig] = useState<VenueConfig>({
    court_count: 8,
    match_duration: 30,
    break_duration: 5,
    buffer_duration: 5,
    max_daily_hours: 8,
    max_days: 2
  });

  const [schedulingConfigs, setSchedulingConfigs] = useState<Record<string, ProjectSchedulingConfig>>({});
  const [basicInfo, setBasicInfo] = useState<TournamentBasicInfo>({
    tournamentName: '2026 城市羽毛球公开赛',
    tournamentSubtitle: '城市俱乐部联赛暨全民健身系列赛',
    coverUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    startTime: '2026-05-01T09:00',
    endTime: '2026-05-03T18:00',
    organizers: ['深圳市羽毛球协会'],
    coOrganizers: ['深圳湾体育中心运营有限公司'],
    province: '广东省',
    city: '深圳市',
    venueName: '深圳湾体育中心羽毛球馆',
    venueAddress: '深圳市南山区滨海大道3001号',
    description:
      '赛事面向城市俱乐部、高校社团及大众羽毛球爱好者开放报名，设置公开组、精英组与团体赛单元，兼顾竞技体验与大众参与氛围。',
  });
  
  const toggleMenu = (menuId: string) => {
    if (!isSidebarOpen) setIsSidebarOpen(true);
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };
  const [config, setConfig] = useState<RegistrationConfig>({
    startTime: '2026-03-20T09:00',
    endTime: '2026-04-20T18:00',
    channel: RegistrationChannel.UNLIMITED,
    listRestriction: ListRestrictionType.NONE,
    selectedListName: '',
    enableQuota: true,
    individualQuota: 100,
    teamQuota: 20,
    quotaBasis: QuotaBasis.SEAT,
    multiEventDiscount: INITIAL_MULTI_EVENT_DISCOUNT,
    maxEventsPerPerson: 2,
    restrictionScope: ['INDIVIDUAL'],
    mutuallyExclusiveGroups: [
      { id: 'g1', eventIds: ['e1', 'e2'], eventNames: ['A组男子单打', 'A组男子双打'] }
    ],
    enableTeamRosterLimit: true,
    maxMembersPerTeam: 12,
    maxCoachesPerTeam: 1,
    enableSigning: true,
    selectedAgreements: [MOCK_AGREEMENTS[0]],
    signingMethod: SigningMethod.READ_AND_AGREE,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MutuallyExclusiveGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const selectList = (name: string) => {
    setConfig({ ...config, selectedListName: name });
    setShowListModal(false);
  };

  const filteredLists = MOCK_LISTS.filter(l => l.name.includes(searchQuery));
  const currentViewTitle = VIEW_TITLES[viewMode];
  const currentSectionTitle = VIEW_SECTIONS[viewMode];

  const tournamentListData = tournaments.map((item) =>
    item.id === selectedTournamentId
      ? {
          ...item,
          name: basicInfo.tournamentName,
          subtitle: basicInfo.tournamentSubtitle,
          organizer: basicInfo.organizers[0] ?? item.organizer,
          province: basicInfo.province,
          city: basicInfo.city,
          venueName: basicInfo.venueName,
          venueAddress: basicInfo.venueAddress,
          registrationStartTime: config.startTime,
          registrationEndTime: config.endTime,
          startTime: basicInfo.startTime,
          endTime: basicInfo.endTime,
        }
      : item
  );

  const filteredTournamentListData = useMemo(() => {
    const keyword = tournamentKeywordFilter.trim().toLowerCase();
    return tournamentListData.filter((item) => {
      const matchesKeyword =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.organizer.toLowerCase().includes(keyword);
      const matchesStatus =
        tournamentStatusFilter === 'all' || item.status === tournamentStatusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [tournamentListData, tournamentKeywordFilter, tournamentStatusFilter]);

  const activeTournament =
    tournamentListData.find((item) => item.id === selectedTournamentId) ?? tournamentListData[0];

  const activeAdminSection =
    ADMIN_MENU_SECTIONS.find((section) => section.children.some((child) => child.key === adminActiveMenu)) ??
    ADMIN_MENU_SECTIONS[0];
  const activeAdminItem =
    activeAdminSection.children.find((child) => child.key === adminActiveMenu) ??
    activeAdminSection.children[0];
  const tournamentListTotalPages = Math.max(1, Math.ceil(filteredTournamentListData.length / tournamentListPageSize));
  const normalizedTournamentListPage = Math.min(tournamentListPage, tournamentListTotalPages);
  const pagedTournaments = filteredTournamentListData.slice(
    (normalizedTournamentListPage - 1) * tournamentListPageSize,
    normalizedTournamentListPage * tournamentListPageSize
  );
  const matchFormatTotalPages = Math.max(1, Math.ceil(MATCH_FORMAT_GROUPS.length / matchFormatPageSize));
  const normalizedMatchFormatPage = Math.min(matchFormatPage, matchFormatTotalPages);
  const pagedMatchFormats = MATCH_FORMAT_GROUPS.slice(
    (normalizedMatchFormatPage - 1) * matchFormatPageSize,
    normalizedMatchFormatPage * matchFormatPageSize
  );
  const filteredScoreRules = useMemo(() => {
    const keyword = scoreRuleSearchQuery.trim().toLowerCase();
    if (!keyword) return SCORE_RULES;
    return SCORE_RULES.filter((item) => item.ruleName.toLowerCase().includes(keyword));
  }, [scoreRuleSearchQuery]);
  const scoreRuleTotalPages = Math.max(1, Math.ceil(filteredScoreRules.length / scoreRulePageSize));
  const normalizedScoreRulePage = Math.min(scoreRulePage, scoreRuleTotalPages);
  const pagedScoreRules = filteredScoreRules.slice(
    (normalizedScoreRulePage - 1) * scoreRulePageSize,
    normalizedScoreRulePage * scoreRulePageSize
  );

  const formatTournamentDate = (startTime: string, endTime: string) => {
    const start = startTime.slice(0, 10).replace(/-/g, '.');
    const end = endTime.slice(5, 10).replace('-', '.');
    return `${start} - ${end}`;
  };

  const formatDateOnly = (value: string) => value.slice(0, 10).replace(/-/g, '.');

  const formatDateRangeWithHover = (startTime: string, endTime: string) => ({
    short: `${formatDateOnly(startTime)} - ${endTime.slice(5, 10).replace('-', '.')}`,
    full: `${startTime.replace('T', ' ')} - ${endTime.replace('T', ' ')}`,
  });

  const applyScoreRuleSearch = () => {
    setScoreRuleSearchQuery(scoreRuleSearchDraft);
    setScoreRulePage(1);
  };

  const resetScoreRuleSearch = () => {
    setScoreRuleSearchDraft('');
    setScoreRuleSearchQuery('');
    setScoreRulePage(1);
  };

  const openTournamentDetail = (tournamentId: string) => {
    const target = tournamentListData.find((item) => item.id === tournamentId);
    if (!target) return;

    setSelectedTournamentId(tournamentId);
    setBasicInfo((prev) => ({
      ...prev,
      tournamentName: target.name,
      tournamentSubtitle: target.subtitle,
      organizers: [target.organizer],
      province: target.province,
      city: target.city,
      venueName: target.venueName,
      venueAddress: target.venueAddress,
      startTime: target.startTime,
      endTime: target.endTime,
    }));
    setConfig((prev) => ({
      ...prev,
      startTime: target.registrationStartTime,
      endTime: target.registrationEndTime,
    }));
    setAppPage('tournament-detail');
  };

  const applyTournamentFilters = () => {
    setTournamentKeywordFilter(tournamentKeywordDraft);
    setTournamentStatusFilter(tournamentStatusFilterDraft);
    setTournamentListPage(1);
  };

  const resetTournamentFilters = () => {
    setTournamentKeywordDraft('');
    setTournamentKeywordFilter('');
    setTournamentStatusFilterDraft('all');
    setTournamentStatusFilter('all');
    setTournamentListPage(1);
  };

  const toggleTournamentPublishStatus = (tournamentId: string) => {
    setTournaments((prev) =>
      prev.map((item) =>
        item.id === tournamentId
          ? {
              ...item,
              publishStatus: !item.publishStatus,
              updatedAt: '刚刚',
            }
          : item
      )
    );
  };

  const deleteTournament = (tournamentId: string) => {
    setTournaments((prev) => prev.filter((item) => item.id !== tournamentId));
    if (selectedTournamentId === tournamentId) {
      const nextTournament = tournaments.find((item) => item.id !== tournamentId);
      if (nextTournament) {
        setSelectedTournamentId(nextTournament.id);
      }
    }
  };

  const toggleAdminMenu = (menuKey: string) => {
    setExpandedAdminMenus((prev) =>
      prev.includes(menuKey) ? prev.filter((item) => item !== menuKey) : [...prev, menuKey]
    );
  };

  if (appPage === 'tournament-list') {
    return (
      <div className="min-h-screen bg-slate-100 flex overflow-x-hidden">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 ${adminSidebarCollapsed ? 'w-24' : 'w-80'}`}
        >
          <div className={`h-20 border-b border-slate-100 ${adminSidebarCollapsed ? 'px-4' : 'px-6'} flex items-center justify-between`}>
            <div className={`flex items-center ${adminSidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Calendar className="h-5 w-5" />
              </div>
              {!adminSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <h1 className="truncate whitespace-nowrap text-lg font-bold tracking-tight text-slate-900">羽球在线后台管理系统</h1>
                </div>
              )}
            </div>
            {!adminSidebarCollapsed && (
              <button
                onClick={() => setAdminSidebarCollapsed(true)}
                className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-3 py-5">
            <div className="space-y-2">
            {ADMIN_MENU_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedAdminMenus.includes(section.key);
              const isSectionActive = section.key === activeAdminSection.key;

              return (
                <div key={section.key} className="space-y-1">
                  <button
                    onClick={() => {
                      if (adminSidebarCollapsed) {
                        setAdminSidebarCollapsed(false);
                        return;
                      }
                      toggleAdminMenu(section.key);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2.5 transition-all ${
                      isSectionActive
                        ? 'bg-slate-50 text-slate-950'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`flex items-center ${adminSidebarCollapsed ? 'justify-center w-full' : 'gap-2.5'}`}>
                      {!adminSidebarCollapsed && (
                        <span className={`h-5 w-1 rounded-full transition-colors ${isSectionActive ? 'bg-indigo-500' : 'bg-transparent'}`} />
                      )}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                        isSectionActive ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'bg-slate-50'
                      }`}>
                        <Icon className={`h-4 w-4 ${isSectionActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                      </div>
                      {!adminSidebarCollapsed && (
                        <span className={`text-sm font-semibold ${isSectionActive ? 'text-slate-950' : 'text-slate-700'}`}>
                          {section.label}
                        </span>
                      )}
                    </div>
                    {!adminSidebarCollapsed && (
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && !adminSidebarCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-4 overflow-hidden border-l border-slate-200 pl-4"
                      >
                        <div className="space-y-1 py-1">
                          {section.children.map((child) => {
                            const isChildActive = child.key === adminActiveMenu;
                            return (
                              <button
                                key={child.key}
                                onClick={() => setAdminActiveMenu(child.key)}
                                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                                  isChildActive
                                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                {child.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            </div>
          </div>

          <div className="border-t border-slate-100 p-3">
            <button
              onClick={() => setAdminSidebarCollapsed((prev) => !prev)}
              className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 ${
                adminSidebarCollapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <Menu className="h-4 w-4" />
              {!adminSidebarCollapsed && <span>收起导航</span>}
            </button>
          </div>
        </aside>

        <div className={`min-w-0 flex-1 min-h-screen flex flex-col transition-all duration-300 ${adminSidebarCollapsed ? 'ml-24' : 'ml-80'}`}>
          <header className="min-w-0 h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-end sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrototypeMode((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                  prototypeMode
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Info className="h-4 w-4" />
                原型说明模式
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">管理员</p>
                  <p className="text-[10px] text-slate-400 font-medium">mustgoon@126.com</p>
                </div>
                <UserCircle className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden px-8 py-8">
            {adminActiveMenu === 'tournament-list' ? (
              <div className="mx-auto w-full max-w-7xl min-w-0">
                <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">赛事列表</h3>
                          <p className="mt-1 text-sm text-slate-500">从一级页进入赛事详情，后续配置均在赛事二级页面中完成。</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                        导入赛事
                      </button>
                      <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                        新建赛事
                      </button>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 px-8 py-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[260px]">
                          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={tournamentKeywordDraft}
                            onChange={(event) => setTournamentKeywordDraft(event.target.value)}
                            placeholder="搜索赛事名称 / 主办单位"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                        <select
                          value={tournamentStatusFilterDraft}
                          onChange={(event) =>
                            setTournamentStatusFilterDraft(
                              event.target.value as 'all' | '未开始报名' | '报名中' | '报名截止' | '比赛进行中' | '已结束' | '已取消'
                            )
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="all">全部赛事状态</option>
                          <option value="未开始报名">未开始报名</option>
                          <option value="报名中">报名中</option>
                          <option value="报名截止">报名截止</option>
                          <option value="比赛进行中">比赛进行中</option>
                          <option value="已结束">已结束</option>
                          <option value="已取消">已取消</option>
                        </select>
                        <button
                          onClick={applyTournamentFilters}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
                        >
                          筛选
                        </button>
                        <button
                          onClick={resetTournamentFilters}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
                        >
                          重置
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 max-w-[440px]">
                      <InteractionHelp
                        prototypeMode={prototypeMode}
                        content={
                          <div className="space-y-3">
                            <p>
                              1. 报名时间、比赛时间：列表只展示日期，鼠标移入后展示具体时分秒。
                            </p>
                            <div>
                              <p className="font-semibold text-amber-900">2. 赛事状态：</p>
                              <p>未开始报名、报名中、报名截止、比赛进行中、已结束、已取消。</p>
                            </div>
                          </div>
                        }
                      />
                    </div>
                  </div>

                  <div className="max-w-full overflow-x-auto">
                    <table className="min-w-[1480px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-white">
                          <th className="w-[28%] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">赛事名称</th>
                          <th className="w-[15%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">报名时间</th>
                          <th className="w-[15%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">比赛时间</th>
                          <th className="w-[11%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">赛事状态</th>
                          <th className="w-[8%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">发布状态</th>
                          <th className="w-[9%] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">最近更新</th>
                          <th className="w-[14%] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedTournaments.map((tournament) => (
                          <tr key={tournament.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-8 py-6 align-top">
                              <div>
                                <p className="text-base font-semibold text-slate-900">{tournament.name}</p>
                                <p className="mt-2 text-sm text-slate-500">主办单位：{tournament.organizer}</p>
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top">
                              {(() => {
                                const registrationRange = formatDateRangeWithHover(
                                  tournament.registrationStartTime,
                                  tournament.registrationEndTime
                                );
                                return (
                                  <div className="group relative inline-block">
                                    <p className="cursor-help text-sm text-slate-600 underline decoration-dotted underline-offset-4">
                                      {registrationRange.short}
                                    </p>
                                    <div className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-20 hidden min-w-max rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-xl group-hover:block">
                                      {registrationRange.full}
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-6 align-top">
                              {(() => {
                                const matchRange = formatDateRangeWithHover(tournament.startTime, tournament.endTime);
                                return (
                                  <div className="group relative inline-block">
                                    <p className="cursor-help text-sm text-slate-600 underline decoration-dotted underline-offset-4">
                                      {matchRange.short}
                                    </p>
                                    <div className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-20 hidden min-w-max rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-xl group-hover:block">
                                      {matchRange.full}
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-6 align-top">
                              <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                                tournament.status === '报名中'
                                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                                  : tournament.status === '已结束'
                                      ? 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                    : tournament.status === '未开始报名'
                                      ? 'bg-sky-50 text-sky-600 ring-1 ring-sky-100'
                                      : tournament.status === '报名截止'
                                        ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                                      : tournament.status === '已取消'
                                        ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
                                        : 'bg-violet-50 text-violet-600 ring-1 ring-violet-100'
                              }`}>
                                {tournament.status}
                              </span>
                            </td>
                            <td className="px-6 py-6 align-top">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={tournament.publishStatus}
                                  onClick={() => toggleTournamentPublishStatus(tournament.id)}
                                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all ${
                                    tournament.publishStatus ? 'bg-indigo-600' : 'bg-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-all ${
                                      tournament.publishStatus ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-6 align-top text-sm text-slate-500 whitespace-nowrap">{tournament.updatedAt}</td>
                            <td className="px-8 py-6 align-top">
                              <div className="flex flex-nowrap justify-end gap-2">
                                <button
                                  onClick={() => openTournamentDetail(tournament.id)}
                                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                                >
                                  赛事详情
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTournament(tournament.id)}
                                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  删除
                                </button>
                                <button
                                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-600 transition-all hover:bg-amber-50"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                  赛事取消
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {pagedTournaments.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-8 py-16 text-center text-sm text-slate-500">
                              暂无符合条件的赛事，试试调整检索条件后再查看。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    total={filteredTournamentListData.length}
                    page={normalizedTournamentListPage}
                    pageSize={tournamentListPageSize}
                    onPageChange={setTournamentListPage}
                    onPageSizeChange={(size) => {
                      setTournamentListPageSize(size);
                      setTournamentListPage(1);
                    }}
                    itemLabel="个赛事"
                  />
                </section>
              </div>
            ) : adminActiveMenu === 'match-format' ? (
              <div className="mx-auto w-full max-w-7xl min-w-0">
                <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">比赛形式</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          平台统一维护比赛形式分组与包含规格，用于赛事项目配置和矩阵生成器选择。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-full overflow-x-auto">
                    <table className="min-w-[1180px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-white">
                          <th className="px-6 py-5 text-sm font-semibold text-slate-900 whitespace-nowrap">形式分组</th>
                          <th className="px-6 py-5 text-sm font-semibold text-slate-900 whitespace-nowrap">包含规格</th>
                          <th className="px-6 py-5 text-sm font-semibold text-slate-900 whitespace-nowrap">说明</th>
                          <th className="px-6 py-5 text-sm font-semibold text-slate-900 whitespace-nowrap">创建时间</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedMatchFormats.map((row) => (
                          <tr key={row.id} className="align-top hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-6 text-sm font-medium text-slate-700 whitespace-nowrap">{row.groupName}</td>
                            <td className="px-6 py-6 text-sm leading-7 text-slate-600 whitespace-nowrap">{row.specs.join('、')}</td>
                            <td className="px-6 py-6 text-sm leading-7 text-slate-600 whitespace-nowrap">{row.description}</td>
                            <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{row.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    total={MATCH_FORMAT_GROUPS.length}
                    page={normalizedMatchFormatPage}
                    pageSize={matchFormatPageSize}
                    onPageChange={setMatchFormatPage}
                    onPageSizeChange={(size) => {
                      setMatchFormatPageSize(size);
                      setMatchFormatPage(1);
                    }}
                    itemLabel="个项目"
                  />
                </section>
              </div>
            ) : adminActiveMenu === 'score-rule-template' ? (
              <div className="mx-auto w-full max-w-7xl min-w-0">
                <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">单局计分规则</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          统一维护单局目标分、平分加分与封顶分规则，供赛事项目引用。
                        </p>
                      </div>
                    </div>
                    <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700">
                      添加规则
                    </button>
                  </div>

                  <div className="border-b border-slate-100 px-8 py-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                      <div className="relative min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={scoreRuleSearchDraft}
                          onChange={(event) => setScoreRuleSearchDraft(event.target.value)}
                          placeholder="检索规则名称"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                      <button
                        onClick={applyScoreRuleSearch}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                      >
                        筛选
                      </button>
                      <button
                        onClick={resetScoreRuleSearch}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                      >
                        重置
                      </button>
                    </div>
                  </div>

                  <div className="max-w-full overflow-x-auto">
                    <table className="min-w-[1380px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-white">
                          <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">ID</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">规则名称</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">规则摘要</th>
                          <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">最新更新</th>
                          <th className="px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedScoreRules.length > 0 ? (
                          pagedScoreRules.map((rule) => (
                            <tr key={rule.id} className="align-top transition-colors hover:bg-slate-50/60">
                              <td className="px-8 py-6 text-sm font-medium text-slate-500 whitespace-nowrap">{rule.id}</td>
                              <td className="px-6 py-6">
                                <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{rule.ruleName}</p>
                              </td>
                              <td className="px-6 py-6">
                                <p className="text-sm leading-7 text-slate-600 whitespace-nowrap">{rule.summary}</p>
                              </td>
                              <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{rule.updatedAt}</td>
                              <td className="px-8 py-6">
                                <div className="flex flex-nowrap justify-end gap-2">
                                  <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
                                    <PencilLine className="h-4 w-4" />
                                    编辑
                                  </button>
                                  <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-500 transition-all hover:bg-rose-50">
                                    <Trash2 className="h-4 w-4" />
                                    删除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-8 py-16 text-center text-sm text-slate-500">
                              暂无符合条件的规则，试试调整检索条件后再查看。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <TablePagination
                    total={filteredScoreRules.length}
                    page={normalizedScoreRulePage}
                    pageSize={scoreRulePageSize}
                    onPageChange={setScoreRulePage}
                    onPageSizeChange={(size) => {
                      setScoreRulePageSize(size);
                      setScoreRulePage(1);
                    }}
                    itemLabel="条规则"
                  />
                </section>
              </div>
            ) : adminActiveMenu === 'group-management' ? (
              <GroupManagement prototypeMode={prototypeMode} />
            ) : adminActiveMenu === 'match-code-rule-template' ? (
              <div className="max-w-7xl mx-auto">
                <MatchCodeConfig />
              </div>
            ) : (
              <div className="max-w-7xl mx-auto space-y-6">
                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{activeAdminItem.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          这里是一级页平台能力入口，后续可以在这一层承接跨赛事的基础资料、模板与支付配置。
                        </p>
                      </div>
                      <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                        新建{activeAdminItem.label}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12">
                      <p className="text-sm font-semibold text-slate-700">{activeAdminSection.label} / {activeAdminItem.label}</p>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                        当前先完成一级页框架与菜单结构，这个功能页还没有接入具体业务内容。等你确认整体导航结构后，我可以继续逐个把这里的真实页面补上。
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">建议下一步</p>
                        <p className="mt-3 text-sm text-slate-600">优先补这类页面通常最有价值：</p>
                        <div className="mt-4 space-y-3">
                          {['统一列表页筛选骨架', '批量导入/导出能力', '基础资料字典配置'].map((item) => (
                            <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sidebar */}
      <aside 
        className={`fixed left-6 top-24 bottom-6 z-30 rounded-[28px] border border-slate-200 bg-white/95 text-slate-500 shadow-lg shadow-slate-200/70 backdrop-blur transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-72' : 'w-24'}`}
      >
        {/* Sidebar Content */}
        <div className="flex-1 py-8 px-4 space-y-3 overflow-y-auto">
          {isSidebarOpen && (
            <div className="px-3 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">赛事详情</p>
            </div>
          )}
          {/* 1. 基础配置 */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('basic')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all hover:bg-slate-100 group ${!isSidebarOpen && 'justify-center'}`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-5 h-5 ${expandedMenus.includes('basic') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                {isSidebarOpen && <span className={`text-sm font-bold ${expandedMenus.includes('basic') ? 'text-slate-900' : 'text-slate-600'}`}>基础配置</span>}
              </div>
              {isSidebarOpen && (
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedMenus.includes('basic') ? 'rotate-180' : ''}`} />
              )}
            </button>
            <AnimatePresence>
              {expandedMenus.includes('basic') && isSidebarOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-4 pl-4 border-l border-slate-200 space-y-1 overflow-hidden"
                >
                  <button
                    onClick={() => setViewMode('basic-info')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'basic-info' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    基础信息
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. 报名管理 */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('registration')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all hover:bg-slate-100 group ${!isSidebarOpen && 'justify-center'}`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className={`w-5 h-5 ${expandedMenus.includes('registration') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                {isSidebarOpen && <span className={`text-sm font-bold ${expandedMenus.includes('registration') ? 'text-slate-900' : 'text-slate-600'}`}>报名管理</span>}
              </div>
              {isSidebarOpen && (
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedMenus.includes('registration') ? 'rotate-180' : ''}`} />
              )}
            </button>

            <AnimatePresence>
              {expandedMenus.includes('registration') && isSidebarOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-4 pl-4 border-l border-slate-200 space-y-1 overflow-hidden"
                >
                  <button 
                    onClick={() => setViewMode('projects')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'projects' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    报名项目
                  </button>
                  <button 
                    onClick={() => setViewMode('settings')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'settings' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    报名规则
                  </button>
                  <button 
                    onClick={() => setViewMode('records')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'records' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    报名记录
                  </button>
                  <button 
                    onClick={() => setViewMode('announcement')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'announcement' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    报名公示
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. 赛事编排 */}
          <div className="space-y-1">
            <button 
              onClick={() => toggleMenu('scheduling')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all hover:bg-slate-100 group ${!isSidebarOpen && 'justify-center'}`}
            >
              <div className="flex items-center gap-3">
                <Database className={`w-5 h-5 ${expandedMenus.includes('scheduling') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                {isSidebarOpen && <span className={`text-sm font-bold ${expandedMenus.includes('scheduling') ? 'text-slate-900' : 'text-slate-600'}`}>赛事编排</span>}
              </div>
              {isSidebarOpen && (
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedMenus.includes('scheduling') ? 'rotate-180' : ''}`} />
              )}
            </button>
            <AnimatePresence>
              {expandedMenus.includes('scheduling') && isSidebarOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-4 pl-4 border-l border-slate-200 space-y-1 overflow-hidden"
                >
                  <button 
                    onClick={() => setViewMode('venue-config')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'venue-config' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    场地资源
                  </button>
                  <button 
                    onClick={() => setViewMode('scheduling')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'scheduling' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    项目编排
                  </button>
                  <button 
                    onClick={() => setViewMode('match-management')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'match-management' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    比赛管理
                  </button>
                  <button 
                    onClick={() => setViewMode('player-management')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'player-management' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    选手管理
                  </button>
                  <button 
                    onClick={() => setViewMode('schedule-config')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'schedule-config' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    赛程安排
                  </button>
                  <button 
                    onClick={() => setViewMode('referee-management')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'referee-management' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    裁判管理
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. 成绩排名 */}
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:bg-slate-100 group ${!isSidebarOpen && 'justify-center'}`}>
            <Database className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
            {isSidebarOpen && <span className="text-sm font-medium text-slate-600">成绩排名</span>}
          </button>

          {/* 7. 数据统计 */}
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:bg-slate-100 group ${!isSidebarOpen && 'justify-center'}`}>
            <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
            {isSidebarOpen && <span className="text-sm font-medium text-slate-600">数据统计</span>}
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-2xl text-slate-500 hover:bg-slate-100 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAppPage('tournament-list')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{activeTournament.name}</h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>赛事管理</span>
                <ChevronRight className="w-3 h-3" />
                <span>赛事列表</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-600">{currentViewTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPrototypeMode((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                prototypeMode
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Info className="h-4 w-4" />
              原型说明模式
            </button>
            {(viewMode === 'settings' || viewMode === 'basic-info') && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    保存配置
                  </>
                )}
              </button>
            )}
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">管理员</p>
                  <p className="text-[10px] text-slate-400 font-medium">mustgoon@126.com</p>
                </div>
                <UserCircle className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className={`flex-1 flex flex-col bg-slate-100 px-6 lg:pl-[360px] ${viewMode === 'scheduling' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {/* Navigation Tabs (Capsule Buttons) - Only show for settings */}
          {viewMode === 'settings' && (
            <div className="sticky top-0 z-10 py-6">
              <div className="max-w-7xl mx-auto px-8">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">报名规则设置</h2>
                        <p className="text-xs text-slate-500 mt-0.5">配置比赛的报名时间、报名渠道、名单限制及相关协议</p>
                      </div>
                    </div>

                    <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 w-fit">
                      <button 
                        onClick={() => setActiveTab('config')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                      >
                        报名限制
                      </button>
                      <button 
                        onClick={() => setActiveTab('restriction')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'restriction' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                      >
                        兼项限制
                      </button>
                      <button 
                        onClick={() => setActiveTab('discount')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'discount' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                      >
                        优惠配置
                      </button>
                      <button 
                        onClick={() => setActiveTab('signing')}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === 'signing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                      >
                        协议签约
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className={viewMode === 'scheduling' ? "flex-1 flex flex-col" : "max-w-7xl mx-auto px-8 py-6 pb-24 w-full"}>
            <AnimatePresence mode="wait">
              {viewMode === 'basic-info' ? (
                <motion.div
                  key="basic-info-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <BasicInfoConfig
                    value={basicInfo}
                    onChange={(updates) => setBasicInfo((prev) => ({ ...prev, ...updates }))}
                    onNavigateToDecoration={() => setViewMode('page-decoration')}
                  />
                </motion.div>
              ) : viewMode === 'page-decoration' ? (
                <motion.div
                  key="page-decoration-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <PageDecorationConfig
                    basicInfo={basicInfo}
                    onBack={() => setViewMode('basic-info')}
                  />
                </motion.div>
              ) : viewMode === 'records' ? (
                <motion.div
                  key="records-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RegistrationRecords initialTab={recordsInitialTab} />
                </motion.div>
              ) : viewMode === 'projects' ? (
                <motion.div
                  key="projects-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RegistrationProjects />
                </motion.div>
              ) : viewMode === 'announcement' ? (
                <motion.div
                  key="announcement-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RegistrationAnnouncement 
                    onNavigateToRecords={(tab) => {
                      setRecordsInitialTab(tab);
                      setViewMode('records');
                    }}
                    onNavigateToRegistration={() => setViewMode('projects')}
                  />
                </motion.div>
              ) : viewMode === 'scheduling' ? (
                <motion.div
                  key="scheduling-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <ProjectScheduling 
                    onNavigateToAnnouncement={() => setViewMode('announcement')} 
                    venueConfig={venueConfig}
                    schedulingConfigs={schedulingConfigs}
                    onUpdateSchedulingConfigs={setSchedulingConfigs}
                  />
                </motion.div>
              ) : viewMode === 'venue-config' ? (
                <motion.div
                  key="venue-config-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <VenueResourceConfig 
                    venueConfig={venueConfig}
                    schedulingConfigs={schedulingConfigs}
                    onUpdateVenueConfig={(updates) => setVenueConfig(prev => ({ ...prev, ...updates }))}
                    onSave={() => alert('场地资源配置已保存')}
                  />
                </motion.div>
              ) : viewMode === 'player-management' ? (
                <motion.div
                  key="player-management-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <PlayerManagement />
                </motion.div>
              ) : viewMode === 'match-management' ? (
                <motion.div
                  key="match-management-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col"
                >
                  <MatchManagement />
                </motion.div>
              ) : viewMode === 'schedule-config' ? (
                <motion.div
                  key="schedule-config-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ScheduleConfig
                    venueConfig={venueConfig}
                    onUpdateVenueConfig={(updates) => setVenueConfig(prev => ({ ...prev, ...updates }))}
                    onSave={() => alert('赛程配置已保存')}
                  />
                </motion.div>
              ) : viewMode === 'referee-management' ? (
                <motion.div
                  key="referee-management-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">裁判管理</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                          这一页先接入一个可用工作台，避免菜单点击后回落到报名配置。下一轮我们可以继续补裁判档案、排班冲突校验和执裁统计。
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: '待分配场次', value: '12' },
                          { label: '已指派裁判', value: '8' },
                          { label: '冲突提醒', value: '2' },
                        ].map((item) => (
                          <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                            <div className="text-lg font-bold text-slate-900">{item.value}</div>
                            <div className="mt-1 text-xs font-medium text-slate-500">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                      <h4 className="text-sm font-bold text-slate-800">建议优先补的能力</h4>
                      <div className="mt-4 space-y-3">
                        {[
                          '裁判档案列表与等级筛选',
                          '按日期 / 场地自动推荐可用裁判',
                          '和比赛管理联动的指派面板',
                          '冲突检测与执裁负载统计',
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm p-6">
                      <h4 className="text-sm font-bold text-slate-800">当前接入状态</h4>
                      <div className="mt-4 space-y-3 text-sm text-slate-500">
                        <p>比赛管理页里已经存在裁判字段和快速指派入口，因此数据基础是有的。</p>
                        <p>这一页现在先作为独立入口兜底，后续适合把裁判数据抽成共享状态，再把指派和排班串起来。</p>
                      </div>
                    </section>
                  </div>
                </motion.div>
              ) : activeTab === 'config' ? (
            <motion.div
              key="config-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {/* Section: Registration Time */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">报名时间设置</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      开始时间
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="datetime-local" 
                        value={config.startTime}
                        onChange={e => setConfig({...config, startTime: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">结束时间</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="datetime-local" 
                        value={config.endTime}
                        onChange={e => setConfig({...config, endTime: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Channel & List Restrictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Channel Restriction */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">报名通道限制</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      { id: RegistrationChannel.UNLIMITED, label: '不限', desc: '所有开放渠道均可报名' },
                      { id: RegistrationChannel.BACKEND_ONLY, label: '仅后台导入', desc: '仅支持管理员在后台导入名单' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setConfig({...config, channel: item.id as RegistrationChannel})}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                          config.channel === item.id 
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                          config.channel === item.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}>
                          {config.channel === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* List Restriction */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">报名名单限制</h2>
                  </div>
                  <div className="p-6 space-y-4 flex-1">
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                      {[
                        { id: ListRestrictionType.NONE, label: '不限制' },
                        { id: ListRestrictionType.WHITELIST, label: '白名单' },
                        { id: ListRestrictionType.BLACKLIST, label: '黑名单' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setConfig({...config, listRestriction: item.id as ListRestrictionType, selectedListName: ''})}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            config.listRestriction === item.id 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {config.listRestriction !== ListRestrictionType.NONE ? (
                        <motion.div
                          key="list-selector"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            关联目标清单
                          </label>
                          
                          {config.selectedListName ? (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-indigo-900">{config.selectedListName}</p>
                                  <p className="text-[10px] text-indigo-400 font-medium">已关联名单</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowListModal(true)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                              >
                                更换
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowListModal(true)}
                              className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                            >
                              <div className="p-2 bg-slate-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                                <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                              </div>
                              <p className="text-sm font-medium text-slate-500 group-hover:text-indigo-600">点击关联目标清单</p>
                            </button>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="no-restriction"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-8 text-slate-400"
                        >
                          <Users className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-sm">当前未设置名单限制</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Section: Quota Control */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">赛事名额控制</h2>
                    </div>
                    <button 
                      onClick={() => setConfig({...config, enableQuota: !config.enableQuota})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        config.enableQuota ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enableQuota ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {config.enableQuota ? (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-600">单项赛总名额上限</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  value={config.individualQuota}
                                  onChange={e => setConfig({...config, individualQuota: parseInt(e.target.value) || 0})}
                                  placeholder="请输入名额数量"
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">个</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-600">团体赛总名额上限</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  value={config.teamQuota}
                                  onChange={e => setConfig({...config, teamQuota: parseInt(e.target.value) || 0})}
                                  placeholder="请输入名额数量"
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">队</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              统计口径
                              <Info className="w-3.5 h-3.5 text-slate-400" />
                            </label>
                            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                              {[
                                { id: QuotaBasis.SEAT, label: '按席位计算' },
                                { id: QuotaBasis.PERSON, label: '按人头计算' }
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => setConfig({...config, quotaBasis: item.id as QuotaBasis})}
                                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                    config.quotaBasis === item.id 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-start gap-3 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                              <Info className="w-4 h-4 text-indigo-600 mt-0.5" />
                              <p className="text-xs text-indigo-700/80 leading-relaxed">
                                {config.quotaBasis === QuotaBasis.SEAT 
                                  ? '按席位计算：团体赛每报名一个队伍算占用一个席位，双打项目一个组合算一个席位，以此类推' 
                                  : '按人头计算：以双打项目为例，双打每次报名需填写2个选手信息，占用了2个名额。'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-slate-400"
                      >
                        <Trophy className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">当前未设置赛事名额限制</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">队伍人数限制</h2>
                    </div>
                    <button
                      onClick={() => setConfig({ ...config, enableTeamRosterLimit: !config.enableTeamRosterLimit })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.enableTeamRosterLimit ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.enableTeamRosterLimit ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {config.enableTeamRosterLimit ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-600">每个队伍最多队员数</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  value={config.maxMembersPerTeam}
                                  onChange={(e) =>
                                    setConfig({ ...config, maxMembersPerTeam: parseInt(e.target.value) || 1 })
                                  }
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                  人
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-600">每个队伍最多教练数</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  value={config.maxCoachesPerTeam}
                                  onChange={(e) =>
                                    setConfig({ ...config, maxCoachesPerTeam: parseInt(e.target.value) || 0 })
                                  }
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                  人
                                  </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-slate-400"
                      >
                        <Users className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">当前未设置队伍人数限制</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </div>
              </motion.div>
            ) : activeTab === 'restriction' ? (
              <motion.div
                key="restriction-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Max Events Per Person */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">单人报名限制</h2>
                  </div>
                  <div className="p-6 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">*</span>
                        <label className="text-sm font-medium text-slate-700">单人最多允许报名项目数：</label>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative w-32">
                          <input 
                            type="number" 
                            min="1"
                            value={config.maxEventsPerPerson}
                            onChange={(e) => setConfig({ ...config, maxEventsPerPerson: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                            <button onClick={() => setConfig({ ...config, maxEventsPerPerson: config.maxEventsPerPerson + 1 })} className="p-0.5 hover:bg-slate-200 rounded transition-colors"><ArrowUp className="w-3 h-3 text-slate-400" /></button>
                            <button onClick={() => setConfig({ ...config, maxEventsPerPerson: Math.max(1, config.maxEventsPerPerson - 1) })} className="p-0.5 hover:bg-slate-200 rounded transition-colors"><ArrowDown className="w-3 h-3 text-slate-400" /></button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">
                          一个自然人（Identity）<span className="text-red-500 font-medium">以“选手”的身份</span> 在本次赛事中最多允许报名的次数
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">*</span>
                        <label className="text-sm font-medium text-slate-700">单人兼项限制范围：</label>
                      </div>
                      <div className="flex items-center gap-8">
                        {[
                          { id: 'INDIVIDUAL', label: '单项赛' },
                          { id: 'TEAM', label: '团体赛' }
                        ].map(item => (
                          <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                            <div 
                              onClick={() => {
                                const newScope = config.restrictionScope.includes(item.id)
                                  ? config.restrictionScope.filter(s => s !== item.id)
                                  : [...config.restrictionScope, item.id];
                                setConfig({ ...config, restrictionScope: newScope });
                              }}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                config.restrictionScope.includes(item.id)
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-slate-300 group-hover:border-indigo-400'
                              }`}
                            >
                              {config.restrictionScope.includes(item.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${config.restrictionScope.includes(item.id) ? 'text-slate-900' : 'text-slate-500'}`}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Mutually Exclusive Groups */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">互斥项目组</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingGroup(null);
                        setShowRestrictionModal(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      添加互斥组
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20">序</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">互斥项目</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {config.mutuallyExclusiveGroups.map((group, idx) => (
                          <tr key={group.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">{idx + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {group.eventNames.map((name, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => {
                                    setEditingGroup(group);
                                    setShowRestrictionModal(true);
                                  }}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                  编辑
                                </button>
                                <button 
                                  onClick={() => {
                                    setConfig({
                                      ...config,
                                      mutuallyExclusiveGroups: config.mutuallyExclusiveGroups.filter(g => g.id !== group.id)
                                    });
                                  }}
                                  className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                >
                                  删除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {config.mutuallyExclusiveGroups.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2 opacity-30">
                                <Layers className="w-8 h-8 text-slate-400" />
                                <p className="text-xs font-medium text-slate-500">暂无互斥配置</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </motion.div>
            ) : activeTab === 'discount' ? (
              <motion.div
                key="discount-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Single Discount Rule: Multi-Event Discount */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">兼项优惠配置</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-500">
                        {config.multiEventDiscount.status === RuleStatus.ENABLED ? '已开启' : '已关闭'}
                      </span>
                      <button
                        onClick={() => setConfig({
                          ...config, 
                          multiEventDiscount: {
                            ...config.multiEventDiscount,
                            status: config.multiEventDiscount.status === RuleStatus.ENABLED ? RuleStatus.DISABLED : RuleStatus.ENABLED
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          config.multiEventDiscount.status === RuleStatus.ENABLED ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            config.multiEventDiscount.status === RuleStatus.ENABLED ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {config.multiEventDiscount.status === RuleStatus.ENABLED ? (
                      <motion.div
                        key="discount-enabled"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 space-y-8">
                          {/* Basic Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">规则名称</label>
                              <input 
                                type="text" 
                                value={config.multiEventDiscount.rule_name}
                                onChange={(e) => setConfig({
                                  ...config,
                                  multiEventDiscount: { ...config.multiEventDiscount, rule_name: e.target.value }
                                })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="请输入规则名称"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">适用范围</label>
                              <div className="flex items-center gap-4 py-2">
                                <label className="flex items-center gap-2 cursor-not-allowed opacity-80">
                                  <input 
                                    type="checkbox" 
                                    checked={config.multiEventDiscount.applicable_scope?.includes('INDIVIDUAL')} 
                                    disabled 
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-sm font-medium text-slate-700">单项赛</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-not-allowed opacity-40">
                                  <input 
                                    type="checkbox" 
                                    disabled 
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-sm font-medium text-slate-700">团体赛 (暂不支持)</span>
                                </label>
                              </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">兼项计算方式</label>
                              <div className="flex p-1 bg-slate-100 rounded-xl w-full max-w-md">
                                {[
                                  { id: MultiEventCalcType.PLAYER, label: '按选手' },
                                  { id: MultiEventCalcType.ENTRY, label: '按报名项' }
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setConfig({
                                      ...config,
                                      multiEventDiscount: { ...config.multiEventDiscount, multi_event_calc_type: item.id as MultiEventCalcType }
                                    })}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                      config.multiEventDiscount.multi_event_calc_type === item.id 
                                      ? 'bg-white text-indigo-600 shadow-sm' 
                                      : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                              <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100/50">
                                <p className="text-[11px] text-indigo-600 leading-relaxed flex items-start gap-2">
                                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span>
                                    {config.multiEventDiscount.multi_event_calc_type === MultiEventCalcType.PLAYER 
                                      ? "按选手计算：根据同一选手报名的项目总数进行阶梯减免。例如报2项，第2项减免50元。" 
                                      : "按报名项计算：根据订单内包含的报名项总数进行阶梯减免。适用于代报名场景。"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Multi Event Specific - Horizontal Layout */}
                          <div className="space-y-4 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-500" />
                                阶梯优惠配置
                              </h3>
                              <button 
                                onClick={() => {
                                  const nextIndex = (config.multiEventDiscount.multi_event_step_config?.length || 0) + 2;
                                  const newSteps = [...(config.multiEventDiscount.multi_event_step_config || []), { index: nextIndex, discount: 0, discount_type: DiscountValueType.FIXED }];
                                  setConfig({
                                    ...config,
                                    multiEventDiscount: { ...config.multiEventDiscount, multi_event_step_config: newSteps }
                                  });
                                }}
                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                新增阶梯
                              </button>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
                              {/* Table Header */}
                              <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50/50 border-b border-slate-100">
                                <div className="col-span-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">兼项序号</div>
                                <div className="col-span-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">优惠配置</div>
                                <div className="col-span-2 text-right text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">操作</div>
                              </div>

                              {/* Table Body */}
                              <div className="divide-y divide-slate-100">
                                {config.multiEventDiscount.multi_event_step_config?.map((step, stepIdx) => (
                                  <div key={stepIdx} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/30 transition-colors group">
                                    {/* Event Index Column */}
                                    <div className="col-span-4 flex items-center gap-3">
                                      <span className="text-sm font-semibold text-slate-400">第</span>
                                      <div className="relative">
                                        <input 
                                          type="number" 
                                          value={step.index}
                                          onChange={(e) => {
                                            const newSteps = [...(config.multiEventDiscount.multi_event_step_config || [])];
                                            newSteps[stepIdx].index = parseInt(e.target.value) || 0;
                                            setConfig({
                                              ...config,
                                              multiEventDiscount: { ...config.multiEventDiscount, multi_event_step_config: newSteps }
                                            });
                                          }}
                                          className="w-24 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center shadow-sm"
                                        />
                                      </div>
                                      <span className="text-sm font-semibold text-slate-400">项</span>
                                    </div>

                                    {/* Discount Config Column */}
                                    <div className="col-span-6">
                                      <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all shadow-sm">
                                        <input 
                                          type="number" 
                                          value={step.discount}
                                          onChange={(e) => {
                                            const newSteps = [...(config.multiEventDiscount.multi_event_step_config || [])];
                                            newSteps[stepIdx].discount = parseFloat(e.target.value) || 0;
                                            setConfig({
                                              ...config,
                                              multiEventDiscount: { ...config.multiEventDiscount, multi_event_step_config: newSteps }
                                            });
                                          }}
                                          className="flex-1 bg-transparent border-none px-4 py-1 text-base font-bold text-slate-700 focus:ring-0"
                                          placeholder="0.00"
                                        />
                                        <div className="flex bg-slate-100/80 p-1 rounded-xl">
                                          <button
                                            onClick={() => {
                                              const newSteps = [...(config.multiEventDiscount.multi_event_step_config || [])];
                                              newSteps[stepIdx].discount_type = DiscountValueType.FIXED;
                                              setConfig({
                                                ...config,
                                                multiEventDiscount: { ...config.multiEventDiscount, multi_event_step_config: newSteps }
                                              });
                                            }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                              step.discount_type === DiscountValueType.FIXED 
                                              ? 'bg-white text-indigo-600 shadow-sm' 
                                              : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                          >
                                            元
                                          </button>
                                          <button
                                            onClick={() => {
                                              const newSteps = [...(config.multiEventDiscount.multi_event_step_config || [])];
                                              newSteps[stepIdx].discount_type = DiscountValueType.PERCENT;
                                              setConfig({
                                                ...config,
                                                multiEventDiscount: { ...config.multiEventDiscount, multi_event_step_config: newSteps }
                                              });
                                            }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                              step.discount_type === DiscountValueType.PERCENT 
                                              ? 'bg-white text-indigo-600 shadow-sm' 
                                              : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                          >
                                            折
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Actions Column */}
                                    <div className="col-span-2 text-right">
                                      <button 
                                        onClick={() => {
                                          const newSteps = config.multiEventDiscount.multi_event_step_config?.filter((_, i) => i !== stepIdx);
                                          setConfig({
                                            ...config,
                                            multiEventDiscount: { ...config.multiEventDiscount, multi_event_step_config: newSteps }
                                          });
                                        }}
                                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {(!config.multiEventDiscount.multi_event_step_config || config.multiEventDiscount.multi_event_step_config.length === 0) && (
                                  <div className="py-10 text-center">
                                    <p className="text-xs text-slate-400">暂无阶梯配置，请点击右上角新增</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Validity Period */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">生效开始时间</label>
                              <input 
                                type="datetime-local" 
                                value={config.multiEventDiscount.start_time}
                                onChange={(e) => setConfig({
                                  ...config,
                                  multiEventDiscount: { ...config.multiEventDiscount, start_time: e.target.value }
                                })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">生效结束时间</label>
                              <input 
                                type="datetime-local" 
                                value={config.multiEventDiscount.end_time}
                                onChange={(e) => setConfig({
                                  ...config,
                                  multiEventDiscount: { ...config.multiEventDiscount, end_time: e.target.value }
                                })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="discount-disabled"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-12 text-center bg-slate-50/50"
                      >
                        <Tag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm font-medium">兼项优惠已关闭</p>
                        <p className="text-slate-400 text-xs mt-1">开启后可配置多项目报名的阶梯减免策略</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </motion.div>
            ) : activeTab === 'signing' ? (
              <motion.div
                key="signing-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">协议签约配置</h2>
                  </div>
                  <div className="p-8 space-y-10">
                    {/* Enable Signing */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">*</span>
                        <label className="text-sm font-medium text-slate-700">参赛需签约：</label>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => setConfig({ ...config, enableSigning: !config.enableSigning })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            config.enableSigning ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enableSigning ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <p className="text-xs text-slate-400">
                          若开启，则将在用户填写报名表时引导用户完成签约，每份报名表需单独签约
                        </p>
                      </div>
                    </div>

                    {/* Selected Agreements */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">*</span>
                        <label className="text-sm font-medium text-slate-700">签约协议：</label>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {config.selectedAgreements.map(agreement => (
                            <div key={agreement.id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg group transition-all">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="text-xs font-semibold text-indigo-900">{agreement.name}</span>
                              <button 
                                onClick={() => setConfig({ ...config, selectedAgreements: config.selectedAgreements.filter(a => a.id !== agreement.id) })}
                                className="p-0.5 hover:bg-indigo-200 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => setShowAgreementModal(true)}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                        >
                          选择协议
                        </button>
                      </div>
                    </div>

                    {/* Signing Method */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">*</span>
                        <label className="text-sm font-medium text-slate-700">签署方式：</label>
                      </div>
                      <div className="flex items-center gap-8">
                        {[
                          { id: SigningMethod.READ_AND_AGREE, label: '阅读并同意' },
                          { id: SigningMethod.USER_SIGNATURE, label: '用户签名' }
                        ].map(item => (
                          <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                            <div 
                              onClick={() => setConfig({ ...config, signingMethod: item.id })}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                config.signingMethod === item.id
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-slate-300 group-hover:border-indigo-400'
                              }`}
                            >
                              {config.signingMethod === item.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-sm font-medium ${config.signingMethod === item.id ? 'text-slate-900' : 'text-slate-500'}`}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            ) : null}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="text-center pt-4">
          <p className="text-xs text-slate-400">
            配置修改后将实时同步至前端报名页面，请谨慎操作。
          </p>
        </footer>
        </main>
      </div>
    </div>

    {/* List Selection Modal */}
    <AnimatePresence>
        {showListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowListModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">选择目标清单</h3>
                <button 
                  onClick={() => setShowListModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="搜索清单名称..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredLists.length > 0 ? (
                  filteredLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => selectList(list.name)}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-900">{list.name}</p>
                          <p className="text-xs text-slate-400">包含 {list.count} 条记录</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-400">未找到相关清单</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowListModal(false)}
                  className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mutually Exclusive Group Modal */}
      <AnimatePresence>
        {showRestrictionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRestrictionModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800">{editingGroup ? '编辑互斥组' : '添加互斥组'}</h3>
                <button onClick={() => setShowRestrictionModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">选择互斥项目</label>
                  <div className="grid grid-cols-1 gap-2">
                    {MOCK_EVENTS.map(event => {
                      const isSelected = editingGroup?.eventIds.includes(event.id) || false;
                      return (
                        <button
                          key={event.id}
                          onClick={() => {
                            const newIds = isSelected
                              ? (editingGroup?.eventIds || []).filter(id => id !== event.id)
                              : [...(editingGroup?.eventIds || []), event.id];
                            const newNames = MOCK_EVENTS.filter(e => newIds.includes(e.id)).map(e => e.name);
                            setEditingGroup({
                              id: editingGroup?.id || Math.random().toString(36).substr(2, 9),
                              eventIds: newIds,
                              eventNames: newNames
                            });
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50'
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                            {event.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    onClick={() => setShowRestrictionModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => {
                      if (!editingGroup || editingGroup.eventIds.length < 2) return;
                      
                      const exists = config.mutuallyExclusiveGroups.find(g => g.id === editingGroup.id);
                      if (exists) {
                        setConfig({
                          ...config,
                          mutuallyExclusiveGroups: config.mutuallyExclusiveGroups.map(g => g.id === editingGroup.id ? editingGroup : g)
                        });
                      } else {
                        setConfig({
                          ...config,
                          mutuallyExclusiveGroups: [...config.mutuallyExclusiveGroups, editingGroup]
                        });
                      }
                      setShowRestrictionModal(false);
                    }}
                    disabled={!editingGroup || editingGroup.eventIds.length < 2}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    确认保存
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Agreement Selection Modal */}
      <AnimatePresence>
        {showAgreementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgreementModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800">选择协议模板</h3>
                <button onClick={() => setShowAgreementModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {MOCK_AGREEMENTS.map(agreement => {
                    const isSelected = config.selectedAgreements.some(a => a.id === agreement.id);
                    return (
                      <button
                        key={agreement.id}
                        onClick={() => {
                          const newAgreements = isSelected
                            ? config.selectedAgreements.filter(a => a.id !== agreement.id)
                            : [...config.selectedAgreements, agreement];
                          setConfig({ ...config, selectedAgreements: newAgreements });
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                          isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{agreement.name}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setShowAgreementModal(false)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
