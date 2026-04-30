import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Settings2,
  Sparkles,
  X,
} from 'lucide-react';
import { EventGroupDefinition, Project } from '../types';
import {
  MATCH_FORMAT_GROUPS,
  getEventGroupCategories,
  getEventGroupValuesByCategory,
  getMatchFormatOption,
} from '../constants';

interface ProjectMatrixGeneratorProps {
  onBack: () => void;
  onGenerate: (projects: Project[]) => void;
  eventGroups: EventGroupDefinition[];
  enableTeamSetup: boolean;
}

export const ProjectMatrixGenerator: React.FC<ProjectMatrixGeneratorProps> = ({
  onBack,
  onGenerate,
  eventGroups,
  enableTeamSetup,
}) => {
  const eventGroupCategories = useMemo(() => getEventGroupCategories(eventGroups), [eventGroups]);
  const [matrixGroupCategory, setMatrixGroupCategory] = useState<string>(eventGroupCategories[0] || '');
  const [matrixFormatGroup, setMatrixFormatGroup] = useState<string>(MATCH_FORMAT_GROUPS[0].name);
  const [matrixFormats, setMatrixFormats] = useState<string[]>(['男子单打', '女子单打']);
  const [selectedMatrixCells, setSelectedMatrixCells] = useState<Set<string>>(new Set());
  const [matrixBaseFee, setMatrixBaseFee] = useState(199);
  const [matrixBaseDeposit, setMatrixBaseDeposit] = useState(0);
  const [matrixMaxSeats, setMatrixMaxSeats] = useState(32);
  const [matrixTemplate, setMatrixTemplate] = useState('通用报名模板');
  const [matrixTeamJoin, setMatrixTeamJoin] = useState(false);
  const [matrixMaxMembersPerTeam, setMatrixMaxMembersPerTeam] = useState(1);
  const [matrixMinSeats, setMatrixMinSeats] = useState(8);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!eventGroupCategories.length) {
      setMatrixGroupCategory('');
      setSelectedMatrixCells(new Set());
      return;
    }

    if (!eventGroupCategories.includes(matrixGroupCategory)) {
      setMatrixGroupCategory(eventGroupCategories[0]);
      setSelectedMatrixCells(new Set());
    }
  }, [eventGroupCategories, matrixGroupCategory]);

  const matrixGroupValues = useMemo(
    () => getEventGroupValuesByCategory(eventGroups, matrixGroupCategory).map((item) => item.value),
    [eventGroups, matrixGroupCategory],
  );

  const selectedPreview = useMemo(
    () => Array.from(selectedMatrixCells).slice(0, 6),
    [selectedMatrixCells],
  );

  const selectedProjects = useMemo(
    () =>
      Array.from(selectedMatrixCells)
        .map((item) => item.replace('|', ''))
        .sort((a, b) => a.localeCompare(b, 'zh-CN')),
    [selectedMatrixCells],
  );

  const currentFormatOptions = useMemo(
    () => MATCH_FORMAT_GROUPS.find((group) => group.name === matrixFormatGroup)?.options || [],
    [matrixFormatGroup],
  );

  const toggleMatrixCell = (group: string, format: string) => {
    const cellId = `${group}|${format}`;
    setSelectedMatrixCells((prev) => {
      const next = new Set(prev);
      if (next.has(cellId)) next.delete(cellId);
      else next.add(cellId);
      return next;
    });
  };

  const toggleMatrixRow = (group: string) => {
    const rowCells = matrixFormats.map((format) => `${group}|${format}`);
    const allSelected = rowCells.every((cell) => selectedMatrixCells.has(cell));
    setSelectedMatrixCells((prev) => {
      const next = new Set(prev);
      rowCells.forEach((cell) => {
        if (allSelected) next.delete(cell);
        else next.add(cell);
      });
      return next;
    });
  };

  const toggleMatrixCol = (format: string) => {
    const colCells = matrixGroupValues.map((group) => `${group}|${format}`);
    const allSelected = colCells.every((cell) => selectedMatrixCells.has(cell));
    setSelectedMatrixCells((prev) => {
      const next = new Set(prev);
      colCells.forEach((cell) => {
        if (allSelected) next.delete(cell);
        else next.add(cell);
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    const next = new Set<string>();
    matrixGroupValues.forEach((group) => {
      matrixFormats.forEach((format) => {
        next.add(`${group}|${format}`);
      });
    });
    setSelectedMatrixCells(next);
  };

  const confirmGenerate = () => {
    const newProjects: Project[] = [];
    selectedMatrixCells.forEach((cellId) => {
      const [group, format] = cellId.split('|');
      const formatOption = getMatchFormatOption(format);
      newProjects.push({
        id: `M-${Date.now()}-${Math.random()}`,
        name: `${group}${format}`,
        short_name: formatOption?.shortName || format,
        code: `${group}${formatOption?.code || format}`.toUpperCase(),
        type: 'single',
        match_format_rule: { category: formatOption?.groupName || matrixFormatGroup, operator: '=', value: format },
        group_rule: { category: matrixGroupCategory, operator: 'in', values: [group] },
        fee: matrixBaseFee,
        deposit: matrixBaseDeposit,
        max_seats: matrixMaxSeats,
        min_seats: matrixMinSeats,
        team_join: enableTeamSetup && matrixTeamJoin,
        max_members_per_team: enableTeamSetup && matrixTeamJoin ? matrixMaxMembersPerTeam : undefined,
        template: matrixTemplate,
        sort: 10,
        status: 'active',
        restrictions: [],
      });
    });
    setIsConfirmOpen(false);
    onGenerate(newProjects);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white px-7 py-5 shadow-sm">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onBack}
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">赛事矩阵生成器</h1>
            <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-500">
              面向单项项目，按比赛形式与组别维度批量生成报名项目。生成后仍可回到列表页继续逐项微调费用、模板与限制规则。
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <LayoutGrid className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">维度定义</h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">Format & Age Groups</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">比赛形式</label>
                  <div className="relative">
                    <select
                      value={matrixFormatGroup}
                      onChange={(e) => {
                        setMatrixFormatGroup(e.target.value);
                        setMatrixFormats([]);
                        setSelectedMatrixCells(new Set());
                      }}
                      className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pr-9 text-[12px] font-bold text-indigo-700 outline-none transition focus:border-indigo-300"
                    >
                      {MATCH_FORMAT_GROUPS.map((group) => (
                        <option key={group.id} value={group.name}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentFormatOptions.map((format) => {
                    const isSelected = matrixFormats.includes(format.value);
                    return (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? matrixFormats.filter((item) => item !== format.value)
                            : [...matrixFormats, format.value];
                          if (next.length === 0) return;
                          setMatrixFormats(next);
                          setSelectedMatrixCells(new Set());
                        }}
                        className={`rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {format.value}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">组别维度</label>
                  <div className="relative">
                    <select
                      value={matrixGroupCategory}
                      onChange={(e) => {
                        setMatrixGroupCategory(e.target.value);
                        setSelectedMatrixCells(new Set());
                      }}
                      className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pr-9 text-[12px] font-bold text-indigo-700 outline-none transition focus:border-indigo-300"
                    >
                      {eventGroupCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600" />
                  </div>
                </div>

                {matrixGroupValues.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {matrixGroupValues.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => toggleMatrixRow(group)}
                        className={`rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition ${
                          matrixFormats.every((format) => selectedMatrixCells.has(`${group}|${format}`))
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    当前赛事还没有可用于矩阵生成的组别，请先去“赛事组别”页面完成配置。
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Settings2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">基础模板配置</h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">Base Configuration</p>
              </div>
            </div>

            <div className="mt-6 space-y-4.5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">报名模板</span>
                <input
                  value={matrixTemplate}
                  onChange={(e) => setMatrixTemplate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">基础报名费</span>
                  <input
                    type="number"
                    value={matrixBaseFee}
                    onChange={(e) => setMatrixBaseFee(Number(e.target.value || 0))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">押金</span>
                  <input
                    type="number"
                    value={matrixBaseDeposit}
                    onChange={(e) => setMatrixBaseDeposit(Number(e.target.value || 0))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">最少成赛人数</span>
                  <input
                    type="number"
                    value={matrixMinSeats}
                    onChange={(e) => setMatrixMinSeats(Number(e.target.value || 0))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">席位上限</span>
                  <input
                    type="number"
                    value={matrixMaxSeats}
                    onChange={(e) => setMatrixMaxSeats(Number(e.target.value || 0))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">报名页面队伍是否必填</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {enableTeamSetup
                        ? '开启后，用户报名该项目时需先加入或创建队伍。'
                        : '当前赛事未启用队伍，请先在「报名规则 - 队伍限制」中将”启用队伍“选择为开启。'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!enableTeamSetup}
                    onClick={() => enableTeamSetup && setMatrixTeamJoin((prev) => !prev)}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full px-2 text-xs font-semibold transition-all ${
                      !enableTeamSetup
                        ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                        : matrixTeamJoin
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{enableTeamSetup && matrixTeamJoin ? '开' : '关'}</span>
                    <span
                      className={`absolute h-6 w-6 rounded-full bg-white shadow transition-all ${
                        enableTeamSetup && matrixTeamJoin ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                {enableTeamSetup && matrixTeamJoin && (
                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">每队人数</span>
                    <input
                      type="number"
                      min={1}
                      value={matrixMaxMembersPerTeam}
                      onChange={(e) => setMatrixMaxMembersPerTeam(Number(e.target.value || 1))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">矩阵选择</h2>
                <p className="mt-1 text-sm text-slate-500">按行列勾选需要生成的组别与比赛形式组合。</p>
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={matrixGroupValues.length === 0 || matrixFormats.length === 0}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
              >
                全选当前矩阵
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">组别</th>
                    {matrixFormats.map((format) => (
                      <th key={format} className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleMatrixCol(format)}
                          className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          {format}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixGroupValues.map((group) => (
                    <tr key={group} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleMatrixRow(group)}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          {group}
                        </button>
                      </td>
                      {matrixFormats.map((format) => {
                        const cellId = `${group}|${format}`;
                        const selected = selectedMatrixCells.has(cellId);
                        return (
                          <td key={cellId} className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleMatrixCell(group, format)}
                              className={`inline-flex h-11 min-w-[96px] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                                selected
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/40'
                              }`}
                            >
                              {selected ? '已选中' : '选择'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">生成预览</h2>
                <p className="mt-1 text-sm text-slate-500">当前已选择 {selectedMatrixCells.size} 个项目组合。</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPreview.length > 0 ? (
                selectedPreview.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"
                  >
                    {item.replace('|', ' / ')}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">还没有选择任何矩阵组合。</p>
              )}
              {selectedProjects.length > selectedPreview.length && (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  +{selectedProjects.length - selectedPreview.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={selectedMatrixCells.size === 0}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
              生成报名项目
            </button>
          </section>
        </div>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">确认生成</h3>
                <p className="mt-1 text-sm text-slate-500">将批量创建 {selectedProjects.length} 个单项报名项目。</p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                生成后会直接写入项目列表，仍可在“报名项目管理”中继续调整费用、模板、席位与限制规则。
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmGenerate}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                确认生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
