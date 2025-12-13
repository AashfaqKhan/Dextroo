import React, { useState, useEffect } from 'react';
import { User, ClassSession, Notification } from '../types';
import { db } from '../services/db';
import { LogOut, LayoutDashboard, Users, GraduationCap, MapPin, Calendar, Clock, Video, Bell, UserCheck } from 'lucide-react';

interface FacultyDashboardProps {
  user: User;
  onLogout: () => void;
}

type FacultyView = 'students' | 'timetable';

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<FacultyView>('students');
  const [students, setStudents] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const s = await db.getUsers();
      setStudents(s);

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
          setCurrentView('timetable');
      }
      setShowNotifications(false);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-teal-900 text-white flex flex-col shadow-2xl">
        <div className="h-20 flex items-center px-6 border-b border-teal-800">
          <LayoutDashboard className="w-7 h-7 mr-3 text-teal-400" />
          <span className="text-xl font-bold tracking-tight">Dextro Faculty</span>
        </div>
        <div className="flex-1 p-4 mt-4 space-y-2">
          <button
             onClick={() => setCurrentView('students')}
             className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${currentView === 'students' ? 'bg-teal-800 text-white shadow-lg border border-teal-700/50' : 'text-teal-100 hover:bg-teal-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3 text-teal-300" />
            Student List
          </button>

          <button
             onClick={() => setCurrentView('timetable')}
             className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${currentView === 'timetable' ? 'bg-teal-800 text-white shadow-lg border border-teal-700/50' : 'text-teal-100 hover:bg-teal-800 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5 mr-3 text-teal-300" />
            Class Schedule
          </button>
        </div>
        <div className="p-4 border-t border-teal-800 bg-teal-900">
          <div className="flex items-center mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-teal-500 flex items-center justify-center font-bold text-sm text-white shadow-md border-2 border-teal-400">
                {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-teal-50">{user.name}</p>
              <p className="text-xs text-teal-300">Faculty Access</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-teal-100 hover:bg-teal-800 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white shadow-sm h-20 flex items-center px-8 justify-between sticky top-0 z-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {currentView === 'students' ? 'Faculty Dashboard' : 'Academic Timetable'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {currentView === 'students' ? 'Manage and view student performance' : 'View class timings and room allocations'}
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                 {/* Notification Bell */}
                 <div className="relative">
                     <button 
                        onClick={handleNotificationClick}
                        className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative"
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
                                 <span className="text-xs text-teal-600 font-medium">{unreadCount} New</span>
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
                                             <div className="bg-teal-100 p-1.5 rounded-full mt-0.5 text-teal-600">
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

                <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold border border-teal-100">
                    Academic Year 2024
                </div>
            </div>
        </header>

        <main className="p-8 bg-gray-50/50 flex-1">
           
           {/* Stats (Only show on main dashboard) */}
           {currentView === 'students' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                     <div className="p-3 bg-teal-100 rounded-lg mr-4 text-teal-600">
                         <GraduationCap className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="text-sm text-gray-500 font-medium">Enrolled Students</p>
                         <h3 className="text-2xl font-bold text-gray-900">{students.length}</h3>
                     </div>
                 </div>
             </div>
           )}

           {currentView === 'students' && (
             <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-200 bg-white flex justify-between items-center">
                     <h3 className="text-gray-800 font-bold flex items-center">
                         <Users className="w-5 h-5 mr-2 text-gray-400"/> Class Roster
                     </h3>
                 </div>
                 {students.length === 0 ? (
                     <div className="p-16 text-center text-gray-500">No students registered yet.</div>
                 ) : (
                     <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50/50">
                                 <tr>
                                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Details</th>
                                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Demographics</th>
                                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Qualification</th>
                                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                 {students.map((student, idx) => (
                                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                         <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="flex items-center">
                                                 <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                                     {student.name.charAt(0)}
                                                 </div>
                                                 <div className="ml-4">
                                                     <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                     <div className="text-xs text-gray-500">Active Student</div>
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="text-sm text-gray-900 font-medium">{student.email || '-'}</div>
                                             <div className="text-xs text-gray-500">{student.phoneNumber || '-'}</div>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                             <span className="bg-gray-100 px-2 py-1 rounded text-xs">{student.age} Years</span>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{student.qualification}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                             <MapPin className="w-3 h-3 mr-1 text-gray-400" /> {student.location}
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 )}
             </div>
           )}

           {currentView === 'timetable' && (
             <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-white flex justify-between items-center">
                      <h3 className="text-gray-800 font-bold flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-teal-500"/> Weekly Schedule
                      </h3>
                  </div>
                  
                  {schedule.length === 0 ? (
                      <div className="p-16 text-center text-gray-500">
                          <p>No classes have been scheduled by the administrator yet.</p>
                      </div>
                  ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {daysOfWeek.map(day => {
                            const dayClasses = schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                            if (dayClasses.length === 0) return null;

                            return (
                                <div key={day} className="border border-teal-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="bg-teal-50 px-4 py-3 border-b border-teal-100 flex items-center justify-between">
                                        <span className="font-bold text-teal-800 uppercase tracking-wide text-sm">{day}</span>
                                        <span className="text-xs font-semibold text-teal-600 bg-white px-2 py-0.5 rounded-full border border-teal-100">{dayClasses.length} Classes</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 bg-white">
                                        {dayClasses.map(session => (
                                            <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-gray-700 text-xs font-mono font-bold px-2 py-1 rounded border bg-gray-100">
                                                        {session.startTime} - {session.endTime}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1">{session.subject}</h4>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin className="w-3.5 h-3.5 mr-1 text-teal-500"/> {session.room}
                                                    </div>
                                                </div>
                                                
                                                {session.zoomLink ? (
                                                    <a 
                                                        href={session.zoomLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer" 
                                                        className="w-full mt-3 flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Video className="w-3 h-3 mr-1.5" />
                                                        Join Zoom
                                                    </a>
                                                ) : (
                                                    <div className="mt-2 text-xs text-center bg-gray-50 py-1.5 rounded-lg text-gray-500 font-medium">
                                                        In-Person Class
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
           )}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;