import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Building2,
  ImagePlus,
  MapPinned,
  MapPin,
  Plus,
  Trash2,
  ShieldCheck,
  FileText,
  ChevronRight,
  Search,
  Wand2,
  Upload,
  Bold,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { TournamentBasicInfo } from '../types';

interface BasicInfoConfigProps {
  value: TournamentBasicInfo;
  onChange: (updates: Partial<TournamentBasicInfo>) => void;
  onNavigateToDecoration: () => void;
}

const CITY_LIBRARY = [
  {
    province: '广东省',
    cities: ['广州市', '深圳市', '东莞市', '佛山市'],
  },
  {
    province: '浙江省',
    cities: ['杭州市', '宁波市', '温州市', '金华市'],
  },
  {
    province: '江苏省',
    cities: ['南京市', '苏州市', '无锡市', '常州市'],
  },
  {
    province: '四川省',
    cities: ['成都市', '绵阳市', '德阳市', '乐山市'],
  },
  {
    province: '北京市',
    cities: ['北京市'],
  },
];

const VENUE_LIBRARY = {
  广州市: [
    { name: '广州天河体育中心羽毛球馆', address: '广州市天河区天河路299号天河体育中心内' },
    { name: '广州大学城体育馆', address: '广州市番禺区大学城体育中心北路' },
    { name: '广州国际体育演艺中心', address: '广州市黄埔区开创大道2666号' },
  ],
  深圳市: [
    { name: '深圳湾体育中心羽毛球馆', address: '深圳市南山区滨海大道3001号' },
    { name: '龙岗大运中心体育馆', address: '深圳市龙岗区龙翔大道3001号' },
    { name: '福田体育公园羽毛球馆', address: '深圳市福田区福强路3030号' },
  ],
  杭州市: [
    { name: '杭州黄龙体育中心', address: '杭州市西湖区黄龙路1号' },
    { name: '拱墅运河体育公园', address: '杭州市拱墅区学院北路与隐秀路交叉口' },
    { name: '奥体中心综合训练馆', address: '杭州市萧山区博奥路2657号' },
  ],
  成都市: [
    { name: '成都双流体育中心', address: '成都市双流区白河路二段' },
    { name: '高新体育中心羽毛球馆', address: '成都市高新区盛和一路66号' },
    { name: '东安湖体育公园多功能馆', address: '成都市龙泉驿区东安街道书土路' },
  ],
} as const;

const emptyImage =
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80';

