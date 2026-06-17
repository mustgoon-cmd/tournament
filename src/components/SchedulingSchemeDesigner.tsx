import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  GitBranch,
  Layers3,
  Link2,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';

type SchemeType = '单项项目' | '团体项目' | '通用';
type SchemeEditorMode = 'new' | 'edit' | null;

type SchemeStage = {
  id: string;
  name: string;
  type: string;
  target: string;
  participantRule: string;
  outputRule: string;
};

type SchedulingScheme = {
  id: string;
  name: string;
  type: SchemeType;
  updatedAt: string;
  stages: SchemeStage[];
};

type ProjectSchemeLink = {
  id: string;
  linkedSchemeId?: string;
};

const MOCK_SCHEMES: SchedulingScheme[] = [
  {
    id: 'scheme-group-elimination',
    name: '分组循环 + 单淘汰',
    type: '通用',
    updatedAt: '2026-06-17 15:20',
    stages: [
      {
        id: 'stage-1',
        name: '第一阶段',
        type: '分组循环赛',
        target: '筛选晋级',
        participantRule: '按项目报名人数自动分组',
        outputRule: '每组前 2 名晋级下一阶段',
      },
      {
        id: 'stage-2',
        name: '第二阶段',
        type: '淘汰赛',
        target: '决出名次',
        participantRule: '接收上一阶段晋级选手/队伍',
        outputRule: '决出前 4 名',
      },
    ],
  },
  {
    id: 'scheme-round-robin',
    name: '单循环积分排名',
    type: '单项项目',
    updatedAt: '2026-06-16 19:48',
    stages: [
      {
        id: 'stage-1',
        name: '单阶段',
        type: '单循环赛',
        target: '决出排名',
        participantRule: '全部报名选手进入同一循环组',
        outputRule: '按胜场、净胜局、净胜分排序',
      },
    ],
  },
  {
    id: 'scheme-team-tie',
    name: '团体赛分组 + 交叉淘汰',
    type: '团体项目',
    updatedAt: '2026-06-15 11:06',
    stages: [
      {
        id: 'stage-1',
        name: '小组赛',
        type: '分组循环赛',
        target: '筛选晋级',
        participantRule: '按报名队伍数自动分组',
        outputRule: '每组前 1 名进入交叉淘汰',
      },
      {
        id: 'stage-2',
        name: '交叉淘汰',
        type: '淘汰赛',
        target: '决出名次',
        participantRule: '小组出线队伍进入固定签位',
        outputRule: '决出冠军、亚军、季军',
      },
    ],
  },
];

const INITIAL_PROJECT_LINKS: ProjectSchemeLink[] = [
  { id: 'E001', linkedSchemeId: 'scheme-group-elimination' },
  { id: 'E002', linkedSchemeId: 'scheme-group-elimination' },
  { id: 'E006', linkedSchemeId: 'scheme-team-tie' },
];

const createDefaultStage = (index: number): SchemeStage => ({
  id: `stage-${Date.now()}-${index}`,
  name: index === 0 ? '第一阶段' : `第 ${index + 1} 阶段`,
  type: index === 0 ? '分组循环赛' : '淘汰赛',
  target: index === 0 ? '筛选晋级' : '决出名次',
  participantRule: index === 0 ? '按项目报名人数自动分组' : '接收上一阶段晋级选手/队伍',
  outputRule: index === 0 ? '每组前 2 名晋级下一阶段' : '决出前 4 名',
});

const createEmptyScheme = (): SchedulingScheme => ({
  id: `scheme-${Date.now()}`,
  name: '',
  type: '通用',
  updatedAt: '2026-06-17 16:30',
  stages: [createDefaultStage(0), createDefaultStage(1)],
});

