import React, { useRef, useState } from 'react';
import { Reorder } from 'motion/react';
import { AlertTriangle, Eye, Hash, RefreshCw, Save, Settings2, Users } from 'lucide-react';

type CodeComponentType = 'project' | 'phase' | 'group' | 'round' | 'sequence';

type CodeComponent = {
  id: CodeComponentType;
  name: string;
  format: string;
  length: number;
  enabled: boolean;
  joiner: string;
};

type SingleExceptionRuleConfig = {
  enabled: boolean;
  preMatchForfeitWinGames: number;
  preMatchForfeitPoints: number;
  retirementCurrentGame: 'complete_to_target' | 'manual';
  retirementPendingGames: 'follow_forfeit_rule' | 'manual';
  interruptedHandling: 'manual' | 'resume_later' | 'replay_all';
};

type TeamExceptionRuleConfig = {
  enabled: boolean;
  tieForfeitHandling: 'default_loss' | 'manual';
  completedSubMatchesHandling: 'keep_result' | 'manual';
  pendingSubMatchesHandling: 'count_as_loss' | 'manual';
  unfinishedSubMatchesHandling: 'finish_running' | 'stop_immediately';
};

type StoredMatchRuleConfig = {
  components?: CodeComponent[];
  separator?: string;
  singleExceptionConfig?: SingleExceptionRuleConfig;
  teamExceptionConfig?: TeamExceptionRuleConfig;
};

type MatchCodePanelTarget =
  | {
      type: 'field';
      id: CodeComponentType;
    }
  | {
      type: 'separator';
    }
  | null;

const DEFAULT_COMPONENTS: CodeComponent[] = [
  { id: 'project', name: '项目', format: 'code', length: 2, enabled: true, joiner: '-' },
  { id: 'phase', name: '阶段', format: 'S1', length: 1, enabled: true, joiner: '-' },
  { id: 'group', name: '分组', format: 'letter', length: 1, enabled: true, joiner: '-' },
  { id: 'round', name: '轮次', format: 'R1', length: 1, enabled: true, joiner: '-' },
  { id: 'sequence', name: '序号', format: 'number', length: 2, enabled: true, joiner: '' },
];

const getCodeComponentExample = (component: CodeComponent) => {
  switch (component.id) {
    case 'project':
      if (component.format === 'name') return '男子单打';
      if (component.format === 'short_name') return '男单';
      return 'MS';
    case 'phase':
      return ['S1', 'S2', 'S3'].includes(component.format) ? component.format : 'S1';
    case 'group':
      if (component.format === 'number') return '1';
      if (component.format === 'number_two_digit') return '01';
      return 'A';
    case 'round':
      return ['R1', 'R2', 'R3'].includes(component.format) ? component.format : 'R1';
    case 'sequence':
      return '1'.padStart(component.length, '0');
    default:
      return '';
  }
};

const getCodeComponentFormatLabel = (component: CodeComponent) => {
  switch (component.id) {
    case 'project':
      if (component.format === 'name') return '项目名称';
      if (component.format === 'short_name') return '项目简称';
      return '项目代码';
    case 'phase':
      return component.format || 'S1';
    case 'group':
      if (component.format === 'number') return '123';
      if (component.format === 'number_two_digit') return '010203';
      return 'ABC';
    case 'round':
      return component.format || 'R1';
    case 'sequence':
      return '固定两位序号';
    default:
      return '';
  }
};

const getSeparatorLabel = (value: string) => {
  if (value === '_') return '_';
  if (value === '/') return '/';
  if (value === '') return '无';
  return '-';
};