export const BasicInfoConfig: React.FC<BasicInfoConfigProps> = ({
  value,
  onChange,
  onNavigateToDecoration,
}) => {
  const [venueKeyword, setVenueKeyword] = useState('');
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const competitionRulesEditorRef = useRef<HTMLDivElement | null>(null);

  const selectedProvince = CITY_LIBRARY.find((item) => item.province === value.province);
  const availableCities = selectedProvince?.cities ?? [];

  const venueSuggestions = useMemo(() => {
    if (!value.city) {
      return [];
    }

    const cityVenues = VENUE_LIBRARY[value.city as keyof typeof VENUE_LIBRARY] ?? [];
    if (!venueKeyword.trim()) {
      return cityVenues;
    }

    return cityVenues.filter((venue) => {
      const keyword = venueKeyword.trim().toLowerCase();
      return (
        venue.name.toLowerCase().includes(keyword) ||
        venue.address.toLowerCase().includes(keyword)
      );
    });
  }, [value.city, venueKeyword]);

  const updateListField = (
    field: 'organizers' | 'coOrganizers',
    index: number,
    nextValue: string,
  ) => {
    const nextList = [...value[field]];
    nextList[index] = nextValue;
    onChange({ [field]: nextList });
  };

  const addListField = (field: 'organizers' | 'coOrganizers') => {
    onChange({ [field]: [...value[field], ''] });
  };

  const removeListField = (field: 'organizers' | 'coOrganizers', index: number) => {
    const nextList = value[field].filter((_, itemIndex) => itemIndex !== index);
    onChange({ [field]: nextList.length > 0 ? nextList : [''] });
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextAttachments = files.map((file) => ({
      id: `ATT${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      name: file.name,
      sizeLabel:
        file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));

    onChange({ attachments: [...value.attachments, ...nextAttachments] });
    event.target.value = '';
  };

  const removeAttachment = (attachmentId: string) => {
    onChange({ attachments: value.attachments.filter((item) => item.id !== attachmentId) });
  };

  const applyCompetitionRulesFormat = (
    command: 'bold' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock',
    valueArg?: string,
  ) => {
    competitionRulesEditorRef.current?.focus();
    document.execCommand(command, false, valueArg);
    onChange({ competitionRules: competitionRulesEditorRef.current?.innerHTML ?? '' });
  };

  const completionCount = [
    value.tournamentName,
    value.tournamentSubtitle,
    value.coverUrl,
    value.startTime,
    value.endTime,
    value.organizers.filter(Boolean).join(''),
    value.coOrganizers.filter(Boolean).join(''),
    value.province,
    value.city,
    value.venueName,
    value.venueAddress,
    value.competitionRules,
    value.description,
    value.attachments.length > 0 ? 'attachments' : '',
  ].filter(Boolean).length;

  return (
    <div className="py-2">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">基础信息配置</h1>
                  <p className="mt-1 text-xs text-slate-500">
                    配置赛事对外展示的核心信息，后续主页装修、分享页和报名页都可以直接复用这套基础数据。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-slate-700">赛事信息</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-600">赛事名称</span>
                    <input
                      type="text"
                      value={value.tournamentName}
                      onChange={(e) => onChange({ tournamentName: e.target.value })}
                      placeholder="例如：2026 城市羽毛球公开赛"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-600">赛事副标题</span>
                    <input
                      type="text"
                      value={value.tournamentSubtitle}
                      onChange={(e) => onChange({ tournamentSubtitle: e.target.value })}
                      placeholder="例如：城市俱乐部联赛暨全民健身系列赛"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-600">赛事封面</span>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="space-y-3">
                        <div className="relative">
                          <ImagePlus className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            value={value.coverUrl}
                            onChange={(e) => onChange({ coverUrl: e.target.value })}
                            placeholder="粘贴封面图 URL，后续也可替换成上传控件"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                        <p className="text-xs leading-5 text-slate-400">
                          当前先用图片链接模拟封面选择器，接平台素材库后可无缝替换成上传/媒体选择。
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                        <img
                          src={value.coverUrl || emptyImage}
                          alt="赛事封面预览"
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-slate-700">举办时间</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">开始时间</span>
                    <input
                      type="datetime-local"
                      value={value.startTime}
                      onChange={(e) => onChange({ startTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">结束时间</span>
                    <input
                      type="datetime-local"
                      value={value.endTime}
                      onChange={(e) => onChange({ endTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-slate-700">主承办单位</h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {[
                    {
                      title: '主办单位',
                      field: 'organizers' as const,
                      hint: '支持维护多个主办单位，前台展示时可按顺序拼接。',
                    },
                    {
                      title: '承办单位',
                      field: 'coOrganizers' as const,
                      hint: '适合录入赛事执行方、运营方或合作单位。',
                    },
                  ].map((group) => (
                    <div key={group.field} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{group.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{group.hint}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addListField(group.field)}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold whitespace-nowrap text-indigo-600 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-200"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          添加
                        </button>
                      </div>

                      <div className="space-y-3">
                        {value[group.field].map((item, index) => (
                          <div key={`${group.field}-${index}`} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                              {index + 1}
                            </div>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateListField(group.field, index, e.target.value)}
                              placeholder={`填写${group.title}`}
                              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            />
                            <button
                              type="button"
                              onClick={() => removeListField(group.field, index)}
                              className="rounded-2xl p-3 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                              aria-label={`删除${group.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">举办城市</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">举办城市</span>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={value.province}
                        onChange={(e) =>
                          onChange({
                            province: e.target.value,
                            city: '',
                            venueName: '',
                            venueAddress: '',
                          })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      >
                        <option value="">选择省份</option>
                        {CITY_LIBRARY.map((item) => (
                          <option key={item.province} value={item.province}>
                            {item.province}
                          </option>
                        ))}
                      </select>

                      <select
                        value={value.city}
                        onChange={(e) =>
                          onChange({
                            city: e.target.value,
                            venueName: '',
                            venueAddress: '',
                          })
                        }
                        disabled={!value.province}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">选择城市</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">举办地点</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">地点选择器</span>
                    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={venueKeyword}
                          onChange={(e) => setVenueKeyword(e.target.value)}
                          placeholder={value.city ? `在 ${value.city} 搜索场馆或地址关键词` : '请先选择举办城市'}
                          disabled={!value.city}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {venueSuggestions.length > 0 ? (
                          venueSuggestions.map((venue) => (
                            <button
                              key={venue.name}
                              type="button"
                              onClick={() =>
                                onChange({
                                  venueName: venue.name,
                                  venueAddress: venue.address,
                                })
                              }
                              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-slate-600 ring-1 ring-slate-200 transition hover:text-indigo-600 hover:ring-indigo-200"
                            >
                              <MapPin className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-indigo-500" />
                              {venue.name}
                            </button>
                          ))
                        ) : (
                          <p className="text-xs leading-5 text-slate-400">
                            {value.city ? '当前城市暂无匹配的推荐场馆，可直接手动填写详细地址。' : '选择城市后会显示推荐地址。'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">场馆名称</span>
                    <input
                      type="text"
                      value={value.venueName}
                      onChange={(e) => onChange({ venueName: e.target.value })}
                      placeholder="例如：深圳湾体育中心羽毛球馆"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">详细地址</span>
                    <textarea
                      value={value.venueAddress}
                      onChange={(e) => onChange({ venueAddress: e.target.value })}
                      placeholder="填写详细地址，支持楼栋、楼层、入口说明等"
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                    </label>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">竞赛规程</h2>
                </div>

                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    {[
                      { label: '加粗', icon: Bold, onClick: () => applyCompetitionRulesFormat('bold') },
                      { label: '无序列表', icon: List, onClick: () => applyCompetitionRulesFormat('insertUnorderedList') },
                      { label: '有序列表', icon: ListOrdered, onClick: () => applyCompetitionRulesFormat('insertOrderedList') },
                      { label: '引用', icon: Quote, onClick: () => applyCompetitionRulesFormat('formatBlock', 'blockquote') },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.onClick}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-h-[220px] rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
                    {!value.competitionRules && (
                      <div className="pointer-events-none absolute left-5 top-4 text-sm leading-7 text-slate-400">
                        支持录入赛事规程、参赛须知、竞赛办法、奖励说明等内容。
                      </div>
                    )}
                    <div
                      ref={competitionRulesEditorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(event) =>
                        onChange({ competitionRules: (event.currentTarget as HTMLDivElement).innerHTML })
                      }
                      dangerouslySetInnerHTML={{ __html: value.competitionRules }}
                      className="min-h-[188px] text-sm leading-7 text-slate-800 outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-200 [&_blockquote]:pl-4 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+ul]:mt-2 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">赛事介绍</h2>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">介绍内容</span>
                  <textarea
                    value={value.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="介绍赛事定位、参赛人群、赛制亮点、奖励说明等内容。"
                    rows={8}
                    className="w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </label>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">上传附件</h2>
                </div>

                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">上传赛事规程、报名须知等附件</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        当前以原型方式模拟上传，支持先选择本地文件并展示文件名与大小。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                    >
                      <Upload className="h-4 w-4" />
                      上传附件
                    </button>
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />
                  </div>

                  {value.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {value.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{attachment.name}</p>
                            <p className="mt-1 text-xs text-slate-400">{attachment.sizeLabel}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-500 transition hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
                      暂未上传附件
                    </div>
                  )}
                </div>
              </section>
            </div>
          </motion.section>
        </div>

        <div className="space-y-6">
          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">填写预览</h3>
                  <p className="mt-1 text-xs text-slate-400">便于快速确认基础信息完整度</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold whitespace-nowrap text-indigo-600">
                    {completionCount}/14
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToDecoration}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold whitespace-nowrap text-white transition hover:bg-slate-800"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    页面装修
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="overflow-hidden rounded-3xl bg-slate-100">
                <img
                  src={value.coverUrl || emptyImage}
                  alt="封面预览"
                  className="h-44 w-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-xl font-bold leading-8 text-slate-900">
                  {value.tournamentName || '赛事名称待填写'}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {value.tournamentSubtitle || '这里会展示赛事副标题，用于首页头图或分享卡片。'}
                </p>
              </div>

              <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
                {[
                  { label: '举办时间', value: value.startTime && value.endTime ? `${value.startTime.replace('T', ' ')} 至 ${value.endTime.replace('T', ' ')}` : '待填写' },
                  { label: '主办单位', value: value.organizers.filter(Boolean).join(' / ') || '待填写' },
                  { label: '承办单位', value: value.coOrganizers.filter(Boolean).join(' / ') || '待填写' },
                  { label: '举办城市', value: value.province && value.city ? `${value.province} / ${value.city}` : '待填写' },
                  { label: '举办地点', value: value.venueName || value.venueAddress || '待填写' },
                  { label: '竞赛规程', value: value.competitionRules ? '已填写' : '待填写' },
                  { label: '上传附件', value: value.attachments.length > 0 ? `${value.attachments.length} 个文件` : '未上传' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-3 last:border-b-0 last:pb-0">
                    <span className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</span>
                    <span className="text-right text-sm leading-6 text-slate-600">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  竞赛规程摘要
                </div>
                <div
                  className="mt-3 text-sm leading-7 text-slate-500 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-200 [&_blockquote]:pl-4 [&_li]:ml-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{
                    __html:
                      value.competitionRules ||
                      '<p>这里会展示竞赛规程摘要，便于在右侧快速确认是否已录入赛事的核心比赛规则。</p>',
                  }}
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">下一步：进入页面装修</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      基于当前填写的赛事名称、封面和地点信息，继续配置赛事主页与分享效果。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToDecoration}
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                  >
                    立即装修
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-slate-300 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  配置建议
                </div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                  <p>赛事封面建议使用横向大图，方便后续主页头图和分享卡片直接复用。</p>
                  <p>主办 / 承办单位建议按对外展示顺序填写，避免后续页面装修再次调整。</p>
                  <p>城市和地点确认后，后续可继续接地图 SDK 做真实地址选择。</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};
