import React, { useRef, useState } from 'react';
import { Reorder } from 'motion/react';
import { AlertTriangle, Eye, Hash, RefreshCw, Save, Settings2 } from 'lucide-react';

type CodeComponentType = 'project' | 'phase' | 'group' | 'round' | 'sequence';

type CodeComponent = {
  id: CodeComponentType;
  name: string;
  format: string;
  length: number;
  enabled: boolean;
  joiner: string;
};

type ExceptionEventType = 'forfeit' | 'injury_retirement' | 'disqualification' | 'forced_stop' | 'interruption';

type ExceptionResultDecision = 'opponent_win' | 'current_score' | 'replay' | 'manual';
type ExceptionCurrentGameScore = 'complete_to_target' | 'keep_current_score' | 'void_current_game' | 'manual';
type ExceptionPendingGames = 'forfeit_compensation' | 'cancel_remaining' | 'not_counted' | 'manual';
type ExceptionMatchStatus = 'completed' | 'unfinished' | 'cancelled' | 'interrupted_pending' | 'manual';

type ExceptionRuleRow = {
  type: ExceptionEventType;
  name: string;
  description: string;
  resultDecision: ExceptionResultDecision;
  currentGameScore: ExceptionCurrentGameScore;
  pendingGames: ExceptionPendingGames;
  matchStatus: ExceptionMatchStatus;
};

type ExceptionRuleConfig = {
  enabled: boolean;
  rules: ExceptionRuleRow[];
};

