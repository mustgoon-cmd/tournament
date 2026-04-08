/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ArrowLeft,
  Upload,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RegistrationConfig, 
  RegistrationChannel, 
  ListRestrictionType, 
  QuotaBasis,
  AgeCalculationBase,
  AgeCalculationMethod,
  DiscountRule,
  MutuallyExclusiveGroup,
  SigningMethod,
  AgreementTemplate,
  RuleType,
  ScopeType,
  DiscountValueType,
  StackStrategy,
  RuleStatus,
  MultiEventCalcType,
  TeamGenderRequirement
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
  'event-group-management': '赛事组别',
  'page-decoration': '页面装修',
  settings: '报名规则',
  'discount-rules': '优惠规则',
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
  'event-group-management': '基础配置',
  'page-decoration': '基础配置',
  settings: '报名管理',
  'discount-rules': '报名管理',
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
  targetScore: number;
  deuceEnabled: boolean;
  leadTriggerScore: number;
  leadWinScore: number;
  capScore: number;
  midgameEnabled: boolean;
  swapTriggerScore: number;
  breakEnabled: boolean;
  breakSeconds: number;
  swapCourtEnabled: boolean;
};

type SingleMatchRuleRow = {
  id: string;
  ruleName: string;
  outcomeMethod: '局分胜' | '总分胜';
  matchFormat: '多局胜制' | '单局定胜负' | '固定局数';
  totalGames: number;
  gamesToWin: number;
  scoreRuleMode: 'global' | 'per-game';
  globalScoreRuleId: string;
  perGameScoreRuleIds: string[];
  swapAfterGame: boolean;
  intervalRestEnabled: boolean;
  intervalRestSeconds: number;
  forfeitWinGames: number;
  forfeitPointsPerGame: number;
  createdAt: string;
};

type TeamBattleOutcomeMethod = '胜场制' | '总分制';
type TeamBattleEndStrategy = 'play-all' | 'finish-running' | 'stop-immediately';
type TeamBattleSingleMatchRuleMode = 'global' | 'per-match';

type TeamBattleRuleRow = {
  id: string;
  ruleName: string;
  outcomeMethod: TeamBattleOutcomeMethod;
  totalMatches: number;
  matchesToWin: number | null;
  singleMatchRuleMode: TeamBattleSingleMatchRuleMode;
  singleMatchRuleId: string;
  perMatchSingleMatchRuleIds: string[];
  endStrategy: TeamBattleEndStrategy;
  createdAt: string;
};

type OfficialStatus = 'pending' | 'approved' | 'rejected' | 'disabled';
type OfficialSource = 'mini-program' | 'admin';

type OfficialCertificate = {
  id: string;
  sport: string;
  certificateName: string;
  level: string;
  certificateNo: string;
  issuer: string;
  issueDate: string;
  expireDate: string;
};

type TechnicalOfficialRow = {
  id: string;
  name: string;
  avatar: string;
  gender: '男' | '女';
  phone: string;
  region: string;
  organization: string;
  realName: string;
  idType: '身份证' | '护照' | '港澳居民来往内地通行证';
  idNumber: string;
  certificates: OfficialCertificate[];
  status: OfficialStatus;
  source: OfficialSource;
  reviewRemark: string;
  createdAt: string;
};

type RegistrationTemplateFieldType = 'text' | 'phone' | 'date' | 'select';
type RegistrationTemplateFieldSource = 'profile' | 'custom';
type RegistrationTemplateProfileKey =
  | 'player_name'
  | 'id_type'
  | 'id_number'
  | 'phone'
  | 'gender'
  | 'birth_date'
  | 'region';

type RegistrationTemplateField = {
  id: string;
  label: string;
  source: RegistrationTemplateFieldSource;
  profileKey?: RegistrationTemplateProfileKey;
  fieldType: RegistrationTemplateFieldType;
  required: boolean;
  editable: boolean;
  enabled: boolean;
  placeholder: string;
  options: string[];
};

type RegistrationTemplateRow = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  fields: RegistrationTemplateField[];
};

type RegistrationTemplatePageMode = 'list' | 'editor';
type AgreementCategory = '报名协议' | '免责声明' | '隐私授权';
type AgreementVariableCategory = '赛事变量' | '选手变量' | '签署变量';

type AgreementVariableItem = {
  key: string;
  label: string;
  category: AgreementVariableCategory;
  description: string;
};

type AgreementManagementRow = AgreementTemplate & {
  category: AgreementCategory;
  content: string;
  updatedAt: string;
};

type AgreementManagementPageMode = 'list' | 'editor';
type TargetListMemberRow = {
  id: string;
  playerName: string;
  phone: string;
  idType: '身份证' | '护照' | '港澳居民来往内地通行证';
  idNumber: string;
  updatedAt: string;
};

type TargetListRow = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  members: TargetListMemberRow[];
};

type TargetListPageMode = 'list' | 'manage';
type TargetListEditorMode = 'create' | 'edit' | null;
type TargetListMemberEditorMode = 'create' | 'edit' | null;

type InlineInfoTooltipProps = {
  content: string;
  align?: 'left' | 'right';
};

