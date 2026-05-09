/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Gift, 
  Settings2, 
  Upload, 
  Trash2, 
  UserPlus, 
  Sparkles,
  Search,
  History,
  LayoutGrid,
  FileText
} from 'lucide-react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { cn, shuffleArray } from './lib/utils';

type Tab = 'list' | 'raffle' | 'groups';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [names, setNames] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Raffle State
  const [isRaffling, setIsRaffling] = useState(false);
  const [raffleWinner, setRaffleWinner] = useState<string | null>(null);
  const [raffleHistory, setRaffleHistory] = useState<string[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [rafflePool, setRafflePool] = useState<string[]>([]);

  // Grouping State
  const [groupSize, setGroupSize] = useState(3);
  const [groups, setGroups] = useState<string[][]>([]);

  // Duplicate Check Derived State
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
  const hasDuplicates = duplicateNames.length > 0;

  // Initialize raffle pool when names change or tab changes
  useEffect(() => {
    if (activeTab === 'raffle') {
      const uniqueNames = [...new Set(names)];
      setRafflePool(uniqueNames.filter(n => !(!allowDuplicates && raffleHistory.includes(n))));
    }
  }, [names, activeTab, allowDuplicates, raffleHistory]);

  const handleAddNames = () => {
    const newNames = inputText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    setNames(prev => [...prev, ...newNames]);
    setInputText('');
  };

  const handleLoadMockData = () => {
    const mockData = [
      '陳大明', '林小華', '張志強', '王佩琳', '李美琪', 
      '趙又廷', '黃品源', '周杰倫', '蔡依林', '郭采潔',
      '林俊傑', '田馥甄', '蕭敬騰', '徐佳瑩', '盧廣仲',
      '林小華', '陳大明' // Intentional duplicates
    ];
    setNames(mockData);
  };

  const handleRemoveDuplicates = () => {
    setNames(prev => [...new Set(prev)]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as any[];
        const parsedNames = data
          .flat()
          .map(n => String(n).trim())
          .filter(n => n.length > 0);
        setNames(prev => [...prev, ...parsedNames]);
        e.target.value = ''; // 加上這行，確保能重複上傳同一個檔案
      },
      header: false,
    });
  };

  const clearNames = () => {
    if (confirm('確定要清空所有名單嗎？')) {
      setNames([]);
      setRaffleHistory([]);
      setGroups([]);
    }
  };

  const startRaffle = () => {
    if (isRaffling || rafflePool.length === 0) return;

    setIsRaffling(true);
    setRaffleWinner(null);

    // Animation lasts for 3 seconds
    let startTime = Date.now();
    const duration = 2000;
    
    const animate = () => {
      const now = Date.now();
      const progress = (now - startTime) / duration;

      if (progress < 1) {
        const randomIndex = Math.floor(Math.random() * rafflePool.length);
        setRaffleWinner(rafflePool[randomIndex]);
        requestAnimationFrame(animate);
      } else {
        const finalWinner = rafflePool[Math.floor(Math.random() * rafflePool.length)];
        setRaffleWinner(finalWinner);
        setRaffleHistory(prev => [finalWinner, ...prev]);
        setIsRaffling(false);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    };

    animate();
  };

  const handleGrouping = () => {
    if (names.length === 0) return;
    
    const shuffled = shuffleArray([...new Set(names)] as string[]);
    const result: string[][] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      result.push(shuffled.slice(i, i + groupSize));
    }
    
    setGroups(result);
  };

  const handleExportGroups = () => {
    if (groups.length === 0) return;

    const exportData = groups.flatMap((group, index) => 
      group.map(name => ({
        '組別': `第 ${index + 1} 組`,
        '姓名': name
      }))
    );

    const csv = Papa.unparse(exportData);
    const dateStr = new Date().toISOString().split('T')[0];
    const encodedUri = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv);
    
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `Group_Result_${dateStr}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] selection:bg-[#141414] selection:text-white font-sans text-[#141414]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#F5F5F3]/80 backdrop-blur-md border-b border-[#141414]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#141414] rounded-xl flex items-center justify-center text-white">
              <Users size={22} />
            </div>
            <div>
              <h1 className="font-medium text-lg tracking-tight">HR Buddy</h1>
              <p className="text-[11px] uppercase tracking-wider opacity-50 font-semibold">Taiwan Staff Tool</p>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-[#141414]/5 p-1 rounded-full">
            {(['list', 'raffle', 'groups'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeTab === tab 
                    ? "bg-[#141414] text-white shadow-lg" 
                    : "text-[#141414]/60 hover:bg-[#141414]/10"
                )}
              >
                {tab === 'list' && '名單管理'}
                {tab === 'raffle' && '獎品抽籤'}
                {tab === 'groups' && '自動分組'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* List Management Section */}
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#141414]/5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
                       <UserPlus size={20} /> 匯入名單
                    </h2>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleLoadMockData}
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        使用模擬名單
                      </button>
                      <label className="cursor-pointer group">
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#141414]/50 group-hover:text-[#141414] transition-colors">
                          <Upload size={14} /> 點此上傳 CSV
                        </span>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                  
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="在此貼上姓名名單 (每行一個姓名)..."
                    className="w-full h-48 bg-[#F9F9F8] border border-[#141414]/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/20 transition-all resize-none"
                  />
                  
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleAddNames}
                      disabled={!inputText.trim()}
                      className="flex-1 bg-[#141414] text-white py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 transition-all shadow-md active:scale-[0.98]"
                    >
                      確認加入
                    </button>
                    <button
                      onClick={clearNames}
                      className="px-6 border border-[#141414]/10 rounded-2xl hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all font-medium text-sm flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#141414]/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-medium tracking-tight">全部名單 ({names.length})</h2>
                      {hasDuplicates && (
                        <button 
                          onClick={handleRemoveDuplicates}
                          className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5"
                        >
                          <Trash2 size={10} /> 移除重複項目
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                      <input 
                        type="text" 
                        placeholder="搜尋..." 
                        className="pl-9 pr-4 py-1.5 bg-[#F9F9F8] border border-[#141414]/5 rounded-full text-xs focus:outline-none w-48"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {names.length === 0 ? (
                      <p className="text-sm text-[#141414]/30 italic w-full text-center py-12">尚未加入任何名單</p>
                    ) : (
                      names.map((name, i) => {
                        const isDuplicate = names.indexOf(name) !== i;
                        return (
                          <span 
                            key={`${name}-${i}`} 
                            className={cn(
                              "px-4 py-2 text-sm rounded-full border transition-all flex items-center gap-2 group",
                              isDuplicate 
                                ? "bg-amber-50 border-amber-200 text-amber-700" 
                                : "bg-[#F9F9F8] border-[#141414]/5 text-[#141414]"
                            )}
                          >
                            {name}
                            {isDuplicate && <span className="text-[10px] bg-amber-200 px-1 rounded">重疊</span>}
                            <button 
                              onClick={() => {
                                const newNames = [...names];
                                newNames.splice(i, 1);
                                setNames(newNames);
                              }}
                              className="opacity-0 group-hover:opacity-30 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#141414] text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-[11px] uppercase tracking-widest opacity-60 font-bold mb-2">快速提示</p>
                    <h3 className="text-2xl font-light leading-tight mb-4 text-[#F5F5F3]">
                      簡單幾步<br />
                      輕鬆完成<br />
                      HR 任務。
                    </h3>
                    <ul className="space-y-3 text-sm opacity-80 font-light">
                      <li className="flex gap-2"><span>1.</span> 匯入公司同仁名單</li>
                      <li className="flex gap-2"><span>2.</span> 選擇抽籤或分組模式</li>
                      <li className="flex gap-2"><span>3.</span> 即時顯示結果與視覺化</li>
                    </ul>
                  </div>
                  <Users className="absolute -bottom-8 -right-8 opacity-10 w-40 h-40" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Lucky Draw Section */}
          {activeTab === 'raffle' && (
            <motion.div
              key="raffle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-[#141414]/5 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
                  <div className="absolute top-8 right-8">
                    <label className="flex items-center gap-3 bg-[#F5F5F3] px-4 py-2 rounded-full cursor-pointer hover:bg-[#141414]/5 transition-all">
                      <Settings2 size={16} className="opacity-40" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/60">重覆抽取</span>
                      <input 
                        type="checkbox" 
                        checked={allowDuplicates} 
                        onChange={(e) => setAllowDuplicates(e.target.checked)}
                        className="w-4 h-4 rounded border-[#141414]/20 accent-[#141414]"
                      />
                    </label>
                  </div>

                  {raffleWinner ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#141414]/40 mb-6 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> Congratulations <Sparkles size={14} />
                      </p>
                      <h3 className="text-7xl font-medium tracking-tight mb-8">
                        {raffleWinner}
                      </h3>
                      <div className="h-1 w-24 bg-[#141414] mx-auto rounded-full mb-8 opacity-20" />
                    </motion.div>
                  ) : (
                    <div className="text-center mb-12">
                      <div className="w-24 h-24 bg-[#F5F5F3] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Gift size={40} className="opacity-20" />
                      </div>
                      <h3 className="text-2xl font-medium tracking-tight mb-2">準備好抽籤了嗎？</h3>
                      <p className="text-sm text-[#141414]/40">目前的抽籤池中有 {rafflePool.length} 人</p>
                    </div>
                  )}

                  <button
                    onClick={startRaffle}
                    disabled={isRaffling || rafflePool.length === 0}
                    className={cn(
                      "group relative px-12 py-5 rounded-[2rem] font-medium text-lg transition-all duration-500 overflow-hidden shadow-xl active:scale-95",
                      isRaffling 
                        ? "bg-[#141414]/5 text-[#141414] cursor-not-allowed" 
                        : "bg-[#141414] text-white hover:px-16"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {isRaffling ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles size={20} />
                          </motion.div>
                          抽籤中...
                        </>
                      ) : (
                        '立即隨機抽籤'
                      )}
                    </span>
                    {!isRaffling && (
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-[#F5F5F3]/10 group-hover:animate-shine" />
                    )}
                  </button>
                  
                  {rafflePool.length === 0 && names.length > 0 && !allowDuplicates && (
                    <p className="mt-4 text-xs text-red-500 font-medium">所有人都已經中獎過囉！</p>
                  )}
                  {names.length === 0 && (
                    <p className="mt-4 text-xs text-red-500 font-medium">請先在首頁新增名單</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#141414]/5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium tracking-tight flex items-center gap-2">
                       <History size={18} /> 中獎紀錄
                    </h2>
                    <span className="text-[10px] font-bold bg-[#141414]/5 px-2 py-1 rounded">
                      {raffleHistory.length}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {raffleHistory.length === 0 ? (
                      <p className="text-xs text-[#141414]/30 italic text-center py-8">暫無紀錄</p>
                    ) : (
                      raffleHistory.map((winner, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={idx}
                          className="flex items-center justify-between py-3 border-b border-[#141414]/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono opacity-30">#{raffleHistory.length - idx}</span>
                            <span className="text-sm font-medium">{winner}</span>
                          </div>
                          <span className="text-[10px] opacity-20">Just now</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                  {raffleHistory.length > 0 && (
                    <button 
                      onClick={() => setRaffleHistory([])}
                      className="w-full mt-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 hover:text-red-500 transition-colors"
                    >
                      清除紀錄
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Grouping Section */}
          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#141414]/5 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-1">每組人數</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setGroupSize(Math.max(2, groupSize - 1))}
                        className="w-8 h-8 rounded-full border border-[#141414]/10 flex items-center justify-center hover:bg-[#141414] hover:text-white transition-all disabled:opacity-20"
                        disabled={groupSize <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-xl font-medium">{groupSize}</span>
                      <button 
                        onClick={() => setGroupSize(groupSize + 1)}
                        className="w-8 h-8 rounded-full border border-[#141414]/10 flex items-center justify-center hover:bg-[#141414] hover:text-white transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-12 w-px bg-[#141414]/5" />
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-1">預計組數</span>
                    <p className="text-xl font-medium">{Math.ceil(names.length / groupSize)} 組</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleGrouping}
                    disabled={names.length === 0}
                    className="bg-[#141414] text-white px-10 py-4 rounded-2xl font-medium shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30"
                  >
                    <LayoutGrid size={20} />
                    立刻隨機分組
                  </button>
                  {groups.length > 0 && (
                    <button
                      onClick={handleExportGroups}
                      className="text-[#141414]/60 hover:text-[#141414] transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                    >
                      <Upload size={16} className="rotate-180" /> 下載 CSV
                    </button>
                  )}
                </div>
              </div>

              {groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groups.map((group, groupIdx) => (
                    <motion.div
                      key={groupIdx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: groupIdx * 0.05 }}
                      className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#141414]/5">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#141414]/30 group-hover:text-[#141414] transition-colors">Group {groupIdx + 1}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F5F5F3] rounded">{group.length} 人</span>
                      </div>
                      <div className="space-y-2">
                        {group.map((name, nameIdx) => (
                          <div key={nameIdx} className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-1.5 h-1.5 bg-[#141414] rounded-full opacity-20" />
                            {name}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 border border-dashed border-[#141414]/10 rounded-[3rem] py-24 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 text-[#141414]/20">
                      <FileText size={32} />
                   </div>
                   <h3 className="text-xl font-medium mb-1">尚未分組</h3>
                   <p className="text-sm text-[#141414]/40">點擊上方按鈕開始隨機分配成員</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-[#141414]/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#141414]/30">
            <span>© 2026 HR Buddy HK/TW</span>
            <div className="w-1 h-1 bg-[#141414]/10 rounded-full" />
            <span>Built for HR Efficiency</span>
          </div>
          <div className="flex gap-8">
             <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-1">Total Pool</p>
                <p className="text-xl font-medium">{names.length}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-1">Latest Winner</p>
                <p className="text-xl font-medium">{raffleHistory[0] || '--'}</p>
             </div>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(20, 20, 20, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(20, 20, 20, 0.2);
        }
        @keyframes shine {
          to {
            left: 100%;
          }
        }
        .animate-shine {
          animation: shine 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
