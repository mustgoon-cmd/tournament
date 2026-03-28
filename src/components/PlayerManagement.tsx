import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  IdCard, 
  Trophy, 
  Clock, 
  ChevronRight, 
  Download,
  CheckCircle2,
  MapPin,
  Calendar,
  QrCode,
  X,
  Phone,
  ShieldCheck,
  ChevronDown,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Match {
  id: string;
  code: string;
  project: string;
  phase: string; // e.g., "小组赛", "1/8决赛", "决赛"
  opponent: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  score?: string;
  result?: 'win' | 'loss' | 'draw';
}

interface Player {
  id: string;
  name: string;
  gender: 'male' | 'female';
  idCard: string;
  phone: string;
  team: string;
  status: 'confirmed' | 'pending' | 'withdrawn';
  projects: string[];
  matches: Match[];
}

const MOCK_PLAYERS: Player[] = [
  {
    id: 'P001',
    name: '张伟',
    gender: 'male',
    idCard: '4401**********1234',
    phone: '138****8888',
    team: '广州羽协',
    status: 'confirmed',
    projects: ['男子单打', '男子双打'],
    matches: [
      {
        id: 'M101',
        code: 'MS-P1-A-R1-01',
        project: '男子单打',
        phase: '小组赛',
        opponent: '李华',
        time: '2026-03-22 09:00',
        venue: '1号场地',
        status: 'completed',
        score: '21-15, 21-18',
        result: 'win'
      },
      {
        id: 'M102',
        code: 'MS-P1-A-R2-05',
        project: '男子单打',
        phase: '小组赛',
        opponent: '王五',
        time: '2026-03-22 14:30',
        venue: '3号场地',
        status: 'completed',
        score: '21-19, 21-17',
        result: 'win'
      },
      {
        id: 'M103',
        code: 'MS-P2-R16-01',
        project: '男子单打',
        phase: '1/8决赛',
        opponent: '赵六',
        time: '2026-03-23 10:00',
        venue: '2号场地',
        status: 'ongoing'
      },
      {
        id: 'M201',
        code: 'MD-P1-B-R1-02',
        project: '男子双打',
        phase: '小组赛',
        opponent: '陈七/林八',
        time: '2026-03-22 11:00',
        venue: '4号场地',
        status: 'scheduled'
      }
    ]
  },
  {
    id: 'P002',
    name: '李芳',
    gender: 'female',
    idCard: '4401**********5678',
    phone: '139****9999',
    team: '深圳俱乐部',
    status: 'confirmed',
    projects: ['女子单打'],
    matches: [
      {
        id: 'M301',
        code: 'WS-P1-B-R1-02',
        project: '女子单打',
        phase: '小组赛',
        opponent: '赵敏',
        time: '2026-03-22 10:00',
        venue: '2号场地',
        status: 'scheduled'
      }
    ]
  }
];

