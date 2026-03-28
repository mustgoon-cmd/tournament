import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  ImageIcon,
  LayoutPanelLeft,
  MapPin,
  Megaphone,
  MousePointerClick,
  Palette,
  Plus,
  Save,
  Settings2,
  Share2,
  Sparkles,
  Ticket,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { TournamentBasicInfo } from '../types';

interface PageDecorationConfigProps {
  basicInfo: TournamentBasicInfo;
  onBack: () => void;
}

type BuilderRail = 'page' | 'share' | 'publish';
type LeftTab = 'outline' | 'palette';
type InspectorTab = 'page' | 'module';
type PageTheme = 'classic' | 'marine' | 'energy';
type NavStyle = 'glass' | 'solid';
type ModuleType = 'hero' | 'summary' | 'intro' | 'faq' | 'schedule' | 'prize' | 'sponsor' | 'publicity';
type ModuleStyle = 'soft' | 'brand' | 'contrast';

interface DecorationModule {
  id: string;
  type: ModuleType;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  badge: string;
  visible: boolean;
  style: ModuleStyle;
}

interface PageSettings {
  theme: PageTheme;
  navStyle: NavStyle;
  showBottomBar: boolean;
  captainButtonText: string;
}

interface ModuleTemplate {
  type: ModuleType;
  name: string;
  description: string;
  defaults: Omit<DecorationModule, 'id' | 'type'>;
}

const BUILDER_RAIL_ITEMS = [
  { id: 'page' as const, label: '页面配置', icon: LayoutPanelLeft },
  { id: 'share' as const, label: '分享设置', icon: Share2 },
  { id: 'publish' as const, label: '发布设置', icon: Settings2 },
];

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'hero',
    name: '轮播头图',
    description: '赛事封面图、顶部氛围和状态信息',
    defaults: {
      name: '轮播头图',
      title: '赛事头图',
      subtitle: '顶部轮播与赛事状态',
      description: '适合承接赛事第一眼印象和封面图展示。',
      ctaText: '',
      badge: '顶部轮播',
      visible: true,
      style: 'brand',
    },
  },
  {
    type: 'summary',
    name: '基础信息区',
    description: '赛事标题、时间地点和主承办方',
    defaults: {
      name: '基础信息区',
      title: '赛事详情',
      subtitle: '核心信息概览',
      description: '承载赛事标题、状态、基础信息卡。',
      ctaText: '',
      badge: '详情头部',
      visible: true,
      style: 'soft',
    },
  },
  {
    type: 'intro',
    name: '赛事介绍',
    description: '图文介绍赛事背景与赛制亮点',
    defaults: {
      name: '赛事介绍',
      title: '赛事介绍',
      subtitle: '详细说明赛事定位和亮点',
      description: '适合承载赛事背景、赛制特色和奖励说明。',
      ctaText: '',
      badge: '正文内容',
      visible: true,
      style: 'soft',
    },
  },
  {
    type: 'faq',
    name: '常见问题',
    description: '说明报名、检录和退赛等高频问题',
    defaults: {
      name: '常见问题',
      title: '常见问题解答',
      subtitle: '统一解决高频咨询',
      description: '用 Q&A 结构降低运营答疑成本。',
      ctaText: '',
      badge: '服务组件',
      visible: true,
      style: 'soft',
    },
  },
  {
    type: 'schedule',
    name: '赛程亮点',
    description: '展示报名截止、检录和决赛等节点',
    defaults: {
      name: '赛程亮点',
      title: '赛程安排',
      subtitle: '关键节点提醒',
      description: '用时间线强化赛事节奏感。',
      ctaText: '查看完整赛程',
      badge: '赛事组件',
      visible: true,
      style: 'soft',
    },
  },
  {
    type: 'prize',
    name: '奖项说明',
    description: '展示奖杯、礼包和纪念权益',
    defaults: {
      name: '奖项说明',
      title: '奖项与权益',
      subtitle: '参赛荣誉与奖励',
      description: '适合承接冠亚季军奖励说明。',
      ctaText: '',
      badge: '赛事组件',
      visible: true,
      style: 'contrast',
    },
  },
  {
    type: 'sponsor',
    name: '合作伙伴',
    description: '展示主办、协办和品牌支持',
    defaults: {
      name: '合作伙伴',
      title: '合作伙伴',
      subtitle: '感谢品牌与机构支持',
      description: '适合放置 logo 墙或合作说明。',
      ctaText: '',
      badge: '品牌组件',
      visible: true,
      style: 'soft',
    },
  },
  {
    type: 'publicity',
    name: '报名公示',
    description: '最近报名记录和报名入口',
    defaults: {
      name: '报名公示',
      title: '报名公示信息',
      subtitle: '公开展示报名动态',
      description: '支持展示最近报名记录和转化入口。',
      ctaText: '领队报名',
      badge: '报名转化',
      visible: true,
      style: 'brand',
    },
  },
];

