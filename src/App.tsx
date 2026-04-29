/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  User, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  FileText,
  Briefcase,
  UserCheck,
  UserX
} from 'lucide-react';

// --- Data Types ---

type StatusType = 'L' | 'OD' | 'AB';

interface RecordEntry {
  date: string;
  leave: string[];
  od: string[];
  ab: string[];
  month: string;
}

// --- Historical Data extracted from PDF ---

const ATTENDANCE_DATA: RecordEntry[] = [
  // DECEMBER 2025
  { month: 'DECEMBER', date: '16.12.25', leave: ['57', '305'], od: ['2'], ab: [] },
  { month: 'DECEMBER', date: '17.12.25', leave: ['32'], od: ['2'], ab: [] },
  { month: 'DECEMBER', date: '18.12.25', leave: ['32'], od: ['2'], ab: [] },
  { month: 'DECEMBER', date: '19.12.25', leave: ['32'], od: ['2'], ab: [] },
  { month: 'DECEMBER', date: '20.12.25', leave: ['32'], od: [], ab: [] },
  { month: 'DECEMBER', date: '24.12.25', leave: ['12', '57'], od: [], ab: [] },
  { month: 'DECEMBER', date: '26.12.25', leave: ['56', '302'], od: [], ab: [] },
  { month: 'DECEMBER', date: '29.12.25', leave: ['62'], od: [], ab: [] },
  { month: 'DECEMBER', date: '30.12.25', leave: ['62'], od: [], ab: [] },
  { month: 'DECEMBER', date: '31.12.25', leave: ['62'], od: [], ab: [] },

  // JANUARY 2026
  { month: 'JANUARY', date: '07.01.26', leave: ['4', '6', '10', '29', '304', '307'], od: [], ab: [] },
  { month: 'JANUARY', date: '09.01.26', leave: ['25'], od: [], ab: [] },
  { month: 'JANUARY', date: '10.01.26', leave: ['25', '32'], od: [], ab: [] },
  { month: 'JANUARY', date: '12.01.26', leave: [], od: [], ab: ['42'] },
  { month: 'JANUARY', date: '13.01.26', leave: ['51', '43', '57'], od: [], ab: ['3', '4', '10', '18', '26', '32', '40', '44', '62', '304', '305'] },
  { month: 'JANUARY', date: '19.01.26', leave: [], od: [], ab: ['43', '51'] },
  { month: 'JANUARY', date: '21.01.26', leave: ['36'], od: [], ab: [] },
  { month: 'JANUARY', date: '22.01.26', leave: ['36'], od: [], ab: [] },
  { month: 'JANUARY', date: '24.01.26', leave: [], od: [], ab: ['32', '302'] },
  { month: 'JANUARY', date: '27.01.26', leave: [], od: [], ab: ['302', '27'] },
  { month: 'JANUARY', date: '28.01.26', leave: [], od: [], ab: ['25'] },
  { month: 'JANUARY', date: '29.01.26', leave: [], od: [], ab: ['36'] },
  { month: 'JANUARY', date: '30.01.26', leave: ['29'], od: [], ab: [] },
  { month: 'JANUARY', date: '31.01.26', leave: ['29'], od: ['5'], ab: ['10', '26'] },

  // FEBRUARY 2026
  { month: 'FEBRUARY', date: '02.02.26', leave: [], od: ['25'], ab: ['53', '10'] },
  { month: 'FEBRUARY', date: '03.02.26', leave: [], od: [], ab: ['53', '16'] },
  { month: 'FEBRUARY', date: '04.02.26', leave: [], od: [], ab: ['53', '302'] },
  { month: 'FEBRUARY', date: '05.02.26', leave: [], od: [], ab: ['302', '53'] },
  { month: 'FEBRUARY', date: '06.02.26', leave: [], od: [], ab: ['53', '36'] },
  { month: 'FEBRUARY', date: '07.02.26', leave: ['43', '306'], od: ['2'], ab: ['20', '53'] },
  { month: 'FEBRUARY', date: '09.02.26', leave: ['306'], od: ['18', '304'], ab: ['53', '35', '302'] },
  { month: 'FEBRUARY', date: '10.02.26', leave: ['306'], od: ['18', '304'], ab: ['23', '53', '56'] },
  { month: 'FEBRUARY', date: '11.02.26', leave: ['12'], od: [], ab: ['306', '53'] },
  { month: 'FEBRUARY', date: '12.02.26', leave: [], od: [], ab: ['35', '53'] },
  { month: 'FEBRUARY', date: '13.02.26', leave: [], od: [], ab: ['53'] },
  { month: 'FEBRUARY', date: '14.02.26', leave: [], od: [], ab: ['21', '53', '302', '304'] },
  { month: 'FEBRUARY', date: '15.02.26', leave: [], od: [], ab: ['40', '37', '4'] },
  { month: 'FEBRUARY', date: '17.02.26', leave: [], od: ['2'], ab: ['22'] },
  { month: 'FEBRUARY', date: '20.02.26', leave: [], od: ['301'], ab: ['6', '8', '36', '48', '302'] },
  { month: 'FEBRUARY', date: '21.02.26', leave: ['57'], od: ['10', '18', '20', '21', '23', '56', '301', '54'], ab: ['36', '307'] },
  { month: 'FEBRUARY', date: '23.02.26', leave: ['31', '4'], od: [], ab: ['307', '36', '57'] },
  { month: 'FEBRUARY', date: '24.02.26', leave: [], od: [], ab: ['32', '48'] },
  { month: 'FEBRUARY', date: '25.02.26', leave: [], od: [], ab: ['32'] },
  { month: 'FEBRUARY', date: '26.02.26', leave: [], od: ['46', '36', '41'], ab: [] },
  { month: 'FEBRUARY', date: '27.02.26', leave: ['38'], od: ['36', '41', '43', '46'], ab: ['23'] },
  { month: 'FEBRUARY', date: '28.02.26', leave: [], od: [], ab: ['42'] },

  // MARCH 2026
  { month: 'MARCH', date: '04.03.26', leave: [], od: [], ab: ['4', '12', '57'] },
  { month: 'MARCH', date: '05.03.26', leave: [], od: [], ab: ['4', '12', '56'] },
  { month: 'MARCH', date: '06.03.26', leave: [], od: ['56'], ab: ['4'] },
  { month: 'MARCH', date: '11.03.26', leave: [], od: [], ab: ['11'] },
  { month: 'MARCH', date: '13.03.26', leave: [], od: [], ab: ['13'] },
  { month: 'MARCH', date: '14.03.26', leave: [], od: ['2', '59'], ab: ['44'] },
  { month: 'MARCH', date: '16.03.26', leave: ['6'], od: [], ab: [] },
  { month: 'MARCH', date: '17.03.26', leave: ['6'], od: [], ab: [] },
  { month: 'MARCH', date: '18.03.26', leave: ['6', '4'], od: [], ab: [] },
  { month: 'MARCH', date: '23.03.26', leave: ['6'], od: [], ab: ['11', '59'] },
  { month: 'MARCH', date: '24.03.26', leave: ['6', '4', '2', '50'], od: [], ab: ['59'] },
  { month: 'MARCH', date: '25.03.26', leave: ['6', '50'], od: ['304'], ab: [] },
  { month: 'MARCH', date: '26.03.26', leave: ['6'], od: ['304'], ab: [] },
  { month: 'MARCH', date: '27.03.26', leave: ['6'], od: ['304', '8', '25', '59'], ab: ['57'] },

  // APRIL 2026
  { month: 'APRIL', date: '01.04.26', leave: [], od: [], ab: ['8', '36', '39', '304'] },
  { month: 'APRIL', date: '02.04.26', leave: ['36'], od: [], ab: ['39'] },
  { month: 'APRIL', date: '06.04.26', leave: [], od: [], ab: ['36'] },
  { month: 'APRIL', date: '07.04.26', leave: [], od: [], ab: ['36'] },
  { month: 'APRIL', date: '09.04.26', leave: [], od: [], ab: ['11'] },
];

