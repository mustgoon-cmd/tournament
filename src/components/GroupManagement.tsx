import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  FileText,
  PencilLine,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { TablePagination } from './TablePagination';

type DateRuleOperator = 'on_or_after' | 'on_or_before' | 'between';
type DateRuleMode = 'fixed' | 'dynamic';
type GroupPageMode = 'list' | 'editor';

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
  mode: 'dynamic',
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

const createValue = (name = '新组别值', ruleEnabled = true): GroupValue => ({
  id: createId('value'),
  name,
  ruleEnabled,
  rules: [createRule()],
});

const createGroup = (): GroupDefinition => {
  const firstValue = createValue('组别值1');
  return {
    id: createId('group'),
    name: '新组别',
    description: '',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    values: [firstValue],
  };
};

const INITIAL_GROUPS: GroupDefinition[] = [
  {
    id: 'group-u',
    name: 'U系列',
    description: '青少年分龄组，按出生日期自动计算对应年龄段。',
    createdAt: '2026-03-24 16:20:00',
    values: [
      {
        id: 'u10',
        name: 'U10',
        ruleEnabled: true,
        rules: [
          createRule({
            operator: 'between',
            mode: 'dynamic',
            rangeStartAgeOffset: 10,
            rangeStartMonthDay: '01-01',
            rangeEndAgeOffset: 10,
            rangeEndMonthDay: '12-31',
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
            mode: 'dynamic',
            rangeStartAgeOffset: 12,
            rangeStartMonthDay: '01-01',
            rangeEndAgeOffset: 12,
            rangeEndMonthDay: '12-31',
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

const normalizeMonthDay = (value: string, fallback: string) =>
  /^\d{2}-\d{2}$/.test(value) ? value : fallback;

const formatSingleResolvedDate = (rule: BirthDateRule, currentYear: number) => {
  if (rule.mode === 'fixed') {
    return rule.fixedDate || '未设置日期';
  }

  return `${currentYear - rule.ageOffset}-${normalizeMonthDay(rule.monthDay, '01-01')}`;
};

const formatRangeResolvedDates = (rule: BirthDateRule, currentYear: number) => {
  if (rule.mode === 'fixed') {
    return {
      start: rule.fixedStartDate || '未设置开始日期',
      end: rule.fixedEndDate || '未设置结束日期',
    };
  }

  return {
    start: `${currentYear - rule.rangeStartAgeOffset}-${normalizeMonthDay(rule.rangeStartMonthDay, '01-01')}`,
    end: `${currentYear - rule.rangeEndAgeOffset}-${normalizeMonthDay(rule.rangeEndMonthDay, '12-31')}`,
  };
};

const summarizeRule = (rule: BirthDateRule, currentYear: number) => {
  if (rule.operator === 'between') {
    const { start, end } = formatRangeResolvedDates(rule, currentYear);
    return `出生日期 介于 ${start} ～ ${end}`;
  }

  const operatorLabel =
    OPERATOR_OPTIONS.find((item) => item.value === rule.operator)?.label ?? '晚于或等于';
  return `出生日期 ${operatorLabel} ${formatSingleResolvedDate(rule, currentYear)}`;
};

export function GroupManagement({ prototypeMode = false }: { prototypeMode?: boolean }) {
  const currentYear = new Date().getFullYear();
  const [pageMode, setPageMode] = useState<GroupPageMode>('list');
  const [groups, setGroups] = useState<GroupDefinition[]>(INITIAL_GROUPS);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedGroupId, setSelectedGroupId] = useState(INITIAL_GROUPS[0].id);
  const [selectedValueId, setSelectedValueId] = useState(INITIAL_GROUPS[0].values[0].id);

  const filteredGroups = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return groups;
    return groups.filter((group) => group.name.toLowerCase().includes(keyword));
  }, [groups, searchQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const normalizedPage = Math.min(currentPage, totalPages);
  const pagedGroups = filteredGroups.slice((normalizedPage - 1) * pageSize, normalizedPage * pageSize);

  const applySearch = () => {
    setSearchQuery(searchDraft);
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchDraft('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0];
  const selectedValue =
    selectedGroup?.values.find((value) => value.id === selectedValueId) ?? selectedGroup?.values[0];
  const selectedRule = selectedValue?.rules[0];

  const updateSelectedGroup = (updater: (group: GroupDefinition) => GroupDefinition) => {
    if (!selectedGroup) return;
    setGroups((prev) => prev.map((group) => (group.id === selectedGroup.id ? updater(group) : group)));
  };

  const updateSelectedValue = (updater: (value: GroupValue) => GroupValue) => {
    if (!selectedGroup || !selectedValue) return;
    updateSelectedGroup((group) => ({
      ...group,
      values: group.values.map((value) => (value.id === selectedValue.id ? updater(value) : value)),
    }));
  };

  const openEditor = (groupId: string) => {
    const targetGroup = groups.find((group) => group.id === groupId);
    if (!targetGroup) return;
    setSelectedGroupId(groupId);
    setSelectedValueId(targetGroup.values[0]?.id ?? '');
    setPageMode('editor');
  };

  const handleCreateGroup = () => {
    const newGroup = createGroup();
    setGroups((prev) => [newGroup, ...prev]);
    setSelectedGroupId(newGroup.id);
    setSelectedValueId(newGroup.values[0].id);
    setPageMode('editor');
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    if (selectedGroupId === groupId) {
      const nextGroup = groups.find((group) => group.id !== groupId);
      if (nextGroup) {
        setSelectedGroupId(nextGroup.id);
        setSelectedValueId(nextGroup.values[0]?.id ?? '');
      }
    }
  };

  const addValue = () => {
    if (!selectedGroup) return;
    const newValue = createValue(`组别值${selectedGroup.values.length + 1}`);
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

  if (pageMode === 'list') {
    return (
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">组别管理</h3>
                <p className="mt-1 text-sm text-slate-500">组别用于对参赛选手进行人群划分，例如分为A组、B组或者按年龄分为U12、U14等</p>
              </div>
            </div>

            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              新建组别
            </button>
          </div>

          <div className="border-b border-slate-100 px-8 py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-[280px]">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="检索组别名称"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
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
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="min-w-[1200px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="px-8 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">组别名称</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">组别说明</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">组别值</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">创建时间</th>
                  <th className="sticky right-0 z-10 bg-white px-8 py-4 text-right text-sm font-semibold text-slate-900 whitespace-nowrap shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedGroups.length > 0 ? (
                  pagedGroups.map((group) => (
                    <tr key={group.id} className="align-top transition-colors hover:bg-slate-50/60">
                      <td className="px-8 py-6">
                        <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{group.name}</p>
                      </td>
                      <td className="px-6 py-6">
                        <p className="max-w-xl text-sm leading-6 text-slate-600">
                          {group.description || '暂未填写组别说明'}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-2">
                          {group.values.map((value) => (
                            <span
                              key={value.id}
                              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                            >
                              {value.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-slate-500 whitespace-nowrap">{group.createdAt}</td>
                      <td className="sticky right-0 z-10 bg-white px-8 py-6 shadow-[-12px_0_20px_-16px_rgba(15,23,42,0.18)] transition-colors group-hover:bg-slate-50/60">
                        <div className="flex flex-nowrap justify-end gap-2">
                          <button
                            onClick={() => openEditor(group.id)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700"
                          >
                            <PencilLine className="h-4 w-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
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
                      暂无组别数据，点击右上角“新建组别”开始配置。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            total={filteredGroups.length}
            page={normalizedPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="个组别"
            compact
          />
        </section>
      </div>
    );
  }

  if (!selectedGroup || !selectedValue) return null;

  const resolvedRange = selectedRule ? formatRangeResolvedDates(selectedRule, currentYear) : null;
  const resolvedDate = selectedRule ? formatSingleResolvedDate(selectedRule, currentYear) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setPageMode('list')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          返回组别列表
        </button>
        <button
          onClick={() => window.alert(`组别「${selectedGroup.name}」已保存`)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
        >
          <Save className="h-4 w-4" />
          保存组别
        </button>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">组别配置</h3>
        </div>

        <div className="space-y-10 px-6 py-6">
            <section className="max-w-2xl space-y-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-700">组别信息</h2>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-600">组别名称</span>
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
                <span className="text-sm font-medium text-slate-600">组别说明</span>
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
            </section>

            <section className="space-y-6">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-white px-5 py-4">
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
                  新增组别值
                </button>
              </div>
            </div>

            <div className="space-y-5 bg-white px-5 pb-5 pt-2">
              <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">组别值名称</span>
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
                    当前未启用校验规则。该组别值将仅作为人群分组使用，不限制出生日期等条件。
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
                        <select
                          value={selectedRule.mode}
                          onChange={(event) =>
                            updateRule(selectedRule.id, { mode: event.target.value as DateRuleMode })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="fixed">固定日期</option>
                          <option value="dynamic">按年龄计算</option>
                        </select>
                      </label>
                    </div>

                    {selectedRule.mode === 'fixed' ? (
                      selectedRule.operator === 'between' ? (
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
                      )
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100">
                          当前年份：{currentYear}
                        </div>
                        {selectedRule.operator === 'between' ? (
                          <div className="grid gap-4 xl:grid-cols-2">
                            <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                              <p className="mb-4 text-sm font-semibold text-slate-800">开始日期</p>
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-500">当前年 -</span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={selectedRule.rangeStartAgeOffset}
                                    onChange={(event) =>
                                      updateRule(selectedRule.id, {
                                        rangeStartAgeOffset: Number(event.target.value || 0),
                                      })
                                    }
                                    className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center text-lg font-bold text-indigo-600 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                  />
                                  <span className="text-sm text-slate-500">年</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-500">日期</span>
                                  <input
                                    value={selectedRule.rangeStartMonthDay}
                                    onChange={(event) =>
                                      updateRule(selectedRule.id, {
                                        rangeStartMonthDay: event.target.value.replace(/[^\d-]/g, '').slice(0, 5),
                                      })
                                    }
                                    placeholder="01-01"
                                    className="w-32 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                  />
                                </div>
                              </div>
                              <p className="mt-4 text-sm font-semibold text-indigo-600">{resolvedRange?.start}</p>
                            </div>

                            <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                              <p className="mb-4 text-sm font-semibold text-slate-800">结束日期</p>
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-500">当前年 -</span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={selectedRule.rangeEndAgeOffset}
                                    onChange={(event) =>
                                      updateRule(selectedRule.id, {
                                        rangeEndAgeOffset: Number(event.target.value || 0),
                                      })
                                    }
                                    className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center text-lg font-bold text-indigo-600 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                  />
                                  <span className="text-sm text-slate-500">年</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-500">日期</span>
                                  <input
                                    value={selectedRule.rangeEndMonthDay}
                                    onChange={(event) =>
                                      updateRule(selectedRule.id, {
                                        rangeEndMonthDay: event.target.value.replace(/[^\d-]/g, '').slice(0, 5),
                                      })
                                    }
                                    placeholder="12-31"
                                    className="w-32 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                  />
                                </div>
                              </div>
                              <p className="mt-4 text-sm font-semibold text-indigo-600">{resolvedRange?.end}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_200px]">
                            <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-500">当前年 -</span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={selectedRule.ageOffset}
                                    onChange={(event) =>
                                      updateRule(selectedRule.id, { ageOffset: Number(event.target.value || 0) })
                                    }
                                    className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center text-lg font-bold text-indigo-600 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                  />
                                  <span className="text-sm text-slate-500">年</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-500">日期</span>
                                  <input
                                    value={selectedRule.monthDay}
                                    onChange={(event) =>
                                      updateRule(selectedRule.id, {
                                        monthDay: event.target.value.replace(/[^\d-]/g, '').slice(0, 5),
                                      })
                                    }
                                    placeholder="01-01"
                                    className="w-32 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="rounded-[22px] border border-indigo-100 bg-indigo-50 px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">生效年份</p>
                              <p className="mt-2 text-2xl font-bold text-indigo-700">{currentYear - selectedRule.ageOffset}</p>
                              <p className="mt-2 text-sm text-indigo-500">{resolvedDate}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      规则预览：{summarizeRule(selectedRule, currentYear)}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
  );
}