function InlineInfoTooltip({ content, align = 'left' }: InlineInfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <span ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute top-full mt-2 z-30 w-72 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900 shadow-lg ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {content}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

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

const AGREEMENT_VARIABLE_LIBRARY: AgreementVariableItem[] = [
  { key: '{{赛事名称}}', label: '赛事名称', category: '赛事变量', description: '插入当前赛事的名称' },
  { key: '{{主办单位}}', label: '主办单位', category: '赛事变量', description: '插入当前赛事主办单位' },
  { key: '{{举办城市}}', label: '举办城市', category: '赛事变量', description: '插入当前赛事举办城市' },
  { key: '{{比赛时间}}', label: '比赛时间', category: '赛事变量', description: '插入当前赛事比赛时间' },
  { key: '{{选手姓名}}', label: '选手姓名', category: '选手变量', description: '插入报名选手姓名' },
  { key: '{{证件类型}}', label: '证件类型', category: '选手变量', description: '插入报名选手证件类型' },
  { key: '{{证件号码}}', label: '证件号码', category: '选手变量', description: '插入报名选手证件号码' },
  { key: '{{手机号}}', label: '手机号', category: '选手变量', description: '插入报名选手手机号' },
  { key: '{{签署时间}}', label: '签署时间', category: '签署变量', description: '插入用户签署协议时间' },
  { key: '{{签署账号}}', label: '签署账号', category: '签署变量', description: '插入当前签署账号信息' },
];

const INITIAL_AGREEMENT_TEMPLATES: AgreementManagementRow[] = [
  {
    id: 'AG001',
    name: '赛事免责声明',
    category: '免责声明',
    updatedAt: '2026-04-06 14:20:00',
    content:
      '本人已充分了解并自愿参加【{{赛事名称}}】。本人承诺身体状况适合参赛，并愿意自行承担因参赛产生的风险与责任。签署人：{{选手姓名}}，签署时间：{{签署时间}}。',
  },
  {
    id: 'AG002',
    name: '个人信息授权协议',
    category: '隐私授权',
    updatedAt: '2026-04-04 10:15:00',
    content:
      '本人同意主办方【{{主办单位}}】在赛事组织过程中采集并使用本人报名信息，包括姓名、证件信息及手机号，用于报名审核、身份核验与成绩发布。',
  },
  {
    id: 'AG003',
    name: '参赛承诺书',
    category: '报名协议',
    updatedAt: '2026-03-30 09:50:00',
    content:
      '本人确认所填写的报名信息真实有效，并承诺遵守【{{赛事名称}}】竞赛规程及现场管理要求。如存在信息虚假，主办方有权取消参赛资格。',
  },
];

const SCORE_RULES: ScoreRuleRow[] = [
  {
    id: 'SR001',
    ruleName: '21分标准分',
    summary: '本局目标分 [20] 分，若出现平分，需领先 [2] 分获胜；如分数僵持，则先到 [30] 分者直接获胜。',
    updatedAt: '2026-03-22 14:20:36',
    targetScore: 20,
    deuceEnabled: true,
    leadTriggerScore: 20,
    leadWinScore: 2,
    capScore: 30,
    midgameEnabled: true,
    swapTriggerScore: 11,
    breakEnabled: true,
    breakSeconds: 60,
    swapCourtEnabled: true,
  },
  {
    id: 'SR002',
    ruleName: '15分单淘汰',
    summary: '本局目标分 [15] 分，若出现平分，需领先 [2] 分获胜；如分数僵持，则先到 [21] 分者直接获胜。',
    updatedAt: '2026-03-18 09:12:08',
    targetScore: 15,
    deuceEnabled: true,
    leadTriggerScore: 15,
    leadWinScore: 2,
    capScore: 21,
    midgameEnabled: true,
    swapTriggerScore: 8,
    breakEnabled: true,
    breakSeconds: 60,
    swapCourtEnabled: true,
  },
  {
    id: 'SR003',
    ruleName: '11分快节奏',
    summary: '本局目标分 [11] 分，若出现平分，需领先 [2] 分获胜；如分数僵持，则先到 [15] 分者直接获胜。',
    updatedAt: '2026-03-09 18:45:20',
    targetScore: 11,
    deuceEnabled: true,
    leadTriggerScore: 11,
    leadWinScore: 2,
    capScore: 15,
    midgameEnabled: false,
    swapTriggerScore: 6,
    breakEnabled: true,
    breakSeconds: 60,
    swapCourtEnabled: true,
  },
];

const SINGLE_MATCH_RULES: SingleMatchRuleRow[] = [
  {
    id: 'SMR001',
    ruleName: '羽毛球标准BO3',
    outcomeMethod: '局分胜',
    matchFormat: '多局胜制',
    totalGames: 3,
    gamesToWin: 2,
    scoreRuleMode: 'global',
    globalScoreRuleId: 'SR001',
    perGameScoreRuleIds: ['SR001', 'SR001', 'SR001'],
    swapAfterGame: true,
    intervalRestEnabled: true,
    intervalRestSeconds: 60,
    forfeitWinGames: 2,
    forfeitPointsPerGame: 21,
    createdAt: '2026-03-20 10:20:18',
  },
  {
    id: 'SMR002',
    ruleName: '青少年快节奏BO3',
    outcomeMethod: '局分胜',
    matchFormat: '多局胜制',
    totalGames: 3,
    gamesToWin: 2,
    scoreRuleMode: 'global',
    globalScoreRuleId: 'SR002',
    perGameScoreRuleIds: ['SR002', 'SR002', 'SR002'],
    swapAfterGame: true,
    intervalRestEnabled: true,
    intervalRestSeconds: 45,
    forfeitWinGames: 2,
    forfeitPointsPerGame: 15,
    createdAt: '2026-03-18 09:42:10',
  },
  {
    id: 'SMR003',
    ruleName: '企业邀请赛BO5',
    outcomeMethod: '局分胜',
    matchFormat: '多局胜制',
    totalGames: 5,
    gamesToWin: 3,
    scoreRuleMode: 'global',
    globalScoreRuleId: 'SR003',
    perGameScoreRuleIds: ['SR003', 'SR003', 'SR003', 'SR003', 'SR003'],
    swapAfterGame: false,
    intervalRestEnabled: true,
    intervalRestSeconds: 60,
    forfeitWinGames: 3,
    forfeitPointsPerGame: 11,
    createdAt: '2026-03-12 16:08:55',
  },
];

const TEAM_BATTLE_RULES: TeamBattleRuleRow[] = [
  {
    id: 'TBR001',
    ruleName: '5场3胜（分出胜负后已开赛继续）',
    outcomeMethod: '胜场制',
    totalMatches: 5,
    matchesToWin: 3,
    singleMatchRuleMode: 'global',
    singleMatchRuleId: 'SMR001',
    perMatchSingleMatchRuleIds: ['SMR001', 'SMR001', 'SMR001', 'SMR001', 'SMR001'],
    endStrategy: 'finish-running',
    createdAt: '2026-03-24 10:18:22',
  },
  {
    id: 'TBR002',
    ruleName: '5场3胜（打满全部比赛）',
    outcomeMethod: '胜场制',
    totalMatches: 5,
    matchesToWin: 3,
    singleMatchRuleMode: 'per-match',
    singleMatchRuleId: 'SMR001',
    perMatchSingleMatchRuleIds: ['SMR001', 'SMR002', 'SMR001', 'SMR002', 'SMR001'],
    endStrategy: 'play-all',
    createdAt: '2026-03-18 15:42:08',
  },
  {
    id: 'TBR003',
    ruleName: '3场总分制团体对抗',
    outcomeMethod: '总分制',
    totalMatches: 3,
    matchesToWin: null,
    singleMatchRuleMode: 'global',
    singleMatchRuleId: 'SMR003',
    perMatchSingleMatchRuleIds: ['SMR003', 'SMR003', 'SMR003'],
    endStrategy: 'play-all',
    createdAt: '2026-03-10 09:36:15',
  },
];

const TECHNICAL_OFFICIALS: TechnicalOfficialRow[] = [
  {
    id: 'OFF001',
    name: '李晨',
    avatar: '',
    gender: '男',
    phone: '13800138000',
    region: '广东省 深圳市',
    organization: '深圳市羽毛球协会',
    realName: '李晨',
    idType: '身份证',
    idNumber: '440301199203154512',
    certificates: [
      {
        id: 'CERT001',
        sport: '羽毛球',
        certificateName: '羽毛球裁判员证',
        level: '一级',
        certificateNo: 'SZ-U-2026-001',
        issuer: '深圳市羽毛球协会',
        issueDate: '2024-05-20',
        expireDate: '2028-05-19',
      },
    ],
    status: 'approved',
    source: 'mini-program',
    reviewRemark: '资料完整，审核通过。',
    createdAt: '2026-03-18 10:12:08',
  },
  {
    id: 'OFF002',
    name: '王静',
    avatar: '',
    gender: '女',
    phone: '13900139001',
    region: '广东省 广州市',
    organization: '广州市羽毛球运动中心',
    realName: '王静',
    idType: '身份证',
    idNumber: '440106199507267124',
    certificates: [
      {
        id: 'CERT002',
        sport: '羽毛球',
        certificateName: '羽毛球裁判员证',
        level: '二级',
        certificateNo: 'GZ-U-2025-118',
        issuer: '广州市羽毛球协会',
        issueDate: '2025-01-16',
        expireDate: '2029-01-15',
      },
      {
        id: 'CERT003',
        sport: '乒乓球',
        certificateName: '技术代表培训证书',
        level: '培训合格',
        certificateNo: 'TR-2025-008',
        issuer: '广东省羽毛球协会',
        issueDate: '2025-06-03',
        expireDate: '2028-06-02',
      },
    ],
    status: 'pending',
    source: 'mini-program',
    reviewRemark: '待核对证书编号与手机号归属。',
    createdAt: '2026-03-26 09:20:16',
  },
  {
    id: 'OFF003',
    name: '陈楠',
    avatar: '',
    gender: '男',
    phone: '13700137002',
    region: '广东省 东莞市',
    organization: '东莞市羽协裁判委员会',
    realName: '陈楠',
    idType: '护照',
    idNumber: 'EJ9483721',
    certificates: [
      {
        id: 'CERT004',
        sport: '羽毛球',
        certificateName: '羽毛球裁判员证',
        level: '一级',
        certificateNo: 'DG-U-2023-077',
        issuer: '东莞市羽毛球协会',
        issueDate: '2023-09-12',
        expireDate: '2027-09-11',
      },
    ],
    status: 'rejected',
    source: 'mini-program',
    reviewRemark: '实名信息与证书姓名不一致，请重新提交。',
    createdAt: '2026-03-21 14:08:43',
  },
  {
    id: 'OFF004',
    name: '赵婷',
    avatar: '',
    gender: '女',
    phone: '13600136003',
    region: '广东省 珠海市',
    organization: '珠海市羽毛球协会',
    realName: '赵婷',
    idType: '身份证',
    idNumber: '440402198811062226',
    certificates: [
      {
        id: 'CERT005',
        sport: '羽毛球',
        certificateName: '羽毛球裁判员证',
        level: '国家级',
        certificateNo: 'ZH-N-2022-015',
        issuer: '中国羽协',
        issueDate: '2022-04-10',
        expireDate: '2027-04-09',
      },
    ],
    status: 'disabled',
    source: 'admin',
    reviewRemark: '暂停使用。',
    createdAt: '2026-03-05 08:40:20',
  },
];

const REGISTRATION_TEMPLATE_PROFILE_FIELDS: Array<{
  key: RegistrationTemplateProfileKey;
  label: string;
  fieldType: RegistrationTemplateFieldType;
  placeholder: string;
  options: string[];
}> = [
  {
    key: 'player_name',
    label: '选手姓名',
    fieldType: 'text',
    placeholder: '从选手档案自动带出',
    options: [],
  },
  {
    key: 'id_type',
    label: '证件类型',
    fieldType: 'select',
    placeholder: '从选手档案自动带出',
    options: ['身份证', '护照', '港澳居民来往内地通行证'],
  },
  {
    key: 'id_number',
    label: '证件号码',
    fieldType: 'text',
    placeholder: '从选手档案自动带出',
    options: [],
  },
  {
    key: 'phone',
    label: '手机号',
    fieldType: 'phone',
    placeholder: '从选手档案自动带出',
    options: [],
  },
  {
    key: 'gender',
    label: '性别',
    fieldType: 'select',
    placeholder: '从选手档案自动带出',
    options: ['男', '女'],
  },
  {
    key: 'birth_date',
    label: '出生日期',
    fieldType: 'date',
    placeholder: '从选手档案自动带出',
    options: [],
  },
  {
    key: 'region',
    label: '所属地区',
    fieldType: 'text',
    placeholder: '从选手档案自动带出',
    options: [],
  },
];

const createProfileTemplateField = (profileKey: RegistrationTemplateProfileKey): RegistrationTemplateField => {
  const fieldMeta =
    REGISTRATION_TEMPLATE_PROFILE_FIELDS.find((item) => item.key === profileKey) ??
    REGISTRATION_TEMPLATE_PROFILE_FIELDS[0];

  return {
    id: `RTF${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    label: fieldMeta.label,
    source: 'profile',
    profileKey,
    fieldType: fieldMeta.fieldType,
    required: ['player_name', 'id_type', 'id_number'].includes(profileKey),
    editable: profileKey !== 'id_number',
    enabled: true,
    placeholder: fieldMeta.placeholder,
    options: fieldMeta.options,
  };
};

const createCustomTemplateField = (): RegistrationTemplateField => ({
  id: `RTF${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  label: '自定义字段',
  source: 'custom',
  fieldType: 'text',
  required: false,
  editable: true,
  enabled: true,
  placeholder: '请输入',
  options: [],
});

const REGISTRATION_TEMPLATES: RegistrationTemplateRow[] = [
  {
    id: 'TMP001',
    name: '通用个人报名模板',
    description: '适用于标准个人报名场景，优先复用选手档案中的实名与联系方式。',
    updatedAt: '2026-03-29 15:20:18',
    fields: [
      createProfileTemplateField('player_name'),
      createProfileTemplateField('id_type'),
      createProfileTemplateField('id_number'),
      createProfileTemplateField('phone'),
      {
        id: 'TMP001-F001',
        label: '紧急联系人',
        source: 'custom',
        fieldType: 'text',
        required: true,
        editable: true,
        enabled: true,
        placeholder: '请输入紧急联系人姓名',
        options: [],
      },
      {
        id: 'TMP001-F002',
        label: '紧急联系电话',
        source: 'custom',
        fieldType: 'phone',
        required: true,
        editable: true,
        enabled: true,
        placeholder: '请输入紧急联系电话',
        options: [],
      },
    ],
  },
  {
    id: 'TMP002',
    name: '青少年赛事报名模板',
    description: '适用于青少年参赛报名，支持在实名资料基础上补充监护人信息。',
    updatedAt: '2026-03-27 10:48:06',
    fields: [
      createProfileTemplateField('player_name'),
      createProfileTemplateField('gender'),
      createProfileTemplateField('birth_date'),
      createProfileTemplateField('id_type'),
      createProfileTemplateField('id_number'),
      {
        id: 'TMP002-F001',
        label: '监护人姓名',
        source: 'custom',
        fieldType: 'text',
        required: true,
        editable: true,
        enabled: true,
        placeholder: '请输入监护人姓名',
        options: [],
      },
      {
        id: 'TMP002-F002',
        label: '监护人手机号',
        source: 'custom',
        fieldType: 'phone',
        required: true,
        editable: true,
        enabled: true,
        placeholder: '请输入监护人手机号',
        options: [],
      },
    ],
  },
  {
    id: 'TMP003',
    name: '团体赛报名模板',
    description: '适用于团体项目报名，除实名信息外补充队内角色与服装尺码。',
    updatedAt: '2026-03-22 18:36:55',
    fields: [
      createProfileTemplateField('player_name'),
      createProfileTemplateField('id_type'),
      createProfileTemplateField('id_number'),
      createProfileTemplateField('phone'),
      {
        id: 'TMP003-F001',
        label: '队内角色',
        source: 'custom',
        fieldType: 'select',
        required: true,
        editable: true,
        enabled: true,
        placeholder: '请选择',
        options: ['主力队员', '替补队员', '兼项队员'],
      },
      {
        id: 'TMP003-F002',
        label: '球衣尺码',
        source: 'custom',
        fieldType: 'select',
        required: false,
        editable: true,
        enabled: true,
        placeholder: '请选择',
        options: ['S', 'M', 'L', 'XL', 'XXL'],
      },
    ],
  },
];

const TARGET_LISTS: TargetListRow[] = [
  {
    id: 'TL001',
    name: '城市公开赛邀请清单',
    description: '用于邀请赛与定向开放赛事的优先报名选手集合。',
    updatedAt: '2026-03-30 18:22:10',
    members: [
      {
        id: 'TLM001',
        playerName: '张晨',
        phone: '13800138000',
        idType: '身份证',
        idNumber: '440301199503154512',
        updatedAt: '2026-03-30 18:22:10',
      },
      {
        id: 'TLM002',
        playerName: '李思雨',
        phone: '13900139001',
        idType: '身份证',
        idNumber: '440303199809264326',
        updatedAt: '2026-03-28 09:13:06',
      },
      {
        id: 'TLM003',
        playerName: '王子豪',
        phone: '13700137002',
        idType: '护照',
        idNumber: 'EJ9483721',
        updatedAt: '2026-03-27 16:52:40',
      },
    ],
  },
  {
    id: 'TL002',
    name: '违规限制清单',
    description: '用于限制存在违规历史或禁赛记录的选手参与报名。',
    updatedAt: '2026-03-26 11:45:28',
    members: [
      {
        id: 'TLM004',
        playerName: '陈浩',
        phone: '13600136003',
        idType: '身份证',
        idNumber: '440106199102081234',
        updatedAt: '2026-03-26 11:45:28',
      },
      {
        id: 'TLM005',
        playerName: '刘佳雯',
        phone: '13500135004',
        idType: '身份证',
        idNumber: '440307200102184522',
        updatedAt: '2026-03-24 09:08:16',
      },
    ],
  },
  {
    id: 'TL003',
    name: '青少年预选通过清单',
    description: '用于青少年赛事中，预选通过选手的正式报名资格验证。',
    updatedAt: '2026-03-22 14:30:20',
    members: [
      {
        id: 'TLM006',
        playerName: '赵一鸣',
        phone: '18800188005',
        idType: '身份证',
        idNumber: '440111201207094214',
        updatedAt: '2026-03-22 14:30:20',
      },
      {
        id: 'TLM007',
        playerName: '林可欣',
        phone: '18600186006',
        idType: '身份证',
        idNumber: '440112201105186218',
        updatedAt: '2026-03-21 17:04:55',
      },
      {
        id: 'TLM008',
        playerName: '周启明',
        phone: '',
        idType: '港澳居民来往内地通行证',
        idNumber: 'H1234567890',
        updatedAt: '2026-03-20 12:16:33',
      },
      {
        id: 'TLM009',
        playerName: '许安然',
        phone: '18500185007',
        idType: '身份证',
        idNumber: '440114201006213321',
        updatedAt: '2026-03-19 18:20:14',
      },
    ],
  },
];

type ScoreRulePageMode = 'list' | 'editor';
type SingleMatchRulePageMode = 'list' | 'editor';
type TeamBattleRulePageMode = 'list' | 'editor';
type TechnicalOfficialPageMode = 'list' | 'editor';

const createEmptyScoreRule = (): ScoreRuleRow => ({
  id: `SR${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  ruleName: '',
  summary: '',
  updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  targetScore: 20,
  deuceEnabled: true,
  leadTriggerScore: 20,
  leadWinScore: 2,
  capScore: 30,
  midgameEnabled: true,
  swapTriggerScore: 11,
  breakEnabled: true,
  breakSeconds: 60,
  swapCourtEnabled: true,
});

const createEmptySingleMatchRule = (): SingleMatchRuleRow => ({
  id: `SMR${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  ruleName: '',
  outcomeMethod: '局分胜',
  matchFormat: '多局胜制',
  totalGames: 3,
  gamesToWin: 2,
  scoreRuleMode: 'global',
  globalScoreRuleId: 'SR001',
  perGameScoreRuleIds: ['SR001', 'SR001', 'SR001'],
  swapAfterGame: true,
  intervalRestEnabled: true,
  intervalRestSeconds: 60,
  forfeitWinGames: 2,
  forfeitPointsPerGame: 21,
  createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
});

const createEmptyTeamBattleRule = (): TeamBattleRuleRow => ({
  id: `TBR${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  ruleName: '',
  outcomeMethod: '胜场制',
  totalMatches: 5,
  matchesToWin: 3,
  singleMatchRuleMode: 'global',
  singleMatchRuleId: 'SMR001',
  perMatchSingleMatchRuleIds: ['SMR001', 'SMR001', 'SMR001', 'SMR001', 'SMR001'],
  endStrategy: 'finish-running',
  createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
});

const createEmptyTechnicalOfficial = (): TechnicalOfficialRow => ({
  id: `OFF${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  name: '',
  avatar: '',
  gender: '男',
  phone: '',
  region: '',
  organization: '',
  realName: '',
  idType: '身份证',
  idNumber: '',
  certificates: [
    {
      id: `CERT${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      sport: '',
      certificateName: '',
      level: '',
      certificateNo: '',
      issuer: '',
      issueDate: '',
      expireDate: '',
    },
  ],
  status: 'approved',
  source: 'admin',
  reviewRemark: '',
  createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
});

const createEmptyRegistrationTemplate = (): RegistrationTemplateRow => ({
  id: `TMP${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  name: '',
  description: '',
  updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  fields: [createProfileTemplateField('player_name'), createProfileTemplateField('id_type'), createProfileTemplateField('id_number')],
});

const createEmptyTargetList = (): TargetListRow => ({
  id: `TL${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  name: '',
  description: '',
  updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  members: [],
});

const createEmptyTargetListMember = (): TargetListMemberRow => ({
  id: `TLM${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  playerName: '',
  phone: '',
  idType: '身份证',
  idNumber: '',
  updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
});

const createEmptyAgreementTemplate = (): AgreementManagementRow => ({
  id: `AG${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  name: '',
  category: '报名协议',
  content: '',
  updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
});

const ADMIN_MENU_SECTIONS: AdminMenuSection[] = [
  {
    key: 'tournament',
    label: '赛事管理',
    icon: Calendar,
    children: [
      { key: 'tournament-list', label: '赛事列表' },
      { key: 'match-format', label: '比赛形式' },
      { key: 'target-list', label: '目标清单' },
      { key: 'registration-template', label: '报名模板' },
      { key: 'agreement-management', label: '协议管理' },
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
    label: '竞赛规则管理',
    icon: FileText,
    children: [
      { key: 'score-rule-template', label: '单局计分规则' },
      { key: 'single-match-rule-template', label: '单项胜负规则' },
      { key: 'team-battle-rule-template', label: '团体对抗规则' },
      { key: 'match-code-rule-template', label: '比赛代码规则' },
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
    key: 'payment',
    label: '经营管理',
    icon: DollarSign,
    children: [
      { key: 'order-workflow', label: '订单流程配置' },
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
  const [expandedAdminMenus, setExpandedAdminMenus] = useState<string[]>(['tournament']);
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(false);
  const [prototypeMode, setPrototypeMode] = useState(false);
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
  const [scoreRules, setScoreRules] = useState<ScoreRuleRow[]>(SCORE_RULES);
  const [scoreRulePageMode, setScoreRulePageMode] = useState<ScoreRulePageMode>('list');
  const [scoreRuleDraft, setScoreRuleDraft] = useState<ScoreRuleRow>(SCORE_RULES[0]);
  const [singleMatchRuleSearchDraft, setSingleMatchRuleSearchDraft] = useState('');
  const [singleMatchRuleSearchQuery, setSingleMatchRuleSearchQuery] = useState('');
  const [singleMatchRulePage, setSingleMatchRulePage] = useState(1);
  const [singleMatchRulePageSize, setSingleMatchRulePageSize] = useState(10);
  const [singleMatchRules, setSingleMatchRules] = useState<SingleMatchRuleRow[]>(SINGLE_MATCH_RULES);
  const [singleMatchRulePageMode, setSingleMatchRulePageMode] = useState<SingleMatchRulePageMode>('list');
  const [singleMatchRuleDraft, setSingleMatchRuleDraft] = useState<SingleMatchRuleRow>(SINGLE_MATCH_RULES[0]);
  const [teamBattleRuleSearchDraft, setTeamBattleRuleSearchDraft] = useState('');
  const [teamBattleRuleSearchQuery, setTeamBattleRuleSearchQuery] = useState('');
  const [teamBattleRulePage, setTeamBattleRulePage] = useState(1);
  const [teamBattleRulePageSize, setTeamBattleRulePageSize] = useState(10);
  const [teamBattleRules, setTeamBattleRules] = useState<TeamBattleRuleRow[]>(TEAM_BATTLE_RULES);
  const [teamBattleRulePageMode, setTeamBattleRulePageMode] = useState<TeamBattleRulePageMode>('list');
  const [teamBattleRuleDraft, setTeamBattleRuleDraft] = useState<TeamBattleRuleRow>(TEAM_BATTLE_RULES[0]);
  const [technicalOfficialStatusFilter, setTechnicalOfficialStatusFilter] = useState<'all' | OfficialStatus>('all');
  const [technicalOfficialSearchDraft, setTechnicalOfficialSearchDraft] = useState('');
  const [technicalOfficialSearchQuery, setTechnicalOfficialSearchQuery] = useState('');
  const [technicalOfficialPage, setTechnicalOfficialPage] = useState(1);
  const [technicalOfficialPageSize, setTechnicalOfficialPageSize] = useState(10);
  const [technicalOfficials, setTechnicalOfficials] = useState<TechnicalOfficialRow[]>(TECHNICAL_OFFICIALS);
  const [technicalOfficialPageMode, setTechnicalOfficialPageMode] = useState<TechnicalOfficialPageMode>('list');
  const [technicalOfficialDraft, setTechnicalOfficialDraft] = useState<TechnicalOfficialRow>(TECHNICAL_OFFICIALS[0]);
  const [registrationTemplateSearchDraft, setRegistrationTemplateSearchDraft] = useState('');
  const [registrationTemplateSearchQuery, setRegistrationTemplateSearchQuery] = useState('');
  const [registrationTemplatePage, setRegistrationTemplatePage] = useState(1);
  const [registrationTemplatePageSize, setRegistrationTemplatePageSize] = useState(10);
  const [registrationTemplates, setRegistrationTemplates] = useState<RegistrationTemplateRow[]>(REGISTRATION_TEMPLATES);
  const [registrationTemplatePageMode, setRegistrationTemplatePageMode] = useState<RegistrationTemplatePageMode>('list');
  const [registrationTemplateDraft, setRegistrationTemplateDraft] = useState<RegistrationTemplateRow>(REGISTRATION_TEMPLATES[0]);
  const [agreementSearchDraft, setAgreementSearchDraft] = useState('');
  const [agreementSearchQuery, setAgreementSearchQuery] = useState('');
  const [agreementPage, setAgreementPage] = useState(1);
  const [agreementPageSize, setAgreementPageSize] = useState(10);
  const [agreementTemplates, setAgreementTemplates] = useState<AgreementManagementRow[]>(INITIAL_AGREEMENT_TEMPLATES);
  const [agreementPageMode, setAgreementPageMode] = useState<AgreementManagementPageMode>('list');
  const [agreementDraft, setAgreementDraft] = useState<AgreementManagementRow>(INITIAL_AGREEMENT_TEMPLATES[0]);
  const [targetLists, setTargetLists] = useState<TargetListRow[]>(TARGET_LISTS);
  const [targetListSearchDraft, setTargetListSearchDraft] = useState('');
  const [targetListSearchQuery, setTargetListSearchQuery] = useState('');
  const [targetListPage, setTargetListPage] = useState(1);
  const [targetListPageSize, setTargetListPageSize] = useState(10);
  const [targetListPageMode, setTargetListPageMode] = useState<TargetListPageMode>('list');
  const [selectedTargetListId, setSelectedTargetListId] = useState(TARGET_LISTS[0]?.id ?? '');
  const [targetListEditorMode, setTargetListEditorMode] = useState<TargetListEditorMode>(null);
  const [targetListDraft, setTargetListDraft] = useState<TargetListRow>(createEmptyTargetList());
  const [targetListMemberSearchDraft, setTargetListMemberSearchDraft] = useState('');
  const [targetListMemberSearchQuery, setTargetListMemberSearchQuery] = useState('');
  const [targetListMemberPage, setTargetListMemberPage] = useState(1);
  const [targetListMemberPageSize, setTargetListMemberPageSize] = useState(10);
  const [targetListMemberEditorMode, setTargetListMemberEditorMode] = useState<TargetListMemberEditorMode>(null);
  const [targetListMemberDraft, setTargetListMemberDraft] = useState<TargetListMemberRow>(createEmptyTargetListMember());
  const [selectedTournamentId, setSelectedTournamentId] = useState(DEFAULT_TOURNAMENT.id);
  const [viewMode, setViewMode] = useState<'basic-info' | 'event-group-management' | 'page-decoration' | 'settings' | 'discount-rules' | 'records' | 'announcement' | 'scheduling' | 'projects' | 'match-management' | 'player-management' | 'schedule-config' | 'referee-management' | 'venue-config'>('basic-info');
  const [recordsInitialTab, setRecordsInitialTab] = useState<'orders' | 'project_summary' | 'participants' | 'teams'>('orders');
  const [activeTab, setActiveTab] = useState<'config' | 'team-limit' | 'restriction' | 'signing'>('config');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['basic', 'registration', 'scheduling']);
  const detailContentRef = useRef<HTMLDivElement | null>(null);
  const registrationLimitSectionRef = useRef<HTMLDivElement | null>(null);
  const teamLimitSectionRef = useRef<HTMLDivElement | null>(null);
  const restrictionSectionRef = useRef<HTMLDivElement | null>(null);
  const signingSectionRef = useRef<HTMLDivElement | null>(null);

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
    competitionRules:
      '<p><strong>一、竞赛项目</strong></p><p>设公开组、精英组与团体赛项目，具体组别与项目设置以最终报名页面展示为准。</p><p><strong>二、报名要求</strong></p><ul><li>参赛选手须保证身份信息真实有效。</li><li>报名成功后请按通知时间完成报到。</li></ul>',
    description:
      '赛事面向城市俱乐部、高校社团及大众羽毛球爱好者开放报名，设置公开组、精英组与团体赛单元，兼顾竞技体验与大众参与氛围。',
    attachments: [
      { id: 'ATT001', name: '赛事规程.pdf', sizeLabel: '2.4 MB' },
      { id: 'ATT002', name: '交通与报到须知.docx', sizeLabel: '860 KB' },
    ],
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
    enableIndividualRegistration: true,
    enableTeamRosterLimit: true,
    maxMembersPerTeam: 12,
    maxCoachesPerTeam: 1,
    teamGenderRequirement: {
      max_male: 6,
      max_female: 6,
    },
    teamLimitConfig: {
      requireGroupOnTeamCreation: true,
      enableGroupSpecificLimits: true,
      defaultMaxMembers: 12,
      defaultGenderRequirement: {
        max_male: 6,
        max_female: 6,
      },
      groupOverrides: [
        {
          id: 'team-limit-a',
          groupName: 'A组',
          enabled: true,
          maxMembers: 12,
          genderRequirement: {
            max_male: 6,
            max_female: 6,
          },
        },
        {
          id: 'team-limit-b',
          groupName: 'B组',
          enabled: true,
          maxMembers: 10,
          genderRequirement: {
            min_male: 3,
          },
        },
        {
          id: 'team-limit-u12',
          groupName: 'U12',
          enabled: true,
          maxMembers: 8,
          genderRequirement: {
            max_male: 4,
            max_female: 4,
          },
        },
      ],
    },
    ageCalculationBase: AgeCalculationBase.EVENT_START,
    ageCalculationMethod: AgeCalculationMethod.BIRTH_YEAR,
    ageCalculationCustomDate: '2026-05-01',
    enableSigning: true,
    selectedAgreements: [{ id: INITIAL_AGREEMENT_TEMPLATES[0].id, name: INITIAL_AGREEMENT_TEMPLATES[0].name }],
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

  const updateAdvancedTeamLimitConfig = (updates: Partial<RegistrationConfig['teamLimitConfig']>) => {
    setConfig((prev) => ({
      ...prev,
      teamLimitConfig: {
        ...prev.teamLimitConfig,
        ...updates,
      },
    }));
  };

  const updateAdvancedDefaultGenderRequirement = (
    key: keyof TeamGenderRequirement,
    enabled: boolean,
    nextValue?: number
  ) => {
    setConfig((prev) => {
      const currentRequirement = prev.teamLimitConfig.defaultGenderRequirement ?? {};
      const nextRequirement: TeamGenderRequirement = { ...currentRequirement };
      if (!enabled) {
        delete nextRequirement[key];
      } else {
        nextRequirement[key] = nextValue ?? currentRequirement[key] ?? 1;
      }

      return {
        ...prev,
        teamLimitConfig: {
          ...prev.teamLimitConfig,
          defaultGenderRequirement: nextRequirement,
        },
      };
    });
  };

  const updateAdvancedGroupOverride = (
    id: string,
    updater: (rule: RegistrationConfig['teamLimitConfig']['groupOverrides'][number]) => RegistrationConfig['teamLimitConfig']['groupOverrides'][number]
  ) => {
    setConfig((prev) => ({
      ...prev,
      teamLimitConfig: {
        ...prev.teamLimitConfig,
        groupOverrides: prev.teamLimitConfig.groupOverrides.map((rule) => (rule.id === id ? updater(rule) : rule)),
      },
    }));
  };

  const filteredLists = MOCK_LISTS.filter(l => l.name.includes(searchQuery));
  const currentViewTitle = VIEW_TITLES[viewMode];
  const currentSectionTitle = VIEW_SECTIONS[viewMode];
  const registrationRuleElevatorItems = [
    { id: 'config', label: '报名限制', ref: registrationLimitSectionRef },
    { id: 'team-limit', label: '队伍限制', ref: teamLimitSectionRef },
    { id: 'restriction', label: '兼项限制', ref: restrictionSectionRef },
    { id: 'signing', label: '协议签约', ref: signingSectionRef },
  ] as const;

  const syncActiveRegistrationSection = () => {
    const container = detailContentRef.current;
    if (!container || viewMode !== 'settings') return;

    const scrollTop = container.scrollTop;
    let nextActive: typeof activeTab = 'config';

    registrationRuleElevatorItems.forEach((item) => {
      const offsetTop = item.ref.current?.offsetTop ?? 0;
      if (offsetTop - 180 <= scrollTop) {
        nextActive = item.id;
      }
    });

    if (nextActive !== activeTab) {
      setActiveTab(nextActive);
    }
  };

  const scrollToRegistrationSection = (section: typeof activeTab) => {
    setActiveTab(section);
    const container = detailContentRef.current;
    const target = registrationRuleElevatorItems.find((item) => item.id === section)?.ref.current;
    if (!container || !target) return;

    container.scrollTo({
      top: Math.max(target.offsetTop - 140, 0),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (viewMode !== 'settings') return;
    syncActiveRegistrationSection();
  }, [viewMode]);

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
    if (!keyword) return scoreRules;
    return scoreRules.filter((item) => item.ruleName.toLowerCase().includes(keyword));
  }, [scoreRuleSearchQuery, scoreRules]);
  const scoreRuleTotalPages = Math.max(1, Math.ceil(filteredScoreRules.length / scoreRulePageSize));
  const normalizedScoreRulePage = Math.min(scoreRulePage, scoreRuleTotalPages);
  const pagedScoreRules = filteredScoreRules.slice(
    (normalizedScoreRulePage - 1) * scoreRulePageSize,
    normalizedScoreRulePage * scoreRulePageSize
  );
  const filteredSingleMatchRules = useMemo(() => {
    const keyword = singleMatchRuleSearchQuery.trim().toLowerCase();
    if (!keyword) return singleMatchRules;
    return singleMatchRules.filter((item) => item.ruleName.toLowerCase().includes(keyword));
  }, [singleMatchRuleSearchQuery, singleMatchRules]);
  const singleMatchRuleTotalPages = Math.max(1, Math.ceil(filteredSingleMatchRules.length / singleMatchRulePageSize));
  const normalizedSingleMatchRulePage = Math.min(singleMatchRulePage, singleMatchRuleTotalPages);
  const pagedSingleMatchRules = filteredSingleMatchRules.slice(
    (normalizedSingleMatchRulePage - 1) * singleMatchRulePageSize,
    normalizedSingleMatchRulePage * singleMatchRulePageSize
  );
  const filteredTeamBattleRules = useMemo(() => {
    const keyword = teamBattleRuleSearchQuery.trim().toLowerCase();
    if (!keyword) return teamBattleRules;
    return teamBattleRules.filter((item) => item.ruleName.toLowerCase().includes(keyword));
  }, [teamBattleRuleSearchQuery, teamBattleRules]);
  const teamBattleRuleTotalPages = Math.max(1, Math.ceil(filteredTeamBattleRules.length / teamBattleRulePageSize));
  const normalizedTeamBattleRulePage = Math.min(teamBattleRulePage, teamBattleRuleTotalPages);
  const pagedTeamBattleRules = filteredTeamBattleRules.slice(
    (normalizedTeamBattleRulePage - 1) * teamBattleRulePageSize,
    normalizedTeamBattleRulePage * teamBattleRulePageSize
  );
  const filteredTechnicalOfficials = useMemo(() => {
    const keyword = technicalOfficialSearchQuery.trim().toLowerCase();
    return technicalOfficials.filter((item) => {
      const matchesStatus =
        technicalOfficialStatusFilter === 'all' || item.status === technicalOfficialStatusFilter;
      const matchesKeyword =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.phone.includes(keyword) ||
        item.organization.toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [technicalOfficials, technicalOfficialSearchQuery, technicalOfficialStatusFilter]);
  const technicalOfficialTotalPages = Math.max(
    1,
    Math.ceil(filteredTechnicalOfficials.length / technicalOfficialPageSize)
  );
  const normalizedTechnicalOfficialPage = Math.min(technicalOfficialPage, technicalOfficialTotalPages);
  const pagedTechnicalOfficials = filteredTechnicalOfficials.slice(
    (normalizedTechnicalOfficialPage - 1) * technicalOfficialPageSize,
    normalizedTechnicalOfficialPage * technicalOfficialPageSize
  );
  const technicalOfficialStatusCounts = useMemo(
    () => ({
      all: technicalOfficials.length,
      pending: technicalOfficials.filter((item) => item.status === 'pending').length,
      approved: technicalOfficials.filter((item) => item.status === 'approved').length,
      rejected: technicalOfficials.filter((item) => item.status === 'rejected').length,
      disabled: technicalOfficials.filter((item) => item.status === 'disabled').length,
    }),
    [technicalOfficials]
  );
  const selectedRegistrationProfileKeys = registrationTemplateDraft.fields
    .filter((field): field is RegistrationTemplateField & { profileKey: RegistrationTemplateProfileKey } => Boolean(field.profileKey))
    .map((field) => field.profileKey);
  const registrationTemplatePreviewFields = registrationTemplateDraft.fields.filter((field) => field.enabled);
  const filteredRegistrationTemplates = useMemo(() => {
    const keyword = registrationTemplateSearchQuery.trim().toLowerCase();
    if (!keyword) return registrationTemplates;
    return registrationTemplates.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );
  }, [registrationTemplateSearchQuery, registrationTemplates]);
  const registrationTemplateTotalPages = Math.max(
    1,
    Math.ceil(filteredRegistrationTemplates.length / registrationTemplatePageSize)
  );
  const normalizedRegistrationTemplatePage = Math.min(
    registrationTemplatePage,
    registrationTemplateTotalPages
  );
  const pagedRegistrationTemplates = filteredRegistrationTemplates.slice(
    (normalizedRegistrationTemplatePage - 1) * registrationTemplatePageSize,
    normalizedRegistrationTemplatePage * registrationTemplatePageSize
  );
  const filteredAgreementTemplates = useMemo(() => {
    const keyword = agreementSearchQuery.trim().toLowerCase();
    if (!keyword) return agreementTemplates;
    return agreementTemplates.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
    );
  }, [agreementSearchQuery, agreementTemplates]);
  const agreementTotalPages = Math.max(1, Math.ceil(filteredAgreementTemplates.length / agreementPageSize));
  const normalizedAgreementPage = Math.min(agreementPage, agreementTotalPages);
  const pagedAgreementTemplates = filteredAgreementTemplates.slice(
    (normalizedAgreementPage - 1) * agreementPageSize,
    normalizedAgreementPage * agreementPageSize
  );
  const filteredTargetLists = useMemo(() => {
    const keyword = targetListSearchQuery.trim().toLowerCase();
    if (!keyword) return targetLists;
    return targetLists.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [targetListSearchQuery, targetLists]);
  const targetListTotalPages = Math.max(1, Math.ceil(filteredTargetLists.length / targetListPageSize));
  const normalizedTargetListPage = Math.min(targetListPage, targetListTotalPages);
  const pagedTargetLists = filteredTargetLists.slice(
    (normalizedTargetListPage - 1) * targetListPageSize,
    normalizedTargetListPage * targetListPageSize
  );
  const activeTargetList = targetLists.find((item) => item.id === selectedTargetListId) ?? targetLists[0] ?? null;
  const filteredTargetListMembers = useMemo(() => {
    const keyword = targetListMemberSearchQuery.trim().toLowerCase();
    const members = activeTargetList?.members ?? [];
    if (!keyword) return members;
    return members.filter(
      (item) =>
        item.playerName.toLowerCase().includes(keyword) ||
        item.phone.includes(keyword) ||
        item.idNumber.toLowerCase().includes(keyword)
    );
  }, [activeTargetList, targetListMemberSearchQuery]);
  const targetListMemberTotalPages = Math.max(
    1,
    Math.ceil(filteredTargetListMembers.length / targetListMemberPageSize)
  );
  const normalizedTargetListMemberPage = Math.min(targetListMemberPage, targetListMemberTotalPages);
  const pagedTargetListMembers = filteredTargetListMembers.slice(
    (normalizedTargetListMemberPage - 1) * targetListMemberPageSize,
    normalizedTargetListMemberPage * targetListMemberPageSize
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

  const applySingleMatchRuleSearch = () => {
    setSingleMatchRuleSearchQuery(singleMatchRuleSearchDraft);
    setSingleMatchRulePage(1);
  };

  const resetSingleMatchRuleSearch = () => {
    setSingleMatchRuleSearchDraft('');
    setSingleMatchRuleSearchQuery('');
    setSingleMatchRulePage(1);
  };

  const applyTeamBattleRuleSearch = () => {
    setTeamBattleRuleSearchQuery(teamBattleRuleSearchDraft);
    setTeamBattleRulePage(1);
  };

  const resetTeamBattleRuleSearch = () => {
    setTeamBattleRuleSearchDraft('');
    setTeamBattleRuleSearchQuery('');
    setTeamBattleRulePage(1);
  };

  const applyTechnicalOfficialSearch = () => {
    setTechnicalOfficialSearchQuery(technicalOfficialSearchDraft);
    setTechnicalOfficialPage(1);
  };

  const applyRegistrationTemplateSearch = () => {
    setRegistrationTemplateSearchQuery(registrationTemplateSearchDraft);
    setRegistrationTemplatePage(1);
  };

  const applyAgreementSearch = () => {
    setAgreementSearchQuery(agreementSearchDraft);
    setAgreementPage(1);
  };

  const resetTechnicalOfficialSearch = () => {
    setTechnicalOfficialSearchDraft('');
    setTechnicalOfficialSearchQuery('');
    setTechnicalOfficialStatusFilter('all');
    setTechnicalOfficialPage(1);
  };

  const resetRegistrationTemplateSearch = () => {
    setRegistrationTemplateSearchDraft('');
    setRegistrationTemplateSearchQuery('');
    setRegistrationTemplatePage(1);
  };

  const resetAgreementSearch = () => {
    setAgreementSearchDraft('');
    setAgreementSearchQuery('');
    setAgreementPage(1);
  };

  const applyTargetListSearch = () => {
    setTargetListSearchQuery(targetListSearchDraft);
    setTargetListPage(1);
  };

  const resetTargetListSearch = () => {
    setTargetListSearchDraft('');
    setTargetListSearchQuery('');
    setTargetListPage(1);
  };

  const applyTargetListMemberSearch = () => {
    setTargetListMemberSearchQuery(targetListMemberSearchDraft);
    setTargetListMemberPage(1);
  };

  const resetTargetListMemberSearch = () => {
    setTargetListMemberSearchDraft('');
    setTargetListMemberSearchQuery('');
    setTargetListMemberPage(1);
  };

  const maskIdNumber = (value: string) => {
    if (!value) return '未填写';
    if (value.length <= 7) return `${value.slice(0, 1)}***${value.slice(-1)}`;
    return `${value.slice(0, 3)}********${value.slice(-4)}`;
  };

  const getOfficialStatusLabel = (status: OfficialStatus) => {
    if (status === 'pending') return '待审核';
    if (status === 'approved') return '已通过';
    if (status === 'rejected') return '已驳回';
    return '已停用';
  };

  const getOfficialStatusClass = (status: OfficialStatus) => {
    if (status === 'pending') return 'bg-amber-50 text-amber-600 ring-1 ring-amber-100';
    if (status === 'approved') return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100';
    if (status === 'rejected') return 'bg-rose-50 text-rose-600 ring-1 ring-rose-100';
    return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
  };

  const getOfficialSourceLabel = (source: OfficialSource) => (source === 'admin' ? '后台新建' : '小程序注册');

  const getOfficialCertificateSummary = (official: TechnicalOfficialRow) => {
    const validCertificates = official.certificates.filter(
      (item) => item.sport || item.certificateName || item.level || item.certificateNo
    );
    if (validCertificates.length === 0) return '未录入证书';
    if (validCertificates.length === 1) {
      const first = validCertificates[0];
      return `${first.sport || '未设项目'} / ${first.level || '未定级'}`;
    }
    return `${validCertificates[0].sport || '未设项目'} 等 ${validCertificates.length} 项`;
  };

  const getRegistrationTemplateProfileFieldMeta = (key: RegistrationTemplateProfileKey) =>
    REGISTRATION_TEMPLATE_PROFILE_FIELDS.find((item) => item.key === key) ??
    REGISTRATION_TEMPLATE_PROFILE_FIELDS[0];

  const getRegistrationTemplateFieldTypeLabel = (fieldType: RegistrationTemplateFieldType) => {
    if (fieldType === 'phone') return '手机号';
    if (fieldType === 'date') return '日期';
    if (fieldType === 'select') return '单选';
    return '单行文本';
  };

  const openCreateRegistrationTemplate = () => {
    setRegistrationTemplateDraft(createEmptyRegistrationTemplate());
    setRegistrationTemplatePageMode('editor');
  };

  const openEditRegistrationTemplate = (templateId: string) => {
    const targetTemplate = registrationTemplates.find((item) => item.id === templateId);
    if (!targetTemplate) return;
    setRegistrationTemplateDraft(targetTemplate);
    setRegistrationTemplatePageMode('editor');
  };

  const duplicateRegistrationTemplate = (templateId: string) => {
    const targetTemplate = registrationTemplates.find((item) => item.id === templateId);
    if (!targetTemplate) return;
    const nextTemplate: RegistrationTemplateRow = {
      ...targetTemplate,
      id: `TMP${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: `${targetTemplate.name}（复制）`,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      fields: targetTemplate.fields.map((field) => ({
        ...field,
        id: `RTF${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      })),
    };
    setRegistrationTemplates((prev) => [nextTemplate, ...prev]);
  };

  const addProfileFieldToTemplate = (profileKey: RegistrationTemplateProfileKey) => {
    setRegistrationTemplateDraft((prev) => {
      if (prev.fields.some((field) => field.profileKey === profileKey)) return prev;
      return {
        ...prev,
        fields: [...prev.fields, createProfileTemplateField(profileKey)],
      };
    });
  };

  const addCustomFieldToTemplate = () => {
    setRegistrationTemplateDraft((prev) => ({
      ...prev,
      fields: [...prev.fields, createCustomTemplateField()],
    }));
  };

  const updateRegistrationTemplateField = (
    fieldId: string,
    updater: (field: RegistrationTemplateField) => RegistrationTemplateField
  ) => {
    setRegistrationTemplateDraft((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }));
  };

  const moveRegistrationTemplateField = (fieldId: string, direction: 'up' | 'down') => {
    setRegistrationTemplateDraft((prev) => {
      const currentIndex = prev.fields.findIndex((field) => field.id === fieldId);
      if (currentIndex === -1) return prev;
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.fields.length) return prev;
      const nextFields = [...prev.fields];
      const [currentField] = nextFields.splice(currentIndex, 1);
      nextFields.splice(targetIndex, 0, currentField);
      return {
        ...prev,
        fields: nextFields,
      };
    });
  };

  const removeRegistrationTemplateField = (fieldId: string) => {
    setRegistrationTemplateDraft((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const deleteRegistrationTemplate = (templateId: string) => {
    setRegistrationTemplates((prev) => prev.filter((item) => item.id !== templateId));
  };

  const saveRegistrationTemplate = () => {
    const normalizedTemplate: RegistrationTemplateRow = {
      ...registrationTemplateDraft,
      fields: registrationTemplateDraft.fields,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };

    setRegistrationTemplates((prev) => {
      const exists = prev.some((item) => item.id === normalizedTemplate.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedTemplate.id ? normalizedTemplate : item));
      }
      return [normalizedTemplate, ...prev];
    });
    setRegistrationTemplatePageMode('list');
  };

  const extractAgreementVariableKeys = (content: string) => {
    const matches = content.match(/{{[^}]+}}/g) ?? [];
    return Array.from(new Set(matches));
  };

  const openCreateAgreementTemplate = () => {
    setAgreementDraft(createEmptyAgreementTemplate());
    setAgreementPageMode('editor');
  };

  const openEditAgreementTemplate = (agreementId: string) => {
    const targetAgreement = agreementTemplates.find((item) => item.id === agreementId);
    if (!targetAgreement) return;
    setAgreementDraft(targetAgreement);
    setAgreementPageMode('editor');
  };

  const insertAgreementVariable = (variableKey: string) => {
    setAgreementDraft((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}\n${variableKey}` : variableKey,
    }));
  };

  const saveAgreementTemplate = () => {
    const normalizedAgreement: AgreementManagementRow = {
      ...agreementDraft,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };

    setAgreementTemplates((prev) => {
      const exists = prev.some((item) => item.id === normalizedAgreement.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedAgreement.id ? normalizedAgreement : item));
      }
      return [normalizedAgreement, ...prev];
    });

    setConfig((prev) => ({
      ...prev,
      selectedAgreements: prev.selectedAgreements.map((item) =>
        item.id === normalizedAgreement.id ? { id: normalizedAgreement.id, name: normalizedAgreement.name } : item
      ),
    }));
    setAgreementPageMode('list');
  };

  const deleteAgreementTemplate = (agreementId: string) => {
    setAgreementTemplates((prev) => prev.filter((item) => item.id !== agreementId));
    setConfig((prev) => ({
      ...prev,
      selectedAgreements: prev.selectedAgreements.filter((item) => item.id !== agreementId),
    }));
  };

  const openCreateTargetList = () => {
    setTargetListDraft(createEmptyTargetList());
    setTargetListEditorMode('create');
  };

  const openEditTargetList = (targetListId: string) => {
    const targetList = targetLists.find((item) => item.id === targetListId);
    if (!targetList) return;
    setTargetListDraft(targetList);
    setTargetListEditorMode('edit');
  };

  const saveTargetList = () => {
    const normalizedTargetList: TargetListRow = {
      ...targetListDraft,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };

    setTargetLists((prev) => {
      const exists = prev.some((item) => item.id === normalizedTargetList.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedTargetList.id ? normalizedTargetList : item));
      }
      return [normalizedTargetList, ...prev];
    });
    setSelectedTargetListId(normalizedTargetList.id);
    setTargetListEditorMode(null);
  };

  const deleteTargetList = (targetListId: string) => {
    if (!window.confirm('确认删除这张目标清单吗？删除后清单成员也会一并移除。')) return;
    setTargetLists((prev) => {
      const nextLists = prev.filter((item) => item.id !== targetListId);
      if (selectedTargetListId === targetListId) {
        setSelectedTargetListId(nextLists[0]?.id ?? '');
      }
      if (targetListPageMode === 'manage' && selectedTargetListId === targetListId) {
        setTargetListPageMode('list');
      }
      return nextLists;
    });
  };

  const openManageTargetList = (targetListId: string) => {
    setSelectedTargetListId(targetListId);
    setTargetListPageMode('manage');
    setTargetListMemberSearchDraft('');
    setTargetListMemberSearchQuery('');
    setTargetListMemberPage(1);
  };

  const openCreateTargetListMember = () => {
    setTargetListMemberDraft(createEmptyTargetListMember());
    setTargetListMemberEditorMode('create');
  };

  const openEditTargetListMember = (memberId: string) => {
    const member = activeTargetList?.members.find((item) => item.id === memberId);
    if (!member) return;
    setTargetListMemberDraft(member);
    setTargetListMemberEditorMode('edit');
  };

  const saveTargetListMember = () => {
    if (!activeTargetList) return;
    const normalizedMember: TargetListMemberRow = {
      ...targetListMemberDraft,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };

    setTargetLists((prev) =>
      prev.map((item) => {
        if (item.id !== activeTargetList.id) return item;
        const exists = item.members.some((member) => member.id === normalizedMember.id);
        return {
          ...item,
          updatedAt: normalizedMember.updatedAt,
          members: exists
            ? item.members.map((member) => (member.id === normalizedMember.id ? normalizedMember : member))
            : [normalizedMember, ...item.members],
        };
      })
    );
    setTargetListMemberEditorMode(null);
  };

  const deleteTargetListMember = (memberId: string) => {
    if (!activeTargetList) return;
    if (!window.confirm('确认删除这位清单成员吗？')) return;
    const nextUpdatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    setTargetLists((prev) =>
      prev.map((item) =>
        item.id === activeTargetList.id
          ? {
              ...item,
              updatedAt: nextUpdatedAt,
              members: item.members.filter((member) => member.id !== memberId),
            }
          : item
      )
    );
  };

  const clearTargetListMembers = () => {
    if (!activeTargetList) return;
    if (!window.confirm(`确认清空「${activeTargetList.name}」里的全部成员吗？`)) return;
    const nextUpdatedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    setTargetLists((prev) =>
      prev.map((item) =>
        item.id === activeTargetList.id ? { ...item, updatedAt: nextUpdatedAt, members: [] } : item
      )
    );
    setTargetListMemberPage(1);
  };

  const importTargetListMembers = () => {
    if (!activeTargetList) return;
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const importedMembers: TargetListMemberRow[] = [
      {
        id: `TLM${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        playerName: '导入选手A',
        phone: '13900010001',
        idType: '身份证',
        idNumber: '440101199603150018',
        updatedAt: now,
      },
      {
        id: `TLM${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        playerName: '导入选手B',
        phone: '13800010002',
        idType: '护照',
        idNumber: 'P93821045',
        updatedAt: now,
      },
    ];

    setTargetLists((prev) =>
      prev.map((item) =>
        item.id === activeTargetList.id
          ? {
              ...item,
              updatedAt: now,
              members: [...importedMembers, ...item.members],
            }
          : item
      )
    );
  };

  const exportTargetListMembers = () => {
    if (!activeTargetList) return;
    const headers = ['选手姓名', '手机号', '证件类型', '证件号码', '最新更新'];
    const rows = activeTargetList.members.map((member) => [
      member.playerName,
      member.phone,
      member.idType,
      member.idNumber,
      member.updatedAt,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTargetList.name}-清单成员.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openCreateTechnicalOfficial = () => {
    setTechnicalOfficialDraft(createEmptyTechnicalOfficial());
    setTechnicalOfficialPageMode('editor');
  };

  const openEditTechnicalOfficial = (officialId: string) => {
    const targetOfficial = technicalOfficials.find((item) => item.id === officialId);
    if (!targetOfficial) return;
    setTechnicalOfficialDraft(targetOfficial);
    setTechnicalOfficialPageMode('editor');
  };

  const saveTechnicalOfficial = () => {
    const normalizedOfficial: TechnicalOfficialRow = {
      ...technicalOfficialDraft,
      certificates: technicalOfficialDraft.certificates.filter(
        (item) =>
          item.sport ||
          item.certificateName ||
          item.level ||
          item.certificateNo ||
          item.issuer ||
          item.issueDate ||
          item.expireDate
      ),
    };

    setTechnicalOfficials((prev) => {
      const exists = prev.some((item) => item.id === normalizedOfficial.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedOfficial.id ? normalizedOfficial : item));
      }
      return [normalizedOfficial, ...prev];
    });
    setTechnicalOfficialPageMode('list');
  };

  const deleteTechnicalOfficial = (officialId: string) => {
    setTechnicalOfficials((prev) => prev.filter((item) => item.id !== officialId));
  };

  const updateTechnicalOfficialStatus = (officialId: string, status: OfficialStatus, reviewRemark: string) => {
    setTechnicalOfficials((prev) =>
      prev.map((item) => (item.id === officialId ? { ...item, status, reviewRemark } : item))
    );
    setTechnicalOfficialDraft((prev) =>
      prev.id === officialId ? { ...prev, status, reviewRemark } : prev
    );
  };

  const buildScoreRuleSummary = (rule: ScoreRuleRow) => {
    const targetScore = rule.targetScore;
    if (rule.deuceEnabled) {
      return `本局目标分 [${targetScore}] 分，若出现平分，需领先 [${rule.leadWinScore}] 分获胜；如分数僵持，则先到 [${rule.capScore}] 分者直接获胜。`;
    }
    return `本局目标分 [${targetScore}] 分，先到目标分者直接获胜。`;
  };

  const openCreateScoreRule = () => {
    const nextRule = createEmptyScoreRule();
    nextRule.summary = buildScoreRuleSummary(nextRule);
    setScoreRuleDraft(nextRule);
    setScoreRulePageMode('editor');
  };

  const openEditScoreRule = (ruleId: string) => {
    const targetRule = scoreRules.find((item) => item.id === ruleId);
    if (!targetRule) return;
    setScoreRuleDraft(targetRule);
    setScoreRulePageMode('editor');
  };

  const saveScoreRule = () => {
    const normalizedRule: ScoreRuleRow = {
      ...scoreRuleDraft,
      summary: buildScoreRuleSummary(scoreRuleDraft),
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };

    setScoreRules((prev) => {
      const exists = prev.some((item) => item.id === normalizedRule.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedRule.id ? normalizedRule : item));
      }
      return [normalizedRule, ...prev];
    });
    setScoreRulePageMode('list');
  };

  const deleteScoreRule = (ruleId: string) => {
    setScoreRules((prev) => prev.filter((item) => item.id !== ruleId));
  };

  const deleteSingleMatchRule = (ruleId: string) => {
    setSingleMatchRules((prev) => prev.filter((item) => item.id !== ruleId));
  };

  const getScoreRuleNameById = (ruleId: string) =>
    scoreRules.find((item) => item.id === ruleId)?.ruleName ?? '未选择规则';

  const getSingleMatchRuleRoundsLabel = (rule: SingleMatchRuleRow) => {
    if (rule.matchFormat === '单局定胜负') return '1局定胜负';
    if (rule.matchFormat === '固定局数') return `打${rule.totalGames}局，赢${rule.gamesToWin}局`;
    return `${rule.totalGames}局${rule.gamesToWin}胜`;
  };

  const getSingleMatchRuleScoreLabel = (rule: SingleMatchRuleRow) => {
    if (rule.scoreRuleMode === 'global') {
      return `全局统一：${getScoreRuleNameById(rule.globalScoreRuleId)}`;
    }
    return `分局自定义：共 ${rule.perGameScoreRuleIds.length} 局`;
  };

  const getSingleMatchRuleIntervalLabel = (rule: SingleMatchRuleRow) =>
    rule.intervalRestEnabled ? `是，局间休息 ${rule.intervalRestSeconds} 秒` : '否';

  const getSingleMatchRuleForfeitLabel = (rule: SingleMatchRuleRow) =>
    `胜局补偿 ${rule.forfeitWinGames} 局，每局小分补偿 ${rule.forfeitPointsPerGame} 分`;

  const normalizeTeamBattlePerMatchRuleIds = (count: number, currentIds: string[], fallbackId: string) =>
    Array.from({ length: count }, (_, index) => currentIds[index] ?? fallbackId);

  const getTeamBattleRuleSingleMatchName = (ruleId: string) =>
    singleMatchRules.find((item) => item.id === ruleId)?.ruleName ?? '未选择规则';

  const getTeamBattleRuleSingleMatchSummary = (rule: TeamBattleRuleRow) => {
    if (rule.singleMatchRuleMode === 'global') {
      return `全场统一：${getTeamBattleRuleSingleMatchName(rule.singleMatchRuleId)}`;
    }

    const names = normalizeTeamBattlePerMatchRuleIds(
      rule.totalMatches,
      rule.perMatchSingleMatchRuleIds,
      rule.singleMatchRuleId || singleMatchRules[0]?.id || 'SMR001'
    ).map((id, index) => `第${index + 1}场 ${getTeamBattleRuleSingleMatchName(id)}`);

    return `分场设置：${names.join(' / ')}`;
  };

  const getTeamBattleRuleWinsLabel = (rule: TeamBattleRuleRow) =>
    rule.outcomeMethod === '胜场制' && rule.matchesToWin
      ? `${rule.totalMatches}场 / 先胜${rule.matchesToWin}场`
      : `${rule.totalMatches}场 / 按累计总分判胜`;

  const getTeamBattleRuleStrategyLabel = (strategy: TeamBattleEndStrategy) => {
    if (strategy === 'play-all') return '打满全部比赛后结束';
    if (strategy === 'finish-running') return '分出胜负后已开赛场次继续';
    return '分出胜负后立即结束未完成场次';
  };

  const getSingleMatchRuleGameCount = (rule: SingleMatchRuleRow) =>
    rule.matchFormat === '单局定胜负' ? 1 : Math.max(1, rule.totalGames);

  const normalizePerGameScoreRuleIds = (count: number, currentIds: string[], fallbackId: string) =>
    Array.from({ length: count }, (_, index) => currentIds[index] ?? fallbackId);

  const openCreateSingleMatchRule = () => {
    setSingleMatchRuleDraft(createEmptySingleMatchRule());
    setSingleMatchRulePageMode('editor');
  };

  const openEditSingleMatchRule = (ruleId: string) => {
    const targetRule = singleMatchRules.find((item) => item.id === ruleId);
    if (!targetRule) return;
    setSingleMatchRuleDraft(targetRule);
    setSingleMatchRulePageMode('editor');
  };

  const saveSingleMatchRule = () => {
    const normalizedRule: SingleMatchRuleRow = {
      ...singleMatchRuleDraft,
      perGameScoreRuleIds: normalizePerGameScoreRuleIds(
        getSingleMatchRuleGameCount(singleMatchRuleDraft),
        singleMatchRuleDraft.perGameScoreRuleIds,
        singleMatchRuleDraft.globalScoreRuleId || scoreRules[0]?.id || 'SR001'
      ),
    };

    setSingleMatchRules((prev) => {
      const exists = prev.some((item) => item.id === normalizedRule.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedRule.id ? normalizedRule : item));
      }
      return [normalizedRule, ...prev];
    });
    setSingleMatchRulePageMode('list');
  };

  const deleteTeamBattleRule = (ruleId: string) => {
    setTeamBattleRules((prev) => prev.filter((item) => item.id !== ruleId));
  };

  const openCreateTeamBattleRule = () => {
    setTeamBattleRuleDraft(createEmptyTeamBattleRule());
    setTeamBattleRulePageMode('editor');
  };

  const openEditTeamBattleRule = (ruleId: string) => {
    const targetRule = teamBattleRules.find((item) => item.id === ruleId);
    if (!targetRule) return;
    setTeamBattleRuleDraft(targetRule);
    setTeamBattleRulePageMode('editor');
  };

  const saveTeamBattleRule = () => {
    const existingRule = teamBattleRules.find((item) => item.id === teamBattleRuleDraft.id);
    const normalizedRule: TeamBattleRuleRow = {
      ...teamBattleRuleDraft,
      matchesToWin:
        teamBattleRuleDraft.outcomeMethod === '胜场制'
          ? Math.min(teamBattleRuleDraft.matchesToWin || 1, teamBattleRuleDraft.totalMatches)
          : null,
      perMatchSingleMatchRuleIds: normalizeTeamBattlePerMatchRuleIds(
        teamBattleRuleDraft.totalMatches,
        teamBattleRuleDraft.perMatchSingleMatchRuleIds,
        teamBattleRuleDraft.singleMatchRuleId || singleMatchRules[0]?.id || 'SMR001'
      ),
      createdAt:
        existingRule?.createdAt ||
        teamBattleRuleDraft.createdAt ||
        new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };

    setTeamBattleRules((prev) => {
      const exists = prev.some((item) => item.id === normalizedRule.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedRule.id ? normalizedRule : item));
      }
      return [normalizedRule, ...prev];
    });
    setTeamBattleRulePageMode('list');
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
                          <p className="mt-1 text-sm text-slate-500">展示当前已创建的赛事，若需要修改赛事配置，请点击“赛事详情”按钮进入配置页</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => openTournamentDetail(activeTournament.id)}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
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
                          <th className="sticky right-0 z-10 w-[14%] bg-white px-8 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedTournaments.map((tournament) => (
                          <tr key={tournament.id} className="group hover:bg-slate-50/60 transition-colors">
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
                            <td className="sticky right-0 z-10 bg-white px-8 py-6 align-top shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)] transition-colors group-hover:bg-slate-50/60">
                              <div className="flex flex-nowrap justify-end gap-2">
                                <button
                                  onClick={() => openTournamentDetail(tournament.id)}
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-all hover:text-indigo-700"
                                >
                                  赛事详情
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTournament(tournament.id)}
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  删除
                                </button>
                                <button
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 transition-all hover:text-amber-700"
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
                    compact
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
                          比赛形式包含了两个要素：参赛人数（每个参赛单元需要多少名选手）+ 性别结构（选手的性别组合规则），若当前形式不满足您的需求，请联系平台运营处理
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
                    compact
                  />
                </section>
              </div>
            ) : adminActiveMenu === 'score-rule-template' ? (
              scoreRulePageMode === 'list' ? (
                <div className="mx-auto w-full max-w-7xl min-w-0">
                  <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
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
                      <button
                        onClick={openCreateScoreRule}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
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
                            <th className="sticky right-0 z-10 bg-white px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedScoreRules.length > 0 ? (
                            pagedScoreRules.map((rule) => (
                              <tr key={rule.id} className="group align-top transition-colors hover:bg-slate-50/60">
                                <td className="px-8 py-6 text-sm font-medium text-slate-500 whitespace-nowrap">{rule.id}</td>
                                <td className="px-6 py-6">
                                  <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{rule.ruleName}</p>
                                </td>
                                <td className="px-6 py-6">
                                  <p className="text-sm leading-7 text-slate-600 whitespace-nowrap">{rule.summary}</p>
                                </td>
                                <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{rule.updatedAt}</td>
                                <td className="sticky right-0 z-10 bg-white px-8 py-6 shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)] transition-colors group-hover:bg-slate-50/60">
                                  <div className="flex flex-nowrap justify-end gap-2">
                                    <button
                                      onClick={() => openEditScoreRule(rule.id)}
                                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                    >
                                      <PencilLine className="h-4 w-4" />
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => deleteScoreRule(rule.id)}
                                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                    >
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
                      compact
                    />
                  </section>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setScoreRulePageMode('list')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      返回规则列表
                    </button>
                    <button
                      onClick={saveScoreRule}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                      保存
                    </button>
                  </div>

                  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">单局计分规则配置</h3>
                          <p className="mt-1 text-sm text-slate-500">配置单局内的胜负判定与换场间歇规则。</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 px-8 py-8">
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-slate-600">规则名称</span>
                          <input
                            value={scoreRuleDraft.ruleName}
                            onChange={(event) => setScoreRuleDraft((prev) => ({ ...prev, ruleName: event.target.value }))}
                            placeholder="请输入"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </label>

                        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Settings2 className="h-4 w-4 text-indigo-500" />
                              <p className="text-sm font-semibold text-slate-700">计分规则</p>
                            </div>
                            <div className="space-y-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                                  <span className="font-medium text-slate-600">目标获胜分</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={scoreRuleDraft.targetScore}
                                    onChange={(event) =>
                                      setScoreRuleDraft((prev) => ({ ...prev, targetScore: Number(event.target.value || 0) }))
                                    }
                                    className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                  />
                                  <span>分</span>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-sm font-medium text-slate-600">平分加赛</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setScoreRuleDraft((prev) => ({ ...prev, deuceEnabled: !prev.deuceEnabled }))
                                    }
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full px-2 text-xs font-semibold transition-all ${
                                      scoreRuleDraft.deuceEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                                    }`}
                                  >
                                    <span>{scoreRuleDraft.deuceEnabled ? '开' : '关'}</span>
                                    <span
                                      className={`absolute h-6 w-6 rounded-full bg-white shadow transition-all ${
                                        scoreRuleDraft.deuceEnabled ? 'right-1' : 'left-1'
                                      }`}
                                    />
                                  </button>
                                </div>

                                {scoreRuleDraft.deuceEnabled && (
                                  <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                                      <span className="font-medium text-slate-600">需领先分数</span>
                                      <span>当双方达到</span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={scoreRuleDraft.leadTriggerScore}
                                        onChange={(event) =>
                                          setScoreRuleDraft((prev) => ({
                                            ...prev,
                                            leadTriggerScore: Number(event.target.value || 0),
                                          }))
                                        }
                                        className="w-32 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                      />
                                      <span>分平分时，获胜需要领先</span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={scoreRuleDraft.leadWinScore}
                                        onChange={(event) =>
                                          setScoreRuleDraft((prev) => ({
                                            ...prev,
                                            leadWinScore: Number(event.target.value || 0),
                                          }))
                                        }
                                        className="w-32 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                      />
                                      <span>分</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                                  <span className="font-medium text-slate-600">最高封顶分</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={scoreRuleDraft.capScore}
                                    onChange={(event) =>
                                      setScoreRuleDraft((prev) => ({ ...prev, capScore: Number(event.target.value || 0) }))
                                    }
                                    className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                  />
                                  <span>分</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-indigo-500" />
                              <p className="text-sm font-semibold text-slate-700">计分规则解读</p>
                            </div>
                            <div className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-5 shadow-sm">
                              <p className="text-sm leading-7 text-slate-600">
                                {buildScoreRuleSummary(scoreRuleDraft)}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                  目标分 {scoreRuleDraft.targetScore}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                  平分加赛 {scoreRuleDraft.deuceEnabled ? '开启' : '关闭'}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                  封顶分 {scoreRuleDraft.capScore}
                                </span>
                              </div>
                            </div>
                            <InteractionHelp
                              prototypeMode={prototypeMode}
                              stacked
                              title="对应模块：计分规则解读"
                              content="根据【目标获胜分】、【平分加赛规则】、【最高封顶分】汇总出规则摘要，便于活动配置的人理解当前配置的规则。"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-slate-600">局内换场&间歇</span>
                            <button
                              type="button"
                              onClick={() =>
                                setScoreRuleDraft((prev) => ({ ...prev, midgameEnabled: !prev.midgameEnabled }))
                              }
                              className={`relative inline-flex h-8 w-16 items-center rounded-full px-2 text-xs font-semibold transition-all ${
                                scoreRuleDraft.midgameEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                              }`}
                            >
                              <span>{scoreRuleDraft.midgameEnabled ? '开' : '关'}</span>
                              <span
                                className={`absolute h-6 w-6 rounded-full bg-white shadow transition-all ${
                                  scoreRuleDraft.midgameEnabled ? 'right-1' : 'left-1'
                                }`}
                              />
                            </button>
                          </div>

                          {scoreRuleDraft.midgameEnabled && (
                            <div className="space-y-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-5">
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                                <span className="font-medium text-slate-600">触发分数</span>
                                <span>当比赛某一方达到</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={scoreRuleDraft.swapTriggerScore}
                                  onChange={(event) =>
                                    setScoreRuleDraft((prev) => ({
                                      ...prev,
                                      swapTriggerScore: Number(event.target.value || 0),
                                    }))
                                  }
                                  className="w-40 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                />
                                <span>分时</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                                <span className="font-medium text-slate-600">局内休息</span>
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={scoreRuleDraft.breakEnabled}
                                    onChange={() => setScoreRuleDraft((prev) => ({ ...prev, breakEnabled: true }))}
                                  />
                                  <span>是</span>
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={scoreRuleDraft.breakSeconds}
                                  onChange={(event) =>
                                    setScoreRuleDraft((prev) => ({
                                      ...prev,
                                      breakSeconds: Number(event.target.value || 0),
                                    }))
                                  }
                                  className="w-40 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                />
                                <span>秒</span>
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={!scoreRuleDraft.breakEnabled}
                                    onChange={() => setScoreRuleDraft((prev) => ({ ...prev, breakEnabled: false }))}
                                  />
                                  <span>否</span>
                                </label>
                              </div>
                              <p className="text-sm text-slate-400">
                                选择是，则到达触发分数时开启休息时间：教练手动开启或者3秒后自动启动倒计时
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                                <span className="font-medium text-slate-600">交换场地</span>
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={scoreRuleDraft.swapCourtEnabled}
                                    onChange={() =>
                                      setScoreRuleDraft((prev) => ({ ...prev, swapCourtEnabled: true }))
                                    }
                                  />
                                  <span>是</span>
                                </label>
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={!scoreRuleDraft.swapCourtEnabled}
                                    onChange={() =>
                                      setScoreRuleDraft((prev) => ({ ...prev, swapCourtEnabled: false }))
                                    }
                                  />
                                  <span>否</span>
                                </label>
                              </div>
                              <p className="text-sm text-slate-400">
                                选择是，则到达触发分数时裁判页面提醒双方交换场地
                              </p>

                            </div>
                          )}
                          <InteractionHelp
                            prototypeMode={prototypeMode}
                            stacked
                            title="对应模块：局内换场&间歇"
                            content={
                              <div className="space-y-2">
                                <p>3.1 【局内换场&间歇 = 开启】时，显示【触发分数】、【局内休息】和【交换场地】配置项。</p>
                                <p>3.2 【局内休息】默认写入60秒。</p>
                              </div>
                            }
                          />
                        </div>
                      </div>
                  </section>
                </div>
              )
            ) : adminActiveMenu === 'single-match-rule-template' ? (
              singleMatchRulePageMode === 'list' ? (
                <div className="mx-auto w-full max-w-7xl min-w-0">
                  <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">单项胜负规则</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            统一维护单项比赛的胜负判定、局制、弃权结果与局间规则，供比赛项目直接引用。
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openCreateSingleMatchRule}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
                        添加规则
                      </button>
                    </div>

                    <div className="border-b border-slate-100 px-8 py-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative min-w-[280px]">
                          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={singleMatchRuleSearchDraft}
                            onChange={(event) => setSingleMatchRuleSearchDraft(event.target.value)}
                            placeholder="检索规则名称"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                        <button
                          onClick={applySingleMatchRuleSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          筛选
                        </button>
                        <button
                          onClick={resetSingleMatchRuleSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          重置
                        </button>
                      </div>
                    </div>

                    <div className="max-w-full overflow-x-auto px-6 py-4">
                      <table className="min-w-[1720px] w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-white">
                            <th className="w-[88px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">ID</th>
                            <th className="w-[190px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">规则名称</th>
                            <th className="w-[120px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">胜负判定方式</th>
                            <th className="w-[120px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">比赛局制</th>
                            <th className="w-[150px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">局数</th>
                            <th className="w-[240px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">局内计分规则</th>
                            <th className="w-[150px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">每局结束交换场区</th>
                            <th className="w-[210px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">局间休息</th>
                            <th className="w-[340px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">弃权判定结果</th>
                            <th className="w-[170px] px-3 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">创建时间</th>
                            <th className="sticky right-0 z-10 w-[160px] bg-white px-3 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedSingleMatchRules.length > 0 ? (
                            pagedSingleMatchRules.map((rule) => (
                              <tr key={rule.id} className="align-top transition-colors hover:bg-slate-50/60">
                                <td className="px-3 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">{rule.id}</td>
                                <td className="px-3 py-5">
                                  <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{rule.ruleName}</p>
                                </td>
                                <td className="px-3 py-5">
                                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {rule.outcomeMethod}
                                  </span>
                                </td>
                                <td className="px-3 py-5">
                                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {rule.matchFormat}
                                  </span>
                                </td>
                                <td className="px-3 py-5 text-sm font-medium text-slate-700 whitespace-nowrap">
                                  {getSingleMatchRuleRoundsLabel(rule)}
                                </td>
                                <td className="px-3 py-5">
                                  <p className="text-sm text-slate-700 whitespace-nowrap">{getSingleMatchRuleScoreLabel(rule)}</p>
                                </td>
                                <td className="px-3 py-5">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                      rule.swapAfterGame
                                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                        : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                    }`}
                                  >
                                    {rule.swapAfterGame ? '开启' : '关闭'}
                                  </span>
                                </td>
                                <td className="px-3 py-5">
                                  <p className="text-sm text-slate-600 whitespace-nowrap">{getSingleMatchRuleIntervalLabel(rule)}</p>
                                </td>
                                <td className="px-3 py-5">
                                  <p className="text-sm text-slate-600 whitespace-nowrap">{getSingleMatchRuleForfeitLabel(rule)}</p>
                                </td>
                                <td className="px-3 py-5 text-sm text-slate-500 whitespace-nowrap">{rule.createdAt}</td>
                                <td className="sticky right-0 z-10 bg-white px-3 py-5 shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)] transition-colors group-hover:bg-slate-50/60">
                                  <div className="flex justify-end gap-2 whitespace-nowrap">
                                    <button
                                      onClick={() => openEditSingleMatchRule(rule.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                    >
                                      <PencilLine className="h-4 w-4" />
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => deleteSingleMatchRule(rule.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      删除
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={11} className="px-8 py-16 text-center text-sm text-slate-500">
                                暂无符合条件的规则，试试调整检索条件后再查看。
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      total={filteredSingleMatchRules.length}
                      page={normalizedSingleMatchRulePage}
                      pageSize={singleMatchRulePageSize}
                      onPageChange={setSingleMatchRulePage}
                      onPageSizeChange={(size) => {
                        setSingleMatchRulePageSize(size);
                        setSingleMatchRulePage(1);
                      }}
                      itemLabel="条规则"
                      compact
                    />
                  </section>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setSingleMatchRulePageMode('list')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      返回规则列表
                    </button>
                    <button
                      onClick={saveSingleMatchRule}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                      保存
                    </button>
                  </div>

                  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">单项胜负规则配置</h3>
                          <p className="mt-1 text-sm text-slate-500">配置单项比赛的胜负判定方式、局制与局间规则。</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 px-8 py-8">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-600">规则名称</span>
                        <input
                          value={singleMatchRuleDraft.ruleName}
                          onChange={(event) =>
                            setSingleMatchRuleDraft((prev) => ({ ...prev, ruleName: event.target.value }))
                          }
                          placeholder="请输入"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        />
                      </label>

                      <div className="space-y-7">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">基础判定</p>
                          </div>
                          <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="space-y-3 rounded-2xl border border-white bg-white p-5">
                              <p className="text-sm font-medium text-slate-600">胜负判定方式</p>
                              <div className="flex flex-wrap gap-3">
                                {(['局分胜', '总分胜'] as const).map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() =>
                                      setSingleMatchRuleDraft((prev) => {
                                        const nextMatchFormat =
                                          option === '总分胜'
                                            ? '单局定胜负'
                                            : prev.matchFormat === '单局定胜负'
                                              ? '多局胜制'
                                              : prev.matchFormat;
                                        const nextGameCount = nextMatchFormat === '单局定胜负' ? 1 : Math.max(3, prev.totalGames);
                                        const nextWins = nextMatchFormat === '单局定胜负' ? 1 : Math.min(prev.gamesToWin || 2, nextGameCount);
                                        return {
                                          ...prev,
                                          outcomeMethod: option,
                                          matchFormat: nextMatchFormat,
                                          totalGames: nextGameCount,
                                          gamesToWin: nextWins,
                                          swapAfterGame: nextMatchFormat === '单局定胜负' ? false : prev.swapAfterGame,
                                          perGameScoreRuleIds: normalizePerGameScoreRuleIds(
                                            nextGameCount,
                                            prev.perGameScoreRuleIds,
                                            prev.globalScoreRuleId || scoreRules[0]?.id || 'SR001'
                                          ),
                                        };
                                      })
                                    }
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                      singleMatchRuleDraft.outcomeMethod === option
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                              <p className="text-sm leading-6 text-slate-500">
                                {singleMatchRuleDraft.outcomeMethod === '局分胜'
                                  ? '局分胜：以赢得的“局数”定胜负（如：2:1 获胜）。'
                                  : '总分胜：以全场累计的总分数定胜负（如：105:98 获胜）。'}
                              </p>
                            </div>

                            <div className="space-y-4 rounded-2xl border border-white bg-white p-5">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <p className="text-sm font-medium text-slate-600">比赛局制</p>
                                  <InteractionHelp
                                    prototypeMode={prototypeMode}
                                    content="【胜负依据 = 局分胜】时，【比赛局制】只能选择【多局胜制】和【固定局数】；【胜负依据 = 总分胜】时，【比赛局制】只能选择【单局定胜负】。"
                                  />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {(['多局胜制', '单局定胜负', '固定局数'] as const).map((option) => {
                                    const disabled =
                                      (singleMatchRuleDraft.outcomeMethod === '局分胜' && option === '单局定胜负') ||
                                      (singleMatchRuleDraft.outcomeMethod === '总分胜' && option !== '单局定胜负');

                                    return (
                                      <button
                                        key={option}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() =>
                                          setSingleMatchRuleDraft((prev) => {
                                            const nextGameCount = option === '单局定胜负' ? 1 : Math.max(prev.totalGames, 3);
                                            const nextWins =
                                              option === '单局定胜负'
                                                ? 1
                                                : option === '固定局数'
                                                  ? Math.min(prev.gamesToWin || 1, nextGameCount)
                                                  : Math.min(prev.gamesToWin || 2, nextGameCount);
                                            return {
                                              ...prev,
                                              matchFormat: option,
                                              totalGames: nextGameCount,
                                              gamesToWin: nextWins,
                                              swapAfterGame: option === '单局定胜负' ? false : prev.swapAfterGame,
                                              perGameScoreRuleIds: normalizePerGameScoreRuleIds(
                                                nextGameCount,
                                                prev.perGameScoreRuleIds,
                                                prev.globalScoreRuleId || scoreRules[0]?.id || 'SR001'
                                              ),
                                            };
                                          })
                                        }
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                          singleMatchRuleDraft.matchFormat === option
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : disabled
                                              ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                      >
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {singleMatchRuleDraft.matchFormat !== '单局定胜负' && (
                                <div className="space-y-3 border-t border-slate-100 pt-4">
                                  <p className="text-sm font-medium text-slate-600">局数设置</p>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                                    <span>打</span>
                                    <input
                                      type="number"
                                      min={1}
                                      value={singleMatchRuleDraft.totalGames}
                                      onChange={(event) =>
                                        setSingleMatchRuleDraft((prev) => {
                                          const totalGames = Number(event.target.value || 1);
                                          return {
                                            ...prev,
                                            totalGames,
                                            gamesToWin: Math.min(prev.gamesToWin, totalGames),
                                            perGameScoreRuleIds: normalizePerGameScoreRuleIds(
                                              totalGames,
                                              prev.perGameScoreRuleIds,
                                              prev.globalScoreRuleId || scoreRules[0]?.id || 'SR001'
                                            ),
                                          };
                                        })
                                      }
                                      className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    />
                                    <span>局，</span>
                                    {singleMatchRuleDraft.matchFormat === '多局胜制' && <span>先赢</span>}
                                    {singleMatchRuleDraft.matchFormat === '固定局数' && <span>赢</span>}
                                    <input
                                      type="number"
                                      min={1}
                                      value={singleMatchRuleDraft.gamesToWin}
                                      onChange={(event) =>
                                        setSingleMatchRuleDraft((prev) => ({
                                          ...prev,
                                          gamesToWin: Number(event.target.value || 1),
                                        }))
                                      }
                                      className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    />
                                    <span>局为胜</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">计分与场间规则</p>
                          </div>
                          <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="space-y-3 rounded-2xl border border-white bg-white p-5">
                              <p className="text-sm font-medium text-slate-600">局内计分规则</p>
                              <div className="flex flex-wrap gap-3">
                                {[
                                  { key: 'global', label: '全局统一' },
                                  { key: 'per-game', label: '分局自定义' },
                                ].map((option) => (
                                  <button
                                    key={option.key}
                                    type="button"
                                    onClick={() =>
                                      setSingleMatchRuleDraft((prev) => ({
                                        ...prev,
                                        scoreRuleMode: option.key as 'global' | 'per-game',
                                        perGameScoreRuleIds: normalizePerGameScoreRuleIds(
                                          getSingleMatchRuleGameCount(prev),
                                          prev.perGameScoreRuleIds,
                                          prev.globalScoreRuleId || scoreRules[0]?.id || 'SR001'
                                        ),
                                      }))
                                    }
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                      singleMatchRuleDraft.scoreRuleMode === option.key
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>

                              {singleMatchRuleDraft.scoreRuleMode === 'global' ? (
                                <label className="block max-w-md space-y-2">
                                  <span className="text-sm font-medium text-slate-600">关联计分规则</span>
                                  <select
                                    value={singleMatchRuleDraft.globalScoreRuleId}
                                    onChange={(event) =>
                                      setSingleMatchRuleDraft((prev) => ({
                                        ...prev,
                                        globalScoreRuleId: event.target.value,
                                        perGameScoreRuleIds: normalizePerGameScoreRuleIds(
                                          getSingleMatchRuleGameCount(prev),
                                          prev.perGameScoreRuleIds,
                                          event.target.value
                                        ),
                                      }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                  >
                                    {scoreRules.map((rule) => (
                                      <option key={rule.id} value={rule.id}>
                                        {rule.ruleName}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                  {Array.from({ length: getSingleMatchRuleGameCount(singleMatchRuleDraft) }, (_, index) => (
                                    <label key={`game-${index + 1}`} className="block space-y-2">
                                      <span className="text-sm font-medium text-slate-600">第 {index + 1} 局计分规则</span>
                                      <select
                                        value={
                                          singleMatchRuleDraft.perGameScoreRuleIds[index] ||
                                          singleMatchRuleDraft.globalScoreRuleId
                                        }
                                        onChange={(event) =>
                                          setSingleMatchRuleDraft((prev) => {
                                            const nextIds = [...normalizePerGameScoreRuleIds(
                                              getSingleMatchRuleGameCount(prev),
                                              prev.perGameScoreRuleIds,
                                              prev.globalScoreRuleId || scoreRules[0]?.id || 'SR001'
                                            )];
                                            nextIds[index] = event.target.value;
                                            return {
                                              ...prev,
                                              perGameScoreRuleIds: nextIds,
                                            };
                                          })
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                      >
                                        {scoreRules.map((rule) => (
                                          <option key={rule.id} value={rule.id}>
                                            {rule.ruleName}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>

                            {singleMatchRuleDraft.matchFormat !== '单局定胜负' && (
                              <div className="space-y-3 rounded-2xl border border-white bg-white p-5">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-sm font-medium text-slate-600">每局结束交换场区</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSingleMatchRuleDraft((prev) => ({
                                        ...prev,
                                        swapAfterGame: !prev.swapAfterGame,
                                      }))
                                    }
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full px-2 text-xs font-semibold transition-all ${
                                      singleMatchRuleDraft.swapAfterGame ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                                    }`}
                                    >
                                      <span>{singleMatchRuleDraft.swapAfterGame ? '开' : '关'}</span>
                                      <span
                                      className={`absolute h-6 w-6 rounded-full bg-white shadow transition-all ${
                                        singleMatchRuleDraft.swapAfterGame ? 'right-1' : 'left-1'
                                      }`}
                                    />
                                  </button>
                                  <InteractionHelp
                                    prototypeMode={prototypeMode}
                                    content="【每局结束交换场地 = 开启】时，支持设置【局间间歇】，默认写入60秒。"
                                  />
                                </div>

                                {singleMatchRuleDraft.swapAfterGame && (
                                  <div className="space-y-3 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-5">
                                    <p className="text-sm font-medium text-slate-600">局间休息</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                                      <label className="inline-flex items-center gap-2">
                                        <input
                                          type="radio"
                                          checked={singleMatchRuleDraft.intervalRestEnabled}
                                          onChange={() =>
                                            setSingleMatchRuleDraft((prev) => ({ ...prev, intervalRestEnabled: true }))
                                          }
                                        />
                                        <span>是</span>
                                      </label>
                                      {singleMatchRuleDraft.intervalRestEnabled && (
                                        <>
                                          <span>局间休息</span>
                                          <input
                                            type="number"
                                            min={1}
                                            value={singleMatchRuleDraft.intervalRestSeconds}
                                            onChange={(event) =>
                                              setSingleMatchRuleDraft((prev) => ({
                                                ...prev,
                                                intervalRestSeconds: Number(event.target.value || 0),
                                              }))
                                            }
                                            className="w-36 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                          />
                                          <span>秒</span>
                                        </>
                                      )}
                                      <label className="inline-flex items-center gap-2">
                                        <input
                                          type="radio"
                                          checked={!singleMatchRuleDraft.intervalRestEnabled}
                                          onChange={() =>
                                            setSingleMatchRuleDraft((prev) => ({ ...prev, intervalRestEnabled: false }))
                                          }
                                        />
                                        <span>否</span>
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">异常赛果规则设置</p>
                          </div>
                          <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="space-y-3 rounded-2xl border border-white bg-white p-5">
                              <p className="text-sm font-medium text-slate-600">弃权判定结果</p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                                <span>胜局补偿</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={singleMatchRuleDraft.forfeitWinGames}
                                  onChange={(event) =>
                                    setSingleMatchRuleDraft((prev) => ({
                                      ...prev,
                                      forfeitWinGames: Number(event.target.value || 0),
                                    }))
                                  }
                                  className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                                <span>局，每局小分补偿</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={singleMatchRuleDraft.forfeitPointsPerGame}
                                  onChange={(event) =>
                                    setSingleMatchRuleDraft((prev) => ({
                                      ...prev,
                                      forfeitPointsPerGame: Number(event.target.value || 0),
                                    }))
                                  }
                                  className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                                <span>分</span>
                              </div>
                              <p className="text-sm leading-6 text-slate-400">
                                胜局补偿填入 {singleMatchRuleDraft.forfeitWinGames}，代表弃权即判定另一方 {singleMatchRuleDraft.forfeitWinGames}:0 获胜；每局小分补偿填入{singleMatchRuleDraft.forfeitPointsPerGame}，即每一局比分为：{singleMatchRuleDraft.forfeitPointsPerGame}:0。
                              </p>
                            </div>

                            <div className="space-y-3 rounded-2xl border border-white bg-white p-5">
                              <p className="text-sm font-medium text-slate-600">退赛判定结果</p>
                              <div className="overflow-hidden rounded-2xl border border-slate-200">
                                <div className="grid grid-cols-[220px_minmax(0,1fr)] border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                                  <div className="px-5 py-4">场景</div>
                                  <div className="border-l border-slate-200 px-5 py-4">规则说明</div>
                                </div>
                                <div className="grid grid-cols-[220px_minmax(0,1fr)] border-b border-slate-200 text-sm text-slate-600">
                                  <div className="px-5 py-5 font-medium text-slate-700">当前中断局补分逻辑</div>
                                  <div className="border-l border-slate-200 px-5 py-5 leading-7">
                                    <p>• 获胜方：自动补齐至当前局的目标分（例如从 10 分补到 21 分）</p>
                                    <p>• 负方（退赛方）：保留退赛瞬间的实际得分（例如 5 分），本局结果为 21:5</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-[220px_minmax(0,1fr)] text-sm text-slate-600">
                                  <div className="px-5 py-5 font-medium text-slate-700">后续未开赛局补偿</div>
                                  <div className="border-l border-slate-200 px-5 py-5 leading-7">
                                    若此时获胜方尚未赢得整场比赛（如 BO3 刚打完 1 局），则剩余局次自动引用上方的“弃权判定”分值进行填充（例如补一局 {singleMatchRuleDraft.forfeitPointsPerGame}:0），直到获胜方达到规则要求的获胜局数。
                                  </div>
                                </div>
                              </div>
                            </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </section>
                </div>
              )
            ) : adminActiveMenu === 'team-battle-rule-template' ? (
              teamBattleRulePageMode === 'list' ? (
                <div className="mx-auto w-full max-w-7xl min-w-0">
                  <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">团体对抗规则</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            统一维护团体项目中 Tie 的整场对抗方式、获胜条件与比赛结束策略。
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openCreateTeamBattleRule}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
                        添加规则
                      </button>
                    </div>

                    <div className="border-b border-slate-100 px-8 py-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative min-w-[280px]">
                          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={teamBattleRuleSearchDraft}
                            onChange={(event) => setTeamBattleRuleSearchDraft(event.target.value)}
                            placeholder="检索规则名称"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                        <button
                          onClick={applyTeamBattleRuleSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          筛选
                        </button>
                        <button
                          onClick={resetTeamBattleRuleSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          重置
                        </button>
                      </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                      <table className="min-w-[1380px] w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-white">
                            <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">规则ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">规则名称</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">胜负判定方式</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">总场数/胜利规则</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">单场胜负规则</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">创建时间</th>
                            <th className="sticky right-0 z-10 bg-white px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedTeamBattleRules.length > 0 ? (
                            pagedTeamBattleRules.map((rule) => (
                              <tr key={rule.id} className="group align-top transition-colors hover:bg-slate-50/60">
                                <td className="px-8 py-6 text-sm font-medium text-slate-500 whitespace-nowrap">{rule.id}</td>
                                <td className="px-6 py-6">
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{rule.ruleName}</p>
                                    <p className="text-xs text-slate-400 whitespace-nowrap">{getTeamBattleRuleStrategyLabel(rule.endStrategy)}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-6">
                                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 whitespace-nowrap">
                                    {rule.outcomeMethod}
                                  </span>
                                </td>
                                <td className="px-6 py-6 text-sm font-medium text-slate-700 whitespace-nowrap">
                                  {getTeamBattleRuleWinsLabel(rule)}
                                </td>
                                <td className="px-6 py-6">
                                  <p
                                    className="max-w-[340px] truncate text-sm text-slate-600"
                                    title={getTeamBattleRuleSingleMatchSummary(rule)}
                                  >
                                    {getTeamBattleRuleSingleMatchSummary(rule)}
                                  </p>
                                </td>
                                <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{rule.createdAt}</td>
                                <td className="sticky right-0 z-10 bg-white px-8 py-6 shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)] transition-colors group-hover:bg-slate-50/60">
                                  <div className="flex flex-nowrap justify-end gap-2">
                                    <button
                                      onClick={() => openEditTeamBattleRule(rule.id)}
                                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                    >
                                      <PencilLine className="h-4 w-4" />
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => deleteTeamBattleRule(rule.id)}
                                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      删除
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-8 py-16 text-center text-sm text-slate-500">
                                暂无符合条件的规则，试试调整检索条件后再查看。
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      total={filteredTeamBattleRules.length}
                      page={normalizedTeamBattleRulePage}
                      pageSize={teamBattleRulePageSize}
                      onPageChange={setTeamBattleRulePage}
                      onPageSizeChange={(size) => {
                        setTeamBattleRulePageSize(size);
                        setTeamBattleRulePage(1);
                      }}
                      itemLabel="条规则"
                      compact
                    />
                  </section>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setTeamBattleRulePageMode('list')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      返回规则列表
                    </button>
                    <button
                      onClick={saveTeamBattleRule}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                      保存
                    </button>
                  </div>

                  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">团体对抗规则配置</h3>
                          <p className="mt-1 text-sm text-slate-500">配置团体项目中 Tie 的判胜方式、单场引用规则和比赛结束策略。</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 px-8 py-8">
                      <label className="block max-w-3xl space-y-2">
                        <span className="text-sm font-medium text-slate-600">规则名称</span>
                        <input
                          value={teamBattleRuleDraft.ruleName}
                          onChange={(event) =>
                            setTeamBattleRuleDraft((prev) => ({ ...prev, ruleName: event.target.value }))
                          }
                          placeholder="请输入"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        />
                      </label>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-semibold text-slate-700">对抗结构</p>
                        </div>
                        <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="space-y-3 rounded-2xl border border-white bg-white p-5">
                            <p className="text-sm font-medium text-slate-600">胜负判定方式</p>
                            <div className="flex flex-wrap gap-3">
                              {(['胜场制', '总分制'] as const).map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() =>
                                    setTeamBattleRuleDraft((prev) => ({
                                      ...prev,
                                      outcomeMethod: option,
                                      matchesToWin:
                                        option === '胜场制'
                                          ? prev.matchesToWin ?? Math.ceil(prev.totalMatches / 2)
                                          : null,
                                    }))
                                  }
                                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                    teamBattleRuleDraft.outcomeMethod === option
                                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                            <p className="text-sm leading-6 text-slate-500">
                              {teamBattleRuleDraft.outcomeMethod === '胜场制'
                                ? '胜场制：以赢得的场次数决定整场 Tie 胜负（如：5场3胜）。'
                                : '总分制：以整场团体对抗中所有单场累计总得分决定最终胜负。'}
                            </p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-600">总场数</span>
                              <input
                                type="number"
                                min={1}
                                value={teamBattleRuleDraft.totalMatches}
                                onChange={(event) =>
                                  setTeamBattleRuleDraft((prev) => {
                                    const totalMatches = Number(event.target.value || 1);
                                    return {
                                      ...prev,
                                      totalMatches,
                                      matchesToWin:
                                        prev.outcomeMethod === '胜场制'
                                          ? Math.min(prev.matchesToWin ?? Math.ceil(totalMatches / 2), totalMatches)
                                          : null,
                                      perMatchSingleMatchRuleIds: normalizeTeamBattlePerMatchRuleIds(
                                        totalMatches,
                                        prev.perMatchSingleMatchRuleIds,
                                        prev.singleMatchRuleId || singleMatchRules[0]?.id || 'SMR001'
                                      ),
                                    };
                                  })
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>

                            {teamBattleRuleDraft.outcomeMethod === '胜场制' && (
                              <label className="block space-y-2">
                                <span className="text-sm font-medium text-slate-600">获胜所需场次</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={teamBattleRuleDraft.totalMatches}
                                  value={teamBattleRuleDraft.matchesToWin ?? 1}
                                  onChange={(event) =>
                                    setTeamBattleRuleDraft((prev) => ({
                                      ...prev,
                                      matchesToWin: Number(event.target.value || 1),
                                    }))
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                              </label>
                            )}
                          </div>

                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                            当前规则将按 <span className="font-semibold text-slate-700">{getTeamBattleRuleWinsLabel(teamBattleRuleDraft)}</span> 进行 Tie 判胜。
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-semibold text-slate-700">单场胜负规则</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                              {[
                                { key: 'global', label: '全场统一' },
                                { key: 'per-match', label: '分场设置' },
                              ].map((option) => (
                                <button
                                  key={option.key}
                                  type="button"
                                  onClick={() =>
                                    setTeamBattleRuleDraft((prev) => ({
                                      ...prev,
                                      singleMatchRuleMode: option.key as TeamBattleSingleMatchRuleMode,
                                      perMatchSingleMatchRuleIds: normalizeTeamBattlePerMatchRuleIds(
                                        prev.totalMatches,
                                        prev.perMatchSingleMatchRuleIds,
                                        prev.singleMatchRuleId || singleMatchRules[0]?.id || 'SMR001'
                                      ),
                                    }))
                                  }
                                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                    teamBattleRuleDraft.singleMatchRuleMode === option.key
                                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>

                            {teamBattleRuleDraft.singleMatchRuleMode === 'global' ? (
                              <>
                                <label className="block max-w-xl space-y-2">
                                  <span className="text-sm font-medium text-slate-600">关联单项胜负规则</span>
                                  <select
                                    value={teamBattleRuleDraft.singleMatchRuleId}
                                    onChange={(event) =>
                                      setTeamBattleRuleDraft((prev) => ({
                                        ...prev,
                                        singleMatchRuleId: event.target.value,
                                        perMatchSingleMatchRuleIds: normalizeTeamBattlePerMatchRuleIds(
                                          prev.totalMatches,
                                          prev.perMatchSingleMatchRuleIds,
                                          event.target.value
                                        ),
                                      }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                  >
                                    {singleMatchRules.map((rule) => (
                                      <option key={rule.id} value={rule.id}>
                                        {rule.ruleName}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <p className="text-sm leading-6 text-slate-500">
                                  当前 Tie 中的每个单场，统一引用这条单项胜负规则。
                                </p>
                              </>
                            ) : (
                              <div className="grid gap-4 md:grid-cols-2">
                                {Array.from({ length: teamBattleRuleDraft.totalMatches }, (_, index) => (
                                  <label key={`team-battle-match-${index + 1}`} className="block space-y-2">
                                    <span className="text-sm font-medium text-slate-600">第 {index + 1} 场单项胜负规则</span>
                                    <select
                                      value={
                                        teamBattleRuleDraft.perMatchSingleMatchRuleIds[index] ||
                                        teamBattleRuleDraft.singleMatchRuleId
                                      }
                                      onChange={(event) =>
                                        setTeamBattleRuleDraft((prev) => {
                                          const nextIds = [
                                            ...normalizeTeamBattlePerMatchRuleIds(
                                              prev.totalMatches,
                                              prev.perMatchSingleMatchRuleIds,
                                              prev.singleMatchRuleId || singleMatchRules[0]?.id || 'SMR001'
                                            ),
                                          ];
                                          nextIds[index] = event.target.value;
                                          return {
                                            ...prev,
                                            perMatchSingleMatchRuleIds: nextIds,
                                          };
                                        })
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    >
                                      {singleMatchRules.map((rule) => (
                                        <option key={rule.id} value={rule.id}>
                                          {rule.ruleName}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-semibold text-slate-700">比赛结束策略</p>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-3">
                          {[
                            {
                              key: 'play-all' as const,
                              title: '打满全部比赛后结束',
                              description: '即使已经提前分出团体胜负，剩余场次仍需全部完成。',
                            },
                            {
                              key: 'finish-running' as const,
                              title: '分出胜负后已开赛场次继续',
                              description: '一旦团体胜负确定，未开始的场次不再进行；已开赛但未结束的场次继续完成。',
                            },
                            {
                              key: 'stop-immediately' as const,
                              title: '分出胜负后立即结束未完成场次',
                              description: '一旦团体胜负确定，未开始及未完成的场次均立即终止。',
                            },
                          ].map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => setTeamBattleRuleDraft((prev) => ({ ...prev, endStrategy: option.key }))}
                              className={`rounded-[24px] border px-5 py-5 text-left transition-all ${
                                teamBattleRuleDraft.endStrategy === option.key
                                  ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <p className="text-sm font-semibold text-slate-800">{option.title}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-500">{option.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )
            ) : adminActiveMenu === 'official-list' ? (
              technicalOfficialPageMode === 'list' ? (
                <div className="mx-auto w-full max-w-7xl min-w-0">
                  <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">技术官员列表</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            统一维护技术官员的档案资料、实名信息与证书信息，并支持处理小程序注册审核。
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openCreateTechnicalOfficial}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
                        新建技术官员
                      </button>
                    </div>

                    <div className="border-b border-slate-100 px-8 py-5">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-2 rounded-full bg-white p-1.5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 w-fit">
                          {[
                            { key: 'all' as const, label: '全部', count: technicalOfficialStatusCounts.all },
                            { key: 'pending' as const, label: '待审核', count: technicalOfficialStatusCounts.pending },
                            { key: 'approved' as const, label: '已通过', count: technicalOfficialStatusCounts.approved },
                            { key: 'rejected' as const, label: '已驳回', count: technicalOfficialStatusCounts.rejected },
                            { key: 'disabled' as const, label: '已停用', count: technicalOfficialStatusCounts.disabled },
                          ].map((tab) => (
                            <button
                              key={tab.key}
                              onClick={() => {
                                setTechnicalOfficialStatusFilter(tab.key);
                                setTechnicalOfficialPage(1);
                              }}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                                technicalOfficialStatusFilter === tab.key
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              {tab.label}
                              <span className={`ml-1.5 ${technicalOfficialStatusFilter === tab.key ? 'text-white/80' : 'text-slate-400'}`}>
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                          <div className="relative min-w-[280px]">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={technicalOfficialSearchDraft}
                              onChange={(event) => setTechnicalOfficialSearchDraft(event.target.value)}
                              placeholder="检索姓名 / 手机号 / 所属单位"
                              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                            />
                          </div>
                          <button
                            onClick={applyTechnicalOfficialSearch}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            筛选
                          </button>
                          <button
                            onClick={resetTechnicalOfficialSearch}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            重置
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                      <table className="min-w-[1460px] w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-white">
                            <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">姓名</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">手机号</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">实名信息</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">证书信息</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">审核状态</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">创建时间</th>
                            <th className="sticky right-0 z-10 w-[220px] bg-white px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedTechnicalOfficials.length > 0 ? (
                            pagedTechnicalOfficials.map((official) => (
                              <tr key={official.id} className="group align-top transition-colors hover:bg-slate-50/60">
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                      <UserCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{official.name}</p>
                                      <p className="mt-1 text-xs text-slate-400 whitespace-nowrap">
                                        {official.gender} · {official.region} · {official.organization}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-6 text-sm text-slate-700 whitespace-nowrap">{official.phone}</td>
                                <td className="px-6 py-6">
                                  <p className="text-sm text-slate-700 whitespace-nowrap">{official.realName || '未填写'}</p>
                                  <p className="mt-1 text-xs text-slate-400 whitespace-nowrap">
                                    {official.idType} · {maskIdNumber(official.idNumber)}
                                  </p>
                                </td>
                                <td className="px-6 py-6">
                                  <p className="text-sm text-slate-700 whitespace-nowrap">{getOfficialCertificateSummary(official)}</p>
                                  <p className="mt-1 text-xs text-slate-400 whitespace-nowrap">
                                    {official.certificates.length} 项证书
                                  </p>
                                </td>
                                <td className="px-6 py-6">
                                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getOfficialStatusClass(official.status)}`}>
                                    {getOfficialStatusLabel(official.status)}
                                  </span>
                                  <p className="mt-2 text-xs text-slate-400 whitespace-nowrap">{getOfficialSourceLabel(official.source)}</p>
                                </td>
                                <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{official.createdAt}</td>
                                <td className="sticky right-0 z-10 bg-white px-8 py-6 shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)] transition-colors group-hover:bg-slate-50">
                                  <div className="flex justify-end gap-2 whitespace-nowrap">
                                    {official.status === 'pending' && (
                                      <button
                                        onClick={() => openEditTechnicalOfficial(official.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 transition-all hover:text-amber-700"
                                      >
                                        <ShieldCheck className="h-4 w-4" />
                                        审核
                                      </button>
                                    )}
                                    <button
                                      onClick={() => openEditTechnicalOfficial(official.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                    >
                                      <PencilLine className="h-4 w-4" />
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => deleteTechnicalOfficial(official.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      删除
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-8 py-16 text-center text-sm text-slate-500">
                                暂无符合条件的技术官员记录，试试调整检索条件后再查看。
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      total={filteredTechnicalOfficials.length}
                      page={normalizedTechnicalOfficialPage}
                      pageSize={technicalOfficialPageSize}
                      onPageChange={setTechnicalOfficialPage}
                      onPageSizeChange={(size) => {
                        setTechnicalOfficialPageSize(size);
                        setTechnicalOfficialPage(1);
                      }}
                      itemLabel="位技术官员"
                      compact
                    />
                  </section>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTechnicalOfficialPageMode('list')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        返回列表
                      </button>
                      {technicalOfficialDraft.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              updateTechnicalOfficialStatus(
                                technicalOfficialDraft.id,
                                'approved',
                                '资料完整，审核通过。'
                              )
                            }
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
                          >
                            审核通过
                          </button>
                          <button
                            onClick={() =>
                              updateTechnicalOfficialStatus(
                                technicalOfficialDraft.id,
                                'rejected',
                                technicalOfficialDraft.reviewRemark || '请补充或修正实名/证书信息后重新提交。'
                              )
                            }
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-all hover:border-rose-300 hover:text-rose-700"
                          >
                            驳回
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={saveTechnicalOfficial}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                      保存
                    </button>
                  </div>

                  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">技术官员档案</h3>
                          <p className="mt-1 text-sm text-slate-500">维护技术官员的个人资料、实名信息与证书信息。</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 px-8 py-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-semibold text-slate-700">个人资料</p>
                        </div>
                        <div className="grid gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-3">
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">姓名</span>
                            <input
                              value={technicalOfficialDraft.name}
                              onChange={(event) => setTechnicalOfficialDraft((prev) => ({ ...prev, name: event.target.value }))}
                              placeholder="请输入"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">性别</span>
                            <select
                              value={technicalOfficialDraft.gender}
                              onChange={(event) =>
                                setTechnicalOfficialDraft((prev) => ({ ...prev, gender: event.target.value as '男' | '女' }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            >
                              <option value="男">男</option>
                              <option value="女">女</option>
                            </select>
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">手机号</span>
                            <input
                              value={technicalOfficialDraft.phone}
                              onChange={(event) => setTechnicalOfficialDraft((prev) => ({ ...prev, phone: event.target.value }))}
                              placeholder="请输入"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">所属地区</span>
                            <input
                              value={technicalOfficialDraft.region}
                              onChange={(event) => setTechnicalOfficialDraft((prev) => ({ ...prev, region: event.target.value }))}
                              placeholder="如：广东省 深圳市"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">所属单位/俱乐部</span>
                            <input
                              value={technicalOfficialDraft.organization}
                              onChange={(event) => setTechnicalOfficialDraft((prev) => ({ ...prev, organization: event.target.value }))}
                              placeholder="请输入"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">来源</span>
                            <select
                              value={technicalOfficialDraft.source}
                              onChange={(event) =>
                                setTechnicalOfficialDraft((prev) => ({ ...prev, source: event.target.value as OfficialSource }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            >
                              <option value="admin">后台新建</option>
                              <option value="mini-program">小程序注册</option>
                            </select>
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">状态</span>
                            <select
                              value={technicalOfficialDraft.status}
                              onChange={(event) =>
                                setTechnicalOfficialDraft((prev) => ({ ...prev, status: event.target.value as OfficialStatus }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            >
                              <option value="pending">待审核</option>
                              <option value="approved">已通过</option>
                              <option value="rejected">已驳回</option>
                              <option value="disabled">已停用</option>
                            </select>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-semibold text-slate-700">实名信息</p>
                        </div>
                        <div className="grid gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">证件姓名</span>
                            <input
                              value={technicalOfficialDraft.realName}
                              onChange={(event) => setTechnicalOfficialDraft((prev) => ({ ...prev, realName: event.target.value }))}
                              placeholder="请输入"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">证件类型</span>
                            <select
                              value={technicalOfficialDraft.idType}
                              onChange={(event) =>
                                setTechnicalOfficialDraft((prev) => ({
                                  ...prev,
                                  idType: event.target.value as TechnicalOfficialRow['idType'],
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            >
                              <option value="身份证">身份证</option>
                              <option value="护照">护照</option>
                              <option value="港澳居民来往内地通行证">港澳居民来往内地通行证</option>
                            </select>
                          </label>
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-600">证件号码</span>
                            <input
                              value={technicalOfficialDraft.idNumber}
                              onChange={(event) => setTechnicalOfficialDraft((prev) => ({ ...prev, idNumber: event.target.value }))}
                              placeholder="请输入"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">证书信息</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setTechnicalOfficialDraft((prev) => ({
                                ...prev,
                                certificates: [
                                  ...prev.certificates,
                                  {
                                    id: `CERT${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                                    sport: '',
                                    certificateName: '',
                                    level: '',
                                    certificateNo: '',
                                    issuer: '',
                                    issueDate: '',
                                    expireDate: '',
                                  },
                                ],
                              }))
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            新增证书
                          </button>
                        </div>
                        <div className="space-y-4">
                          {technicalOfficialDraft.certificates.map((certificate, index) => (
                            <div
                              key={certificate.id}
                              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                            >
                              <div className="mb-4 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-700">证书 {index + 1}</p>
                                <button
                                  type="button"
                                  disabled={technicalOfficialDraft.certificates.length === 1}
                                  onClick={() =>
                                    setTechnicalOfficialDraft((prev) => ({
                                      ...prev,
                                      certificates: prev.certificates.filter((item) => item.id !== certificate.id),
                                    }))
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  删除证书
                                </button>
                              </div>
                              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {[
                                  { key: 'sport', label: '运动项目', placeholder: '如：羽毛球' },
                                  { key: 'certificateName', label: '证书名称', placeholder: '请输入' },
                                  { key: 'level', label: '证书等级', placeholder: '请输入' },
                                  { key: 'certificateNo', label: '证书编号', placeholder: '请输入' },
                                  { key: 'issuer', label: '发证单位', placeholder: '请输入' },
                                  { key: 'issueDate', label: '发证日期', placeholder: '', type: 'date' },
                                  { key: 'expireDate', label: '有效期', placeholder: '', type: 'date' },
                                ].map((field) => (
                                  <label key={field.key} className="block space-y-2">
                                    <span className="text-sm font-medium text-slate-600">{field.label}</span>
                                    <input
                                      type={field.type || 'text'}
                                      value={certificate[field.key as keyof OfficialCertificate] as string}
                                      onChange={(event) =>
                                        setTechnicalOfficialDraft((prev) => ({
                                          ...prev,
                                          certificates: prev.certificates.map((item) =>
                                            item.id === certificate.id
                                              ? { ...item, [field.key]: event.target.value }
                                              : item
                                          ),
                                        }))
                                      }
                                      placeholder={field.placeholder}
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm font-semibold text-slate-700">审核备注</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                          <textarea
                            value={technicalOfficialDraft.reviewRemark}
                            onChange={(event) =>
                              setTechnicalOfficialDraft((prev) => ({ ...prev, reviewRemark: event.target.value }))
                            }
                            rows={4}
                            placeholder="可填写审核意见或档案备注"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )
            ) : adminActiveMenu === 'target-list' ? (
              targetListPageMode === 'list' ? (
                <div className="mx-auto w-full max-w-7xl min-w-0">
                  <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">目标清单</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            统一维护可复用的选手清单，后续可在赛事报名规则中按白名单或黑名单方式引用。
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openCreateTargetList}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
                        新建清单
                      </button>
                    </div>

                    <div className="border-b border-slate-100 px-8 py-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[260px]">
                          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={targetListSearchDraft}
                            onChange={(event) => setTargetListSearchDraft(event.target.value)}
                            placeholder="按清单名称检索"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                        <button
                          onClick={applyTargetListSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          筛选
                        </button>
                        <button
                          onClick={resetTargetListSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          重置
                        </button>
                      </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-white">
                            <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">目标清单名称</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">数量</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">最新更新</th>
                            <th className="px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedTargetLists.length > 0 ? (
                            pagedTargetLists.map((list) => (
                              <tr key={list.id} className="align-top transition-colors hover:bg-slate-50/60">
                                <td className="px-8 py-6">
                                  <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{list.name}</p>
                                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">{list.description}</p>
                                </td>
                                <td className="px-6 py-6">
                                  <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                    {list.members.length} 人
                                  </span>
                                </td>
                                <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{list.updatedAt}</td>
                                <td className="px-8 py-6">
                                  <div className="flex justify-end gap-2 whitespace-nowrap">
                                    <button
                                      onClick={() => openManageTargetList(list.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-all hover:text-emerald-700"
                                    >
                                      <Users className="h-4 w-4" />
                                      清单管理
                                    </button>
                                    <button
                                      onClick={() => openEditTargetList(list.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                    >
                                      <PencilLine className="h-4 w-4" />
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => deleteTargetList(list.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      删除
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-8 py-16 text-center text-sm text-slate-500">
                                暂无符合条件的目标清单，试试调整检索条件后再查看。
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      total={filteredTargetLists.length}
                      page={normalizedTargetListPage}
                      pageSize={targetListPageSize}
                      onPageChange={setTargetListPage}
                      onPageSizeChange={(size) => {
                        setTargetListPageSize(size);
                        setTargetListPage(1);
                      }}
                      itemLabel="张清单"
                      compact
                    />
                  </section>

                  <AnimatePresence>
                    {targetListEditorMode && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 16, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 16, scale: 0.98 }}
                          className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {targetListEditorMode === 'create' ? '新建目标清单' : '编辑目标清单'}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                维护一张可复用的选手清单，后续可在赛事里作为白名单或黑名单引用。
                              </p>
                            </div>
                            <button
                              onClick={() => setTargetListEditorMode(null)}
                              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="space-y-5 px-8 py-8">
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-600">清单名称</span>
                              <input
                                value={targetListDraft.name}
                                onChange={(event) =>
                                  setTargetListDraft((prev) => ({ ...prev, name: event.target.value }))
                                }
                                placeholder="请输入清单名称"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-600">清单说明</span>
                              <textarea
                                value={targetListDraft.description}
                                onChange={(event) =>
                                  setTargetListDraft((prev) => ({ ...prev, description: event.target.value }))
                                }
                                rows={4}
                                placeholder="说明这张清单的适用场景"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                          </div>
                          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5">
                            <button
                              onClick={() => setTargetListEditorMode(null)}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                              取消
                            </button>
                            <button
                              onClick={saveTargetList}
                              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                            >
                              保存
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={() => setTargetListPageMode('list')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      返回列表
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={openCreateTargetListMember}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
                        新增成员
                      </button>
                      <button
                        onClick={importTargetListMembers}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Upload className="h-4 w-4" />
                        导入
                      </button>
                      <button
                        onClick={exportTargetListMembers}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        导出
                      </button>
                      <button
                        onClick={clearTargetListMembers}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 transition-all hover:border-rose-300 hover:text-rose-700"
                      >
                        清空
                      </button>
                    </div>
                  </div>

                  {activeTargetList ? (
                    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                            <UserCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{activeTargetList.name}</h3>
                            <p className="mt-1 text-sm text-slate-500">{activeTargetList.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600">
                            当前共 {activeTargetList.members.length} 位成员
                          </span>
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                            最近更新 {activeTargetList.updatedAt}
                          </span>
                        </div>
                      </div>

                      <div className="border-b border-slate-100 px-8 py-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="relative min-w-[320px]">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={targetListMemberSearchDraft}
                              onChange={(event) => setTargetListMemberSearchDraft(event.target.value)}
                              placeholder="按选手姓名/手机号/证件号码检索"
                              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                            />
                          </div>
                          <button
                            onClick={applyTargetListMemberSearch}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            筛选
                          </button>
                          <button
                            onClick={resetTargetListMemberSearch}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            重置
                          </button>
                        </div>
                      </div>

                      <div className="max-w-full overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-slate-100 bg-white">
                              <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">选手姓名</th>
                              <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">手机号</th>
                              <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">证件类型</th>
                              <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">证件号码</th>
                              <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">最新更新</th>
                              <th className="px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pagedTargetListMembers.length > 0 ? (
                              pagedTargetListMembers.map((member) => (
                                <tr key={member.id} className="align-top transition-colors hover:bg-slate-50/60">
                                  <td className="px-8 py-6 text-sm font-semibold text-slate-900 whitespace-nowrap">
                                    {member.playerName}
                                  </td>
                                  <td className="px-6 py-6 text-sm text-slate-600 whitespace-nowrap">
                                    {member.phone || '未填写'}
                                  </td>
                                  <td className="px-6 py-6 text-sm text-slate-600 whitespace-nowrap">{member.idType}</td>
                                  <td className="px-6 py-6 text-sm text-slate-600 whitespace-nowrap">
                                    {maskIdNumber(member.idNumber)}
                                  </td>
                                  <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{member.updatedAt}</td>
                                  <td className="px-8 py-6">
                                    <div className="flex justify-end gap-2 whitespace-nowrap">
                                      <button
                                        onClick={() => openEditTargetListMember(member.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                      >
                                        <PencilLine className="h-4 w-4" />
                                        编辑
                                      </button>
                                      <button
                                        onClick={() => deleteTargetListMember(member.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        删除
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-8 py-16 text-center text-sm text-slate-500">
                                  当前清单暂无符合条件的成员记录，试试调整检索条件后再查看。
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <TablePagination
                        total={filteredTargetListMembers.length}
                        page={normalizedTargetListMemberPage}
                        pageSize={targetListMemberPageSize}
                        onPageChange={setTargetListMemberPage}
                        onPageSizeChange={(size) => {
                          setTargetListMemberPageSize(size);
                          setTargetListMemberPage(1);
                        }}
                        itemLabel="位成员"
                        compact
                      />
                    </section>
                  ) : (
                    <section className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center">
                      <p className="text-sm font-semibold text-slate-700">当前没有可管理的目标清单</p>
                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        你可以先返回列表页创建一张目标清单，再继续维护具体成员。
                      </p>
                    </section>
                  )}

                  <AnimatePresence>
                    {targetListMemberEditorMode && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 16, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 16, scale: 0.98 }}
                          className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {targetListMemberEditorMode === 'create' ? '新增清单成员' : '编辑清单成员'}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                维护选手的姓名、手机号与证件信息，用于后续赛事报名校验。
                              </p>
                            </div>
                            <button
                              onClick={() => setTargetListMemberEditorMode(null)}
                              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid gap-5 px-8 py-8 md:grid-cols-2">
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-600">选手姓名</span>
                              <input
                                value={targetListMemberDraft.playerName}
                                onChange={(event) =>
                                  setTargetListMemberDraft((prev) => ({ ...prev, playerName: event.target.value }))
                                }
                                placeholder="请输入"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-600">手机号</span>
                              <input
                                value={targetListMemberDraft.phone}
                                onChange={(event) =>
                                  setTargetListMemberDraft((prev) => ({ ...prev, phone: event.target.value }))
                                }
                                placeholder="请输入"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-600">证件类型</span>
                              <select
                                value={targetListMemberDraft.idType}
                                onChange={(event) =>
                                  setTargetListMemberDraft((prev) => ({
                                    ...prev,
                                    idType: event.target.value as TargetListMemberRow['idType'],
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              >
                                <option value="身份证">身份证</option>
                                <option value="护照">护照</option>
                                <option value="港澳居民来往内地通行证">港澳居民来往内地通行证</option>
                              </select>
                            </label>
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-600">证件号码</span>
                              <input
                                value={targetListMemberDraft.idNumber}
                                onChange={(event) =>
                                  setTargetListMemberDraft((prev) => ({ ...prev, idNumber: event.target.value }))
                                }
                                placeholder="请输入"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                          </div>
                          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5">
                            <button
                              onClick={() => setTargetListMemberEditorMode(null)}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                              取消
                            </button>
                            <button
                              onClick={saveTargetListMember}
                              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                            >
                              保存
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            ) : adminActiveMenu === 'registration-template' ? (
              registrationTemplatePageMode === 'list' ? (
                <div className="mx-auto w-full max-w-7xl min-w-0">
                  <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">报名模板</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            统一维护用户报名时需要填写的字段，支持从选手档案映射基础资料，并补充赛事自定义信息。
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openCreateRegistrationTemplate}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
                        新建模板
                      </button>
                    </div>

                    <div className="border-b border-slate-100 px-8 py-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[260px]">
                          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={registrationTemplateSearchDraft}
                            onChange={(event) => setRegistrationTemplateSearchDraft(event.target.value)}
                            placeholder="按模板名称或说明检索"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                        <button
                          onClick={applyRegistrationTemplateSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          筛选
                        </button>
                        <button
                          onClick={resetRegistrationTemplateSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          重置
                        </button>
                      </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-white">
                            <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">模板ID</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">模板名称</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">模板说明</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">字段数量</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">最近更新</th>
                            <th className="px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedRegistrationTemplates.length > 0 ? (
                            pagedRegistrationTemplates.map((template) => (
                              <tr key={template.id} className="align-top transition-colors hover:bg-slate-50/60">
                                <td className="px-8 py-6 text-sm font-medium text-slate-500 whitespace-nowrap">{template.id}</td>
                                <td className="px-6 py-6">
                                  <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{template.name}</p>
                                </td>
                                <td className="px-6 py-6 text-sm leading-7 text-slate-600">{template.description}</td>
                                <td className="px-6 py-6">
                                  <span className="inline-flex whitespace-nowrap rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                    {template.fields.length} 个字段
                                  </span>
                                </td>
                                <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{template.updatedAt}</td>
                                <td className="px-8 py-6">
                                  <div className="flex justify-end gap-2 whitespace-nowrap">
                                    <button
                                      onClick={() => openEditRegistrationTemplate(template.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                    >
                                      <PencilLine className="h-4 w-4" />
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => duplicateRegistrationTemplate(template.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600 transition-all hover:text-violet-700"
                                    >
                                      <ClipboardList className="h-4 w-4" />
                                      复制
                                    </button>
                                    <button
                                      onClick={() => deleteRegistrationTemplate(template.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      删除
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-8 py-16 text-center text-sm text-slate-500">
                                暂无符合条件的报名模板，试试调整检索条件后再查看。
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      total={filteredRegistrationTemplates.length}
                      page={normalizedRegistrationTemplatePage}
                      pageSize={registrationTemplatePageSize}
                      onPageChange={setRegistrationTemplatePage}
                      onPageSizeChange={(size) => {
                        setRegistrationTemplatePageSize(size);
                        setRegistrationTemplatePage(1);
                      }}
                      itemLabel="个模板"
                      compact
                    />
                  </section>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={() => setRegistrationTemplatePageMode('list')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      返回列表
                    </button>
                    <button
                      onClick={saveRegistrationTemplate}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                      保存
                    </button>
                  </div>

                  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">报名模板配置</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            通过选手档案映射字段和自定义字段组合出报名表，减少用户重复录入基础资料。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                      <div className="space-y-8 min-w-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">模板基础信息</p>
                          </div>
                          <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                            <label className="block max-w-3xl space-y-2">
                              <span className="text-sm font-medium text-slate-600">模板名称</span>
                              <input
                                value={registrationTemplateDraft.name}
                                onChange={(event) =>
                                  setRegistrationTemplateDraft((prev) => ({ ...prev, name: event.target.value }))
                                }
                                placeholder="请输入模板名称"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="block max-w-4xl space-y-2">
                              <span className="text-sm font-medium text-slate-600">模板说明</span>
                              <textarea
                                value={registrationTemplateDraft.description}
                                onChange={(event) =>
                                  setRegistrationTemplateDraft((prev) => ({ ...prev, description: event.target.value }))
                                }
                                placeholder="说明这个模板适用于什么报名场景"
                                rows={4}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-indigo-500" />
                              <p className="text-sm font-semibold text-slate-700">模板字段配置</p>
                            </div>
                            <button
                              onClick={addCustomFieldToTemplate}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                              新增自定义字段
                            </button>
                          </div>
                          <div className="space-y-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4">
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm font-medium text-slate-700">从选手档案添加字段</p>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                                  已选 {selectedRegistrationProfileKeys.length} 个档案字段
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {REGISTRATION_TEMPLATE_PROFILE_FIELDS.map((fieldMeta) => {
                                  const isSelected = selectedRegistrationProfileKeys.includes(fieldMeta.key);
                                  return (
                                    <button
                                      key={fieldMeta.key}
                                      type="button"
                                      onClick={() => addProfileFieldToTemplate(fieldMeta.key)}
                                      disabled={isSelected}
                                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                        isSelected
                                          ? 'cursor-not-allowed border border-indigo-100 bg-indigo-50 text-indigo-400'
                                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                      }`}
                                    >
                                      {fieldMeta.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-4">
                              {registrationTemplateDraft.fields.length > 0 ? (
                                registrationTemplateDraft.fields.map((field, index) => (
                                  <div
                                    key={field.id}
                                    className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                                  >
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-indigo-600 px-2 text-xs font-bold text-white">
                                          {index + 1}
                                        </span>
                                        <span
                                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                            field.source === 'profile'
                                              ? 'bg-indigo-50 text-indigo-600'
                                              : 'bg-emerald-50 text-emerald-600'
                                          }`}
                                        >
                                          {field.source === 'profile' ? '档案映射字段' : '自定义字段'}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap justify-end gap-2">
                                        <button
                                          type="button"
                                          disabled={index === 0}
                                          onClick={() => moveRegistrationTemplateField(field.id, 'up')}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                          上移
                                        </button>
                                        <button
                                          type="button"
                                          disabled={index === registrationTemplateDraft.fields.length - 1}
                                          onClick={() => moveRegistrationTemplateField(field.id, 'down')}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                          下移
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeRegistrationTemplateField(field.id)}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          删除
                                        </button>
                                      </div>
                                    </div>

                                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                                      <div className="space-y-5">
                                        <label className="block space-y-2">
                                          <span className="text-sm font-medium text-slate-600">字段名称</span>
                                          <input
                                            value={field.label}
                                            onChange={(event) =>
                                              updateRegistrationTemplateField(field.id, (current) => ({
                                                ...current,
                                                label: event.target.value,
                                              }))
                                            }
                                            placeholder="请输入字段名称"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                          />
                                        </label>
                                        <div className="grid gap-5 md:grid-cols-2">
                                          <label className="block space-y-2">
                                            <span className="text-sm font-medium text-slate-600">字段类型</span>
                                            {field.source === 'profile' ? (
                                              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700">
                                                {getRegistrationTemplateFieldTypeLabel(field.fieldType)}
                                              </div>
                                            ) : (
                                              <select
                                                value={field.fieldType}
                                                onChange={(event) =>
                                                  updateRegistrationTemplateField(field.id, (current) => ({
                                                    ...current,
                                                    fieldType: event.target.value as RegistrationTemplateFieldType,
                                                    options:
                                                      event.target.value === 'select' ? current.options : [],
                                                  }))
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                              >
                                                <option value="text">单行文本</option>
                                                <option value="phone">手机号</option>
                                                <option value="date">日期</option>
                                                <option value="select">单选</option>
                                              </select>
                                            )}
                                          </label>
                                          {field.source === 'profile' && field.profileKey ? (
                                            <div className="space-y-2">
                                              <span className="text-sm font-medium text-slate-600">映射字段</span>
                                              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700">
                                                {getRegistrationTemplateProfileFieldMeta(field.profileKey).label}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              <span className="text-sm font-medium text-slate-600">映射字段</span>
                                              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400">
                                                自定义字段无需映射
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <label className="block space-y-2">
                                          <span className="text-sm font-medium text-slate-600">占位提示</span>
                                          <input
                                            value={field.placeholder}
                                            onChange={(event) =>
                                              updateRegistrationTemplateField(field.id, (current) => ({
                                                ...current,
                                                placeholder: event.target.value,
                                              }))
                                            }
                                            placeholder="请输入占位提示"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                          />
                                        </label>
                                        {field.fieldType === 'select' && (
                                          <label className="block space-y-2">
                                            <span className="text-sm font-medium text-slate-600">选项值</span>
                                            <input
                                              value={field.options.join('，')}
                                              onChange={(event) =>
                                                updateRegistrationTemplateField(field.id, (current) => ({
                                                  ...current,
                                                  options: event.target.value
                                                    .split(/[，,]/)
                                                    .map((item) => item.trim())
                                                    .filter(Boolean),
                                                }))
                                              }
                                              placeholder="多个选项请用逗号分隔"
                                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                            />
                                          </label>
                                        )}
                                      </div>

                                      <div className="pt-1">
                                        <p className="text-sm font-medium text-slate-600">字段行为</p>
                                        <div className="mt-3 space-y-3">
                                          {[
                                            {
                                              key: 'required',
                                              label: '必填',
                                              checked: field.required,
                                            },
                                            {
                                              key: 'editable',
                                              label: '报名时可修改',
                                              checked: field.editable,
                                            },
                                            {
                                              key: 'enabled',
                                              label: '启用字段',
                                              checked: field.enabled,
                                            },
                                          ].map((toggleItem) => (
                                            <button
                                              key={toggleItem.key}
                                              type="button"
                                              onClick={() =>
                                                updateRegistrationTemplateField(field.id, (current) => ({
                                                  ...current,
                                                  [toggleItem.key]: !current[toggleItem.key as keyof RegistrationTemplateField],
                                                }))
                                              }
                                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                                toggleItem.checked
                                                  ? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
                                                  : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                              }`}
                                            >
                                              <span>{toggleItem.label}</span>
                                              <span
                                                className={`inline-flex h-6 min-w-[44px] items-center rounded-full p-1 transition-all ${
                                                  toggleItem.checked ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                                                }`}
                                              >
                                                <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                                  当前模板还没有字段，请先从选手档案添加字段，或新增自定义字段。
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <aside className="xl:sticky xl:top-6 self-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">用户侧移动端预览</p>
                          </div>
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                            <div className="mx-auto w-[320px] rounded-[36px] bg-slate-900 p-3 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.45)]">
                              <div className="overflow-hidden rounded-[28px] bg-white">
                                <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 px-5 pb-6 pt-5 text-white">
                                  <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-white/35" />
                                  <p className="text-xs font-medium text-white/75">赛事报名</p>
                                  <h4 className="mt-2 text-xl font-bold leading-tight">
                                    {registrationTemplateDraft.name || '报名模板名称'}
                                  </h4>
                                  <p className="mt-2 text-sm leading-6 text-white/85">
                                    {registrationTemplateDraft.description || '这里会展示模板说明，帮助用户理解需要填写哪些报名信息。'}
                                  </p>
                                </div>

                                <div className="max-h-[560px] space-y-4 overflow-y-auto px-4 py-5">
                                  <div className="rounded-[20px] border border-indigo-100 bg-indigo-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
                                      选手档案
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-slate-800">从我的选手库中选择报名人</p>
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-indigo-100">
                                      已选择常用选手档案
                                    </div>
                                  </div>

                                  {registrationTemplatePreviewFields.length > 0 ? (
                                    registrationTemplatePreviewFields.map((field) => (
                                      <div
                                        key={`preview-mobile-${field.id}`}
                                        className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-sm"
                                      >
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                                          {field.required && (
                                            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-500">
                                              必填
                                            </span>
                                          )}
                                          <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                              field.source === 'profile'
                                                ? 'bg-indigo-50 text-indigo-500'
                                                : 'bg-emerald-50 text-emerald-500'
                                            }`}
                                          >
                                            {field.source === 'profile' ? '档案映射' : '自定义'}
                                          </span>
                                        </div>
                                        <div className="mt-3">
                                          {field.fieldType === 'select' ? (
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                                              {field.options.length > 0 ? `请选择：${field.options.join(' / ')}` : '请选择'}
                                            </div>
                                          ) : (
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                                              {field.placeholder || '请输入'}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                                      当前没有启用字段，移动端预览会在添加字段后展示。
                                    </div>
                                  )}

                                  <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 px-4 py-4">
                                    <p className="text-sm font-semibold text-emerald-700">提交效果</p>
                                    <p className="mt-2 text-sm leading-6 text-emerald-600">
                                      用户确认档案映射信息并补充自定义字段后，即可提交本次报名表。
                                    </p>
                                    <button
                                      type="button"
                                      className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100"
                                    >
                                      提交报名
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </section>
                </div>
              )
            ) : adminActiveMenu === 'agreement-management' ? (
              agreementPageMode === 'list' ? (
                <div className="mx-auto w-full max-w-7xl min-w-0">
                  <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">协议管理</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            统一维护赛事报名会用到的协议模板，支持在正文中插入赛事、选手与签署相关变量。
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openCreateAgreementTemplate}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                      >
                        新建协议
                      </button>
                    </div>

                    <div className="border-b border-slate-100 px-8 py-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[260px]">
                          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={agreementSearchDraft}
                            onChange={(event) => setAgreementSearchDraft(event.target.value)}
                            placeholder="按协议名称检索"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                        <button
                          onClick={applyAgreementSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          筛选
                        </button>
                        <button
                          onClick={resetAgreementSearch}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                          重置
                        </button>
                      </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-white">
                            <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">协议名称</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">协议类型</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">变量数量</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">最近更新</th>
                            <th className="px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pagedAgreementTemplates.length > 0 ? (
                            pagedAgreementTemplates.map((agreement) => (
                              <tr key={agreement.id} className="align-top transition-colors hover:bg-slate-50/60">
                                <td className="px-8 py-6">
                                  <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{agreement.name}</p>
                                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 line-clamp-2">{agreement.content}</p>
                                </td>
                                <td className="px-6 py-6">
                                  <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 whitespace-nowrap">
                                    {agreement.category}
                                  </span>
                                </td>
                                <td className="px-6 py-6">
                                  <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {extractAgreementVariableKeys(agreement.content).length} 个变量
                                  </span>
                                </td>
                                <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{agreement.updatedAt}</td>
                                <td className="px-8 py-6">
                                  <div className="flex justify-end gap-2 whitespace-nowrap">
                                    <button
                                      onClick={() => openEditAgreementTemplate(agreement.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                                    >
                                      <PencilLine className="h-4 w-4" />
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => deleteAgreementTemplate(agreement.id)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition-all hover:text-rose-600"
                                    >
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
                                暂无符合条件的协议模板，试试调整检索条件后再查看。
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      total={filteredAgreementTemplates.length}
                      page={normalizedAgreementPage}
                      pageSize={agreementPageSize}
                      onPageChange={setAgreementPage}
                      onPageSizeChange={(size) => {
                        setAgreementPageSize(size);
                        setAgreementPage(1);
                      }}
                      itemLabel="份协议"
                      compact
                    />
                  </section>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={() => setAgreementPageMode('list')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      返回列表
                    </button>
                    <button
                      onClick={saveAgreementTemplate}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                      保存
                    </button>
                  </div>

                  <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">协议模板配置</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            维护协议正文并插入系统变量，后续可在赛事详情的协议签约中直接选择引用。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="min-w-0 space-y-8">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">协议基础信息</p>
                          </div>
                          <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                            <label className="block max-w-3xl space-y-2">
                              <span className="text-sm font-medium text-slate-600">协议名称</span>
                              <input
                                value={agreementDraft.name}
                                onChange={(event) =>
                                  setAgreementDraft((prev) => ({ ...prev, name: event.target.value }))
                                }
                                placeholder="请输入协议名称"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              />
                            </label>
                            <label className="block max-w-sm space-y-2">
                              <span className="text-sm font-medium text-slate-600">协议类型</span>
                              <select
                                value={agreementDraft.category}
                                onChange={(event) =>
                                  setAgreementDraft((prev) => ({
                                    ...prev,
                                    category: event.target.value as AgreementCategory,
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                              >
                                <option value="报名协议">报名协议</option>
                                <option value="免责声明">免责声明</option>
                                <option value="隐私授权">隐私授权</option>
                              </select>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-indigo-500" />
                              <p className="text-sm font-semibold text-slate-700">协议正文</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              已使用 {extractAgreementVariableKeys(agreementDraft.content).length} 个变量
                            </span>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                            <textarea
                              value={agreementDraft.content}
                              onChange={(event) =>
                                setAgreementDraft((prev) => ({ ...prev, content: event.target.value }))
                              }
                              rows={16}
                              placeholder="请输入协议正文内容，可从右侧变量库插入变量。"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            />
                          </div>
                        </div>
                      </div>

                      <aside className="space-y-6 xl:sticky xl:top-6 self-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">变量库</p>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="space-y-5">
                              {(['赛事变量', '选手变量', '签署变量'] as AgreementVariableCategory[]).map((category) => (
                                <div key={category} className="space-y-3">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{category}</p>
                                  <div className="space-y-2">
                                    {AGREEMENT_VARIABLE_LIBRARY.filter((item) => item.category === category).map((item) => (
                                      <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => insertAgreementVariable(item.key)}
                                        className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50"
                                      >
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                          <p className="mt-1 text-xs leading-6 text-slate-500">{item.description}</p>
                                        </div>
                                        <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-indigo-600 ring-1 ring-slate-200 shrink-0">
                                          {item.key}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-slate-700">正文预览</p>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                              <p className="text-sm font-semibold text-slate-800">
                                {agreementDraft.name || '协议名称'}
                              </p>
                              <p className="mt-3 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                                {(agreementDraft.content || '这里会展示协议正文预览。')
                                  .replaceAll('{{赛事名称}}', DEFAULT_TOURNAMENT.name)
                                  .replaceAll('{{主办单位}}', DEFAULT_TOURNAMENT.organizer)
                                  .replaceAll('{{举办城市}}', DEFAULT_TOURNAMENT.city)
                                  .replaceAll('{{比赛时间}}', `${DEFAULT_TOURNAMENT.startTime.replace('T', ' ')} - ${DEFAULT_TOURNAMENT.endTime.replace('T', ' ')}`)
                                  .replaceAll('{{选手姓名}}', '张三')
                                  .replaceAll('{{证件类型}}', '身份证')
                                  .replaceAll('{{证件号码}}', '4403********1234')
                                  .replaceAll('{{手机号}}', '13800138000')
                                  .replaceAll('{{签署时间}}', '2026-04-07 18:30:00')
                                  .replaceAll('{{签署账号}}', 'mustgoon@126.com')}
                              </p>
                            </div>
                            <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 bg-white px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">已使用变量</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {extractAgreementVariableKeys(agreementDraft.content).length > 0 ? (
                                  extractAgreementVariableKeys(agreementDraft.content).map((key) => (
                                    <span
                                      key={key}
                                      className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600"
                                    >
                                      {key}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">当前正文尚未插入变量</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </section>
                </div>
              )
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
                  <button
                    onClick={() => setViewMode('event-group-management')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'event-group-management' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    赛事组别
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
                    onClick={() => setViewMode('discount-rules')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${viewMode === 'discount-rules' ? 'text-indigo-700 bg-indigo-50 ring-1 ring-inset ring-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    优惠规则
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
            {(viewMode === 'settings' || viewMode === 'discount-rules' || viewMode === 'basic-info' || viewMode === 'event-group-management') && (
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
        <div
          ref={detailContentRef}
          onScroll={viewMode === 'settings' ? syncActiveRegistrationSection : undefined}
          className={`flex-1 flex flex-col bg-slate-100 px-6 lg:pl-[360px] ${viewMode === 'scheduling' ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >

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
              ) : viewMode === 'event-group-management' ? (
                <motion.div
                  key="event-group-management-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GroupManagement prototypeMode={prototypeMode} />
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
              ) : viewMode === 'settings' ? (
            <motion.div
              key="settings-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="sticky top-6 z-10">
                <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-6 shadow-sm backdrop-blur">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">报名规则</h2>
                        <p className="mt-0.5 text-xs text-slate-500">统一配置赛事的报名限制、队伍限制、兼项限制与协议签约规则。</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-1.5 w-fit">
                      {registrationRuleElevatorItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToRegistrationSection(item.id)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                            activeTab === item.id
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div ref={registrationLimitSectionRef} className="scroll-mt-40 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">年龄计算规则</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        计算基准日
                        <InlineInfoTooltip content="用于定义当需要计算报名选手的年龄时，以什么日期为基准日进行计算。" />
                      </label>
                      <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl w-fit gap-1">
                        {[
                          { id: AgeCalculationBase.EVENT_START, label: '比赛开始日' },
                          { id: AgeCalculationBase.REGISTRATION_END, label: '报名截止日' },
                          { id: AgeCalculationBase.CALENDAR_YEAR_START, label: '自然年1月1日' },
                          { id: AgeCalculationBase.CUSTOM_DATE, label: '指定日期' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setConfig({ ...config, ageCalculationBase: item.id as AgeCalculationBase })}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                              config.ageCalculationBase === item.id
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {config.ageCalculationBase === AgeCalculationBase.CUSTOM_DATE ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 max-w-sm">
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-600">指定日期</span>
                                <input
                                  type="date"
                                  value={config.ageCalculationCustomDate}
                                  onChange={(e) => setConfig({ ...config, ageCalculationCustomDate: e.target.value })}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                              </label>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-slate-600">年龄计算口径</label>
                      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                        {[
                          {
                            id: AgeCalculationMethod.BIRTH_YEAR,
                            label: '按出生年份计算',
                          },
                          {
                            id: AgeCalculationMethod.FULL_AGE,
                            label: '按周岁精确计算',
                          },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setConfig({ ...config, ageCalculationMethod: item.id as AgeCalculationMethod })}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                              config.ageCalculationMethod === item.id
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-start gap-3 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-700/80 leading-relaxed">
                          {config.ageCalculationMethod === AgeCalculationMethod.BIRTH_YEAR
                            ? '按出生年份计算：选手年龄 = 计算基准日的年份 - 选手报名时填写的出生日期的年份。'
                            : '按周岁精确计算：以计算基准日为准，若当年生日未到，则年龄 = 基准年份 - 出生年份 - 1；若当年生日已到，则年龄 = 基准年份 - 出生年份。'}
                        </p>
                      </div>
                    </div>

                  </div>
                </section>
              </div>
              </div>
              
              <div ref={teamLimitSectionRef} className="scroll-mt-40 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">报名入口</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">单项赛启用个人报名</p>
                        <p className="text-xs leading-6 text-slate-500">
                          开启后，用户前台赛事详情页会展示单项赛的“个人报名”按钮。
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setConfig({ ...config, enableIndividualRegistration: !config.enableIndividualRegistration })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                          config.enableIndividualRegistration ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            config.enableIndividualRegistration ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">队伍基础规则</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">创建队伍时必须关联组别</p>
                        <p className="text-xs leading-6 text-slate-500">
                          开启后，用户在创建队伍时必须先选择所属组别，后续将按组别规则校验队伍人数与性别限制。
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updateAdvancedTeamLimitConfig({
                            requireGroupOnTeamCreation: !config.teamLimitConfig.requireGroupOnTeamCreation,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                          config.teamLimitConfig.requireGroupOnTeamCreation ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            config.teamLimitConfig.requireGroupOnTeamCreation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-700">默认队伍限制</p>
                          <p className="text-xs leading-6 text-slate-500">
                            当某个组别没有单独配置专属规则时，默认继承这里的队伍人数与性别限制。
                          </p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          全局默认
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600">每个队伍最多队员数</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={config.teamLimitConfig.defaultMaxMembers}
                              onChange={(e) =>
                                updateAdvancedTeamLimitConfig({
                                  defaultMaxMembers: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">人</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">默认规则生效条件</p>
                          <p className="mt-2 text-xs leading-6 text-slate-500">
                            未配置组别专属规则的队伍，将优先应用这里的默认限制。后续可在下方为特殊组别单独覆盖。
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">默认队伍性别限制</p>
                          <p className="mt-1 text-xs leading-6 text-slate-500">
                            支持按需配置最少/最多男性人数、最少/最多女性人数，例如默认最多 12 人且最多 6 男 6 女。
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {[
                            { key: 'min_male', label: '最少男性人数' },
                            { key: 'max_male', label: '最多男性人数' },
                            { key: 'min_female', label: '最少女性人数' },
                            { key: 'max_female', label: '最多女性人数' },
                          ].map((item) => {
                            const requirement = config.teamLimitConfig.defaultGenderRequirement ?? {};
                            const value = requirement[item.key as keyof TeamGenderRequirement];
                            const enabled = value !== undefined;

                            return (
                              <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateAdvancedDefaultGenderRequirement(
                                        item.key as keyof TeamGenderRequirement,
                                        !enabled
                                      )
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                      enabled ? 'bg-indigo-600' : 'bg-slate-200'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        enabled ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                                {enabled ? (
                                  <div className="relative mt-4">
                                    <input
                                      type="number"
                                      min="0"
                                      value={value}
                                      onChange={(e) =>
                                        updateAdvancedDefaultGenderRequirement(
                                          item.key as keyof TeamGenderRequirement,
                                          true,
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                      人
                                    </span>
                                  </div>
                                ) : (
                                  <p className="mt-4 text-xs text-slate-400">未启用该限制</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">按组别覆盖规则</h2>
                    </div>
                    <button
                      onClick={() =>
                        updateAdvancedTeamLimitConfig({
                          enableGroupSpecificLimits: !config.teamLimitConfig.enableGroupSpecificLimits,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        config.teamLimitConfig.enableGroupSpecificLimits ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.teamLimitConfig.enableGroupSpecificLimits ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-6">
                    {config.teamLimitConfig.enableGroupSpecificLimits ? (
                      <div className="space-y-5">
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-5 py-4 text-sm leading-7 text-indigo-700">
                          开启后，可为特殊组别单独覆盖默认规则。未启用专属规则的组别，仍会继承上方“默认队伍限制”。
                        </div>

                        {config.teamLimitConfig.groupOverrides.map((rule) => (
                          <div key={rule.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                    {rule.groupName}
                                  </span>
                                  <span className="text-sm font-medium text-slate-500">
                                    {rule.enabled ? '已启用专属限制' : '继承默认规则'}
                                  </span>
                                </div>
                                <p className="text-xs leading-6 text-slate-500">
                                  可针对不同组别设置不同的队伍人数与性别要求，例如 A 组最多 12 人、U12 最多 8 人。
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  updateAdvancedGroupOverride(rule.id, (currentRule) => ({
                                    ...currentRule,
                                    enabled: !currentRule.enabled,
                                  }))
                                }
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                  rule.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    rule.enabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>

                            {rule.enabled ? (
                              <div className="space-y-5 pt-5">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-600">每个队伍最多队员数</label>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        min="1"
                                        value={rule.maxMembers}
                                        onChange={(e) =>
                                          updateAdvancedGroupOverride(rule.id, (currentRule) => ({
                                            ...currentRule,
                                            maxMembers: parseInt(e.target.value) || 1,
                                          }))
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                      />
                                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                        人
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                                  <div>
                                    <p className="text-sm font-medium text-slate-700">队伍性别限制</p>
                                    <p className="mt-1 text-xs leading-6 text-slate-500">
                                      可按组别单独设置男女数量限制，未启用的项表示该组别在此维度不做额外限制。
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {[
                                      { key: 'min_male', label: '最少男性人数' },
                                      { key: 'max_male', label: '最多男性人数' },
                                      { key: 'min_female', label: '最少女性人数' },
                                      { key: 'max_female', label: '最多女性人数' },
                                    ].map((item) => {
                                      const requirement = rule.genderRequirement ?? {};
                                      const value = requirement[item.key as keyof TeamGenderRequirement];
                                      const enabled = value !== undefined;

                                      return (
                                        <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-4">
                                          <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateAdvancedGroupOverride(rule.id, (currentRule) => {
                                                  const nextRequirement: TeamGenderRequirement = {
                                                    ...(currentRule.genderRequirement ?? {}),
                                                  };
                                                  if (enabled) {
                                                    delete nextRequirement[item.key as keyof TeamGenderRequirement];
                                                  } else {
                                                    nextRequirement[item.key as keyof TeamGenderRequirement] = 1;
                                                  }

                                                  return {
                                                    ...currentRule,
                                                    genderRequirement: nextRequirement,
                                                  };
                                                })
                                              }
                                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                enabled ? 'bg-indigo-600' : 'bg-slate-200'
                                              }`}
                                            >
                                              <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                  enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                              />
                                            </button>
                                          </div>
                                          {enabled ? (
                                            <div className="relative mt-4">
                                              <input
                                                type="number"
                                                min="0"
                                                value={value}
                                                onChange={(e) =>
                                                  updateAdvancedGroupOverride(rule.id, (currentRule) => ({
                                                    ...currentRule,
                                                    genderRequirement: {
                                                      ...(currentRule.genderRequirement ?? {}),
                                                      [item.key]: parseInt(e.target.value) || 0,
                                                    },
                                                  }))
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                              />
                                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                                人
                                              </span>
                                            </div>
                                          ) : (
                                            <p className="mt-4 text-xs text-slate-400">未启用该限制</p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-slate-400">
                        <ShieldCheck className="h-4 w-4 opacity-60" />
                        <p className="text-sm">当前未启用组别专属队伍限制</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div ref={restrictionSectionRef} className="scroll-mt-40 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                            <span
                              onClick={() => {
                                const newScope = config.restrictionScope.includes(item.id)
                                  ? config.restrictionScope.filter(s => s !== item.id)
                                  : [...config.restrictionScope, item.id];
                                setConfig({ ...config, restrictionScope: newScope });
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                config.restrictionScope.includes(item.id)
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-slate-300 group-hover:border-indigo-400'
                              }`}
                            >
                              {config.restrictionScope.includes(item.id) && <div className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                            <span className={`text-sm font-medium ${config.restrictionScope.includes(item.id) ? 'text-slate-900' : 'text-slate-500'}`}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

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
              </div>

              <div ref={signingSectionRef} className="scroll-mt-40 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">协议签约配置</h2>
                  </div>
                  <div className="p-8 space-y-10">
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
              </div>
            </motion.div>

            ) : viewMode === 'discount-rules' ? (
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
                  {agreementTemplates.map(agreement => {
                    const isSelected = config.selectedAgreements.some(a => a.id === agreement.id);
                    return (
                      <button
                        key={agreement.id}
                        onClick={() => {
                          const newAgreements = isSelected
                            ? config.selectedAgreements.filter(a => a.id !== agreement.id)
                            : [...config.selectedAgreements, { id: agreement.id, name: agreement.name }];
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
