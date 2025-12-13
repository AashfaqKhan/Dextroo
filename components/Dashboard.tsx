import React, { useState, useEffect } from 'react';
import { User, AppView, ClassSession, Notification } from '../types';
import { db } from '../services/db';
import { LayoutDashboard, MessageSquare, Image as ImageIcon, Mic, LogOut, User as UserIcon, Sparkles, MapPin, Briefcase, Calendar, Clock, BookOpen, Video, Bell, UserCheck } from 'lucide-react';
import ChatBot from './ChatBot';
import ImageAnalyzer from './ImageAnalyzer';
import TextToSpeech from './TextToSpeech';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = React.useState<AppView>(AppView.DASHBOARD);
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
    // Simulate polling
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const sch = await db.getSchedule();
      setSchedule(sch);
      
      const notifs = await db.getNotifications();
      setNotifications(notifs);
      
      const oneDayAgo = new Date(Date.now() - 86400000);
      const recent = notifs.filter(n => new Date(n.timestamp) > oneDayAgo);
      setUnreadCount(recent.length);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const handleNotificationClick = () => {
      setShowNotifications(!showNotifications);
  };

  const handleNotificationItemClick = (type: string) => {
      if (type === 'timetable') {
          setCurrentView(AppView.TIMETABLE);
      }
      setShowNotifications(false);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1 ${
        currentView === view
          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 ${currentView === view ? 'text-indigo-600' : 'text-gray-400'}`} />
      {label}
    </button>
  );

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        <div className="flex items-center h-20 px-8 border-b border-gray-50">
          <div className="flex items-center text-indigo-700">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 text-white">
                 <LayoutDashboard className="w-5 h-5" />
             </div>
             <span className="text-xl font-bold tracking-tight">Dextro Design</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Main Menu</div>
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Overview" />
          <NavItem view={AppView.TIMETABLE} icon={Calendar} label="Time Table" />
          
          <div className="mt-8 mb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">AI Tools</div>
          <div className="space-y-1">
            <NavItem view={AppView.CHAT} icon={MessageSquare} label="AI Tutor Chat" />
            <NavItem view={AppView.IMAGE} icon={ImageIcon} label="Visual Analysis" />
            <NavItem view={AppView.TTS} icon={Mic} label="Text to Speech" />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-xl">
             <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                {user.name.charAt(0)}
             </div>
             <div className="ml-3 overflow-hidden">
               <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
               <p className="text-xs text-gray-500 truncate">{user.email || user.role}</p>
             </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 z-20 sticky top-0">
           <span className="text-lg font-bold text-indigo-700 flex items-center gap-2">
             <div className="w-6 h-6 bg-indigo-600 rounded-md"></div> Dextro
           </span>
           <div className="flex items-center gap-2">
                <button onClick={handleNotificationClick} className="relative p-2 text-gray-600">
                    <Bell className="w-5 h-5"/>
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
               <button onClick={onLogout}><LogOut className="w-5 h-5 text-gray-500" /></button>
           </div>
        </div>
        
        {/* Mobile Nav */}
        <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap p-2 flex gap-2 z-10">
             <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${currentView === AppView.DASHBOARD ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Home</button>
             <button onClick={() => setCurrentView(AppView.TIMETABLE)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${currentView === AppView.TIMETABLE ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Schedule</button>
             <button onClick={() => setCurrentView(AppView.CHAT)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${currentView === AppView.CHAT ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Chat</button>
             <button onClick={() => setCurrentView(AppView.IMAGE)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${currentView === AppView.IMAGE ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Image</button>
             <button onClick={() => setCurrentView(AppView.TTS)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${currentView === AppView.TTS ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>TTS</button>
        </div>

        {/* Desktop Header for Notifications */}
        <div className="hidden md:flex absolute top-4 right-8 z-30">
             <div className="relative">
                 <button 
                    onClick={handleNotificationClick}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 transition-colors relative"
                 >
                     <Bell className="w-6 h-6"/>
                     {unreadCount > 0 && (
                         <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                     )}
                 </button>

                 {showNotifications && (
                     <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                         <div className="px-4 py-3 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                             <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                             <span className="text-xs text-indigo-600 font-medium">{unreadCount} New</span>
                         </div>
                         <div className="max-h-80 overflow-y-auto">
                             {notifications.length === 0 ? (
                                 <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                             ) : (
                                 notifications.map(n => (
                                     <button 
                                        key={n.id}
                                        onClick={() => handleNotificationItemClick(n.type)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex items-start gap-3"
                                     >
                                         <div className="bg-blue-100 p-1.5 rounded-full mt-0.5 text-blue-600">
                                            <Calendar className="w-4 h-4" />
                                         </div>
                                         <div>
                                             <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                                             <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleDateString()} • {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                         </div>
                                     </button>
                                 ))
                             )}
                         </div>
                     </div>
                 )}
             </div>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === AppView.DASHBOARD && (
              <div className="space-y-8 animate-fade-in-up">
                 
                 {/* Hero Section */}
                 <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    
                    <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
                            <p className="text-indigo-100 max-w-xl">
                                Your academic dashboard is ready. Access your AI tools below to enhance your learning experience today.
                            </p>
                        </div>
                        <div className="mt-6 md:mt-0">
                            <button 
                                onClick={() => setCurrentView(AppView.CHAT)}
                                className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg hover:bg-indigo-50 transition-colors"
                            >
                                Start Learning
                            </button>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tool Cards */}
                    <div 
                        onClick={() => setCurrentView(AppView.CHAT)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors duration-300">
                            <MessageSquare className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">AI Tutor Chat</h3>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">Ask complex questions and get instant academic help from our advanced Gemini AI model.</p>
                    </div>

                    <div 
                        onClick={() => setCurrentView(AppView.IMAGE)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-600 transition-colors duration-300">
                            <ImageIcon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Visual Analysis</h3>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">Upload charts, diagrams, or handwritten notes for instant AI analysis and explanation.</p>
                    </div>

                    <div 
                        onClick={() => setCurrentView(AppView.TTS)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 transition-colors duration-300">
                            <Mic className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Text to Speech</h3>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">Convert your study notes into natural-sounding speech for auditory learning on the go.</p>
                    </div>
                 </div>
                 
                 <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <UserIcon className="w-5 h-5 mr-2 text-indigo-600"/> Student Profile
                        </h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wide">
                            Active Status
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center"><Briefcase className="w-3 h-3 mr-1"/> Qualification</div>
                            <p className="font-semibold text-gray-800">{user.qualification}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Location</div>
                            <p className="font-semibold text-gray-800">{user.location}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Age</div>
                            <p className="font-semibold text-gray-800">{user.age} Years</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Member Since</div>
                            <p className="font-semibold text-gray-800">2024</p>
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {currentView === AppView.TIMETABLE && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                    <div className="bg-indigo-600 p-6 flex items-center justify-between text-white">
                        <div className="flex items-center">
                            <Calendar className="w-6 h-6 mr-3 text-indigo-200" />
                            <h2 className="text-xl font-bold">Class Schedule</h2>
                        </div>
                        <div className="text-indigo-200 text-sm font-medium">Updated Recently</div>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-6 bg-white">
                        {schedule.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                <Calendar className="w-12 h-12 mb-4 opacity-50"/>
                                <p>No classes scheduled yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {daysOfWeek.map(day => {
                                    const dayClasses = schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                                    if (dayClasses.length === 0) return null;

                                    return (
                                        <div key={day} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center">
                                                <span className="font-bold text-gray-700 uppercase tracking-wide text-xs">{day}</span>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {dayClasses.map(session => (
                                                    <div key={session.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold flex flex-col items-center min-w-[100px] text-center bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                                <span>{session.startTime}</span>
                                                                <span className="text-xs opacity-75 font-normal">to</span>
                                                                <span>{session.endTime}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-lg">{session.subject}</h4>
                                                                <div className="flex flex-col gap-1 mt-1">
                                                                     <div className="flex items-center text-sm text-gray-500">
                                                                        <MapPin className="w-3.5 h-3.5 mr-1"/> {session.room}
                                                                     </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {session.zoomLink ? (
                                                            <a 
                                                              href={session.zoomLink} 
                                                              target="_blank" 
                                                              rel="noopener noreferrer"
                                                              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
                                                            >
                                                                <Video className="w-4 h-4 mr-2" />
                                                                Join Class
                                                            </a>
                                                        ) : (
                                                            <div className="hidden sm:block">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    In-Person
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Render sub-components in full height container */}
            {currentView !== AppView.DASHBOARD && currentView !== AppView.TIMETABLE && (
                <div className="h-full animate-fade-in">
                    {currentView === AppView.CHAT && <ChatBot userId={user.name} />}
                    {currentView === AppView.IMAGE && <ImageAnalyzer />}
                    {currentView === AppView.TTS && <TextToSpeech />}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;