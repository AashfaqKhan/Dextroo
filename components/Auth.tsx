import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { Upload, CheckCircle, UserPlus, LogIn, ShieldCheck, Lock, UserCog, Mail, Phone, GraduationCap, Sparkles, BrainCircuit } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [feeFile, setFeeFile] = useState<string | null>(null);
  
  // Staff Login State
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  
  // Errors
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeeFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isStaffMode) {
            if (staffUsername === 'noor' && staffPassword === 'noor123') {
                onLogin({
                    name: 'Administrator',
                    role: 'admin',
                    qualification: 'System Admin',
                    location: 'HQ',
                    age: 0,
                    feeScreenshot: null,
                    isAdmin: true
                });
                setLoading(false);
                return;
            }

            const facultyList = await db.getFaculty();
            const facultyMember = facultyList.find(
                f => (f.username === staffUsername || f.name === staffUsername) && f.password === staffPassword
            );

            if (facultyMember) {
                onLogin(facultyMember);
            } else {
                setError('Invalid credentials. Please check your username and password.');
            }
            setLoading(false);
            return;
        }

        const existingUsers = await db.getUsers();

        if (isRegistering) {
            if (!name || !email || !phoneNumber || !qualification || !location || !age || !feeFile) {
                setError('Please fill in all fields and upload the fee screenshot.');
                setLoading(false);
                return;
            }

            if (existingUsers.some(u => u.email?.toLowerCase() === email.trim().toLowerCase())) {
                setError('An account with this email already exists. Please login instead.');
                setLoading(false);
                return;
            }

            const newUser: User = {
                name: name.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
                role: 'student',
                qualification,
                location,
                age: parseInt(age),
                feeScreenshot: feeFile 
            };

            try {
                await db.saveUser(newUser);
                onLogin(newUser);
            } catch (err) {
                setError('Storage error. If using cloud DB, check connection.');
                console.error(err);
            }

        } else {
            if (!email) {
                setError('Please enter your email to login.');
                setLoading(false);
                return;
            }

            const foundUser = existingUsers.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

            if (foundUser) {
                onLogin(foundUser);
            } else {
                setError('Account not found. Please register first or check your email.');
            }
        }
    } catch (e) {
        console.error(e);
        setError('An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  const toggleStaff = () => {
      setIsStaffMode(!isStaffMode);
      setError('');
      setIsRegistering(false);
      setStaffUsername('');
      setStaffPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative overflow-hidden flex-col justify-between p-12 text-white">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-700 blur-3xl opacity-50"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-700 blur-3xl opacity-50"></div>
         
         <div className="relative z-10">
             <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                 <GraduationCap className="w-10 h-10 text-indigo-300" />
                 Dextro Design
             </div>
             <p className="mt-2 text-indigo-200">Next-Gen Learning Portal</p>
         </div>

         <div className="relative z-10 space-y-8 max-w-lg">
             <h1 className="text-5xl font-extrabold leading-tight">
                 Unlock your potential with AI-powered learning.
             </h1>
             <p className="text-lg text-indigo-200">
                 Access advanced tools like Gemini Chat, Image Analysis, and smart visual aids to accelerate your academic journey.
             </p>
             <div className="flex gap-4 pt-4">
                 <div className="flex items-center gap-2 bg-indigo-800/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-indigo-700">
                     <BrainCircuit className="w-5 h-5 text-indigo-300"/> Smart AI
                 </div>
                 <div className="flex items-center gap-2 bg-indigo-800/50 px-4 py-2 rounded-lg backdrop-blur-sm border border-indigo-700">
                     <Sparkles className="w-5 h-5 text-yellow-300"/> Instant Feedback
                 </div>
             </div>
         </div>

         <div className="relative z-10 text-sm text-indigo-300">
             © 2024 Dextro Design Academy. All rights reserved.
         </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
         <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl lg:shadow-none lg:bg-transparent border border-gray-100 lg:border-none">
            
            <div className="text-center lg:text-left">
              {isStaffMode ? (
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-xl mb-4 text-indigo-700">
                      <ShieldCheck className="h-8 w-8"/>
                  </div>
              ) : (
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-xl mb-4 text-indigo-700 lg:hidden">
                      <GraduationCap className="h-8 w-8"/>
                  </div>
              )}
              
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {isStaffMode ? 'Staff Portal Access' : (isRegistering ? 'Create Account' : 'Welcome Back')}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {isStaffMode 
                  ? 'Please enter your credentials to access the admin dashboard.' 
                  : (isRegistering 
                      ? 'Enter your details to register for the upcoming semester.' 
                      : 'Sign in with your email address to continue.')}
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {isStaffMode ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCog className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="pl-10 block w-full bg-white border border-gray-300 rounded-lg py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                    value={staffUsername}
                                    onChange={(e) => setStaffUsername(e.target.value)}
                                    placeholder="Enter assigned username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="pl-10 block w-full bg-white border border-gray-300 rounded-lg py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                    value={staffPassword}
                                    onChange={(e) => setStaffPassword(e.target.value)}
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {isRegistering && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="pl-10 block w-full bg-white border border-gray-300 rounded-lg py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@example.com"
                                />
                            </div>
                        </div>

                        {isRegistering && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        className="pl-10 block w-full bg-white border border-gray-300 rounded-lg py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+92 300 1234567"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                        value={qualification}
                                        onChange={(e) => setQualification(e.target.value)}
                                        placeholder="BS CS"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <input
                                        type="number"
                                        required
                                        className="block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Submission Proof</label>
                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer group">
                                    <div className="space-y-1 text-center relative w-full">
                                        <input 
                                            id="file-upload" 
                                            name="file-upload" 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                            onChange={handleFileChange} 
                                            accept="image/*" 
                                        />
                                        {feeFile ? (
                                        <div className="flex flex-col items-center">
                                            <img src={feeFile} alt="Fee Preview" className="h-20 w-auto mb-2 rounded shadow-sm border border-gray-200" />
                                            <span className="text-green-600 flex items-center text-sm font-medium bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 mr-1"/> Uploaded</span>
                                        </div>
                                        ) : (
                                        <>
                                            <Upload className="mx-auto h-10 w-10 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <span className="font-medium text-indigo-600 group-hover:text-indigo-500">Upload a file</span>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                        </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isStaffMode ? 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-800' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600'
                    }`}
                >
                    {loading ? 'Processing...' : (isStaffMode 
                        ? 'Login to Dashboard' 
                        : (isRegistering ? 'Complete Registration' : 'Sign In'))}
                </button>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
                {!isStaffMode && (
                    <p className="text-center text-sm text-gray-600">
                        {isRegistering ? "Already have an account?" : "Don't have an account?"}{' '}
                        <button
                            onClick={() => { 
                                setIsRegistering(!isRegistering); 
                                setError(''); 
                                setFeeFile(null);
                            }}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            {isRegistering ? 'Sign in' : 'Register now'}
                        </button>
                    </p>
                )}
                
                <div className="text-center">
                   <button
                        onClick={toggleStaff}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                   >
                        {isStaffMode ? '← Back to Student Access' : 'Faculty & Admin Login'}
                   </button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Auth;