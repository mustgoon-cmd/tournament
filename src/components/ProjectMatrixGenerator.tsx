import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Settings2,
  Sparkles,
  X,
} from 'lucide-react';
import { Project } from '../types';
import { GROUP_OPTIONS, MATCH_FORMAT_GROUPS, getMatchFormatOption } from '../constants';

interface ProjectMatrixGeneratorProps {
  onBack: () => void;
  onGenerate: (projects: Project[]) => void;
}

export const ProjectMatrixGenerator: React.FC<ProjectMatrixGeneratorProps> = ({
  onBack,
  onGenerate,
}) => {
  const [matrixGroupCategory, setMatrixGroupCategory] = useState<string>('U系列');
  const [matrixGroupValues, setMatrixGroupValues] = useState<string[]>(GROUP_OPTIONS['U系列']);
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
        team_join: matrixTeamJoin,
        max_members_per_team: matrixTeamJoin ? matrixMaxMembersPerTeam : undefined,
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
                        const nextCategory = e.target.value;
                        setMatrixGroupCategory(nextCategory);
                        setMatrixGroupValues(GROUP_OPTIONS[nextCategory]);
                        setSelectedMatrixCells(new Set());
                      }}
                      className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pr-9 text-[12px] font-bold text-indigo-700 outline-none transition focus:border-indigo-300"
                    >
                      {Object.keys(GROUP_OPTIONS)
                        .filter((category) => category !== '自定义')
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600" />
                  </div>
                </div>

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
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">基础报名费 (CNY)</span>
                  <input
                    type="number"
                    value={matrixBaseFee}
                    onChange={(e) => setMatrixBaseFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xl font-black text-slate-900 outline-none transition focus:border-indigo-300"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">押金</span>
                  <input
                    type="number"
                    value={matrixBaseDeposit}
                    onChange={(e) => setMatrixBaseDeposit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base font-bold text-slate-900 outline-none transition focus:border-indigo-300"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">名额上限</span>
                  <input
                    type="number"
                    value={matrixMaxSeats}
                    onChange={(e) => setMatrixMaxSeats(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base font-bold text-slate-900 outline-none transition focus:border-indigo-300"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">最少立项人数</span>
                  <input
                    type="number"
                    value={matrixMinSeats}
                    onChange={(e) => setMatrixMinSeats(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base font-bold text-slate-900 outline-none transition focus:border-indigo-300"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">报名模板</span>
                <select
                  value={matrixTemplate}
                  onChange={(e) => setMatrixTemplate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-300"
                >
                  <option value="通用报名模板">通用报名模板</option>
                  <option value="精英赛模板">精英赛模板</option>
                  <option value="默认模板">默认模板</option>
                </select>
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">报名需加入队伍</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">开启后，则报名页面队伍为必填项</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMatrixTeamJoin((prev) => !prev)}
                    className={`relative h-6 w-11 rounded-full transition ${matrixTeamJoin ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${matrixTeamJoin ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              {matrixTeamJoin && (
                <label className="block space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">每队最多报名人数</span>
                  <input
                    type="number"
                    min={1}
                    value={matrixMaxMembersPerTeam}
                    onChange={(e) => setMatrixMaxMembersPerTeam(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base font-bold text-slate-900 outline-none transition focus:border-indigo-300"
                  />
                </label>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-7 py-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">矩阵生成器</h2>
              <p className="mt-1 text-[13px] text-slate-500">勾选需要生成的项目组合</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.16em]">
              <button type="button" onClick={handleSelectAll} className="text-indigo-600 transition hover:text-indigo-700">
                全选
              </button>
              <button type="button" onClick={() => setSelectedMatrixCells(new Set())} className="text-slate-400 transition hover:text-slate-600">
                清空
              </button>
            </div>
          </div>

          <div className="px-7 py-5">
            <div className="overflow-hidden rounded-[20px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead className="bg-slate-50 text-slate-400">
                    <tr>
                      <th className="w-24 border-b border-slate-200 px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.16em]">
                        组别
                      </th>
                      {matrixFormats.map((format) => (
                        <th key={format} className="border-b border-slate-200 px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleMatrixCol(format)}
                            className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:text-indigo-600"
                          >
                            {format}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixGroupValues.map((group) => (
                      <tr key={group} className="bg-white">
                        <td className="border-b border-slate-100 px-4 py-5">
                          <button
                            type="button"
                            onClick={() => toggleMatrixRow(group)}
                            className="text-base font-bold text-slate-700 transition hover:text-indigo-600"
                          >
                            {group}
                          </button>
                        </td>
                        {matrixFormats.map((format) => {
                          const cellId = `${group}|${format}`;
                          const isSelected = selectedMatrixCells.has(cellId);
                          return (
                            <td key={cellId} className="border-b border-slate-100 px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => toggleMatrixCell(group, format)}
                                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border-2 transition ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'border-slate-200 bg-slate-50 text-transparent hover:border-indigo-200'
                                }`}
                              >
                                <CheckCircle2 className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="text-[13px] leading-6 text-slate-400">
                将批量生成 <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-black text-indigo-600">{selectedMatrixCells.size}</span> 个单项项目，生成后可在列表页修改单个项目的名称、代码、模板和限制规则。
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={selectedMatrixCells.size === 0}
                className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                <Sparkles className="h-4.5 w-4.5" />
                一键生成项目
              </button>
            </div>
          </div>
        </section>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">确认批量生成项目</h3>
                <p className="mt-1 text-[13px] leading-6 text-slate-500">
                  本次将按照当前矩阵选择结果，批量创建以下 {selectedProjects.length} 个报名项目。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="max-h-[320px] overflow-y-auto rounded-[20px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap gap-2.5">
                  {selectedProjects.map((projectName) => (
                    <span
                      key={projectName}
                      className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200"
                    >
                      {projectName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-6 text-amber-800">
                请确认项目名称、组别与比赛形式组合无误。确认后将一次性写入报名项目列表。
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                返回检查
              </button>
              <button
                type="button"
                onClick={confirmGenerate}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
              >
                <Sparkles className="h-4.5 w-4.5" />
                确认生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
