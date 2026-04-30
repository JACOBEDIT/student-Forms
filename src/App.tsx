import { useState, useMemo, useEffect, FormEvent } from 'react';
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
  UserX,
  Settings,
  Lock,
  LogOut,
  Save,
  Plus,
  Trash2,
  Table as TableIcon,
  Trophy,
  Sparkles
} from 'lucide-react';

// Firebase Imports
import { db } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  query, 
  orderBy,
  getDocs,
  limit,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// --- Data Types ---

type StatusType = 'L' | 'OD' | 'AB';

interface RecordEntry {
  id: string;
  date: string;
  leave: string[];
  od: string[];
  ab: string[];
  month: string;
  updatedAt?: string;
}

// --- Historical Data extracted from PDF ---

const INITIAL_ATTENDANCE_DATA: RecordEntry[] = [
  // DECEMBER 2025
  { id: '1', month: 'DECEMBER', date: '16.12.25', leave: [], od: ['2'], ab: [] },
  { id: '2', month: 'DECEMBER', date: '17.12.25', leave: ['32'], od: ['2'], ab: [] },
  { id: '3', month: 'DECEMBER', date: '18.12.25', leave: ['32'], od: ['2'], ab: [] },
  { id: '4', month: 'DECEMBER', date: '19.12.25', leave: ['32'], od: ['2'], ab: [] },
  { id: '5', month: 'DECEMBER', date: '20.12.25', leave: ['32'], od: [], ab: [] },
  { id: '6', month: 'DECEMBER', date: '26.12.25', leave: ['302'], od: [], ab: [] },

  // JANUARY 2026
  { id: '7', month: 'JANUARY', date: '07.01.26', leave: ['4', '304'], od: [], ab: [] },
  { id: '8', month: 'JANUARY', date: '09.01.26', leave: ['25'], od: [], ab: [] },
  { id: '9', month: 'JANUARY', date: '10.01.26', leave: ['25', '32'], od: [], ab: [] },
  { id: '10', month: 'JANUARY', date: '13.01.26', leave: ['43'], od: [], ab: ['3', '4', '26', '32', '40', '44', '62', '304'] },
  { id: '11', month: 'JANUARY', date: '19.01.26', leave: [], od: [], ab: ['43'] },
  { id: '12', month: 'JANUARY', date: '21.01.26', leave: ['36'], od: [], ab: [] },
  { id: '13', month: 'JANUARY', date: '22.01.26', leave: ['36'], od: [], ab: [] },
  { id: '14', month: 'JANUARY', date: '23.01.26', leave: [], od: [], ab: [] }, // All present
  { id: '15', month: 'JANUARY', date: '24.01.26', leave: [], od: [], ab: ['32', '302'] },
  { id: '16', month: 'JANUARY', date: '27.01.26', leave: [], od: [], ab: ['302'] },
  { id: '17', month: 'JANUARY', date: '28.01.26', leave: [], od: [], ab: ['25', '49'] },
  { id: '18', month: 'JANUARY', date: '31.01.26', leave: ['29'], od: ['5'], ab: ['26'] },

  // FEBRUARY 2026
  { id: '19', month: 'FEBRUARY', date: '02.02.26', leave: [], od: ['25'], ab: ['53'] },
  { id: '20', month: 'FEBRUARY', date: '03.02.26', leave: [], od: [], ab: ['53'] },
  { id: '21', month: 'FEBRUARY', date: '04.02.26', leave: [], od: [], ab: ['53', '302'] },
  { id: '22', month: 'FEBRUARY', date: '05.02.26', leave: [], od: [], ab: ['302', '53'] },
  { id: '23', month: 'FEBRUARY', date: '06.02.26', leave: [], od: [], ab: ['53'] },
  { id: '24', month: 'FEBRUARY', date: '07.02.26', leave: ['43'], od: ['2'], ab: ['20', '53'] },
  { id: '25', month: 'FEBRUARY', date: '09.02.26', leave: [], od: ['304'], ab: ['53', '302'] },
  { id: '26', month: 'FEBRUARY', date: '10.02.26', leave: [], od: ['304'], ab: ['23', '53'] },
  { id: '27', month: 'FEBRUARY', date: '11.02.26', leave: [], od: [], ab: ['53'] },
  { id: '28', month: 'FEBRUARY', date: '12.02.26', leave: [], od: [], ab: ['53'] },
  { id: '29', month: 'FEBRUARY', date: '13.02.26', leave: [], od: [], ab: ['53'] },
  { id: '30', month: 'FEBRUARY', date: '14.02.26', leave: [], od: [], ab: ['21', '53', '302', '304'] },
  { id: '31', month: 'FEBRUARY', date: '15.02.26', leave: [], od: [], ab: ['40', '37', '4'] },
  { id: '32', month: 'FEBRUARY', date: '17.02.26', leave: [], od: ['2'], ab: [] },
  { id: '33', month: 'FEBRUARY', date: '20.02.26', leave: [], od: ['301'], ab: ['302'] },
  { id: '34', month: 'FEBRUARY', date: '21.02.26', leave: [], od: ['20', '21', '23', '301', '54'], ab: [] },
  { id: '35', month: 'FEBRUARY', date: '23.02.26', leave: ['4'], od: [], ab: [] },
  { id: '36', month: 'FEBRUARY', date: '24.02.26', leave: [], od: [], ab: ['32'] },
  { id: '37', month: 'FEBRUARY', date: '25.02.26', leave: [], od: [], ab: ['32'] },
  { id: '38', month: 'FEBRUARY', date: '27.02.26', leave: ['38'], od: ['36', '41', '43', '46'], ab: ['23'] },

  // MARCH 2026
  { id: '39', month: 'MARCH', date: '04.03.26', leave: [], od: [], ab: ['4'] },
  { id: '40', month: 'MARCH', date: '05.03.26', leave: [], od: [], ab: ['4'] },
  { id: '41', month: 'MARCH', date: '06.03.26', leave: [], od: ['56'], ab: ['4'] },
  { id: '42', month: 'MARCH', date: '13.03.26', leave: [], od: [], ab: ['13'] },
  { id: '43', month: 'MARCH', date: '14.03.26', leave: [], od: ['2', '59'], ab: ['44'] },
  { id: '44', month: 'MARCH', date: '18.03.26', leave: ['4'], od: [], ab: [] },
  { id: '45', month: 'MARCH', date: '23.03.26', leave: [], od: [], ab: ['11', '59'] },
  { id: '46', month: 'MARCH', date: '24.03.26', leave: ['4', '2'], od: [], ab: ['59'] },
  { id: '47', month: 'MARCH', date: '25.03.26', leave: [], od: ['304'], ab: [] },
  { id: '48', month: 'MARCH', date: '26.03.26', leave: [], od: ['304'], ab: [] },
  { id: '49', month: 'MARCH', date: '27.03.26', leave: [], od: ['304', '25', '59'], ab: [] },

  // APRIL 2026
  { id: '50', month: 'APRIL', date: '01.04.26', leave: [], od: [], ab: ['304'] },
];

