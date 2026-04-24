import React, { useEffect, useMemo, useState } from 'react';
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
import {
  EventGroupDefinition,
  EventGroupRule,
  EventGroupRuleOperator,
  EventGroupValue,
} from '../types';

type GroupPageMode = 'list' | 'editor';

interface GroupManagementProps {
  prototypeMode?: boolean;
  value: EventGroupDefinition[];
  onChange: (groups: EventGroupDefinition[]) => void;
  singleGroupMode?: boolean;
}

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createRule = (overrides: Partial<EventGroupRule> = {}): EventGroupRule => ({
  id: createId('rule'),
  operator: 'between',
  fixedDate: '',
  fixedStartDate: '',
  fixedEndDate: '',
  ...overrides,
});

const createValue = (name = '新组别', ruleEnabled = true): EventGroupValue => ({
  id: createId('value'),
  name,
  ruleEnabled,
  rules: [createRule()],
});

const createGroup = (): EventGroupDefinition => ({
  id: createId('group'),
  name: '新组别分组',
  description: '',
  createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  values: [createValue('组别1')],
});

const OPERATOR_OPTIONS: { value: EventGroupRuleOperator; label: string }[] = [
  { value: 'on_or_after', label: '晚于或等于' },
  { value: 'on_or_before', label: '早于或等于' },
  { value: 'between', label: '介于区间' },
];

const formatSingleResolvedDate = (rule: EventGroupRule) => rule.fixedDate || '未设置日期';

const formatRangeResolvedDates = (rule: EventGroupRule) => ({
  start: rule.fixedStartDate || '未设置开始日期',
  end: rule.fixedEndDate || '未设置结束日期',
});

const summarizeRule = (rule: EventGroupRule) => {
  if (rule.operator === 'between') {
    const { start, end } = formatRangeResolvedDates(rule);
    return `出生日期 介于 ${start} ～ ${end}`;
  }

  const operatorLabel =
    OPERATOR_OPTIONS.find((item) => item.value === rule.operator)?.label ?? '晚于或等于';
  return `出生日期 ${operatorLabel} ${formatSingleResolvedDate(rule)}`;
};

