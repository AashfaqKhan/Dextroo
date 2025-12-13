import React, { useState, useEffect } from 'react';
import { User, ClassSession, Notification } from '../types';
import { db } from '../services/db';
import { LogOut, LayoutDashboard, Users, FileText, X, Briefcase, Plus, Trash2, Shield, Copy, Check, TrendingUp, Calendar, Clock, MapPin, Video, Link as LinkIcon } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type View = 'students' | 'faculty' | 'timetable';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('students');
  const [students, setStudents] = useState<User[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Faculty Form State
  const [newFacName, setNewFacName] = useState('');
  const [newFacUser, setNewFacUser] = useState('');
  const [newFacPass, setNewFacPass] = useState('');
  const [facError, setFacError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Time Table Form State
  const [classSubject, setClassSubject] = useState('');
  const [classDay, setClassDay] = useState('Monday');
  const [classStart, setClassStart] = useState('');
  const [classEnd, setClassEnd] = useState('');
  const [classRoom, setClassRoom] = useState('');
  const [classLink, setClassLink] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const s = await db.getUsers();
      setStudents(s);

      const f = await db.getFaculty();
      setFaculty(f);

      const sch = await db.getSchedule();
      setSchedule(sch);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  // --- Faculty Logic ---

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacError('');

    if (!newFacName || !newFacUser || !newFacPass) {
        setFacError("All fields are required to generate credentials.");
        return;
    }

    if (faculty.some(f => f.username === newFacUser)) {
        setFacError("This username is already taken.");
        return;
    }

    const newFaculty: User = {
        name: newFacName,
        username: newFacUser,
        password: newFacPass,
        role: 'faculty',
        qualification: 'Faculty Member',
        location: 'Campus',
        age: 0,
        feeScreenshot: null
    };

    await db.addFacultyMember(newFaculty);
    const updated = await db.getFaculty();
    setFaculty(updated);

    setNewFacName('');
    setNewFacUser('');
    setNewFacPass('');
  };

  const handleDeleteFaculty = async (username: string) => {
      if (window.confirm(`Are you sure you want to remove faculty member ${username}?`)) {
          await db.deleteFacultyMember(username);
          const updated = await db.getFaculty();
          setFaculty(updated);
      }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Time Table Logic ---

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classSubject || !classDay || !classStart || !classEnd) return;

    const newClass: ClassSession = {
        id: Date.now().toString(),
        subject: classSubject,
        day: classDay,
        startTime: classStart,
        endTime: classEnd,
        room: classRoom || 'Online',
        zoomLink: classLink
    };

    await db.addClass(newClass);
    await db.addNotification({
        id: Date.now().toString(),
        message: `New ${classSubject} class added on ${classDay} at ${classStart}`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'timetable'
    });

    const updated = await db.getSchedule();
    setSchedule(updated);

    // Reset Form
    setClassSubject('');
    setClassStart('');
    setClassEnd('');
    setClassRoom('');
    setClassLink('');
  };

  const handleDeleteClass = async (id: string) => {
    if(window.confirm("Are you sure you want to delete this class?")) {
        await db.deleteClass(id);
        const updated = await db.getSchedule();
        setSchedule(updated);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl">
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <LayoutDashboard className="w-7 h-7 mr-3 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight">Dextro Admin</span>
        </div>
        <div className="flex-1 p-4 space-y-2 mt-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</div>
          <button 
             onClick={() => setCurrentView('students')}
             className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${currentView === 'students' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3" />
            Registered Students
          </button>
          
          <button 
             onClick={() => setCurrentView('faculty')}
             className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${currentView === 'faculty' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Briefcase className="w-5 h-5 mr-3" />
            Faculty Staff
          </button>

          <button 
             onClick={() => setCurrentView('timetable')}
             className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${currentView === 'timetable' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Time Table
          </button>
        </div>
        
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm shadow-md">A</div>
            <div className="ml-3">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-gray-400">System Access</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white shadow-sm h-20 flex items-center px-8 justify-between z-10 sticky top-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    {currentView === 'students' && 'Student Overview'}
                    {currentView === 'faculty' && 'Faculty Management'}
                    {currentView === 'timetable' && 'Class Schedules'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your academy records efficiently
                </p>
            </div>
            <div className="flex items-center space-x-4">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">System Online</p>
               </div>
            </div>
        </header>

        <main className="p-8 flex-1 overflow-auto bg-gray-50/50">
           
           {/* Summary Stats */}
           {currentView !== 'timetable' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                     <div className="p-3 bg-blue-100 rounded-lg mr-4 text-blue-600">
                         <Users className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="text-sm text-gray-500 font-medium">Total Students</p>
                         <h3 className="text-2xl font-bold text-gray-900">{students.length}</h3>
                     </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                     <div className="p-3 bg-teal-100 rounded-lg mr-4 text-teal-600">
                         <Briefcase className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="text-sm text-gray-500 font-medium">Active Faculty</p>
                         <h3 className="text-2xl font-bold text-gray-900">{faculty.length}</h3>
                     </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                     <div className="p-3 bg-purple-100 rounded-lg mr-4 text-purple-600">
                         <TrendingUp className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="text-sm text-gray-500 font-medium">Total Users</p>
                         <h3 className="text-2xl font-bold text-gray-900">{students.length + faculty.length}</h3>
                     </div>
                 </div>
             </div>
           )}

           {currentView === 'students' && (
               <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                   <div className="px-6 py-5 border-b border-gray-200 bg-white flex justify-between items-center">
                       <h3 className="text-gray-800 font-bold flex items-center text-lg">
                           Student Directory
                       </h3>
                       <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">All Records</span>
                   </div>
                   {students.length === 0 ? (
                       <div className="p-16 text-center">
                           <div className="mx-auto h-12 w-12 text-gray-300 mb-4"><Users className="w-full h-full"/></div>
                           <h3 className="text-lg font-medium text-gray-900">No students yet</h3>
                           <p className="mt-1 text-gray-500">Registration data will appear here once students sign up.</p>
                       </div>
                   ) : (
                       <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50/50">
                                   <tr>
                                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                   </tr>
                               </thead>
                               <tbody className="bg-white divide-y divide-gray-200">
                                   {students.map((student, idx) => (
                                       <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <div className="flex items-center">
                                                   <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                                       {student.name.charAt(0)}
                                                   </div>
                                                   <div className="ml-4">
                                                       <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                       <div className="text-xs text-gray-500">ID: ST-{1000 + idx}</div>
                                                   </div>
                                               </div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <div className="text-sm text-gray-900 font-medium">{student.email}</div>
                                               <div className="text-xs text-gray-500">{student.phoneNumber}</div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <div className="text-sm text-gray-900"><span className="font-semibold">{student.qualification}</span></div>
                                               <div className="text-xs text-gray-500">{student.age} Years Old</div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                               <div className="flex items-center">
                                                   <span className="bg-gray-100 px-2 py-1 rounded text-xs">{student.location}</span>
                                               </div>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                   Active
                                               </span>
                                           </td>
                                           <td className="px-6 py-4 whitespace-nowrap">
                                               {student.feeScreenshot ? (
                                                   <button 
                                                     onClick={() => setSelectedImage(student.feeScreenshot)}
                                                     className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                                   >
                                                       <FileText className="w-3.5 h-3.5 mr-1.5" />
                                                       View Proof
                                                   </button>
                                               ) : (
                                                   <span className="text-xs text-gray-400 italic">No upload</span>
                                               )}
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   )}
               </div>
           )}

           {currentView === 'faculty' && (
               <div className="space-y-6">
                   {/* Add Faculty Form */}
                   <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                       <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                           <div className="p-2 bg-indigo-100 rounded-lg mr-3 text-indigo-600"><Plus className="w-5 h-5"/></div>
                           Register New Faculty
                       </h3>
                       
                       <form onSubmit={handleAddFaculty} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                           <div className="md:col-span-3">
                               <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                               <input 
                                  type="text" 
                                  value={newFacName}
                                  onChange={e => setNewFacName(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                  placeholder="e.g. Dr. Sarah Smith"
                               />
                           </div>
                           <div className="md:col-span-3">
                               <label className="block text-sm font-medium text-gray-700 mb-2">Assign Username</label>
                               <input 
                                  type="text" 
                                  value={newFacUser}
                                  onChange={e => setNewFacUser(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                  placeholder="e.g. ssmith"
                               />
                           </div>
                           <div className="md:col-span-3">
                               <label className="block text-sm font-medium text-gray-700 mb-2">Assign Password</label>
                               <input 
                                  type="text" 
                                  value={newFacPass}
                                  onChange={e => setNewFacPass(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                  placeholder="Secure password"
                               />
                           </div>
                           <div className="md:col-span-3">
                               <button 
                                 type="submit"
                                 className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold transition-colors shadow-md"
                               >
                                   Generate Credentials
                               </button>
                           </div>
                       </form>
                       {facError && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md font-medium border border-red-100 inline-block">{facError}</p>}
                   </div>

                   {/* Faculty List */}
                   <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                       <div className="px-6 py-5 border-b border-gray-200 bg-white">
                           <h3 className="text-gray-800 font-bold flex items-center text-lg">
                               <Shield className="w-5 h-5 mr-2 text-indigo-500"/> Authenticated Staff
                           </h3>
                       </div>
                       {faculty.length === 0 ? (
                           <div className="p-16 text-center text-gray-500">
                               <p>No faculty members have been added yet.</p>
                           </div>
                       ) : (
                           <div className="overflow-x-auto">
                               <table className="min-w-full divide-y divide-gray-200">
                                   <thead className="bg-gray-50/50">
                                       <tr>
                                           <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Faculty Member</th>
                                           <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                           <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Password</th>
                                           <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                       </tr>
                                   </thead>
                                   <tbody className="bg-white divide-y divide-gray-200">
                                       {faculty.map((member, idx) => (
                                           <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                               <td className="px-6 py-4 whitespace-nowrap">
                                                   <div className="flex items-center">
                                                       <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                                                           {member.name.charAt(0)}
                                                       </div>
                                                       <div className="ml-4">
                                                           <div className="text-sm font-bold text-gray-900">{member.name}</div>
                                                           <div className="text-xs text-gray-500">Faculty ID: {2000 + idx}</div>
                                                       </div>
                                                   </div>
                                               </td>
                                               <td className="px-6 py-4 whitespace-nowrap">
                                                   <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">{member.username}</span>
                                               </td>
                                               <td className="px-6 py-4 whitespace-nowrap">
                                                   <div className="flex items-center">
                                                       <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700 mr-2">{member.password}</span>
                                                       <button 
                                                           onClick={() => copyToClipboard(`User: ${member.username}\nPass: ${member.password}`, member.username || '')}
                                                           className="p-1.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                           title="Copy Credentials"
                                                       >
                                                           {copiedId === member.username ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                                                       </button>
                                                   </div>
                                               </td>
                                               <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                   <button 
                                                      onClick={() => handleDeleteFaculty(member.username!)}
                                                      className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                      title="Revoke Access"
                                                   >
                                                       <Trash2 className="w-4 h-4" />
                                                   </button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                       )}
                   </div>
               </div>
           )}

           {currentView === 'timetable' && (
               <div className="space-y-6">
                   {/* Add Class Form */}
                   <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                       <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                           <div className="p-2 bg-indigo-100 rounded-lg mr-3 text-indigo-600"><Calendar className="w-5 h-5"/></div>
                           Schedule a New Class
                       </h3>
                       
                       <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                           <div className="md:col-span-3">
                               <label className="block text-sm font-medium text-gray-700 mb-2">Subject / Course</label>
                               <input 
                                  type="text" 
                                  value={classSubject}
                                  onChange={e => setClassSubject(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                  placeholder="e.g. CS 101"
                               />
                           </div>
                           <div className="md:col-span-3">
                               <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                               <select 
                                  value={classDay}
                                  onChange={e => setClassDay(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                               >
                                   {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                               </select>
                           </div>
                           <div className="md:col-span-3 grid grid-cols-2 gap-2">
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
                                   <input 
                                      type="time" 
                                      value={classStart}
                                      onChange={e => setClassStart(e.target.value)}
                                      className="w-full px-2 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-2">End</label>
                                   <input 
                                      type="time" 
                                      value={classEnd}
                                      onChange={e => setClassEnd(e.target.value)}
                                      className="w-full px-2 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                                   />
                               </div>
                           </div>
                           <div className="md:col-span-4">
                               <label className="block text-sm font-medium text-gray-700 mb-2">Room / Platform</label>
                               <input 
                                  type="text" 
                                  value={classRoom}
                                  onChange={e => setClassRoom(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                  placeholder="Lab 1 or Online"
                               />
                           </div>
                           <div className="md:col-span-5">
                               <label className="block text-sm font-medium text-gray-700 mb-2">Zoom / Meeting Link (Optional)</label>
                               <div className="relative">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <LinkIcon className="h-4 w-4 text-gray-400" />
                                   </div>
                                   <input 
                                      type="text" 
                                      value={classLink}
                                      onChange={e => setClassLink(e.target.value)}
                                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                      placeholder="https://zoom.us/j/123456789"
                                   />
                               </div>
                           </div>
                           <div className="md:col-span-3">
                               <button 
                                 type="submit"
                                 className="w-full px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold transition-colors shadow-md flex items-center justify-center"
                               >
                                   <Plus className="w-4 h-4 mr-2"/> Add Schedule
                               </button>
                           </div>
                       </form>
                   </div>

                   {/* Timetable View */}
                   <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                       <div className="px-6 py-5 border-b border-gray-200 bg-white">
                           <h3 className="text-gray-800 font-bold flex items-center text-lg">
                               <Clock className="w-5 h-5 mr-2 text-indigo-500"/> Master Schedule
                           </h3>
                       </div>
                       
                       {daysOfWeek.map(day => {
                           const dayClasses = schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                           if (dayClasses.length === 0) return null;

                           return (
                               <div key={day} className="border-b border-gray-100 last:border-0">
                                   <div className="bg-gray-50 px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                       {day}
                                   </div>
                                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
                                       {dayClasses.map((session) => (
                                           <div key={session.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 xl:border-r xl:even:border-r-0">
                                                <div className="flex items-start gap-4 mb-3 sm:mb-0">
                                                    <div className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-mono font-bold whitespace-nowrap border border-indigo-100">
                                                        {session.startTime} - {session.endTime}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{session.subject}</h4>
                                                        <div className="flex gap-3 mt-1">
                                                            <span className="flex items-center text-xs text-gray-500">
                                                                <MapPin className="w-3 h-3 mr-1"/> {session.room}
                                                            </span>
                                                            {session.zoomLink && (
                                                                <a href={session.zoomLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-600 hover:underline">
                                                                    <Video className="w-3 h-3 mr-1"/> Zoom
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="self-end sm:self-center">
                                                    <button 
                                                        onClick={() => handleDeleteClass(session.id)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center text-xs font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1"/> Delete
                                                    </button>
                                                </div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           );
                       })}
                       
                       {schedule.length === 0 && (
                           <div className="p-12 text-center text-gray-500">
                               No classes scheduled yet.
                           </div>
                       )}
                   </div>
               </div>
           )}
        </main>
      </div>

      {/* Image Modal */}
      {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity" onClick={() => setSelectedImage(null)}>
              <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <div>
                          <h3 className="font-bold text-lg text-gray-900">Fee Payment Document</h3>
                          <p className="text-xs text-gray-500">Verified Submission</p>
                      </div>
                      <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full border border-gray-200 hover:bg-gray-100">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="overflow-auto p-8 flex justify-center bg-gray-100/50">
                      <img src={selectedImage} alt="Fee Screenshot" className="max-w-full h-auto shadow-md rounded-lg border border-gray-200" />
                  </div>
                  <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
                      >
                          Close Viewer
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;