const themeMap = {
  classic: {
    canvas: 'from-slate-100 via-blue-50 to-slate-100',
    accent: 'bg-blue-600',
    heroOverlay: 'from-slate-950/10 via-slate-950/30 to-slate-950/70',
  },
  marine: {
    canvas: 'from-cyan-100 via-sky-50 to-blue-100',
    accent: 'bg-cyan-600',
    heroOverlay: 'from-cyan-950/10 via-cyan-950/30 to-cyan-950/70',
  },
  energy: {
    canvas: 'from-orange-100 via-rose-50 to-amber-100',
    accent: 'bg-rose-500',
    heroOverlay: 'from-rose-950/10 via-rose-950/28 to-rose-950/70',
  },
} as const;

const styleMap = {
  soft: 'border-slate-200 bg-white text-slate-900',
  brand: 'border-transparent bg-slate-900 text-white',
  contrast: 'border-amber-200 bg-amber-50 text-amber-950',
} as const;

const previewFaqs = [
  {
    question: '比赛对球拍和球鞋有什么要求？',
    answer: '参赛选手需自备符合标准的比赛装备，木地板场地禁止穿着深色外底运动鞋。',
  },
  {
    question: '双打项目可以跨俱乐部组队吗？',
    answer: '可以，自由组队即可，但报名时需完整填写双方真实身份信息。',
  },
  {
    question: '报名后是否支持退赛？',
    answer: '支持在规定时间内申请退赛，超出时限将按赛事规则执行。',
  },
];

const previewRegistrations = [
  { name: '林*丹', type: '个人报名', time: '2分钟前' },
  { name: '李*伟', type: '领队报名', time: '15分钟前' },
  { name: '安*颖', type: '个人报名', time: '45分钟前' },
];

const createDefaultModules = (basicInfo: TournamentBasicInfo): DecorationModule[] => [
  {
    id: 'hero-default',
    type: 'hero',
    name: '轮播头图',
    title: basicInfo.tournamentName || '赛事详情页',
    subtitle: basicInfo.tournamentSubtitle || '赛事轮播与封面展示',
    description: '顶部轮播图区域，突出赛事氛围与状态。',
    ctaText: '',
    badge: '顶部轮播',
    visible: true,
    style: 'brand',
  },
  {
    id: 'summary-default',
    type: 'summary',
    name: '基础信息区',
    title: basicInfo.tournamentName || '赛事详情',
    subtitle: basicInfo.tournamentSubtitle || '挥洒汗水，羽你同行',
    description: '承载赛事标题、状态标签和完整基础信息卡。',
    ctaText: '',
    badge: '详情头部',
    visible: true,
    style: 'soft',
  },
  {
    id: 'intro-default',
    type: 'intro',
    name: '赛事介绍',
    title: '赛事介绍',
    subtitle: '图文说明赛事定位',
    description:
      basicInfo.description ||
      '本赛事面向城市俱乐部、高校社团及大众羽毛球爱好者开放报名，兼顾竞技体验与大众参与氛围。',
    ctaText: '',
    badge: '正文内容',
    visible: true,
    style: 'soft',
  },
  {
    id: 'faq-default',
    type: 'faq',
    name: '常见问题',
    title: '常见问题解答',
    subtitle: '统一解决报名和检录问题',
    description: '以问答卡片形式展示关键信息。',
    ctaText: '',
    badge: '服务组件',
    visible: true,
    style: 'soft',
  },
  {
    id: 'publicity-default',
    type: 'publicity',
    name: '报名公示',
    title: '报名公示信息',
    subtitle: '展示最近报名记录和报名入口',
    description: '对外公开展示报名情况并承接转化。',
    ctaText: '领队报名',
    badge: '报名转化',
    visible: true,
    style: 'brand',
  },
];