export const PlayerManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const filteredPlayers = MOCK_PLAYERS.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.id.includes(searchQuery);
    const matchesTeam = teamFilter === '' || p.team.includes(teamFilter);
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    return matchesSearch && matchesTeam && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">已确认</span>;
      case 'pending': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">待审核</span>;
      case 'withdrawn': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">已退赛</span>;
      default: 
        return null;
    }
  };

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">已结束</span>;
      case 'ongoing': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 animate-pulse">进行中</span>;
      case 'scheduled': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600">未开始</span>;
      default: return null;
    }
  };

  // Group matches by project for the detail view
  const groupMatchesByProject = (matches: Match[]) => {
    return matches.reduce((acc, match) => {
      if (!acc[match.project]) acc[match.project] = [];
      acc[match.project].push(match);
      return acc;
    }, {} as Record<string, Match[]>);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">选手管理</h2>
              <p className="text-xs text-slate-500 mt-0.5">管理参赛选手信息、参赛证件及比赛行程</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
              <Download className="w-4 h-4" />
              导出全部名单
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
      {/* Search & Filter Bar - Unified Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索选手姓名/编号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="relative">
          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索代表队..."
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="relative">
          <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">所有状态</option>
            <option value="confirmed">已确认</option>
            <option value="pending">待审核</option>
            <option value="withdrawn">已退赛</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Player List Table - Unified Style */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">选手信息</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">代表队</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">参赛项目</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">状态</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{player.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {player.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 font-medium">{player.team}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {player.projects.map(proj => (
                      <span key={proj} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                        {proj}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(player.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedPlayer(player)}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </div>

      {/* Player Detail Drawer */}
      <AnimatePresence>
        {selectedPlayer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayer(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[70] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-100">
                    {selectedPlayer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedPlayer.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">选手编号: {selectedPlayer.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Basic Info Section */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-4 bg-indigo-600 rounded-full" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">基本信息</h3>
                    </div>
                    <button 
                      onClick={() => setShowCertificate(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <IdCard className="w-3.5 h-3.5" />
                      查看参赛证
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">代表队</p>
                      <p className="text-sm font-bold text-slate-700">{selectedPlayer.team}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">联系电话</p>
                      <p className="text-sm font-bold text-slate-700 font-mono">{selectedPlayer.phone}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">证件号码</p>
                      <p className="text-sm font-bold text-slate-700 font-mono">{selectedPlayer.idCard}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">性别</p>
                      <p className="text-sm font-bold text-slate-700">{selectedPlayer.gender === 'male' ? '男' : '女'}</p>
                    </div>
                  </div>
                </section>

                {/* Matches Section - Grouped by Project with Timeline */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-4 bg-indigo-600 rounded-full" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">参赛进程</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {Object.entries(groupMatchesByProject(selectedPlayer.matches)).map(([projectName, matches]) => (
                      <div key={projectName} className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg w-fit">
                          <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-bold text-indigo-600">{projectName}</span>
                        </div>
                        
                        <div className="relative pl-8 space-y-6">
                          {/* Vertical Line */}
                          <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
                          
                          {matches.map((match, idx) => (
                            <div key={match.id} className="relative">
                              {/* Dot on Timeline */}
                              <div className={`absolute -left-[25px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                                match.status === 'completed' ? 'bg-emerald-500' : 
                                match.status === 'ongoing' ? 'bg-indigo-500 ring-4 ring-indigo-100' : 'bg-slate-300'
                              }`} />
                              
                              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">{match.phase}</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{match.code}</span>
                                  </div>
                                  {getMatchStatusBadge(match.status)}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3 text-slate-400" />
                                      <span className="text-xs text-slate-600">对手: <span className="font-bold text-slate-900">{match.opponent}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      <span className="text-xs text-slate-600">场地: <span className="font-medium text-slate-700">{match.venue}</span></span>
                                    </div>
                                  </div>
                                  <div className="space-y-2 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span className="text-xs font-mono text-slate-500">{match.time}</span>
                                    </div>
                                    {match.score && (
                                      <div className="flex items-center justify-end gap-2">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                          match.result === 'win' ? 'bg-emerald-50 text-emerald-600' : 
                                          match.result === 'loss' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                                        }`}>
                                          {match.result === 'win' ? '胜' : match.result === 'loss' ? '负' : '平'}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-indigo-600">{match.score}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Drawer Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  导出该选手参赛行程
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Certificate Modal - Unified Style */}
      <AnimatePresence>
        {showCertificate && selectedPlayer && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCertificate(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl"
            >
              {/* Card Top */}
              <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-xl">
                    {selectedPlayer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
                    <p className="text-indigo-200 text-[10px] font-bold tracking-widest uppercase mt-1">参赛选手证 / PARTICIPANT CARD</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">选手编号</p>
                    <p className="text-sm font-bold text-slate-700 font-mono">{selectedPlayer.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">代表队</p>
                    <p className="text-sm font-bold text-slate-700">{selectedPlayer.team}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">参赛项目</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayer.projects.map(p => (
                      <span key={p} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <QrCode className="w-24 h-24 text-slate-800" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">扫码核验参赛身份</p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
