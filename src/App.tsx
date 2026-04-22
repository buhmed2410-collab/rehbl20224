/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Building2,
  FileText,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { RAW_DATA } from './data';
import { 
  formatNumber, 
  formatCurrency, 
  calculateAggregates, 
  calculateGrowth, 
  cn 
} from './lib/utils';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<'year2024' | 'year2025'>('year2025');

  const stats2024 = useMemo(() => calculateAggregates(RAW_DATA, 'year2024'), []);
  const stats2025 = useMemo(() => calculateAggregates(RAW_DATA, 'year2025'), []);

  const currentStats = selectedYear === 'year2025' ? stats2025 : stats2024;
  const previousStats = selectedYear === 'year2025' ? stats2024 : null;

  const growthStats = useMemo(() => {
    if (!previousStats) return null;
    return {
      patients: calculateGrowth(stats2025.patients, stats2024.patients),
      visits: calculateGrowth(stats2025.visits, stats2024.visits),
      procedures: calculateGrowth(stats2025.procedures, stats2024.procedures),
      cost: calculateGrowth(stats2025.cost, stats2024.cost),
    };
  }, [stats2024, stats2025, previousStats]);

  const filteredData = useMemo(() => {
    const list = RAW_DATA.map(item => ({ ...item }))
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b[selectedYear].procedures - a[selectedYear].procedures);

    if (!searchTerm || 'الإجمالي العام'.includes(searchTerm)) {
      list.push({
        name: 'Grand Total',
        year2024: stats2024,
        year2025: stats2025
      });
    }
    return list;
  }, [searchTerm, selectedYear, stats2024, stats2025]);

  const chartData = useMemo(() => {
    return [
      { name: 'المرضى', '2024': stats2024.patients, '2025': stats2025.patients },
      { name: 'الزيارات', '2024': stats2024.visits, '2025': stats2025.visits },
      { name: 'الإجراءات', '2024': stats2024.procedures, '2025': stats2025.procedures },
    ];
  }, [stats2024, stats2025]);

  const topEstablishmentsData = useMemo(() => {
    return RAW_DATA
      .filter(item => item.name !== 'Grand Total')
      .sort((a, b) => b[selectedYear].procedures - a[selectedYear].procedures)
      .slice(0, 5)
      .map(item => ({
        fullName: item.name,
        value: item[selectedYear].procedures
      }));
  }, [selectedYear]);

  const pieData = useMemo(() => {
    const main = RAW_DATA.find(i => i.name === 'AS SULTAN QABOOS HOSPITAL');
    const others = RAW_DATA
      .filter(i => i.name !== 'AS SULTAN QABOOS HOSPITAL' && i.name !== 'Grand Total')
      .reduce((acc, curr) => acc + curr[selectedYear].procedures, 0);
    
    return [
      { name: 'مستشفى السلطان قابوس', value: main?.[selectedYear].procedures || 0, color: '#2563eb' },
      { name: 'مرافق أخرى', value: others, color: '#94a3b8' }
    ];
  }, [selectedYear]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col" dir="rtl">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 md:px-8 md:py-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200"
          >
            <Stethoscope size={24} />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">نظام تحليل نتائج التأهيل الطبي بظفار</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">تقرير الأداء السنوي | معرّف النظام: PT-REHAB-2025</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="hidden sm:inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200">مستوى الخدمة: ممتاز</span>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 ml-2">
            <button 
              onClick={() => setSelectedYear('year2024')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
                selectedYear === 'year2024' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              2024
            </button>
            <button 
              onClick={() => setSelectedYear('year2025')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
                selectedYear === 'year2025' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              2025
            </button>
          </div>
          <button className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
            <FileText size={14} />
            تصدير التقرير
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="إجمالي المرضى" 
            value={formatNumber(currentStats.patients)} 
            icon={<Users className="text-blue-600" />} 
            growth={growthStats?.patients}
            delay={0.1}
          />
          <KPICard 
            title="إجمالي الزيارات" 
            value={formatNumber(currentStats.visits)} 
            icon={<Calendar className="text-emerald-600" />} 
            growth={growthStats?.visits}
            delay={0.2}
          />
          <KPICard 
            title="إجمالي الإجراءات" 
            value={formatNumber(currentStats.procedures)} 
            icon={<Activity className="text-rose-600" />} 
            growth={growthStats?.procedures}
            delay={0.3}
          />
          <KPICard 
            title="التكلفة الإجمالية" 
            value={formatCurrency(currentStats.cost)} 
            icon={<FileText className="text-amber-600" />} 
            growth={growthStats?.cost}
            delay={0.4}
          />
        </section>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-[480px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-blue-600" size={20} />
                  <h3 className="text-sm font-bold text-slate-700 custom-underline">منحنى مقارنة المقاييس السنوية</h3>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <span>2024</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span>2025</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', direction: 'rtl', padding: '12px' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="2024" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={42} />
                    <Bar dataKey="2025" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="text-blue-600" size={20} />
                <h3 className="text-sm font-bold text-slate-700">تحليل كفاءة المؤسسات الرائدة</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {topEstablishmentsData.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-700">{item.fullName}</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600">{formatNumber(item.value)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / topEstablishmentsData[0].value) * 100}%` }}
                        transition={{ duration: 1.2, delay: idx * 0.1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          idx === 0 ? "bg-blue-600" : "bg-slate-400"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-10">
                <PieChartIcon className="text-blue-600" size={20} />
                <h3 className="text-sm font-bold text-slate-700">توزيع الحصيلة العلاجية</h3>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-slate-800">100%</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest text-center">إجمالي</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-4 pt-10">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:bg-white group cursor-default">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{Math.round((item.value / currentStats.procedures) * 100)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed pr-5">معدل الإجراءات الطبية المنفذة لهذا القطاع خلال العام الحالي.</p>
                    </div>
                  ))}
                  
                  <div className="bg-slate-800 p-5 rounded-2xl text-white mt-6 shadow-lg shadow-slate-200">
                    <h4 className="text-xs font-bold mb-4 border-b border-white/10 pb-2 flex items-center gap-2 text-white">
                       <TrendingUp size={14} className="text-blue-400 text-white" />
                      توصيات المرحلة القادمة
                    </h4>
                    <ul className="text-[10px] mt-4 space-y-3 font-medium opacity-90">
                      <li className="flex gap-2">
                        <span className="text-blue-400 text-white">•</span>
                        <span>تعزيز معدل الزيارات في المراكز الصحية الطرفية بنسبة 15%.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-400 text-white">•</span>
                        <span>توسيع نطاق الخدمات التخصصية في مستشفى السلطان قابوس.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-400 text-white">•</span>
                        <span>مراجعة سياسات التكلفة لإجراءات العلاج الطبيعي المكثف.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <FileText size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">سجل البيانات التفصيلي للمؤسسات</h3>
            </div>
            <div className="relative group w-full md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="ابحث بواسطة اسم المؤسسة..." 
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold border-bottom border-slate-200">
                  <th className="px-6 py-4 border-l border-slate-200/50">المؤسسة الطبية</th>
                  <th className="px-6 py-4">المرضى</th>
                  <th className="px-6 py-4">الزيارات</th>
                  <th className="px-6 py-4">الإجراءات</th>
                  <th className="px-6 py-4">التكلفة الإجمالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item, idx) => (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className={cn(
                      "hover:bg-blue-50/30 transition-all group",
                      item.name === 'Grand Total' ? "bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300" : ""
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.name === 'Grand Total' ? (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-black">TOT</div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </div>
                        )}
                        <span className="text-xs font-semibold">{item.name === 'Grand Total' ? 'إجمالي المحافظة' : item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600 group-hover:text-slate-900">{formatNumber(item[selectedYear].patients)}</td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600 group-hover:text-slate-900">{formatNumber(item[selectedYear].visits)}</td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600 group-hover:text-slate-900">{formatNumber(item[selectedYear].procedures)}</td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-blue-600 group-hover:text-blue-700">{formatNumber(item[selectedYear].cost)} ر.ع</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="px-8 py-3 bg-slate-200 text-slate-600 text-[10px] flex flex-col md:flex-row justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>آخر تحديث للبيانات: اليوم 10:45 صباحاً</span>
        </div>
        <div className="flex gap-6 font-medium">
          <span className="border-l border-slate-300 pl-4">رقم السجل الرقمي: 2025-DHOF-REHAB</span>
          <span className="font-bold uppercase tracking-wider text-slate-400">CONFIDENTIAL INFO // DH-PT-8829</span>
        </div>
      </footer>
    </div>
  );
}

function KPICard({ title, value, icon, growth, delay = 0 }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  growth?: number;
  delay?: number
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-100 transition-all relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors text-white">
          {icon}
        </div>
        {growth !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm",
            growth >= 0 ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100"
          )}>
            {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(Math.round(growth))}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</h3>
        <p className="text-2xl font-black tracking-tight text-slate-800">{value}</p>
      </div>
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
