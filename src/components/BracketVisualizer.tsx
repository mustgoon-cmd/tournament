import React from 'react';
import { PhaseConfig, PhaseType, MatchRound } from '../types';

interface BracketVisualizerProps {
  phase: PhaseConfig;
  rounds: MatchRound[];
  previousPhase?: PhaseConfig;
  onMatchClick?: (match: any) => void;
}

export const BracketVisualizer: React.FC<BracketVisualizerProps> = ({ phase, rounds, previousPhase, onMatchClick }) => {
  if (phase.type === PhaseType.ELIMINATION) {
    return <EliminationTree rounds={rounds} previousPhase={previousPhase} onMatchClick={onMatchClick} />;
  }
  
  if (phase.type === PhaseType.ROUND_ROBIN || phase.type === PhaseType.GROUP_ROUND_ROBIN) {
    return <RoundRobinMatrix phase={phase} rounds={rounds} onMatchClick={onMatchClick} />;
  }

  return (
    <div className="text-sm text-slate-500 text-center py-8">
      该赛制暂不支持可视化图表
    </div>
  );
};

const EliminationTree: React.FC<{ rounds: MatchRound[], previousPhase?: PhaseConfig, onMatchClick?: (match: any) => void }> = ({ rounds, previousPhase, onMatchClick }) => {
  if (!rounds || rounds.length === 0) return null;

  const getParticipantName = (position: number) => {
    if (!previousPhase) return null;

    // Helper to get group label based on match code config
    const getGroupLabel = (index: number) => {
      const saved = localStorage.getItem('match_code_config');
      const config = saved ? JSON.parse(saved) : null;
      const groupConfig = config?.find((c: any) => c.id === 'group');
      
      if (groupConfig?.format === 'number') return (index + 1).toString();
      if (groupConfig?.format === 'number_two_digit') return (index + 1).toString().padStart(2, '0');
      return String.fromCharCode(65 + index); // Default to letter A, B, C...
    };

    // If fixed mapping is used
    if (previousPhase.placement_rule?.strategy === 'fixed' && previousPhase.promotion_rules) {
      const rule = previousPhase.promotion_rules.find(r => r.to_position === position);
      if (rule) {
        const groupLabel = previousPhase.group_count && previousPhase.group_count > 1 
          ? `${getGroupLabel(rule.from_group - 1)}组` 
          : '循环赛';
        return `${groupLabel}第${rule.from_rank}名`;
      }
    }

    // Default descriptive labels for other strategies
    if (previousPhase.placement_rule?.strategy === 'serpentine') return `落位位次 ${position}`;
    if (previousPhase.placement_rule?.strategy === 'cross_group') return `交叉对阵位 ${position}`;
    
    return `晋级选手 ${position}`;
  };

  return (
    <div className="flex items-stretch justify-start overflow-x-auto pb-4 min-h-[400px]">
      {rounds.map((round, rIdx) => (
        <div key={rIdx} className="flex flex-col justify-around min-w-[220px] relative px-6">
          {/* Round Header */}
          <div className="absolute top-0 left-0 right-0 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              Round {round.round_index}
            </span>
          </div>
          
          {/* Matches */}
          <div className="flex flex-col justify-around flex-1 mt-12">
            {round.matches.map((match, mIdx) => {
              const isTop = mIdx % 2 === 0;
              const hasNextRound = rIdx < rounds.length - 1;
              const hasPrevRound = rIdx > 0;
              
              const posA = mIdx * 2 + 1;
              const posB = mIdx * 2 + 2;
              
              const nameA = rIdx === 0 ? getParticipantName(posA) || match.participant_a || '待定选手' : match.participant_a || '待定选手';
              const nameB = rIdx === 0 ? getParticipantName(posB) || match.participant_b || '待定选手' : match.participant_b || '待定选手';
              
              return (
                <div key={match.id} className="relative flex items-center my-4">
                  {/* Connector Lines */}
                  {hasPrevRound && (
                    <div className="absolute -left-6 w-6 border-t-2 border-slate-300" style={{ top: '50%' }} />
                  )}
                  {hasNextRound && (
                    <>
                      <div className="absolute -right-3 w-3 border-t-2 border-slate-300" style={{ top: '50%' }} />
                      <div 
                        className="absolute -right-3 border-r-2 border-slate-300" 
                        style={{ 
                          top: isTop ? '50%' : 'auto',
                          bottom: !isTop ? '50%' : 'auto',
                          height: 'calc(50% + 1rem)' // Approximate height to connect to next round
                        }} 
                      />
                      {/* Horizontal line to next round */}
                      {isTop && (
                        <div className="absolute -right-6 w-3 border-t-2 border-slate-300" style={{ top: 'calc(100% + 1rem)' }} />
                      )}
                    </>
                  )}
                  
                  {/* Match Card */}
                  <div 
                    onClick={() => onMatchClick?.(match)}
                    className={`w-full bg-white border-2 ${match.is_bye ? 'border-slate-100 opacity-60' : 'border-slate-200'} rounded-xl shadow-sm overflow-hidden z-10 hover:border-indigo-400 transition-colors cursor-pointer group`}
                  >
                    <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{match.code}</span>
                      {match.is_bye && <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">轮空</span>}
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 truncate w-24" title={nameA}>{nameA}</span>
                        <span className="text-xs font-mono font-bold text-slate-300">-</span>
                      </div>
                      <div className="h-px bg-slate-100 w-full" />
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold truncate w-24 ${match.is_bye ? 'text-slate-400 italic' : 'text-slate-700'}`} title={nameB}>
                          {nameB}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-300">-</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const RoundRobinMatrix: React.FC<{ phase: PhaseConfig, rounds: MatchRound[], onMatchClick?: (match: any) => void }> = ({ phase, rounds, onMatchClick }) => {
  // For round robin, we show a matrix. 
  // If there are multiple groups, we show multiple matrices.
  const groupCount = phase.group_count || 1;

  return (
    <div className={`grid grid-cols-1 ${groupCount > 1 ? 'lg:grid-cols-2' : ''} gap-6 pb-4`}>
      {Array.from({ length: groupCount }).map((_, gIdx) => {
        const groupParticipantsCount = Math.floor(phase.participant_count / groupCount) + (gIdx < phase.participant_count % groupCount ? 1 : 0);
        const participants = Array.from({ length: groupParticipantsCount }, (_, i) => i + 1);
        const groupName = String.fromCharCode(65 + gIdx);

        return (
          <div key={gIdx} className="w-full">
            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              {groupCount > 1 ? `${groupName}组 矩阵图` : '循环赛矩阵图'}
            </h4>
            
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full overflow-x-auto">
              <table className="border-collapse w-full min-w-max">
                <thead>
                  <tr>
                    <th className="bg-slate-50 border-b border-r border-slate-200 p-3 w-16 text-center">
                      <span className="text-[10px] font-bold text-slate-400">VS</span>
                    </th>
                    {participants.map(p => (
                      <th key={`col-${p}`} className="bg-slate-50 border-b border-r border-slate-200 p-3 w-16 text-center">
                        <span className="text-xs font-bold text-slate-700">P{p}</span>
                      </th>
                    ))}
                    <th className="bg-slate-50 border-b border-r border-slate-200 p-2 w-10 text-center">
                      <span className="text-[10px] font-bold text-slate-500">胜</span>
                    </th>
                    <th className="bg-slate-50 border-b border-r border-slate-200 p-2 w-10 text-center">
                      <span className="text-[10px] font-bold text-slate-500">负</span>
                    </th>
                    <th className="bg-slate-50 border-b border-r border-slate-200 p-2 w-10 text-center">
                      <span className="text-[10px] font-bold text-slate-500">积分</span>
                    </th>
                    <th className="bg-slate-50 border-b border-slate-200 p-2 w-10 text-center">
                      <span className="text-[10px] font-bold text-slate-500">排名</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(p1 => (
                    <tr key={`row-${p1}`}>
                      <th className="bg-slate-50 border-b border-r border-slate-200 p-3 text-center">
                        <span className="text-xs font-bold text-slate-700">P{p1}</span>
                      </th>
                      {participants.map(p2 => {
                        const isSelf = p1 === p2;
                        return (
                          <td 
                            key={`cell-${p1}-${p2}`} 
                            className={`border-b border-r border-slate-200 p-2 text-center h-16 relative ${isSelf ? 'bg-slate-100' : 'hover:bg-indigo-50 transition-colors cursor-pointer'}`}
                          >
                            {isSelf ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-px bg-slate-300 transform rotate-45" />
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400">待赛</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-b border-r border-slate-200 p-2 text-center bg-emerald-50/30">
                        <span className="text-xs font-mono font-bold text-emerald-600">0</span>
                      </td>
                      <td className="border-b border-r border-slate-200 p-2 text-center bg-rose-50/30">
                        <span className="text-xs font-mono font-bold text-rose-600">0</span>
                      </td>
                      <td className="border-b border-r border-slate-200 p-2 text-center bg-indigo-50/30">
                        <span className="text-xs font-mono font-bold text-indigo-600">0</span>
                      </td>
                      <td className="border-b border-slate-200 p-2 text-center bg-slate-50">
                        <span className="text-xs font-bold text-slate-700">-</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