const normalizeCodeComponents = (storedComponents?: CodeComponent[], legacySeparator = '-') =>
  DEFAULT_COMPONENTS.map((defaultComponent, index) => {
    const storedComponent = storedComponents?.find((item) => item.id === defaultComponent.id);
    const normalizedFormat =
      defaultComponent.id === 'phase'
        ? ['S1', 'S2', 'S3'].includes(storedComponent?.format || '') ? (storedComponent?.format as string) : defaultComponent.format
        : defaultComponent.id === 'round'
          ? ['R1', 'R2', 'R3'].includes(storedComponent?.format || '') ? (storedComponent?.format as string) : defaultComponent.format
          : storedComponent?.format || defaultComponent.format;

    return {
      ...defaultComponent,
      ...storedComponent,
      format: normalizedFormat,
      enabled:
        defaultComponent.id === 'round'
          ? storedComponent?.enabled ?? defaultComponent.enabled
          : true,
      joiner:
        storedComponent?.joiner ??
        (index === DEFAULT_COMPONENTS.length - 1 ? '' : storedComponents ? legacySeparator : defaultComponent.joiner),
    };
  });

const DEFAULT_SINGLE_EXCEPTION_CONFIG: SingleExceptionRuleConfig = {
  enabled: true,
  preMatchForfeitWinGames: 2,
  preMatchForfeitPoints: 21,
  retirementCurrentGame: 'complete_to_target',
  retirementPendingGames: 'follow_forfeit_rule',
  interruptedHandling: 'manual',
};

const DEFAULT_TEAM_EXCEPTION_CONFIG: TeamExceptionRuleConfig = {
  enabled: true,
  tieForfeitHandling: 'default_loss',
  completedSubMatchesHandling: 'keep_result',
  pendingSubMatchesHandling: 'count_as_loss',
  unfinishedSubMatchesHandling: 'finish_running',
};