type StoredMatchRuleConfig = {
  components?: CodeComponent[];
  separator?: string;
  exceptionRuleConfig?: ExceptionRuleConfig;
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

const RESULT_DECISION_OPTIONS: { value: ExceptionResultDecision; label: string }[] = [
  { value: 'opponent_win', label: '对方获胜' },
  { value: 'current_score', label: '按当前比分判定' },
  { value: 'replay', label: '比赛无效重赛' },
  { value: 'manual', label: '裁判手动判定' },
];

const CURRENT_GAME_SCORE_OPTIONS: { value: ExceptionCurrentGameScore; label: string }[] = [
  { value: 'complete_to_target', label: '胜方补齐至目标分' },
  { value: 'keep_current_score', label: '保留当前比分' },
  { value: 'void_current_game', label: '当前局作废' },
  { value: 'manual', label: '裁判手动处理' },
];

const PENDING_GAMES_OPTIONS: { value: ExceptionPendingGames; label: string }[] = [
  { value: 'forfeit_compensation', label: '按弃权补偿' },
  { value: 'cancel_remaining', label: '取消剩余未开始局' },
  { value: 'not_counted', label: '未开始局不计入' },
  { value: 'manual', label: '裁判手动处理' },
];

const MATCH_STATUS_OPTIONS: { value: ExceptionMatchStatus; label: string }[] = [
  { value: 'completed', label: '已完赛' },
  { value: 'unfinished', label: '未完赛' },
  { value: 'cancelled', label: '已取消' },
  { value: 'interrupted_pending', label: '中断待处理' },
  { value: 'manual', label: '裁判确认后生效' },
];

const DEFAULT_EXCEPTION_RULES: ExceptionRuleRow[] = [
  {
    type: 'forfeit',
    name: '弃权',
    description: '比赛开始前或比赛过程中一方主动放弃比赛。',
    resultDecision: 'opponent_win',
    currentGameScore: 'complete_to_target',
    pendingGames: 'forfeit_compensation',
    matchStatus: 'completed',
  },
  {
    type: 'injury_retirement',
    name: '伤退',
    description: '选手因伤病或身体原因无法继续比赛。',
    resultDecision: 'opponent_win',
    currentGameScore: 'keep_current_score',
    pendingGames: 'forfeit_compensation',
    matchStatus: 'completed',
  },
  {
    type: 'disqualification',
    name: '取消资格',
    description: '因违规、资格不符等原因被取消参赛资格。',
    resultDecision: 'opponent_win',
    currentGameScore: 'complete_to_target',
    pendingGames: 'forfeit_compensation',
    matchStatus: 'completed',
  },
  {
    type: 'forced_stop',
    name: '强制结束',
    description: '比赛已产生处理结论，但现场需要提前终止未完成内容。',
    resultDecision: 'current_score',
    currentGameScore: 'keep_current_score',
    pendingGames: 'cancel_remaining',
    matchStatus: 'unfinished',
  },
  {
    type: 'interruption',
    name: '比赛中断',
    description: '因天气、设备、场地或突发事件导致比赛无法继续。',
    resultDecision: 'manual',
    currentGameScore: 'keep_current_score',
    pendingGames: 'not_counted',
    matchStatus: 'interrupted_pending',
  },
];

const DEFAULT_EXCEPTION_RULE_CONFIG: ExceptionRuleConfig = {
  enabled: true,
  rules: DEFAULT_EXCEPTION_RULES,
};

const normalizeExceptionRuleConfig = (storedConfig?: ExceptionRuleConfig): ExceptionRuleConfig => ({
  enabled: storedConfig?.enabled ?? DEFAULT_EXCEPTION_RULE_CONFIG.enabled,
  rules: DEFAULT_EXCEPTION_RULES.map((defaultRule) => ({
    ...defaultRule,
    ...(storedConfig?.rules?.find((rule) => rule.type === defaultRule.type) || {}),
    type: defaultRule.type,
    name: defaultRule.name,
    description: defaultRule.description,
  })),
});

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

export const MatchCodeConfig: React.FC = () => {
  const [components, setComponents] = useState<CodeComponent[]>(() => {
    const stored = loadStoredMatchRuleConfig();
    return normalizeCodeComponents(stored.components, stored.separator || '-');
  });
  const [separator, setSeparator] = useState(() => loadStoredMatchRuleConfig().separator || '-');
  const [exceptionRuleConfig, setExceptionRuleConfig] = useState<ExceptionRuleConfig>(() =>
    normalizeExceptionRuleConfig(loadStoredMatchRuleConfig().exceptionRuleConfig)
  );
  const [panelTarget, setPanelTarget] = useState<MatchCodePanelTarget>({
    type: 'field',
    id: 'project',
  });
  const [isSaving, setIsSaving] = useState(false);
  const codeFormatRef = useRef<HTMLElement | null>(null);
  const exceptionRef = useRef<HTMLElement | null>(null);

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

  const updateExceptionRule = (type: ExceptionEventType, updates: Partial<ExceptionRuleRow>) => {
    setExceptionRuleConfig((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => (rule.type === type ? { ...rule, ...updates } : rule)),
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const payload: StoredMatchRuleConfig = {
      components,
      separator,
      exceptionRuleConfig,
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
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => codeFormatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-sm"
              >
                比赛代码格式
              </button>
              <button
                type="button"
                onClick={() => exceptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-amber-600 hover:shadow-sm"
              >
                异常赛果处理
              </button>
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

      <section ref={exceptionRef} className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h3 className="text-xl font-bold text-slate-900">异常赛果处理</h3>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {exceptionRuleConfig.rules.map((rule) => (
              <div key={rule.type} className="grid gap-5 px-6 py-5 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{rule.name}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{rule.description}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold text-slate-500">结果判定方式</span>
                    <select
                      value={rule.resultDecision}
                      onChange={(event) =>
                        updateExceptionRule(rule.type, {
                          resultDecision: event.target.value as ExceptionResultDecision,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {RESULT_DECISION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-semibold text-slate-500">当前局比分处理方式</span>
                    <select
                      value={rule.currentGameScore}
                      onChange={(event) =>
                        updateExceptionRule(rule.type, {
                          currentGameScore: event.target.value as ExceptionCurrentGameScore,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {CURRENT_GAME_SCORE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-semibold text-slate-500">未开始局处理方式</span>
                    <select
                      value={rule.pendingGames}
                      onChange={(event) =>
                        updateExceptionRule(rule.type, {
                          pendingGames: event.target.value as ExceptionPendingGames,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {PENDING_GAMES_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-semibold text-slate-500">比赛状态处理方式</span>
                    <select
                      value={rule.matchStatus}
                      onChange={(event) =>
                        updateExceptionRule(rule.type, {
                          matchStatus: event.target.value as ExceptionMatchStatus,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    >
                      {MATCH_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
