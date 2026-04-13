import React, { useMemo, useState } from 'react';
import {
  Copy,
  FileText,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';

type DateRuleOperator = 'on_or_after' | 'on_or_before' | 'between';
type DateRuleMode = 'fixed';

type BirthDateRule = {
  id: string;
  operator: DateRuleOperator;
  mode: DateRuleMode;
  fixedDate: string;
  fixedStartDate: string;
  fixedEndDate: string;
  ageOffset: number;
  monthDay: string;
  rangeStartAgeOffset: number;
  rangeStartMonthDay: string;
  rangeEndAgeOffset: number;
  rangeEndMonthDay: string;
};

type GroupValue = {
  id: string;
  name: string;
  ruleEnabled: boolean;
  rules: BirthDateRule[];
};

type GroupDefinition = {
  id: string;
  name: string;
  description: string;
  values: GroupValue[];
  createdAt: string;
};

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createRule = (overrides: Partial<BirthDateRule> = {}): BirthDateRule => ({
  id: createId('rule'),
  operator: 'between',
  mode: 'fixed',
  fixedDate: '',
  fixedStartDate: '',
  fixedEndDate: '',
  ageOffset: 10,
  monthDay: '01-01',
  rangeStartAgeOffset: 10,
  rangeStartMonthDay: '01-01',
  rangeEndAgeOffset: 10,
  rangeEndMonthDay: '12-31',
  ...overrides,
});

const createValue = (name = '新组别', ruleEnabled = true): GroupValue => ({
  id: createId('value'),
  name,
  ruleEnabled,
  rules: [createRule()],
});

const INITIAL_GROUPS: GroupDefinition[] = [
  {
    id: 'group-u',
    name: 'U系列',
    description: '青少年分龄组，按出生日期区间划分对应年龄段。',
    createdAt: '2026-03-24 16:20:00',
    values: [
      {
        id: 'u10',
        name: 'U10',
        ruleEnabled: true,
        rules: [
          createRule({
            operator: 'between',
            mode: 'fixed',
            fixedStartDate: '2016-01-01',
            fixedEndDate: '2016-12-31',
          }),
        ],
      },
      {
        id: 'u12',
        name: 'U12',
        ruleEnabled: true,
        rules: [
          createRule({
            operator: 'between',
            mode: 'fixed',
            fixedStartDate: '2014-01-01',
            fixedEndDate: '2014-12-31',
          }),
        ],
      },
    ],
  },
  {
    id: 'group-open',
    name: '常规分组',
    description: '适用于按报名水平、赛道或资格范围进行常规人群划分。',
    createdAt: '2026-03-18 10:40:00',
    values: [
      {
        id: 'group-a',
        name: 'A组',
        ruleEnabled: false,
        rules: [createRule({ operator: 'on_or_after', mode: 'fixed', fixedDate: '2000-01-01' })],
      },
      {
        id: 'group-b',
        name: 'B组',
        ruleEnabled: false,
        rules: [createRule({ operator: 'on_or_after', mode: 'fixed', fixedDate: '2000-01-01' })],
      },
      {
        id: 'group-c',
        name: 'C组',
        ruleEnabled: false,
        rules: [createRule({ operator: 'on_or_after', mode: 'fixed', fixedDate: '2000-01-01' })],
      },
    ],
  },
];

const OPERATOR_OPTIONS: { value: DateRuleOperator; label: string }[] = [
  { value: 'on_or_after', label: '晚于或等于' },
  { value: 'on_or_before', label: '早于或等于' },
  { value: 'between', label: '介于区间' },
];

const formatSingleResolvedDate = (rule: BirthDateRule) => {
  return rule.fixedDate || '未设置日期';
};

const formatRangeResolvedDates = (rule: BirthDateRule) => {
  return {
    start: rule.fixedStartDate || '未设置开始日期',
    end: rule.fixedEndDate || '未设置结束日期',
  };
};

const summarizeRule = (rule: BirthDateRule) => {
  if (rule.operator === 'between') {
    const { start, end } = formatRangeResolvedDates(rule);
    return `出生日期 介于 ${start} ～ ${end}`;
  }

  const operatorLabel =
    OPERATOR_OPTIONS.find((item) => item.value === rule.operator)?.label ?? '晚于或等于';
  return `出生日期 ${operatorLabel} ${formatSingleResolvedDate(rule)}`;
};

export function GroupManagement({ prototypeMode = false }: { prototypeMode?: boolean }) {
  const [eventGroup, setEventGroup] = useState<GroupDefinition>(INITIAL_GROUPS[0]);
  const [selectedValueId, setSelectedValueId] = useState(INITIAL_GROUPS[0].values[0].id);

  const selectedGroup = eventGroup;
  const selectedValue =
    selectedGroup.values.find((value) => value.id === selectedValueId) ?? selectedGroup.values[0];
  const selectedRule = selectedValue?.rules[0];

  const updateSelectedGroup = (updater: (group: GroupDefinition) => GroupDefinition) => {
    setEventGroup((prev) => updater(prev));
  };

  const updateSelectedValue = (updater: (value: GroupValue) => GroupValue) => {
    if (!selectedGroup || !selectedValue) return;
    updateSelectedGroup((group) => ({
      ...group,
      values: group.values.map((value) => (value.id === selectedValue.id ? updater(value) : value)),
    }));
  };

  const addValue = () => {
    if (!selectedGroup) return;
    const newValue = createValue(`组别${selectedGroup.values.length + 1}`);
    updateSelectedGroup((group) => ({ ...group, values: [...group.values, newValue] }));
    setSelectedValueId(newValue.id);
  };

  const duplicateValue = () => {
    if (!selectedValue) return;
    const copiedValue: GroupValue = {
      ...selectedValue,
      id: createId('value'),
      name: `${selectedValue.name}副本`,
      rules: selectedValue.rules.map((rule) => ({ ...rule, id: createId('rule') })),
    };
    updateSelectedGroup((group) => ({ ...group, values: [...group.values, copiedValue] }));
    setSelectedValueId(copiedValue.id);
  };

  const deleteValue = () => {
    if (!selectedGroup || !selectedValue || selectedGroup.values.length === 1) return;
    const nextValues = selectedGroup.values.filter((value) => value.id !== selectedValue.id);
    updateSelectedGroup((group) => ({ ...group, values: nextValues }));
    setSelectedValueId(nextValues[0].id);
  };

  const updateRule = (ruleId: string, updates: Partial<BirthDateRule>) => {
    updateSelectedValue((value) => ({
      ...value,
      rules: value.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule)),
    }));
  };

  const toggleRuleEnabled = (enabled: boolean) => {
    updateSelectedValue((value) => ({
      ...value,
      ruleEnabled: enabled,
      rules: value.rules.length > 0 ? value.rules : [createRule()],
    }));
  };

  if (!selectedGroup || !selectedValue) return null;

  const resolvedRange = selectedRule ? formatRangeResolvedDates(selectedRule) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => window.alert(`赛事组别「${selectedGroup.name}」已保存`)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
        >
          <Save className="h-4 w-4" />
          保存组别
        </button>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">组别分组</h3>
          </div>
        </div>

        <div className="max-w-2xl space-y-6 px-6 py-6">
          <p className="text-sm leading-6 text-slate-500">
            为了便于管理，请先填写组别分组名称（必填）和分组说明（非必填），再在下方逐个维护具体组别。
          </p>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-600">组别分组名称</span>
            <input
              value={selectedGroup.name}
              onChange={(event) =>
                updateSelectedGroup((group) => ({ ...group, name: event.target.value }))
              }
              placeholder="请输入组别名称"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-600">分组说明</span>
            <textarea
              value={selectedGroup.description}
              onChange={(event) =>
                updateSelectedGroup((group) => ({ ...group, description: event.target.value }))
              }
              placeholder="请填写该组别的规则说明或设置目的，非必填"
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">组别管理</h3>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {selectedGroup.values.map((value, index) => {
                const isActive = value.id === selectedValueId;
                return (
                  <button
                    key={value.id}
                    onClick={() => setSelectedValueId(value.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    {value.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={addValue}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              新增组别
            </button>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">组别名称</span>
                    <input
                      value={selectedValue.name}
                      onChange={(event) =>
                        updateSelectedValue((value) => ({ ...value, name: event.target.value }))
                      }
                      placeholder="如 U10、成年组"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRuleEnabled(!selectedValue.ruleEnabled)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                      selectedValue.ruleEnabled
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
                        selectedValue.ruleEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-all ${
                          selectedValue.ruleEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </span>
                    校验规则
                  </button>
                  <button
                    onClick={duplicateValue}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                    复制
                  </button>
                  <button
                    onClick={deleteValue}
                    disabled={selectedGroup.values.length === 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm font-medium text-rose-500 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-slate-700">校验规则</h5>
                {!selectedValue.ruleEnabled ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500">
                    当前未启用校验规则。该组别将仅作为人群分组使用，不限制出生日期等条件。
                  </div>
                ) : selectedRule ? (
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid items-start gap-4 xl:grid-cols-3">
                      <div className="flex h-full flex-col">
                        <span className="text-sm font-medium text-slate-600">字段</span>
                        <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700">
                          出生日期
                        </div>
                      </div>

                      <label className="flex h-full flex-col">
                        <span className="text-sm font-medium text-slate-600">逻辑</span>
                        <select
                          value={selectedRule.operator}
                          onChange={(event) =>
                            updateRule(selectedRule.id, { operator: event.target.value as DateRuleOperator })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        >
                          {OPERATOR_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                    </label>

                      <label className="flex h-full flex-col">
                        <span className="text-sm font-medium text-slate-600">日期模式</span>
                        <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700">
                          固定日期
                        </div>
                      </label>
                    </div>

                    {selectedRule.operator === 'between' ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-600">开始日期</span>
                          <input
                            type="date"
                            value={selectedRule.fixedStartDate}
                            onChange={(event) =>
                              updateRule(selectedRule.id, { fixedStartDate: event.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-600">结束日期</span>
                          <input
                            type="date"
                            value={selectedRule.fixedEndDate}
                            onChange={(event) =>
                              updateRule(selectedRule.id, { fixedEndDate: event.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-600">出生日期</span>
                          <input
                            type="date"
                            value={selectedRule.fixedDate}
                            onChange={(event) => updateRule(selectedRule.id, { fixedDate: event.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </label>
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      规则预览：{summarizeRule(selectedRule)}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
  </div>
  );
}