export const SchedulingSchemeDesigner: React.FC = () => {
  const [schemes, setSchemes] = useState<SchedulingScheme[]>(MOCK_SCHEMES);
  const [editorMode, setEditorMode] = useState<SchemeEditorMode>(null);
  const [schemeDraft, setSchemeDraft] = useState<SchedulingScheme>(createEmptyScheme);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const getSchemeSummary = (scheme: SchedulingScheme) => {
    const stageCountLabel = scheme.stages.length === 1 ? '单阶段' : scheme.stages.length === 2 ? '两阶段' : `${scheme.stages.length}阶段`;
    const stageTypes = scheme.stages.map((stage) => {
      if (stage.type === '淘汰赛') return '单淘汰赛';
      if (stage.type === '分组循环赛') return '分组循环';
      if (stage.type === '单循环赛') return '单循环';
      return stage.type;
    });
    return `${stageCountLabel}：${stageTypes.join('+')}`;
  };

  const getSchemeLinkedProjectCount = (schemeId: string) =>
    INITIAL_PROJECT_LINKS.filter((project) => project.linkedSchemeId === schemeId).length;

  const openNewSchemeEditor = () => {
    setSchemeDraft(createEmptyScheme());
    setActiveStageIndex(0);
    setEditorMode('new');
  };

  const openEditSchemeEditor = (scheme: SchedulingScheme) => {
    setSchemeDraft({
      ...scheme,
      stages: scheme.stages.map((stage) => ({ ...stage })),
    });
    setActiveStageIndex(0);
    setEditorMode('edit');
  };

  const closeSchemeEditor = () => {
    setEditorMode(null);
    setActiveStageIndex(0);
  };

  const updateStage = (stageId: string, updates: Partial<SchemeStage>) => {
    setSchemeDraft((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) => (stage.id === stageId ? { ...stage, ...updates } : stage)),
    }));
  };

  const addStage = () => {
    setSchemeDraft((prev) => {
      const nextStages = [...prev.stages, createDefaultStage(prev.stages.length)];
      setActiveStageIndex(nextStages.length - 1);
      return { ...prev, stages: nextStages };
    });
  };

  const removeStage = (stageId: string) => {
    setSchemeDraft((prev) => {
      if (prev.stages.length <= 1) return prev;
      const nextStages = prev.stages.filter((stage) => stage.id !== stageId);
      setActiveStageIndex((current) => Math.min(current, nextStages.length - 1));
      return { ...prev, stages: nextStages };
    });
  };

  const saveScheme = () => {
    const normalizedName = schemeDraft.name.trim() || '未命名赛制方案';
    const nextScheme: SchedulingScheme = {
      ...schemeDraft,
      name: normalizedName,
      updatedAt: '2026-06-17 16:30',
    };

    setSchemes((prev) => {
      if (editorMode === 'edit') {
        return prev.map((scheme) => (scheme.id === nextScheme.id ? nextScheme : scheme));
      }
      return [nextScheme, ...prev];
    });
    closeSchemeEditor();
  };

  const activeStage = schemeDraft.stages[Math.min(activeStageIndex, Math.max(0, schemeDraft.stages.length - 1))];

  return (
    <div className="min-h-full space-y-6 p-6 pb-24">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-5 border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,0.9)_100%)] px-8 py-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
              <GitBranch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">赛制方案配置（新版）</h1>
              <p className="mt-1 text-sm text-slate-500">
                先定义赛事级赛制方案，再将方案与比赛项目关联，统一生成对阵框架。
              </p>
            </div>
          </div>
          <button
            onClick={openNewSchemeEditor}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            新建赛制方案
          </button>
        </div>

        <div className="px-8 py-5">
          <div className="rounded-[24px] border border-slate-200 bg-white/95 p-2 shadow-lg shadow-slate-200/60 backdrop-blur">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                <GitBranch className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-bold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                配置流程如下
              </span>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-500">1</span>
                配置胜负规则模板
              </button>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-500">2</span>
                定义比赛代码格式
              </button>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm shadow-indigo-100 transition-all hover:bg-indigo-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] text-white">3</span>
                配置赛制方案
              </button>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              <button className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-700">4</span>
                将赛制方案与项目关联，生成对阵框架
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">赛制方案列表</h2>
            <p className="mt-1 text-sm text-slate-500">只展示当前赛事已创建的赛制方案，方案详情通过编辑进入配置页。</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-black text-slate-500">
                <th className="px-8 py-4">方案名称</th>
                <th className="px-6 py-4">赛制概要</th>
                <th className="px-6 py-4">关联项目</th>
                <th className="px-6 py-4">更新时间</th>
                <th className="px-8 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemes.map((scheme) => (
                <tr key={scheme.id} className="transition hover:bg-slate-50/80">
                  <td className="px-8 py-6">
                    <p className="whitespace-nowrap text-sm font-black text-slate-900">{scheme.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{scheme.type}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="whitespace-nowrap text-sm font-semibold text-slate-700">{getSchemeSummary(scheme)}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
                      {getSchemeLinkedProjectCount(scheme.id)} 个项目
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap text-sm font-semibold text-slate-500">{scheme.updatedAt}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <button className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-600 transition hover:bg-sky-100">
                        <Link2 className="h-3.5 w-3.5" />
                        关联项目
                      </button>
                      <button
                        onClick={() => openEditSchemeEditor(scheme)}
                        className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => setSchemes((prev) => prev.filter((item) => item.id !== scheme.id))}
                        className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatePresence>
        {editorMode && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSchemeEditor}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative flex max-h-[calc(100vh-32px)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_90px_-36px_rgba(15,23,42,0.45)]"
            >
              <div className="shrink-0 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,0.96)_100%)] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600">
                      <Settings2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {editorMode === 'new' ? '新建赛制方案' : '编辑赛制方案'}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        配置赛事级赛制方案，后续可被多个比赛项目关联复用。
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={saveScheme}
                      className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4" />
                      保存方案
                    </button>
                    <button
                      onClick={closeSchemeEditor}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-600"
                      title="关闭弹窗"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 overflow-x-auto pb-1">
                    <div className="flex w-max items-center gap-3 pr-2">
                      {schemeDraft.stages.map((stage, index) => (
                        <button
                          key={stage.id}
                          onClick={() => setActiveStageIndex(index)}
                          className={`min-w-[180px] rounded-2xl border px-4 py-3 text-left transition-all ${
                            activeStageIndex === index
                              ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                              : 'border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold text-slate-900">{stage.name}</div>
                              <div className="mt-1 text-[11px] text-slate-400">{stage.type}</div>
                            </div>
                            <span className="inline-flex rounded-full border border-indigo-100 bg-white px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                              {index + 1}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={addStage}
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-100"
                  >
                    <Plus className="h-4 w-4" />
                    添加阶段
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <div className="w-[420px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
                  <div className="shrink-0 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,0.92)_100%)] px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">当前阶段配置</div>
                    <div className="mt-1 text-xs text-slate-500">配置当前阶段的赛制、阶段目标与输出规则。</div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500">方案名称</label>
                        <input
                          value={schemeDraft.name}
                          onChange={(event) => setSchemeDraft((prev) => ({ ...prev, name: event.target.value }))}
                          placeholder="例如：分组循环 + 单淘汰"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">适用项目类型</label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {(['通用', '单项项目', '团体项目'] as SchemeType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => setSchemeDraft((prev) => ({ ...prev, type }))}
                              className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                                schemeDraft.type === type
                                  ? 'border-indigo-200 bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {activeStage && (
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Layers3 className="h-4 w-4 text-indigo-600" />
                            <p className="text-sm font-bold text-slate-900">{activeStage.name}</p>
                          </div>
                          {schemeDraft.stages.length > 1 && (
                            <button
                              onClick={() => removeStage(activeStage.id)}
                              className="rounded-xl bg-rose-50 p-2 text-rose-500 transition hover:bg-rose-100"
                              title="删除当前阶段"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500">阶段名称</label>
                          <input
                            value={activeStage.name}
                            onChange={(event) => updateStage(activeStage.id, { name: event.target.value })}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500">赛制类型</label>
                          <select
                            value={activeStage.type}
                            onChange={(event) => updateStage(activeStage.id, { type: event.target.value })}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                          >
                            <option value="分组循环赛">分组循环赛</option>
                            <option value="单循环赛">单循环赛</option>
                            <option value="淘汰赛">淘汰赛</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500">阶段目标</label>
                          <select
                            value={activeStage.target}
                            onChange={(event) => updateStage(activeStage.id, { target: event.target.value })}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                          >
                            <option value="筛选晋级">筛选晋级</option>
                            <option value="决出名次">决出名次</option>
                            <option value="决出排名">决出排名</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500">参赛来源</label>
                          <textarea
                            value={activeStage.participantRule}
                            onChange={(event) => updateStage(activeStage.id, { participantRule: event.target.value })}
                            rows={3}
                            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500">阶段输出</label>
                          <textarea
                            value={activeStage.outputRule}
                            onChange={(event) => updateStage(activeStage.id, { outputRule: event.target.value })}
                            rows={3}
                            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-[520px] bg-slate-50 flex flex-col">
                  <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800">
                          <GitBranch className="h-4 w-4 text-emerald-600" />
                          对阵框架预览
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">预览该赛制方案会生成的阶段结构与签位号，选手尚未落位。</p>
                      </div>
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                        模板预览
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-black text-slate-900">{schemeDraft.name || '未命名赛制方案'}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          当前共 {schemeDraft.stages.length} 个阶段，保存后可在方案列表中关联比赛项目。
                        </p>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        {schemeDraft.stages.map((stage, index) => (
                          <div key={stage.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-black text-slate-900">{stage.name}</p>
                                <p className="mt-1 text-xs text-slate-400">{stage.type} · {stage.target}</p>
                              </div>
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-600">
                                {index + 1}
                              </span>
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500">
                              <span className="rounded-xl bg-slate-100 px-3 py-2">{index === 0 ? 'A1' : 'Q1'}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                              <span className="rounded-xl bg-slate-100 px-3 py-2">{index === 0 ? 'A2' : 'Q2'}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                              <span className="rounded-xl bg-indigo-50 px-3 py-2 text-indigo-600">{stage.type}</span>
                            </div>
                            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                              {stage.outputRule}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
