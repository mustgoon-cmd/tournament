import React from 'react';
import { PhaseConfig, MatchRound } from '../types';

interface MatchListProps {
  phases: PhaseConfig[];
  rounds: MatchRound[];
  onMatchClick?: (match: any) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ phases, rounds, onMatchClick }) => {
  if (!rounds || rounds.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        暂无场次数据
      </div>
    );
  }

  const totalMatches = rounds.reduce((sum, r) => sum + r.matches.length, 0);

  // Group matches by round name to create the summary boxes
  const summaryBoxes = rounds.map((r, idx) => {
    // Format "第1组" to "小组 A"
    let displayName = r.name;
    const groupMatch = r.name.match(/第(\d+)组/);
    if (groupMatch) {
      const groupIndex = parseInt(groupMatch[1]) - 1;
      displayName = `小组 ${String.fromCharCode(65 + groupIndex)}`;
    } else if (r.name === '循环赛') {
      displayName = '循环赛';
    } else if (r.name.startsWith('Round')) {
      displayName = `第 ${r.round_index} 轮`;
    }

    return {
      name: displayName,
      count: r.matches.length
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-[#F4F8FD] border border-[#B8D5F6] rounded-sm p-5">
        <h3 className="text-[#1D3B99] font-bold mb-4 text-base">比赛场次汇总</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {summaryBoxes.map((box, idx) => (
            <div key={idx} className="bg-white border border-slate-800 rounded px-4 py-2 min-w-[140px]">
              <span className="text-sm font-bold text-slate-800">{box.name}: {box.count} 场</span>
            </div>
          ))}
        </div>
        <div className="bg-[#E1EFFF] border border-[#8AB4F8] rounded px-4 py-2 inline-block min-w-[140px]">
          <span className="text-sm font-bold text-[#1D3B99]">总计: {totalMatches} 场</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3">编号</th>
                <th className="px-4 py-3">小组</th>
                <th className="px-4 py-3">阶段/轮次</th>
                <th className="px-4 py-3 text-right">选手A</th>
                <th className="px-4 py-3 text-center">VS</th>
                <th className="px-4 py-3">选手B</th>
                <th className="px-4 py-3 text-center">结果</th>
                <th className="px-4 py-3">场地</th>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3">裁判</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rounds.flatMap(round => 
                round.matches.map((match, mIdx) => {
                  // Extract group name if it exists in the round name (e.g., "第1组")
                  let groupName = '-';
                  const groupMatch = round.name.match(/第(\d+)组/);
                  if (groupMatch) {
                    const groupIndex = parseInt(groupMatch[1]) - 1;
                    groupName = `小组 ${String.fromCharCode(65 + groupIndex)}`;
                  }
                  
                  return (
                    <tr 
                      key={match.id} 
                      onClick={() => onMatchClick?.(match)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {match.code || `${match.phase_name.substring(0, 1)}${round.round_index + 1}-${match.match_index + 1}`}
                      </td>
                      <td className="px-4 py-3">
                        {groupName !== '-' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {groupName}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {match.phase_name} / R{round.round_index}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700">
                        {match.participant_a || '待定选手'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">:</td>
                      <td className="px-4 py-3 font-bold text-slate-700">
                        {match.participant_b || '待定选手'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">
                        {match.score || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {match.court || '待定'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {match.start_time || '待定'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        待定
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