const createModule = (template: ModuleTemplate, idSuffix: string): DecorationModule => ({
  id: `${template.type}-${idSuffix}`,
  type: template.type,
  ...template.defaults,
});

const formatRange = (basicInfo: TournamentBasicInfo) => {
  if (!basicInfo.startTime || !basicInfo.endTime) {
    return '待配置举办时间';
  }

  return `${basicInfo.startTime.replace('T', ' ')} 至 ${basicInfo.endTime.replace('T', ' ')}`;
};

export const PageDecorationConfig: React.FC<PageDecorationConfigProps> = ({
  basicInfo,
  onBack,
}) => {
  const [activeRail, setActiveRail] = useState<BuilderRail>('page');
  const [leftTab, setLeftTab] = useState<LeftTab>('outline');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('module');
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    theme: 'classic',
    navStyle: 'glass',
    showBottomBar: true,
    captainButtonText: '领队报名',
  });
  const [modules, setModules] = useState<DecorationModule[]>(() => createDefaultModules(basicInfo));
  const [selectedModuleId, setSelectedModuleId] = useState<string>('hero-default');

  const currentTheme = themeMap[pageSettings.theme];
  const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? null;
  const visibleModules = modules.filter((module) => module.visible);
  const locationText = basicInfo.city || '待选城市';
  const venueText = basicInfo.venueName || '待配置场馆';
  const organizerText = basicInfo.organizers.filter(Boolean).join(' / ') || '待配置主办方';
  const coOrganizerText = basicInfo.coOrganizers.filter(Boolean).join(' / ') || '待配置承办方';

  const updateModule = (moduleId: string, updates: Partial<DecorationModule>) => {
    setModules((prev) =>
      prev.map((module) => (module.id === moduleId ? { ...module, ...updates } : module)),
    );
  };

  const addModule = (template: ModuleTemplate) => {
    const nextModule = createModule(template, `${Date.now()}`);
    setModules((prev) => [...prev, nextModule]);
    setSelectedModuleId(nextModule.id);
    setLeftTab('outline');
    setInspectorTab('module');
  };

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    setModules((prev) => {
      const currentIndex = prev.findIndex((module) => module.id === moduleId);
      if (currentIndex === -1) {
        return prev;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      const [current] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, current);
      return next;
    });
  };

  const duplicateModule = (moduleId: string) => {
    setModules((prev) => {
      const target = prev.find((module) => module.id === moduleId);
      if (!target) {
        return prev;
      }

      const copy = {
        ...target,
        id: `${target.type}-${Date.now()}`,
        name: `${target.name} 副本`,
      };
      setSelectedModuleId(copy.id);
      return [...prev, copy];
    });
  };

  const deleteModule = (moduleId: string) => {
    setModules((prev) => {
      const next = prev.filter((module) => module.id !== moduleId);
      if (selectedModuleId === moduleId && next.length > 0) {
        setSelectedModuleId(next[Math.max(0, next.length - 1)].id);
      }
      return next;
    });
  };

  const renderModulePreview = (module: DecorationModule) => {
    if (module.type === 'hero') {
      return (
        <div className="overflow-hidden rounded-[28px]">
          <div
            className="relative h-56 bg-slate-200"
            style={
              basicInfo.coverUrl
                ? {
                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.72)), url(${basicInfo.coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.heroOverlay}`} />
            <div className="relative flex h-full flex-col justify-between p-4 text-white">
              <div className="flex items-center justify-between">
                <button className="rounded-full bg-black/25 px-3 py-2 text-xs font-bold backdrop-blur">
                  返回
                </button>
                <button className="rounded-full bg-black/25 px-3 py-2 text-xs font-bold backdrop-blur">
                  分享
                </button>
              </div>

              <div className="flex items-end justify-between">
                <div className="rounded-full bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur">
                  {module.badge}
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((item) => (
                    <span
                      key={item}
                      className={`h-2 rounded-full ${item === 0 ? 'w-4 bg-white' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (module.type === 'summary') {
      return (
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              报名中
            </span>
          </div>
          <h3 className="mt-3 text-2xl font-bold leading-8 text-slate-900">{module.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{module.subtitle}</p>

          <div className="mt-4 space-y-4 rounded-[20px] border border-slate-100 bg-slate-50/80 p-4">
            {[
              { icon: CalendarDays, label: '举办时间', value: formatRange(basicInfo) },
              { icon: MapPin, label: '举办地点', value: locationText },
              { icon: Building2, label: '举办场馆', value: venueText },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-800">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
              {[
                { icon: Users, label: '主办方', value: organizerText },
                { icon: Ticket, label: '承办方', value: coOrganizerText },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-sm font-medium text-slate-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (module.type === 'intro') {
      return (
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
          </div>
          <div className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
            {module.description}
          </div>
        </div>
      );
    }

    if (module.type === 'faq') {
      return (
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
          </div>
          <div className="space-y-3">
            {previewFaqs.map((item) => (
              <div key={item.question} className="rounded-[18px] border border-slate-100 bg-white p-4">
                <div className="flex gap-2">
                  <span className="font-bold text-blue-600">Q:</span>
                  <p className="text-sm font-medium text-slate-800">{item.question}</p>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="font-bold text-orange-500">A:</span>
                  <p className="text-sm leading-6 text-slate-500">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (module.type === 'schedule') {
      return (
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
          </div>
          <div className="space-y-3">
            {[
              { time: '04/12', label: '报名截止', desc: '资格审核与名单确认' },
              { time: '05/01', label: '现场检录', desc: '开放签到、物资领取' },
              { time: '05/03', label: '决赛日', desc: '颁奖典礼与合影' },
            ].map((item) => (
              <div key={item.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <CircleDot className="h-4 w-4 text-blue-500" />
                  <div className="mt-1 h-full w-px bg-slate-200" />
                </div>
                <div className="pb-2">
                  <p className="text-xs font-bold text-slate-500">{item.time}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (module.type === 'prize') {
      return (
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['冠军', '亚军', '季军'].map((tier, index) => (
              <div key={tier} className="rounded-2xl bg-amber-50 px-3 py-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">{tier}</div>
                <div className="mt-3 text-lg font-black text-slate-900">{index === 0 ? '奖杯' : index === 1 ? '奖牌' : '证书'}</div>
                <div className="text-[11px] text-slate-500">{index === 0 ? '冠军礼包' : '赛事周边'}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (module.type === 'sponsor') {
      return (
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['主办方', '媒体合作', '品牌支持'].map((item) => (
              <div key={item} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs font-medium text-slate-400">
                {item}
                <br />
                标识位
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[24px] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-slate-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">报名人</th>
                <th className="px-4 py-3 text-left font-medium">类型</th>
                <th className="px-4 py-3 text-right font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRegistrations.map((item) => (
                <tr key={`${item.name}-${item.time}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.type}</td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-slate-50/60 p-3 text-center">
            <button className="text-xs font-medium text-blue-600">查看更多报名信息</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-2">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              返回基础信息
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{basicInfo.tournamentName || '赛事详情页'}</h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  已发布
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">赛事详情页装修工作台</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-900">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              模板中心
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-600">
              <Save className="h-4 w-4" />
              保存并发布
            </button>
          </div>
        </div>

        <div className="grid min-h-[920px] xl:grid-cols-[86px_360px_minmax(0,1fr)_340px]">
          <aside className="border-r border-slate-200 bg-white">
            <div className="flex h-full flex-col items-center py-6">
              {BUILDER_RAIL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveRail(item.id)}
                  className={`mb-3 flex w-full flex-col items-center gap-2 px-2 py-4 text-xs font-medium transition ${
                    activeRail === item.id
                      ? 'border-r-2 border-cyan-500 bg-cyan-50 text-cyan-600'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setLeftTab('outline')}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${leftTab === 'outline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  页面大纲
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab('palette')}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${leftTab === 'palette' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  业务组件
                </button>
              </div>
            </div>

            {leftTab === 'outline' ? (
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">赛事详情页</h2>
                    <p className="mt-1 text-xs text-slate-400">默认设计页上的组件层级</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLeftTab('palette')}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    添加
                  </button>
                </div>

                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => {
                        setSelectedModuleId(module.id);
                        setInspectorTab('module');
                      }}
                      className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                        selectedModuleId === module.id
                          ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              {index + 1}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{module.name}</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">{module.description}</p>
                        </div>
                        <div className={`rounded-full px-2 py-1 text-[10px] font-bold ${module.visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {module.visible ? '显示' : '隐藏'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="mb-4">
                  <h2 className="text-sm font-black text-slate-900">插入组件</h2>
                  <p className="mt-1 text-xs text-slate-400">在默认赛事详情页上继续扩展业务模块</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {MODULE_TEMPLATES.map((template) => (
                    <button
                      key={template.type}
                      type="button"
                      onClick={() => addModule(template)}
                      className="rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      <div className="flex h-24 flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">
                            {template.type === 'hero' ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : template.type === 'summary' ? (
                              <LayoutPanelLeft className="h-4 w-4" />
                            ) : template.type === 'intro' ? (
                              <Megaphone className="h-4 w-4" />
                            ) : template.type === 'faq' ? (
                              <HelpCircle className="h-4 w-4" />
                            ) : template.type === 'schedule' ? (
                              <CalendarDays className="h-4 w-4" />
                            ) : template.type === 'prize' ? (
                              <Trophy className="h-4 w-4" />
                            ) : template.type === 'sponsor' ? (
                              <Users className="h-4 w-4" />
                            ) : (
                              <MousePointerClick className="h-4 w-4" />
                            )}
                          </div>
                          <Plus className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{template.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{template.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${currentTheme.canvas} px-6 py-8`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(255,255,255,0.8),_transparent_26%),radial-gradient(circle_at_90%_80%,_rgba(255,255,255,0.55),_transparent_24%)]" />
            <div className="relative">
              <div className="mb-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">页面实时预览</p>
                <p className="mt-1 text-sm text-slate-500">已按你提供的 AI Studio 赛事详情页结构重组</p>
              </div>

              <div className="relative w-[395px] rounded-[42px] border-[10px] border-slate-900 bg-slate-900 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
                <div className="absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-slate-900" />
                <div className={`h-[667px] w-[375px] overflow-hidden rounded-[32px] bg-gradient-to-br ${currentTheme.canvas}`}>
                  <div className="custom-scrollbar relative h-full overflow-y-auto overscroll-contain">
                    <div className={`flex items-center justify-between px-5 pt-5 text-xs font-bold ${pageSettings.navStyle === 'glass' ? 'text-slate-900' : 'text-white'}`}>
                      <span>9:41</span>
                      <div className={`rounded-full px-3 py-1 ${pageSettings.navStyle === 'glass' ? 'bg-white/70 text-slate-800 backdrop-blur' : 'bg-slate-900/80 text-white'}`}>
                        赛事详情
                      </div>
                    </div>

                    <div className="space-y-4 px-4 pb-24 pt-4">
                      {visibleModules.map((module) => (
                        <button
                          key={module.id}
                          type="button"
                          onClick={() => {
                            setSelectedModuleId(module.id);
                            setInspectorTab('module');
                          }}
                          className={`block w-full rounded-[30px] text-left transition ${
                            selectedModuleId === module.id
                              ? 'shadow-[0_0_0_3px_rgba(34,211,238,0.28)]'
                              : ''
                          }`}
                        >
                          {renderModulePreview(module)}
                        </button>
                      ))}
                    </div>

                    {pageSettings.showBottomBar && (
                      <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-3">
                        <div className="flex gap-3">
                          <button className="flex-1 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600">
                            个人报名
                          </button>
                          <button className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg ${currentTheme.accent}`}>
                            {pageSettings.captainButtonText}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="flex h-full flex-col border-l border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {inspectorTab === 'page' ? '页面配置' : selectedModule?.name || '组件属性'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">赛事详情页 / decoration-builder</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('page')}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${inspectorTab === 'page' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    页面
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('module')}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${inspectorTab === 'module' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    组件
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {inspectorTab === 'page' ? (
                <div className="space-y-6">
                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">页面主题</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'classic' as const, label: '经典蓝白' },
                        { value: 'marine' as const, label: '海岸蓝调' },
                        { value: 'energy' as const, label: '暖色活力' },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => setPageSettings((prev) => ({ ...prev, theme: theme.value }))}
                          className={`rounded-2xl border px-3 py-4 text-xs font-bold transition ${
                            pageSettings.theme === theme.value
                              ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                              : 'border-slate-200 bg-white text-slate-500'
                          }`}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">导航样式</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'glass' as const, label: '毛玻璃' },
                        { value: 'solid' as const, label: '实心导航' },
                      ].map((nav) => (
                        <button
                          key={nav.value}
                          type="button"
                          onClick={() => setPageSettings((prev) => ({ ...prev, navStyle: nav.value }))}
                          className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                            pageSettings.navStyle === nav.value
                              ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                              : 'border-slate-200 bg-white text-slate-500'
                          }`}
                        >
                          {nav.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">底部按钮</h3>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">领队报名按钮文案</span>
                      <input
                        type="text"
                        value={pageSettings.captainButtonText}
                        onChange={(e) =>
                          setPageSettings((prev) => ({ ...prev, captainButtonText: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setPageSettings((prev) => ({
                          ...prev,
                          showBottomBar: !prev.showBottomBar,
                        }))
                      }
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                        pageSettings.showBottomBar
                          ? 'bg-cyan-50 text-cyan-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span>底部固定报名栏</span>
                      {pageSettings.showBottomBar ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </section>

                  <section className="rounded-[24px] border border-dashed border-slate-300 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Palette className="h-4 w-4 text-cyan-500" />
                      结构说明
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                      <p>中间预览已经按你提供的 AI Studio 赛事详情页结构组织成“轮播 + 详情 + 内容流 + 底部报名”。</p>
                      <p>后续可以继续把轮播、FAQ、报名公示做成更强的真实配置项。</p>
                    </div>
                  </section>
                </div>
              ) : selectedModule ? (
                <div className="space-y-6">
                  <div className={`rounded-[24px] border p-4 ${styleMap[selectedModule.style]}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                          {selectedModule.badge || '已选中组件'}
                        </div>
                        <div className="mt-2 text-base font-black">{selectedModule.name}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateModule(selectedModule.id, { visible: !selectedModule.visible })}
                        className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"
                      >
                        {selectedModule.visible ? '显示中' : '已隐藏'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => moveModule(selectedModule.id, 'up')}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-500 transition hover:text-slate-900"
                    >
                      <ArrowUp className="mx-auto h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveModule(selectedModule.id, 'down')}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-500 transition hover:text-slate-900"
                    >
                      <ArrowDown className="mx-auto h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateModule(selectedModule.id)}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-500 transition hover:text-slate-900"
                    >
                      <Copy className="mx-auto h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteModule(selectedModule.id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-rose-500 transition hover:bg-rose-100"
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">组件名称</span>
                    <input
                      type="text"
                      value={selectedModule.name}
                      onChange={(e) => updateModule(selectedModule.id, { name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">主标题</span>
                    <input
                      type="text"
                      value={selectedModule.title}
                      onChange={(e) => updateModule(selectedModule.id, { title: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">副标题</span>
                    <input
                      type="text"
                      value={selectedModule.subtitle}
                      onChange={(e) => updateModule(selectedModule.id, { subtitle: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">描述文案</span>
                    <textarea
                      rows={4}
                      value={selectedModule.description}
                      onChange={(e) => updateModule(selectedModule.id, { description: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
                    />
                  </label>

                  {selectedModule.type === 'publicity' && (
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">领队报名按钮文案</span>
                      <input
                        type="text"
                        value={selectedModule.ctaText}
                        onChange={(e) => updateModule(selectedModule.id, { ctaText: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white"
                      />
                    </label>
                  )}

                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">组件风格</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'soft' as const, label: '浅色卡' },
                        { value: 'brand' as const, label: '品牌强' },
                        { value: 'contrast' as const, label: '强调色' },
                      ].map((style) => (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() => updateModule(selectedModule.id, { style: style.value })}
                          className={`rounded-2xl border px-3 py-3 text-xs font-bold transition ${
                            selectedModule.style === style.value
                              ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                              : 'border-slate-200 bg-white text-slate-500'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={() => updateModule(selectedModule.id, { visible: !selectedModule.visible })}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      selectedModule.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span>组件显示状态</span>
                    {selectedModule.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-400">
                  请选择一个组件开始编辑
                </div>
              )}
            </div>
          </aside>
        </div>
      </motion.section>
    </div>
  );
};