// --- Components ---

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-5 rounded-2xl border ${color} bg-white shadow-sm flex items-center gap-4`}
  >
    <div className={`p-3 rounded-xl ${color.replace('border-', 'bg-').replace('-200', '-50')}`}>
      <Icon className={`w-6 h-6 ${color.replace('border-', 'text-').replace('-200', '-600')}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </motion.div>
);

const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm"
  >
    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
      <CheckCircle2 className="w-8 h-8 text-green-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">All Forms Submitted</h3>
    <p className="text-slate-500 max-w-xs mt-2">No pending leave, OD, or absent forms found for this registration number.</p>
  </motion.div>
);

export default function App() {
  const [regNo, setRegNo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm) return null;

    const filtered: { date: string, type: StatusType, month: string }[] = [];
    
    ATTENDANCE_DATA.forEach(entry => {
      // Robust matching: Extract the actual student ID from the end of the reg number
      // We take the last 3 digits and parse them to handle roll numbers correctly.
      const isMatch = (list: string[]) => {
        const studentRollNo = parseInt(searchTerm.slice(-3), 10);
        if (isNaN(studentRollNo)) return false;
        return list.some(id => parseInt(id, 10) === studentRollNo);
      };

      if (isMatch(entry.leave)) filtered.push({ date: entry.date, type: 'L', month: entry.month });
      if (isMatch(entry.od)) filtered.push({ date: entry.date, type: 'OD', month: entry.month });
      if (isMatch(entry.ab)) filtered.push({ date: entry.date, type: 'AB', month: entry.month });
    });

    return filtered;
  }, [searchTerm]);

  const stats = useMemo(() => {
    if (!results) return { L: 0, OD: 0, AB: 0 };
    return results.reduce((acc, curr) => {
      acc[curr.type]++;
      return acc;
    }, { L: 0, OD: 0, AB: 0 });
  }, [results]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(regNo.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              Student Leave Portal
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Reporting Period: Dec 2025 – Apr 2026</p>
          </div>

          <form onSubmit={handleSearch} className="relative group flex-1 md:max-w-md">
            <input 
              type="text"
              placeholder="Enter Registration No (e.g. ...5021)"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg font-medium placeholder:text-slate-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors active:scale-95"
            >
              Check
            </button>
          </form>
        </header>

        <AnimatePresence mode="wait">
          {!searchTerm ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-indigo-600 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-indigo-200"
            >
              <div className="relative z-10 space-y-4 max-w-lg">
                <h2 className="text-3xl font-bold leading-tight">Verify Your Pending Forms</h2>
                <p className="text-indigo-100 text-lg opacity-90 leading-relaxed font-medium">
                  Enter your full registration number to see all pending Leave (L), On-Duty (OD), and Absent (AB) forms reported in the official system.
                </p>
                <div className="flex items-center gap-3 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-xs font-bold">ST</div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-indigo-50 underline decoration-indigo-300">Join 300+ tracked students</span>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
              <FileText className="absolute right-12 bottom-12 w-32 h-32 text-indigo-400 opacity-20 rotate-12" />
            </motion.div>
          ) : results && results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard icon={UserCheck} label="Leave (L)" value={stats.L} color="border-amber-200" />
                <StatCard icon={Briefcase} label="On-Duty (OD)" value={stats.OD} color="border-blue-200" />
                <StatCard icon={UserX} label="Absent (AB)" value={stats.AB} color="border-rose-200" />
              </div>

              {/* Detailed List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Pending Records History
                  </h3>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold border border-indigo-100">
                    {results.length} results
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {results.map((res, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg ${
                          res.type === 'L' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          res.type === 'OD' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {res.type}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{res.month}</p>
                          <p className="text-lg font-bold text-slate-800">{res.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`hidden sm:inline-block px-4 py-1.5 rounded-lg text-sm font-bold ${
                          res.type === 'L' ? 'bg-amber-100 text-amber-700' :
                          res.type === 'OD' ? 'bg-blue-100 text-blue-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {res.type === 'L' ? 'Leave Application' : res.type === 'OD' ? 'On-Duty Approval' : 'Unmarked Absence'}
                        </span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-indigo-50 text-slate-300 group-hover:text-indigo-600 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <EmptyState key="empty" />
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="pt-12 border-t border-slate-200">
          <div className="bg-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              <Info className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-bold text-slate-800">System Information</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                This report is updated periodically. If you notice any discrepancies or have already submitted your forms, please contact the administration office with your acknowledgement receipt.
              </p>
            </div>
            <button className="whitespace-nowrap ml-auto bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Contact Support
            </button>
          </div>
          <p className="text-center py-8 text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">
            © 2026 Academic Administration Services | Developed by Jacob
          </p>
        </footer>
      </div>
    </div>
  );
}