export function GroupManagement({
  prototypeMode = false,
  value,
  onChange,
  singleGroupMode = false,
}: GroupManagementProps) {
  void prototypeMode;

  const [pageMode, setPageMode] = useState<GroupPageMode>(singleGroupMode ? 'editor' : 'list');
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(value[0]?.id ?? '');
  const [selectedValueId, setSelectedValueId] = useState(value[0]?.values[0]?.id ?? '');

  useEffect(() => {
    if (!singleGroupMode) return;
    if (value.length > 0) return;

    const initialGroup = createGroup();
    onChange([initialGroup]);
    setSelectedGroupId(initialGroup.id);
    setSelectedValueId(initialGroup.values[0]?.id ?? '');
  }, [onChange, singleGroupMode, value]);

  useEffect(() => {
    if (value.length === 0) {
      setSelectedGroupId('');
      setSelectedValueId('');
      return;
    }

    if (!value.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(value[0].id);
    }
  }, [selectedGroupId, value]);

  useEffect(() => {
    if (!singleGroupMode || value.length === 0) return;
    if (selectedGroupId !== value[0].id) {
      setSelectedGroupId(value[0].id);
    }
    if (pageMode !== 'editor') {
      setPageMode('editor');
    }
  }, [pageMode, selectedGroupId, singleGroupMode, value]);

  const selectedGroup = value.find((group) => group.id === selectedGroupId) ?? value[0];

  useEffect(() => {
    if (!selectedGroup) {
      setSelectedValueId('');
      return;
    }

    if (!selectedGroup.values.some((groupValue) => groupValue.id === selectedValueId)) {
      setSelectedValueId(selectedGroup.values[0]?.id ?? '');
    }
  }, [selectedGroup, selectedValueId]);

  const selectedValue =
    selectedGroup?.values.find((groupValue) => groupValue.id === selectedValueId) ??
    selectedGroup?.values[0];
  const selectedRule = selectedValue?.rules[0];

  const filteredGroups = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return value;
    return value.filter(
      (group) =>
        group.name.toLowerCase().includes(keyword) ||
        group.values.some((groupValue) => groupValue.name.toLowerCase().includes(keyword)),
    );
  }, [searchQuery, value]);

  const updateSelectedGroup = (updater: (group: EventGroupDefinition) => EventGroupDefinition) => {
    if (!selectedGroup) return;
    onChange(value.map((group) => (group.id === selectedGroup.id ? updater(group) : group)));
  };

  const updateSelectedValue = (updater: (groupValue: EventGroupValue) => EventGroupValue) => {
    if (!selectedGroup || !selectedValue) return;
    updateSelectedGroup((group) => ({
      ...group,
      values: group.values.map((groupValue) =>
        groupValue.id === selectedValue.id ? updater(groupValue) : groupValue,
      ),
    }));
  };

  const applySearch = () => {
    setSearchQuery(searchDraft);
  };

  const resetSearch = () => {
    setSearchDraft('');
    setSearchQuery('');
  };

  const openEditor = (groupId: string) => {
    const targetGroup = value.find((group) => group.id === groupId);
    if (!targetGroup) return;
    setSelectedGroupId(groupId);
    setSelectedValueId(targetGroup.values[0]?.id ?? '');
    setPageMode('editor');
  };

  const handleCreateGroup = () => {
    const newGroup = createGroup();
    onChange([newGroup, ...value]);
    setSelectedGroupId(newGroup.id);
    setSelectedValueId(newGroup.values[0]?.id ?? '');
    setPageMode('editor');
  };

  const handleDeleteGroup = (groupId: string) => {
    if (value.length === 1) return;
    const nextGroups = value.filter((group) => group.id !== groupId);
    onChange(nextGroups);
    if (selectedGroupId === groupId) {
      setSelectedGroupId(nextGroups[0]?.id ?? '');
      setSelectedValueId(nextGroups[0]?.values[0]?.id ?? '');
    }
    if (pageMode === 'editor' && nextGroups.length === 0) {
      setPageMode('list');
    }
  };

  const addValue = () => {
    if (!selectedGroup) return;
    const newValue = createValue(`组别${selectedGroup.values.length + 1}`);
    updateSelectedGroup((group) => ({ ...group, values: [...group.values, newValue] }));
    setSelectedValueId(newValue.id);
  };

  const duplicateValue = () => {
    if (!selectedValue) return;
    const copiedValue: EventGroupValue = {
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
    const nextValues = selectedGroup.values.filter((groupValue) => groupValue.id !== selectedValue.id);
    updateSelectedGroup((group) => ({ ...group, values: nextValues }));
    setSelectedValueId(nextValues[0]?.id ?? '');
  };

  const updateRule = (ruleId: string, updates: Partial<EventGroupRule>) => {
    updateSelectedValue((groupValue) => ({
      ...groupValue,
      rules: groupValue.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule)),
    }));
  };

  const toggleRuleEnabled = (enabled: boolean) => {
    updateSelectedValue((groupValue) => ({
      ...groupValue,
      ruleEnabled: enabled,
      rules: groupValue.rules.length > 0 ? groupValue.rules : [createRule()],
    }));
  };

  if (pageMode === 'list' && !singleGroupMode) {
    return (
      <div className="max-w-7xl mx-auto">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 px-8 py-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">组别管理</h3>
                <p className="mt-1 text-sm text-slate-500">统一维护赛事组别分组、具体组别及其校验规则。</p>
              </div>
            </div>

            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              新建组别分组
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
                  placeholder="检索组别分组或具体组别名称"
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

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="px-8 py-4 text-sm font-semibold text-slate-900">组别分组</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900">分组说明</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900">具体组别</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-900">创建时间</th>
                  <th className="px-8 py-4 text-right text-sm font-semibold text-slate-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <tr key={group.id} className="align-top transition-colors hover:bg-slate-50/60">
                      <td className="px-8 py-6">
                        <p className="text-sm font-semibold text-slate-900">{group.name}</p>
                      </td>
                      <td className="px-6 py-6">
                        <p className="max-w-xl text-sm leading-6 text-slate-600">
                          {group.description || '暂未填写组别分组说明'}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-2">
                          {group.values.map((groupValue) => (
                            <span
                              key={groupValue.id}
                              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                            >
                              {groupValue.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-slate-500">{group.createdAt}</td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditor(group.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            <PencilLine className="h-4 w-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={value.length === 1}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-500 transition-all hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
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
                      暂无组别数据，点击右上角“新建组别分组”开始配置。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  if (!selectedGroup || !selectedValue || !selectedRule) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        {singleGroupMode ? (
          <div className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200">
            当前赛事仅维护 1 个组别分组，可在下方直接配置多个具体组别。
          </div>
        ) : (
          <button
            onClick={() => setPageMode('list')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            返回组别列表
          </button>
        )}
        <button
          onClick={() => window.alert(`组别分组「${selectedGroup.name}」已保存`)}
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
            先维护组别分组名称与说明，再在下方逐个配置该分组下的具体组别及其校验规则。
          </p>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-600">组别分组名称</span>
            <input
              value={selectedGroup.name}
              onChange={(event) =>
                updateSelectedGroup((group) => ({ ...group, name: event.target.value }))
              }
              placeholder="请输入组别分组名称"
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
              placeholder="请填写该组别分组的规则说明或设置目的，非必填"
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
            <h3 className="text-lg font-bold text-slate-900">具体组别</h3>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {selectedGroup.values.map((groupValue, index) => {
                const isActive = groupValue.id === selectedValueId;
                return (
                  <button
                    key={groupValue.id}
                    onClick={() => setSelectedValueId(groupValue.id)}
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
                    {groupValue.name}
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
                        updateSelectedValue((groupValue) => ({ ...groupValue, name: event.target.value }))
                      }
                      placeholder="如 U10、公开组"
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
                ) : (
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
                            updateRule(selectedRule.id, {
                              operator: event.target.value as EventGroupRuleOperator,
                            })
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

                      <div className="flex h-full flex-col">
                        <span className="text-sm font-medium text-slate-600">日期模式</span>
                        <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700">
                          固定日期
                        </div>
                      </div>
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
                            onChange={(event) =>
                              updateRule(selectedRule.id, { fixedDate: event.target.value })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </label>
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      规则预览：{summarizeRule(selectedRule)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