const ADMIN_PASSKEY = "200678";

// --- Components ---

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`p-5 rounded-2xl border ${color} bg-white shadow-sm flex items-center gap-4 transition-all hover:shadow-md`}
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
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      type: "spring",
      stiffness: 260,
      damping: 20 
    }}
    className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[3rem] border-4 border-green-100 shadow-2xl relative overflow-hidden"
  >
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200 relative z-10"
    >
      <CheckCircle2 className="w-12 h-12 text-white" />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 bg-green-400 rounded-full"
      />
    </motion.div>
    
    <div className="relative z-10 space-y-3">
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2"
      >
        <Trophy className="w-8 h-8 text-amber-500" />
        Congratulations!
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg font-bold text-green-600 italic"
      >
        All Forms Successfully Submitted
      </motion.p>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-slate-500 max-w-sm mt-4 font-medium"
      >
        Excellent record maintenance! There are no pending leave, OD, or absent marks registered for your number in our database.
      </motion.p>
    </div>

    {/* Background Celebration Elements */}
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Sparkles className="w-32 h-32 text-green-600" />
    </div>
    <div className="absolute bottom-0 left-0 p-4 opacity-10">
      <Sparkles className="w-24 h-24 text-green-600" />
    </div>
  </motion.div>
);

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Data State
  const [records, setRecords] = useState<RecordEntry[]>(INITIAL_ATTENDANCE_DATA);

  // Student Search State
  const [regNo, setRegNo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Firebase Sync
  useEffect(() => {
    const q = query(collection(db, "attendance_records"), orderBy("id", "asc"));
    
    // Check if we need to seed
    const checkAndSeed = async () => {
      // Use a special collection to track if we've already seeded
      const seedRef = doc(db, "system_metadata", "seed_status");
      const seedDoc = await getDocs(query(collection(db, "attendance_records"), limit(1)));
      
      if (seedDoc.empty) {
        console.log("Seeding database...");
        for (const record of INITIAL_ATTENDANCE_DATA) {
          await setDoc(doc(db, "attendance_records", record.id), record);
        }
      }
    };
    checkAndSeed();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecords = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as RecordEntry[];
      
      if (fetchedRecords.length > 0) {
        const sorted = [...fetchedRecords].sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setRecords(sorted);
        setLastGlobalSync(new Date());
      }
    });

    return () => unsubscribe();
  }, []);

  const results = useMemo(() => {
    if (!searchTerm) return null;

    const filtered: { date: string, type: StatusType, month: string }[] = [];
    
    records.forEach(entry => {
      const studentRollNo = parseInt(searchTerm.slice(-3), 10);
      if (isNaN(studentRollNo)) return;

      const isMatch = (list: string[]) => list.some(id => parseInt(id, 10) === studentRollNo);

      if (isMatch(entry.leave)) filtered.push({ date: entry.date, type: 'L', month: entry.month });
      if (isMatch(entry.od)) filtered.push({ date: entry.date, type: 'OD', month: entry.month });
      if (isMatch(entry.ab)) filtered.push({ date: entry.date, type: 'AB', month: entry.month });
    });

    return filtered;
  }, [searchTerm, records]);

  const stats = useMemo(() => {
    if (!results) return { L: 0, OD: 0, AB: 0 };
    return results.reduce((acc, curr) => {
      acc[curr.type]++;
      return acc;
    }, { L: 0, OD: 0, AB: 0 });
  }, [results]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchTerm(regNo.trim());
  };

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSKEY) {
      setIsAdminLoggedIn(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const resetSystemData = async () => {
    if (!window.confirm("Are you sure? This will wipe all current reports and reset to the original provided data list.")) return;
    
    setIsResetting(true);
    try {
      const snapshot = await getDocs(collection(db, "attendance_records"));
      const batch = writeBatch(db);
      
      snapshot.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      
      // Seed with fresh data
      INITIAL_ATTENDANCE_DATA.forEach((record) => {
        const recordRef = doc(db, "attendance_records", record.id);
        batch.set(recordRef, record);
      });
      
      await batch.commit();
      alert("System reset completed successfully!");
    } catch (error) {
      console.error("Reset failed:", error);
      alert("Reset failed. Check console for details.");
    } finally {
      setIsResetting(false);
    }
  };

  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  
  // Local edits for admin table to support "Save All"
  const [edits, setEdits] = useState<Record<string, {leave: string, od: string, ab: string}>>({});

  // Sync edits with records when records load or admin logs in
  useEffect(() => {
    if (isAdminLoggedIn && records.length > 0) {
      const initialEdits: Record<string, {leave: string, od: string, ab: string}> = {};
      records.forEach(r => {
        initialEdits[r.id] = {
          leave: r.leave.join(', '),
          od: r.od.join(', '),
          ab: r.ab.join(', ')
        };
      });
      setEdits(initialEdits);
    }
  }, [isAdminLoggedIn, records.length]);

  const validateRollNumbers = (val: string) => {
    if (val.trim() === '') return true;
    // Strictly allow numbers separated by commas and spaces
    const parts = val.split(',').map(s => s.trim()).filter(s => s !== '');
    if (parts.length === 0) return true;
    return parts.every(p => /^\d+$/.test(p));
  };

  const handleUpdateRecord = async (id: string, field: 'leave' | 'od' | 'ab', value: string) => {
    if (!validateRollNumbers(value)) {
      setValidationErrors(prev => ({ ...prev, [`${id}-${field}`]: true }));
      return;
    }
    setValidationErrors(prev => ({ ...prev, [`${id}-${field}`]: false }));

    // Update local edits state immediately
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));

    // Treat non-numeric or empty as empty list
    const rawParts = value.split(',').map(s => s.trim()).filter(s => s !== '' && /^\d+$/.test(s));
    const cleanedValue = Array.from(new Set(rawParts)); // Remove duplicates
    
    // Find current state
    const currentRecord = records.find(r => r.id === id);
    if (!currentRecord) return;

    setSavingId(id);
    
    try {
      await setDoc(doc(db, "attendance_records", id), {
        ...currentRecord,
        [field]: cleanedValue,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating record:", error);
    } finally {
      setTimeout(() => setSavingId(null), 1000);
    }
  };

  const handleSaveAll = async () => {
    // Check for validation errors first
    const hasErrors = Object.values(validationErrors).some(err => err);
    if (hasErrors) {
      alert("Please fix validation errors (highlighted in red) before saving.");
      return;
    }

    if (!window.confirm("Save all changes to the database?")) return;

    setBulkSaving(true);
    const batch = writeBatch(db);
    let changeCount = 0;

    try {
      for (const record of records) {
        const edit = edits[record.id];
        if (!edit) continue;

        const cleanField = (val: string) => {
          const raw = val.split(',').map(s => s.trim()).filter(s => s !== '' && /^\d+$/.test(s));
          return Array.from(new Set(raw));
        };

        const newLeave = cleanField(edit.leave);
        const newOd = cleanField(edit.od);
        const newAb = cleanField(edit.ab);

        // Only add to batch if changed
        const hasChanged = 
          JSON.stringify(newLeave) !== JSON.stringify(record.leave) ||
          JSON.stringify(newOd) !== JSON.stringify(record.od) ||
          JSON.stringify(newAb) !== JSON.stringify(record.ab);

        if (hasChanged) {
          const docRef = doc(db, "attendance_records", record.id);
          batch.set(docRef, {
            ...record,
            leave: newLeave,
            od: newOd,
            ab: newAb,
            updatedAt: new Date().toISOString()
          });
          changeCount++;
        }
      }

      if (changeCount > 0) {
        await batch.commit();
        alert(`Successfully saved ${changeCount} records!`);
      } else {
        alert("No changes detected.");
      }
    } catch (error) {
      console.error("Bulk save failed:", error);
      alert("Failed to save changes. Check console for details.");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex">
            <button 
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <User className="w-4 h-4" />
              Student View
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Lock className="w-4 h-4" />
              Admin Portal
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'student' ? (
            /* --- STUDENT VIEW --- */
            <motion.div 
              key="student-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors active:scale-95 shadow-sm"
                  >
                    Check
                  </button>
                </form>
              </header>

              <div className="space-y-8">
                {!searchTerm ? (
                  <motion.div 
                    key="welcome"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
                  >
                    <div className="relative z-10 space-y-6 max-w-lg">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        Official Dashboard
                      </div>
                      <h2 className="text-4xl font-black leading-tight">Verify Your Pending Forms</h2>
                      <p className="text-indigo-50 text-xl opacity-90 leading-relaxed font-medium">
                        Enter your full registration number to see all pending Leave (L), On-Duty (OD), and Absent (AB) forms reported in the system.
                      </p>
                      <ul className="space-y-3 font-medium text-indigo-100 italic">
                        <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4" /> Real-time status assessment</li>
                        <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4" /> Comprehensive PDF extraction</li>
                        <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4" /> Secure Admin synchronization</li>
                      </ul>
                    </div>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
                    <FileText className="absolute right-12 bottom-12 w-48 h-48 text-indigo-400 opacity-20 rotate-12" />
                  </motion.div>
                ) : results && results.length > 0 ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <StatCard icon={UserCheck} label="Leave (L)" value={stats.L} color="border-amber-200" />
                      <StatCard icon={Briefcase} label="On-Duty (OD)" value={stats.OD} color="border-blue-200" />
                      <StatCard icon={UserX} label="Absent (AB)" value={stats.AB} color="border-rose-200" />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                          <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Clock className="w-5 h-5 text-indigo-600" />
                          </div>
                          Reported Discrepancies
                        </h3>
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-bold border border-indigo-100 shadow-sm">
                          {results.length} Records Found
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {results.map((res, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl transition-transform group-hover:scale-110 shadow-sm ${
                                res.type === 'L' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                res.type === 'OD' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {res.type}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">{res.month}</span>
                                </div>
                                <p className="text-xl font-bold text-slate-800 tracking-tight">{res.date}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Pending submission required</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className={`hidden sm:flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-bold shadow-sm ${
                                res.type === 'L' ? 'bg-amber-100/50 text-amber-700 border border-amber-200' :
                                res.type === 'OD' ? 'bg-blue-100/50 text-blue-700 border border-blue-200' :
                                'bg-rose-100/50 text-rose-700 border border-rose-200'
                              }`}>
                                {res.type === 'L' ? 'Leave Form' : res.type === 'OD' ? 'On-Duty' : 'Absent Marking'}
                              </div>
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState />
                )}
              </div>
            </motion.div>
          ) : (
            /* --- ADMIN VIEW --- */
            <motion.div 
              key="admin-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {!isAdminLoggedIn ? (
                /* Login Screen */
                <div className="flex items-center justify-center py-20 px-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl max-w-md w-full relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative text-center space-y-6">
                      <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-100 mb-2 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                        <Lock className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Admin Authentication</h2>
                      <p className="text-slate-500 font-medium leading-relaxed px-4">Protected area for staff to manage attendance discrepancy reports.</p>
                      
                      <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Access Passkey</label>
                          <div className="relative group">
                            <input 
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••"
                              className={`w-full bg-slate-50 border px-6 py-4 rounded-2xl font-black tracking-[0.5em] text-center text-xl focus:outline-none transition-all placeholder:tracking-normal placeholder:font-bold ${
                                authError ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 group-hover:border-slate-300'
                              }`}
                            />
                            {authError && (
                              <motion.p 
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute -bottom-7 left-0 right-0 text-center text-rose-500 text-xs font-bold flex items-center justify-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" /> Incorrect Passkey
                              </motion.p>
                            )}
                          </div>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                          Unlock Portal <ArrowRight className="w-5 h-5" />
                        </button>
                      </form>
                      <p className="text-xs font-bold text-slate-400 pt-4 cursor-help hover:text-indigo-600 transition-colors">Forgot credentials? Contact system admin.</p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Admin Dashboard */
                <div className="space-y-8 pb-20">
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-600" />
                        Records Management System
                      </h1>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-slate-500 font-bold text-sm tracking-tight capitalize">Authenticated as System Administrator</p>
                        {lastGlobalSync && (
                          <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-2 py-0.5 rounded-md uppercase ml-2 tracking-widest">
                            Sync: {lastGlobalSync.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AnimatePresence>
                        {(savingId || bulkSaving) && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 shadow-sm"
                          >
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {bulkSaving ? 'Saving All...' : 'Syncing...'}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button 
                        onClick={handleSaveAll}
                        disabled={bulkSaving}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        Save All
                      </button>
                      <button 
                        onClick={() => setIsAdminLoggedIn(false)}
                        className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-95"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </header>

                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                          <TableIcon className="w-5 h-5 text-indigo-500" />
                          Master Attendance Registry
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Edits save automatically on blur</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                          <Info className="w-4 h-4 text-indigo-500 ml-2" />
                          <p className="text-xs font-bold text-slate-500 pr-4">Enter roll numbers separated by commas</p>
                        </div>
                        <button 
                          onClick={resetSystemData}
                          disabled={isResetting}
                          className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-rose-100 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isResetting ? 'Resetting...' : 'Reset Factory Data'}
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 translate-z-0">
                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] w-32">Date</th>
                            <th className="p-6 text-xs font-black text-amber-500 uppercase tracking-[0.2em]">Leave (L)</th>
                            <th className="p-6 text-xs font-black text-blue-500 uppercase tracking-[0.2em]">On-Duty (OD)</th>
                            <th className="p-6 text-xs font-black text-rose-500 uppercase tracking-[0.2em]">Absent (AB)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {records.map((row) => (
                            <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group relative">
                              <td className="p-6">
                                <div className="flex items-center gap-2">
                                  {savingId === row.id && (
                                    <motion.div 
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                      className="absolute left-1"
                                    >
                                      <Clock className="w-3 h-3 text-indigo-500" />
                                    </motion.div>
                                  )}
                                  <div>
                                    <p className="font-black text-slate-800 text-lg leading-none">{row.date}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{row.month}</span>
                                      {row.updatedAt && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400/60 lowercase italic leading-none">
                                          <div className="w-1 h-1 bg-indigo-300 rounded-full" />
                                          {new Date(row.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="relative group/cell">
                                  <input 
                                    type="text"
                                    value={edits[row.id]?.leave ?? row.leave.join(', ')}
                                    placeholder="None"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEdits(prev => ({
                                        ...prev,
                                        [row.id]: { ...(prev[row.id] || { leave: '', od: '', ab: '' }), leave: val }
                                      }));
                                      if (!validateRollNumbers(val)) {
                                        setValidationErrors(prev => ({ ...prev, [`${row.id}-leave`]: true }));
                                      } else {
                                        setValidationErrors(prev => ({ ...prev, [`${row.id}-leave`]: false }));
                                      }
                                    }}
                                    onBlur={(e) => handleUpdateRecord(row.id, 'leave', e.target.value)}
                                    className={`w-full bg-amber-50/30 border-2 px-4 py-3 rounded-xl font-bold text-amber-700 focus:outline-none focus:bg-white transition-all shadow-inner ${
                                      validationErrors[`${row.id}-leave`] 
                                        ? 'border-rose-500 bg-rose-50/50' 
                                        : 'border-transparent focus:border-amber-400 group-hover:border-amber-100 group-hover:bg-amber-50/50'
                                    }`}
                                  />
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="relative group/cell">
                                  <input 
                                    type="text"
                                    value={edits[row.id]?.od ?? row.od.join(', ')}
                                    placeholder="None"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEdits(prev => ({
                                        ...prev,
                                        [row.id]: { ...(prev[row.id] || { leave: '', od: '', ab: '' }), od: val }
                                      }));
                                      if (!validateRollNumbers(val)) {
                                        setValidationErrors(prev => ({ ...prev, [`${row.id}-od`]: true }));
                                      } else {
                                        setValidationErrors(prev => ({ ...prev, [`${row.id}-od`]: false }));
                                      }
                                    }}
                                    onBlur={(e) => handleUpdateRecord(row.id, 'od', e.target.value)}
                                    className={`w-full bg-blue-50/30 border-2 px-4 py-3 rounded-xl font-bold text-blue-700 focus:outline-none focus:bg-white transition-all shadow-inner ${
                                      validationErrors[`${row.id}-od`] 
                                        ? 'border-rose-500 bg-rose-50/50' 
                                        : 'border-transparent focus:border-blue-400 group-hover:border-blue-100 group-hover:bg-blue-50/50'
                                    }`}
                                  />
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="relative group/cell">
                                  <input 
                                    type="text"
                                    value={edits[row.id]?.ab ?? row.ab.join(', ')}
                                    placeholder="None"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEdits(prev => ({
                                        ...prev,
                                        [row.id]: { ...(prev[row.id] || { leave: '', od: '', ab: '' }), ab: val }
                                      }));
                                      if (!validateRollNumbers(val)) {
                                        setValidationErrors(prev => ({ ...prev, [`${row.id}-ab`]: true }));
                                      } else {
                                        setValidationErrors(prev => ({ ...prev, [`${row.id}-ab`]: false }));
                                      }
                                    }}
                                    onBlur={(e) => handleUpdateRecord(row.id, 'ab', e.target.value)}
                                    className={`w-full bg-rose-50/30 border-2 px-4 py-3 rounded-xl font-bold text-rose-700 focus:outline-none focus:bg-white transition-all shadow-inner ${
                                      validationErrors[`${row.id}-ab`] 
                                        ? 'border-rose-500 bg-rose-50/50' 
                                        : 'border-transparent focus:border-rose-400 group-hover:border-rose-100 group-hover:bg-rose-50/50'
                                    }`}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="pt-12 border-t border-slate-200">
          <div className="bg-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              <Info className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-bold text-slate-800">Academic Policy Notice</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-xl font-medium">
                This database is the source of truth for all pending attendance forms. Authenticated staff may update records to reflect recent submissions.
              </p>
            </div>
            <button className="whitespace-nowrap ml-auto bg-white border-2 border-slate-200 px-6 py-2.5 rounded-xl text-sm font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              Admin Support
            </button>
          </div>
          <p className="text-center py-8 text-xs font-black text-slate-400 tracking-[0.2em] uppercase">
            © 2026 Academic Administration Services | Developed by Jacob
          </p>
        </footer>
      </div>
    </div>
  );
}