const loadStoredMatchRuleConfig = (): StoredMatchRuleConfig => {
  try {
    const saved = localStorage.getItem('match_rule_config');
    if (saved) {
      return JSON.parse(saved) as StoredMatchRuleConfig;
    }
  } catch {
    // ignore corrupted local storage and fall back to defaults
  }

  try {
    const legacyComponents = localStorage.getItem('match_code_config');
    if (legacyComponents) {
      return {
        components: JSON.parse(legacyComponents) as CodeComponent[],
      };
    }
  } catch {
    // ignore corrupted legacy storage
  }

  return {};
};

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
}> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-8 w-16 items-center rounded-full px-2 text-xs font-semibold transition-all ${
      checked ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
    }`}
  >
    <span>{checked ? '开' : '关'}</span>
    <span
      className={`absolute h-6 w-6 rounded-full bg-white shadow transition-all ${
        checked ? 'right-1' : 'left-1'
      }`}
    />
  </button>
);

const buildSingleExceptionSummary = (config: SingleExceptionRuleConfig) => {
  if (!config.enabled) {
    return '关闭后，单项赛出现弃权、退赛或中断时，将由裁判根据现场情况决定处理方式。';
  }

  const retirementCurrentGameText =
    config.retirementCurrentGame === 'complete_to_target'
      ? '当前局由胜方补齐至目标分，退赛方保留退赛时实际得分'
      : '当前局由裁判根据现场情况手动判定';
  const retirementPendingGamesText =
    config.retirementPendingGames === 'follow_forfeit_rule'
      ? '后续未开赛局按赛前弃权规则补偿'
      : '后续未开赛局由裁判决定处理';
  const interruptedHandlingText =
    config.interruptedHandling === 'resume_later'
      ? '保留当前结果后续补赛'
      : config.interruptedHandling === 'replay_all'
      ? '整场重赛'
      : '由裁判决定';

  return `赛前弃权按 ${config.preMatchForfeitWinGames}:0、每局 ${config.preMatchForfeitPoints}:0 处理；比赛中退赛时，${retirementCurrentGameText}，${retirementPendingGamesText}；比赛中断未完赛时，${interruptedHandlingText}。`;
};

const buildTeamExceptionSummary = (config: TeamExceptionRuleConfig) => {
  if (!config.enabled) {
    return '关闭后，团体赛出现异常情况时，将由裁判结合赛事现场情况决定处理方式。';
  }

  const tieForfeitText = config.tieForfeitHandling === 'default_loss' ? '整场弃权直接按团体告负处理' : '整场弃权由裁判决定';
  const completedText = config.completedSubMatchesHandling === 'keep_result' ? '已完成单项结果保留' : '已完成单项结果由裁判决定';
  const pendingText = config.pendingSubMatchesHandling === 'count_as_loss' ? '未开始单项按默认负场处理' : '未开始单项由裁判决定';
  const unfinishedText =
    config.unfinishedSubMatchesHandling === 'finish_running' ? '已开赛但未结束的单项继续完成' : '已开赛但未结束的单项立即终止';

  return `${tieForfeitText}；${completedText}；${pendingText}；${unfinishedText}。`;
};

export const MatchCodeConfig: React.FC = () => {
  const [components, setComponents] = useState<CodeComponent[]>(() => {
    const stored = loadStoredMatchRuleConfig();
    return normalizeCodeComponents(stored.components, stored.separator || '-');
  });
  const [separator, setSeparator] = useState(() => loadStoredMatchRuleConfig().separator || '-');
  const [singleExceptionConfig, setSingleExceptionConfig] = useState<SingleExceptionRuleConfig>(() => ({
    ...DEFAULT_SINGLE_EXCEPTION_CONFIG,
    ...(loadStoredMatchRuleConfig().singleExceptionConfig || {}),
  }));
  const [teamExceptionConfig, setTeamExceptionConfig] = useState<TeamExceptionRuleConfig>(() => ({
    ...DEFAULT_TEAM_EXCEPTION_CONFIG,
    ...(loadStoredMatchRuleConfig().teamExceptionConfig || {}),
  }));
  const [panelTarget, setPanelTarget] = useState<MatchCodePanelTarget>({
    type: 'field',
    id: 'project',
  });
  const [isSaving, setIsSaving] = useState(false);
  const codeFormatRef = useRef<HTMLElement | null>(null);
  const singleExceptionRef = useRef<HTMLElement | null>(null);
  const teamExceptionRef = useRef<HTMLElement | null>(null);

  const activeComponents = components.filter((component) => component.enabled);
  const previewSegments = activeComponents.map((component) => ({
    ...component,
    sample: getCodeComponentExample(component),
  }));
  const example = previewSegments.map((component) => component.sample).join(separator);
  const isRoundEnabled = components.some((component) => component.id === 'round' && component.enabled);
  const currentFormatLabel = components.map((component) => component.name).join(separator);
  const selectedField =
    panelTarget?.type === 'field' ? components.find((component) => component.id === panelTarget.id) || null : null;

  const updateComponent = (id: CodeComponentType, updates: Partial<CodeComponent>) => {
    setComponents((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleSave = () => {
    setIsSaving(true);
    const payload: StoredMatchRuleConfig = {
      components,
      separator,
      singleExceptionConfig,
      teamExceptionConfig,
    };
    localStorage.setItem('match_rule_config', JSON.stringify(payload));
    localStorage.setItem('match_code_config', JSON.stringify(components));
    setTimeout(() => {
      setIsSaving(false);
      alert('比赛规则配置已保存');
    }, 800);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">比赛规则配置</h2>
              <p className="text-xs text-slate-500 mt-0.5">统一配置比赛代码格式与赛事级异常赛果处理规则。</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存配置
          </button>
        </div>
      </section>

      <section ref={codeFormatRef} className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <Hash className="h-5 w-5 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">比赛代码配置</h3>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            <div className="grid gap-5 px-6 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
              <div>
                <h2 className="text-base font-semibold text-slate-900">当前比赛代码格式</h2>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] lg:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">当前格式</p>
                      <p className="mt-3 break-words text-lg font-bold text-slate-900">{currentFormatLabel}</p>
                    </div>
                    <div className="border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Eye className="h-4 w-4 text-indigo-500" />
                        <p className="text-xs font-semibold uppercase tracking-[0.16em]">比赛代码预览</p>
                      </div>
                      <p className="mt-3 break-all font-mono text-2xl font-bold tracking-wider text-slate-900">{example || '请先启用字段'}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-800">序号生成规则</p>
                  <p className="mt-2 text-xs leading-6 text-amber-700">
                    {isRoundEnabled
                      ? '已启用轮次字段：序号将按当前轮次内的比赛顺序生成，每轮从 01 重新开始。'
                      : '未启用轮次字段：序号将按当前阶段内的比赛顺序生成，从 01 累加到本阶段结束；进入下一阶段后重新从 01 开始。'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-6 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
              <div>
                <h2 className="text-base font-semibold text-slate-900">比赛代码格式修改</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">请配置比赛代码由哪些字段组成，以及字段之间如何拼接</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    1. 拖拽字段可调整顺序  2. 点击字段可设置该字段规则以及是否启用  3. 点击分隔符可设置拼接符号。
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="overflow-x-auto pb-2">
                    <Reorder.Group axis="x" values={components} onReorder={setComponents} className="flex min-w-max items-center gap-2">
                      {components.map((component, index) => (
                        <Reorder.Item
                          key={component.id}
                          value={component}
                          className="flex shrink-0 items-center gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => setPanelTarget({ type: 'field', id: component.id })}
                            className={`min-w-[128px] rounded-2xl border bg-white px-4 py-3 text-left transition-all ${
                              component.enabled
                                ? panelTarget?.type === 'field' && panelTarget.id === component.id
                                  ? 'border-indigo-300 text-indigo-700 shadow-sm ring-4 ring-indigo-50'
                                  : 'border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600'
                                : panelTarget?.type === 'field' && panelTarget.id === component.id
                                  ? 'border-slate-300 bg-slate-100 text-slate-500 ring-4 ring-slate-100'
                                  : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="block text-sm font-semibold">{component.name}</span>
                              <span className="block whitespace-nowrap text-xs text-current opacity-70">{getCodeComponentFormatLabel(component)}</span>
                            </div>
                          </button>
                          {index < components.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setPanelTarget({ type: 'separator' })}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                                panelTarget?.type === 'separator'
                                  ? 'border-indigo-200 bg-white text-indigo-600 ring-4 ring-indigo-50'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                              }`}
                            >
                              {getSeparatorLabel(separator)}
                            </button>
                          ) : null}
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    {selectedField && panelTarget?.type === 'field' && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-slate-800">
                          请设置“{selectedField.name}”在比赛代码中的展示方式：
                        </p>

                        <div className="flex flex-wrap items-end gap-4">
                          <label className="block w-full max-w-[260px] space-y-2">
                            <span className="text-sm font-medium text-slate-700">字段规则</span>
                            <select
                              value={selectedField.format}
                              onChange={(event) => updateComponent(selectedField.id, { format: event.target.value })}
                              disabled={selectedField.id === 'sequence'}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                              {selectedField.id === 'project' && (
                                <>
                                  <option value="code">项目代码</option>
                                  <option value="short_name">项目简称</option>
                                  <option value="name">项目名称</option>
                                </>
                              )}
                              {selectedField.id === 'phase' && <option value="S1">阶段序号（S1/S2/S3）</option>}
                              {selectedField.id === 'group' && (
                                <>
                                  <option value="letter">ABC</option>
                                  <option value="number">123</option>
                                  <option value="number_two_digit">010203</option>
                                </>
                              )}
                              {selectedField.id === 'round' && <option value="R1">轮次序号（R1/R2/R3）</option>}
                              {selectedField.id === 'sequence' && <option value="number">固定两位序号（01）</option>}
                            </select>
                          </label>

                          <div className="w-full max-w-[140px] space-y-2">
                            <span className="text-sm font-medium text-slate-700">示例</span>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                              {getCodeComponentExample(selectedField)}
                            </div>
                          </div>

                          <div className="w-full max-w-[140px] space-y-2">
                            <span className="text-sm font-medium text-slate-700">状态</span>
                            <div>
                              {selectedField.id === 'round' ? (
                                <button
                                  type="button"
                                  onClick={() => updateComponent(selectedField.id, { enabled: !selectedField.enabled })}
                                  className={`inline-flex min-h-[42px] items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                    selectedField.enabled
                                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                  }`}
                                >
                                  {selectedField.enabled ? '已启用' : '未启用'}
                                </button>
                              ) : (
                                <span className="inline-flex min-h-[42px] items-center rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-100">
                                  固定启用
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {panelTarget?.type === 'separator' && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-slate-800">请设置字段之间使用什么符号连接：</p>
                        <select
                          value={separator}
                          onChange={(event) => setSeparator(event.target.value)}
                          className="w-full max-w-[260px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="-">短横线 (-)</option>
                          <option value="_">下划线 (_)</option>
                          <option value="/">斜杠 (/)</option>
                          <option value="">无分隔符</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8">
      <section ref={singleExceptionRef} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">单项赛异常赛果处理</h3>
              <p className="mt-0.5 text-xs text-slate-500">用于定义单项比赛中弃权、退赛和比赛中断时的统一处理规则。</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900">统一规则</h2>
            </div>
            <p className="text-xs leading-6 text-slate-500">
              开启后，单项赛出现弃权、退赛或中断时，将按本赛事统一规则处理。
            </p>
            <ToggleSwitch
              checked={singleExceptionConfig.enabled}
              onChange={() =>
                setSingleExceptionConfig((prev) => ({
                  ...prev,
                  enabled: !prev.enabled,
                }))
              }
            />
          </div>

          {singleExceptionConfig.enabled ? (
            <>
              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">规则摘要</h2>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
                  <p className="text-sm leading-7 text-amber-800">{buildSingleExceptionSummary(singleExceptionConfig)}</p>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">赛前弃权</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                    <span className="font-medium text-slate-600">胜方补偿胜局数</span>
                    <input
                      type="number"
                      min={1}
                      value={singleExceptionConfig.preMatchForfeitWinGames}
                      onChange={(event) =>
                        setSingleExceptionConfig((prev) => ({
                          ...prev,
                          preMatchForfeitWinGames: Number(event.target.value || 0),
                        }))
                      }
                      className="w-28 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <span>局</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                    <span className="font-medium text-slate-600">每局补偿分数</span>
                    <input
                      type="number"
                      min={1}
                      value={singleExceptionConfig.preMatchForfeitPoints}
                      onChange={(event) =>
                        setSingleExceptionConfig((prev) => ({
                          ...prev,
                          preMatchForfeitPoints: Number(event.target.value || 0),
                        }))
                      }
                      className="w-28 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <span>分</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">比赛中退赛</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-600">当前局处理方式</span>
                    <select
                      value={singleExceptionConfig.retirementCurrentGame}
                      onChange={(event) =>
                        setSingleExceptionConfig((prev) => ({
                          ...prev,
                          retirementCurrentGame: event.target.value as SingleExceptionRuleConfig['retirementCurrentGame'],
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="complete_to_target">胜方补齐至目标分，退赛方保留当前得分</option>
                      <option value="manual">由裁判根据现场情况手动判定</option>
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-600">后续未开赛局处理方式</span>
                    <select
                      value={singleExceptionConfig.retirementPendingGames}
                      onChange={(event) =>
                        setSingleExceptionConfig((prev) => ({
                          ...prev,
                          retirementPendingGames: event.target.value as SingleExceptionRuleConfig['retirementPendingGames'],
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="follow_forfeit_rule">按赛前弃权规则补偿</option>
                      <option value="manual">由裁判决定处理方式</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">比赛中断</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { key: 'manual', label: '由裁判决定' },
                    { key: 'resume_later', label: '保留当前结果后续补赛' },
                    { key: 'replay_all', label: '整场重赛' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() =>
                        setSingleExceptionConfig((prev) => ({
                          ...prev,
                          interruptedHandling: option.key as SingleExceptionRuleConfig['interruptedHandling'],
                        }))
                      }
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                        singleExceptionConfig.interruptedHandling === option.key
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
              <div>
                <h2 className="text-base font-semibold text-slate-900">处理方式</h2>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-500">
                当前未启用单项赛统一异常赛果处理规则。赛事进行中如出现弃权、退赛或比赛中断，将由裁判根据现场情况决定处理方式。
              </div>
            </div>
          )}
        </div>
      </section>

      <section ref={teamExceptionRef} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">团体赛异常赛果处理</h3>
              <p className="mt-0.5 text-xs text-slate-500">用于定义团体 Tie 中整场弃权、未完成单项及已分胜负后续处理规则。</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900">统一规则</h2>
            </div>
            <p className="text-xs leading-6 text-slate-500">
              开启后，团体赛出现整场弃权、未完成单项或已分胜负后的后续处理时，将按本赛事统一规则处理。
            </p>
            <ToggleSwitch
              checked={teamExceptionConfig.enabled}
              onChange={() =>
                setTeamExceptionConfig((prev) => ({
                  ...prev,
                  enabled: !prev.enabled,
                }))
              }
            />
          </div>

          {teamExceptionConfig.enabled ? (
            <>
              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">规则摘要</h2>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                  <p className="text-sm leading-7 text-emerald-800">{buildTeamExceptionSummary(teamExceptionConfig)}</p>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">异常规则</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">整场弃权处理</span>
                  <select
                    value={teamExceptionConfig.tieForfeitHandling}
                    onChange={(event) =>
                      setTeamExceptionConfig((prev) => ({
                        ...prev,
                        tieForfeitHandling: event.target.value as TeamExceptionRuleConfig['tieForfeitHandling'],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="default_loss">整场弃权直接判负</option>
                    <option value="manual">由裁判决定</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">已完成单项结果</span>
                  <select
                    value={teamExceptionConfig.completedSubMatchesHandling}
                    onChange={(event) =>
                      setTeamExceptionConfig((prev) => ({
                        ...prev,
                        completedSubMatchesHandling: event.target.value as TeamExceptionRuleConfig['completedSubMatchesHandling'],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="keep_result">保留已完成结果</option>
                    <option value="manual">由裁判决定</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">未开始单项处理</span>
                  <select
                    value={teamExceptionConfig.pendingSubMatchesHandling}
                    onChange={(event) =>
                      setTeamExceptionConfig((prev) => ({
                        ...prev,
                        pendingSubMatchesHandling: event.target.value as TeamExceptionRuleConfig['pendingSubMatchesHandling'],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="count_as_loss">按默认负场处理</option>
                    <option value="manual">由裁判决定</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-600">已分胜负后未完成单项</span>
                  <select
                    value={teamExceptionConfig.unfinishedSubMatchesHandling}
                    onChange={(event) =>
                      setTeamExceptionConfig((prev) => ({
                        ...prev,
                        unfinishedSubMatchesHandling: event.target.value as TeamExceptionRuleConfig['unfinishedSubMatchesHandling'],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="finish_running">继续完成已开赛单项</option>
                    <option value="stop_immediately">立即终止未完成单项</option>
                  </select>
                </label>
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-5 px-6 py-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
              <div>
                <h2 className="text-base font-semibold text-slate-900">处理方式</h2>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-500">
                当前未启用团体赛统一异常赛果处理规则。赛事进行中如出现整场弃权、未完成单项或已分胜负后的后续处理，将由裁判根据现场情况决定。
              </div>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};
