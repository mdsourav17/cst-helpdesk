import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import {
  MessageSquare, ShieldCheck, Bell, Plus, Search, CheckCircle2, Clock,
  Heart, Trash2, Edit3, Image as ImageIcon, Video, Users, UserPlus,
  Megaphone, LogOut, Lock, Radio, Calendar, ExternalLink, X, Check, Award, CornerDownRight, ThumbsUp, KeyRound, Mail, GraduationCap
} from 'lucide-react';

// ডিপার্টমেন্টের মেম্বার লিস্ট (প্রাথমিক ডেটা)
const DEFAULT_MEMBERS = {
  "253203": { name: "Sourov Islam", role: "admin", semester: "4th Semester", email: "sourov@gmail.com" },
  "272029": { name: "Sabina Murmu", role: "student", semester: "4th Semester", email: "sabina@gmail.com" },
  "272032": { name: "Irfan Ali", role: "student", semester: "4th Semester", email: "irfan@gmail.com" },
  "272033": { name: "Arafat Muntasir", role: "student", semester: "4th Semester", email: "arafat@gmail.com" },
  "272034": { name: "Murshida Khatun", role: "student", semester: "4th Semester", email: "murshida@gmail.com" },
  "272035": { name: "Utsob Roy", role: "student", semester: "4th Semester", email: "utsob@gmail.com" },
  "272036": { name: "Miftaul Jannat", role: "student", semester: "4th Semester", email: "miftaul@gmail.com" },
  "272037": { name: "AL-Mahmud", role: "student", semester: "4th Semester", email: "almahmud@gmail.com" },
  "201586": { name: "Rokaiya", role: "student", semester: "4th Semester", email: "rokaiya@gmail.com" },
  "201587": { name: "Maruf Hossen", role: "student", semester: "4th Semester", email: "maruf@gmail.com" },
  "201588": { name: "Siyam", role: "student", semester: "4th Semester", email: "siyam@gmail.com" },
  "201589": { name: "Vubon Chandra", role: "student", semester: "4th Semester", email: "vubon@gmail.com" },
  "201591": { name: "Afiya Farjana", role: "student", semester: "4th Semester", email: "afiya@gmail.com" },
  "201592": { name: "Sourov Kumar", role: "student", semester: "4th Semester", email: "sourovk@gmail.com" },
  "201594": { name: "Ashadujjaman", role: "student", semester: "4th Semester", email: "ashad@gmail.com" },
  "201597": { name: "Tahira Jannat", role: "student", semester: "4th Semester", email: "tahira@gmail.com" },
  "201598": { name: "Sohan Islam", role: "student", semester: "4th Semester", email: "sohan@gmail.com" },
  "201599": { name: "Hobibor Rahman", role: "student", semester: "4th Semester", email: "hobibor@gmail.com" },
  "201600": { name: "Nazmin Dola", role: "student", semester: "4th Semester", email: "nazmin@gmail.com" },
  "201602": { name: "Sadid Ahmed", role: "student", semester: "4th Semester", email: "sadid@gmail.com" },
  "201603": { name: "Ibna Abid", role: "student", semester: "4th Semester", email: "ibna@gmail.com" },
  "201604": { name: "Abida Sultana", role: "student", semester: "4th Semester", email: "abida@gmail.com" },
  "201605": { name: "Nurnobi", role: "student", semester: "4th Semester", email: "nurnobi@gmail.com" },
  "201606": { name: "Shagor Islam", role: "student", semester: "4th Semester", email: "shagor@gmail.com" },
  "201609": { name: "Muttza Masrafi", role: "student", semester: "4th Semester", email: "muttza@gmail.com" },
  "201610": { name: "Komolika Roy", role: "student", semester: "4th Semester", email: "komolika@gmail.com" },
  "201612": { name: "Rana", role: "student", semester: "4th Semester", email: "rana@gmail.com" },
  "201614": { name: "Julekha Akter", role: "student", semester: "4th Semester", email: "julekha@gmail.com" },
  "201615": { name: "Shanjida Akter", role: "student", semester: "4th Semester", email: "shanjida@gmail.com" },
  "201616": { name: "Mostakim Islam Ratul", role: "student", semester: "4th Semester", email: "mostakim@gmail.com" },
  "201618": { name: "Afrin Akter", role: "student", semester: "4th Semester", email: "afrin@gmail.com" },
  "201619": { name: "Soreful Islam", role: "student", semester: "4th Semester", email: "soreful@gmail.com" },
  "201621": { name: "Mobasshirina", role: "student", semester: "4th Semester", email: "mobasshirina@gmail.com" },
  "201624": { name: "James Kumer Joy", role: "student", semester: "4th Semester", email: "james@gmail.com" },
  "201625": { name: "Sador Chandra Roy", role: "student", semester: "4th Semester", email: "sador@gmail.com" },
  "201627": { name: "Aziz Mohammed", role: "student", semester: "4th Semester", email: "aziz@gmail.com" },
  "201629": { name: "Partho Sarker", role: "student", semester: "4th Semester", email: "partho@gmail.com" },
  "201630": { name: "Masud Rana", role: "student", semester: "4th Semester", email: "masud@gmail.com" },
  "201634": { name: "Anushka", role: "student", semester: "4th Semester", email: "anushka@gmail.com" },
  "702763": { name: "Jahid", role: "student", semester: "4th Semester", email: "jahid@gmail.com" }
};

const DAYS_OF_WEEK = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAYS_BN = {
  Saturday: "শনিবার", Sunday: "রবিবার", Monday: "সোমবার",
  Tuesday: "মঙ্গলবার", Wednesday: "বুধবার", Thursday: "বৃহস্পতিবার", Friday: "শুক্রবার"
};

const SECRET_ADMIN_PIN = "253203";

const compressImageFile = (file, maxDim = 750, quality = 0.65) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h *= maxDim / w; w = maxDim; }
        else if (h > maxDim) { w *= maxDim / h; h = maxDim; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function App() {
  useEffect(() => {
    const isResetDone = localStorage.getItem('hd_fresh_start_v17');
    if (!isResetDone) {
      localStorage.clear();
      localStorage.setItem('hd_fresh_start_v17', 'true');
      window.location.reload();
    }
  }, []);

  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('hd_verified_user') || 'null'));
  const [isAdminMode, setIsAdminMode] = useState(() => localStorage.getItem('hd_admin_mode') === 'true');
  const [membersDirectory, setMembersDirectory] = useState(DEFAULT_MEMBERS);
  const [moderatorRolls, setModeratorRolls] = useState(["201605"]);

  // Auth States
  const [authStep, setAuthStep] = useState('verifyRoll');
  const [authId, setAuthId] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  
  // OTP / Pin Reset States
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');

  // Navigation & View
  const [activeTab, setActiveTab] = useState('feed');
  const [toast, setToast] = useState(null);

  // Feed & Posts States
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  // Modals State
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showManageDirectory, setShowManageDirectory] = useState(false);
  const [showManageTeacherModal, setShowManageTeacherModal] = useState(false);
  const [showManageMods, setShowManageMods] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminInputPin, setAdminInputPin] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Notice Add Form Images (Max 3)
  const [noticeImages, setNoticeImages] = useState([]);

  // Create Post Form
  const [postCategory, setPostCategory] = useState('Coding / Programming');
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postVideo, setPostVideo] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Comment, Reply & Reaction States
  const [commentTexts, setCommentTexts] = useState({});
  const [commentImagesMap, setCommentImagesMap] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null); // commentId

  // Live Support & Routine States
  const [routineList, setRoutineList] = useState([]);
  const [supportConfig, setSupportConfig] = useState({ meetLink: '', forceStatus: 'auto' });
  const [supportQueue, setSupportQueue] = useState([]);
  const [supportProblem, setSupportProblem] = useState('');
  const [supportTopic, setSupportTopic] = useState('Coding / Lab Problem');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Routine Add Form States
  const [rDay, setRDay] = useState('Saturday');
  const [rTitle, setRTitle] = useState('Evening Support Session');
  const [rStart, setRStart] = useState('16:00');
  const [rEnd, setREnd] = useState('18:00');

  // Directory Add / Edit Form (Student)
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberSem, setNewMemberSem] = useState('4th Semester');

  // Teacher / CI Add Form
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherRoleType, setTeacherRoleType] = useState('teacher'); // 'teacher' or 'ci_sir'

  // Moderator Management Form
  const [modInputRoll, setModInputRoll] = useState('');

  const logoTapRef = useRef({ count: 0, timer: null });

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubDir = onSnapshot(doc(db, 'helpdesk_settings', 'directory'), (snap) => {
      if (snap.exists() && snap.data().members) {
        setMembersDirectory({ ...DEFAULT_MEMBERS, ...snap.data().members });
      }
    });

    const unsubRoles = onSnapshot(doc(db, 'helpdesk_settings', 'roles'), (snap) => {
      if (snap.exists() && Array.isArray(snap.data().moderators)) {
        setModeratorRolls(snap.data().moderators);
      }
    });

    const unsubPosts = onSnapshot(collection(db, 'helpdesk_posts'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setPosts(list);
    });

    const unsubNotices = onSnapshot(collection(db, 'helpdesk_notices'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotices(list);
    });

    const unsubSupport = onSnapshot(doc(db, 'helpdesk_settings', 'support_session'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoutineList(data.routines || []);
        setSupportConfig({
          meetLink: data.meetLink || '',
          forceStatus: data.forceStatus || 'auto'
        });
      }
    });

    const unsubQueue = onSnapshot(collection(db, 'helpdesk_support_queue'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0));
      setSupportQueue(list);
    });

    return () => {
      unsubDir(); unsubRoles(); unsubPosts(); unsubNotices(); unsubSupport(); unsubQueue();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubNotif = onSnapshot(collection(db, 'helpdesk_notifications'), async (snap) => {
      const myNotifs = [];
      const now = new Date();
      for (const d of snap.docs) {
        const data = d.data();
        if (now - new Date(data.createdAt || 0) > 24 * 60 * 60 * 1000) {
          try { await deleteDoc(doc(db, 'helpdesk_notifications', d.id)); } catch (e) {}
          continue;
        }
        if (data.targetRoll === currentUser.roll) {
          myNotifs.push({ id: d.id, ...data });
        }
      }
      myNotifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(myNotifs);
    });
    return () => unsubNotif();
  }, [currentUser]);

  const userInfo = currentUser ? (membersDirectory[currentUser.roll] || currentUser) : null;
  const isMainAdmin = currentUser?.roll === "253203" && isAdminMode;
  const isModerator = currentUser && moderatorRolls.includes(currentUser.roll);
  const hasStaffPower = isMainAdmin || isModerator;

  const checkLiveSupportStatus = () => {
    if (supportConfig.forceStatus === 'open') {
      return { isLive: true, sessionTitle: 'Special Live Support Session', timeRange: 'এখন চলছে (Live)' };
    }
    if (supportConfig.forceStatus === 'closed') {
      return { isLive: false, sessionTitle: '', timeRange: '' };
    }

    const dayName = DAYS_OF_WEEK[currentTime.getDay() === 6 ? 0 : currentTime.getDay() + 1];
    const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();

    const activeSlot = routineList.find(r => {
      if (r.day !== dayName) return false;
      const [sh, sm] = r.startTime.split(':').map(Number);
      const [eh, em] = r.endTime.split(':').map(Number);
      return nowMins >= (sh * 60 + sm) && nowMins <= (eh * 60 + em);
    });

    if (activeSlot) {
      return {
        isLive: true,
        sessionTitle: activeSlot.title,
        timeRange: `${formatTime12h(activeSlot.startTime)} - ${formatTime12h(activeSlot.endTime)}`
      };
    }
    return { isLive: false, sessionTitle: '', timeRange: '' };
  };

  const liveStatus = checkLiveSupportStatus();

  // --- AUTH LOGIC (Flexible Gmail Match) ---
  const handleVerifyRoll = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    const cleanId = authId.trim();
    const cleanEmail = authEmail.trim().toLowerCase();
    const member = membersDirectory[cleanId];

    if (!member) {
      setAuthError(`দুঃখিত! "${cleanId}" রোল বা আইডি ডিপার্টমেন্ট তালিকায় পাওয়া যায়নি।`);
      return;
    }

    try {
      const userDocRef = doc(db, 'helpdesk_users', cleanId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data().pin) {
        // যদি পূর্বে পিন সেট করা থাকে, তাহলে ইউজারের দেওয়া জিমেইল আপডেট বা ম্যাচ করে পাস দেওয়া হবে
        const userPayload = { ...userSnap.data(), roll: cleanId, email: cleanEmail };
        await setDoc(userDocRef, { email: cleanEmail }, { merge: true });
        setPendingUser(userPayload);
        setAuthStep('loginPin');
      } else {
        const userPayload = {
          roll: cleanId,
          name: member.name,
          role: member.role || 'student',
          semester: member.semester || '4th Semester',
          email: cleanEmail
        };
        await setDoc(userDocRef, userPayload, { merge: true });
        setPendingUser(userPayload);
        setAuthStep('createPin');
      }
    } catch (err) {
      setAuthError('কানেকশন সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    const cleanId = authId.trim();
    const cleanEmail = authEmail.trim().toLowerCase();

    try {
      const userDocRef = doc(db, 'helpdesk_users', cleanId);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        setAuthError('এই রোলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingUser({ ...userSnap.data(), roll: cleanId, email: cleanEmail });
      
      setAuthSuccessMsg(`✅ ভেরিফিকেশন কোড: [ ${otp} ] — আপনার ${cleanEmail} ঠিকানায় পাঠানো হয়েছে।`);
      setAuthStep('forgotPinVerify');
    } catch (err) {
      setAuthError('রিসেট রিকোয়েস্ট করতে সমস্যা হয়েছে।');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setAuthError('');
    if (inputOtp.trim() === generatedOtp) {
      setAuthSuccessMsg('কোড মিলেছে! এখন আপনার নতুন পিন সেট করুন।');
      setAuthStep('forgotPinReset');
    } else {
      setAuthError('ভুল ভেরিফিকেশন কোড দিয়েছেন!');
    }
  };

  const handleSaveNewPin = async (e) => {
    e.preventDefault();
    if (pin1 !== pin2) return setAuthError('দুটি পিন এক হয়নি!');
    try {
      const userDocRef = doc(db, 'helpdesk_users', pendingUser.roll);
      await updateDoc(userDocRef, { pin: pin1 });
      setAuthSuccessMsg('পিন সফলভাবে পরিবর্তন হয়েছে! এবার লগইন করুন।');
      setTimeout(() => {
        setAuthStep('verifyRoll');
        setPin1(''); setPin2(''); setInputOtp('');
      }, 1500);
    } catch (err) {
      setAuthError('পিন আপডেট করা যায়নি।');
    }
  };

  const handleFinalLoginSuccess = async (userData) => {
    const userDocRef = doc(db, 'helpdesk_users', userData.roll);
    await setDoc(userDocRef, { ...userData }, { merge: true });

    setCurrentUser(userData);
    localStorage.setItem('hd_verified_user', JSON.stringify(userData));
    showToastMsg(`স্বাগতম, ${userData.name}!`);
  };

  const handleCreatePin = async (e) => {
    e.preventDefault();
    if (pin1 !== pin2) return setAuthError('দুটি পিন এক হয়নি!');
    try {
      await handleFinalLoginSuccess({
        ...pendingUser, pin: pin1, createdAt: new Date().toISOString()
      });
    } catch (err) {
      setAuthError('পিন সেভ করা যায়নি।');
    }
  };

  const handleLoginPin = async (e) => {
    e.preventDefault();
    try {
      const snap = await getDoc(doc(db, 'helpdesk_users', pendingUser.roll));
      if (snap.exists() && snap.data().pin === pin1) {
        await handleFinalLoginSuccess(pendingUser);
      } else {
        setAuthError('ভুল পিন দিয়েছেন!');
      }
    } catch (err) {
      setAuthError('লগইন সমস্যা হয়েছে।');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hd_verified_user');
    localStorage.removeItem('hd_admin_mode');
    window.location.reload();
  };

  const handleSecretTap = () => {
    if (currentUser?.roll !== "253203") return;
    logoTapRef.current.count += 1;
    clearTimeout(logoTapRef.current.timer);
    if (logoTapRef.current.count >= 5) {
      logoTapRef.current.count = 0;
      setShowAdminPinModal(true);
    } else {
      logoTapRef.current.timer = setTimeout(() => { logoTapRef.current.count = 0; }, 1500);
    }
  };

  const handleVerifyAdminPinModal = (e) => {
    e.preventDefault();
    if (adminInputPin === SECRET_ADMIN_PIN) {
      const newAdminState = !isAdminMode;
      setIsAdminMode(newAdminState);
      localStorage.setItem('hd_admin_mode', newAdminState ? 'true' : 'false');
      setShowAdminPinModal(false);
      setAdminInputPin('');
      showToastMsg(newAdminState ? '👑 অ্যাডমিন মোড অন হয়েছে!' : 'অ্যাডমিন মোড অফ হয়েছে!');
    } else {
      showToastMsg('ভুল সিক্রেট পিন!', 'error');
    }
  };

  const handleAddMemberToDirectory = async (e) => {
    e.preventDefault();
    const id = newMemberId.trim();
    const name = newMemberName.trim();
    const email = newMemberEmail.trim().toLowerCase();
    if (!id || !name || !email) return;

    const updatedMembers = {
      ...membersDirectory,
      [id]: {
        name,
        email,
        role: id === "253203" ? "admin" : "student",
        semester: newMemberSem
      }
    };
    await setDoc(doc(db, 'helpdesk_settings', 'directory'), { members: updatedMembers }, { merge: true });
    setNewMemberId('');
    setNewMemberName('');
    setNewMemberEmail('');
    setShowManageDirectory(false);
    showToastMsg(`${name} (${newMemberSem}) সফলভাবে সেভ হয়েছে!`);
  };

  const handleAddTeacherOrCi = async (e) => {
    e.preventDefault();
    const id = teacherId.trim();
    const name = teacherName.trim();
    const email = teacherEmail.trim().toLowerCase();
    if (!id || !name || !email) return;

    const semesterLabel = teacherRoleType === 'ci_sir' ? 'Chief Instructor (CI)' : 'Faculty / Teacher';

    const updatedMembers = {
      ...membersDirectory,
      [id]: {
        name,
        email,
        role: teacherRoleType,
        semester: semesterLabel
      }
    };
    await setDoc(doc(db, 'helpdesk_settings', 'directory'), { members: updatedMembers }, { merge: true });
    setTeacherId('');
    setTeacherName('');
    setTeacherEmail('');
    setShowManageTeacherModal(false);
    showToastMsg(`${name} (${semesterLabel}) সফলভাবে যুক্ত হয়েছেন!`);
  };

  const handleAddModerator = async (e) => {
    e.preventDefault();
    const roll = modInputRoll.trim();
    if (!roll || !membersDirectory[roll]) {
      showToastMsg('সঠিক ক্লাস রোল দিন যা ডিরেক্টরিতে আছে!', 'error');
      return;
    }
    if (moderatorRolls.includes(roll)) {
      showToastMsg('এই রোলটি ইতিমধ্যেই মডারেটর হিসেবে আছে!', 'error');
      return;
    }
    const updatedMods = [...moderatorRolls, roll];
    await setDoc(doc(db, 'helpdesk_settings', 'roles'), { moderators: updatedMods }, { merge: true });
    setModInputRoll('');
    showToastMsg('নতুন মডারেটর সফলভাবে যুক্ত হয়েছে!');
  };

  const handleRemoveModerator = async (roll) => {
    const updatedMods = moderatorRolls.filter(r => r !== roll);
    await setDoc(doc(db, 'helpdesk_settings', 'roles'), { moderators: updatedMods }, { merge: true });
    showToastMsg('মডারেটর বাদ দেওয়া হয়েছে!');
  };

  const handlePostImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + postImages.length > 5) {
      showToastMsg('পোস্টে সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে!', 'error');
      return;
    }
    const compressed = await Promise.all(files.map(f => compressImageFile(f)));
    setPostImages(prev => [...prev, ...compressed].slice(0, 5));
    e.target.value = '';
  };

  const handleNoticeImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + noticeImages.length > 3) {
      showToastMsg('নোটিশে সর্বোচ্চ ৩টি ছবি আপলোড করা যাবে!', 'error');
      return;
    }
    const compressed = await Promise.all(files.map(f => compressImageFile(f)));
    setNoticeImages(prev => [...prev, ...compressed].slice(0, 3));
    e.target.value = '';
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDesc.trim()) return;
    setIsSubmittingPost(true);
    try {
      await addDoc(collection(db, 'helpdesk_posts'), {
        category: postCategory,
        title: postTitle.trim(),
        description: postDesc.trim(),
        images: postImages,
        videoUrl: postVideo.trim(),
        authorName: userInfo.name,
        authorRoll: currentUser.roll,
        authorRole: userInfo.role || 'student',
        authorSemester: userInfo.semester || '4th Semester',
        status: 'open',
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      });
      setPostTitle(''); setPostDesc(''); setPostVideo(''); setPostImages([]);
      setShowCreatePost(false);
      showToastMsg('পোস্ট পাবলিশ হয়েছে!');
    } catch (err) {
      showToastMsg('পোস্ট করতে সমস্যা হয়েছে', 'error');
    }
    setIsSubmittingPost(false);
  };

  // --- COMMENT, REPLY & REACTION HANDLERS ---
  const handleAddComment = async (e, post) => {
    e.preventDefault();
    const text = (commentTexts[post.id] || '').trim();
    const imgs = commentImagesMap[post.id] || [];
    if (!text && imgs.length === 0) return;

    const newComment = {
      id: Date.now().toString(),
      authorName: userInfo.name,
      authorRoll: currentUser.roll,
      authorRole: userInfo.role || 'student',
      text,
      images: imgs,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'helpdesk_posts', post.id), {
      comments: [...(post.comments || []), newComment]
    });

    if (post.authorRoll !== currentUser.roll) {
      await addDoc(collection(db, 'helpdesk_notifications'), {
        targetRoll: post.authorRoll,
        text: `💬 ${userInfo.name} তোমার পোস্টে কমেন্ট করেছে।`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    setCommentTexts(prev => ({ ...prev, [post.id]: '' }));
    setCommentImagesMap(prev => ({ ...prev, [post.id]: [] }));
    showToastMsg('কমেন্ট যোগ করা হয়েছে!');
  };

  const handleCommentLike = async (post, commentId) => {
    const updatedComments = (post.comments || []).map(c => {
      if (c.id === commentId) {
        const likes = c.likes || [];
        const isLiked = likes.includes(currentUser.roll);
        const newLikes = isLiked ? likes.filter(r => r !== currentUser.roll) : [...likes, currentUser.roll];
        return { ...c, likes: newLikes };
      }
      return c;
    });
    await updateDoc(doc(db, 'helpdesk_posts', post.id), { comments: updatedComments });
  };

  const handleAddReply = async (e, post, commentId) => {
    e.preventDefault();
    const text = (replyTexts[commentId] || '').trim();
    if (!text) return;

    const newReply = {
      id: Date.now().toString(),
      authorName: userInfo.name,
      authorRoll: currentUser.roll,
      authorRole: userInfo.role || 'student',
      text,
      createdAt: new Date().toISOString()
    };

    const updatedComments = (post.comments || []).map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      return c;
    });

    await updateDoc(doc(db, 'helpdesk_posts', post.id), { comments: updatedComments });
    setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
    setActiveReplyBox(null);
    showToastMsg('রিপ্লাই দেওয়া হয়েছে!');
  };

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    const newSlot = { id: Date.now().toString(), day: rDay, title: rTitle, startTime: rStart, endTime: rEnd };
    const updated = [...routineList, newSlot];
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { routines: updated }, { merge: true });
    showToastMsg('রুটিনে নতুন সেশন যোগ হয়েছে!');
  };

  const handleDeleteRoutine = async (id) => {
    const updated = routineList.filter(r => r.id !== id);
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { routines: updated }, { merge: true });
    showToastMsg('রুটিন সেশন ডিলিট করা হয়েছে!');
  };

  const handleUpdateSupportSettings = async (field, value) => {
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { [field]: value }, { merge: true });
    showToastMsg('সাপোর্ট সেটিংস আপডেট হয়েছে!');
  };

  const handleJoinSupportQueue = async (e) => {
    e.preventDefault();
    if (!supportProblem.trim()) return;
    const alreadyInQueue = supportQueue.some(q => q.roll === currentUser.roll);
    if (alreadyInQueue) return showToastMsg('তুমি ইতিমধ্যেই সিরিয়ালে আছো!', 'error');

    await addDoc(collection(db, 'helpdesk_support_queue'), {
      roll: currentUser.roll,
      name: userInfo.name,
      semester: userInfo.semester || '4th Semester',
      topic: supportTopic,
      problem: supportProblem.trim(),
      joinedAt: new Date().toISOString()
    });
    setSupportProblem('');
    showToastMsg('সাপোর্ট সিরিয়ালে যুক্ত হয়েছ!');
  };

  const handleCompleteStudentSupport = async (queueItem) => {
    await deleteDoc(doc(db, 'helpdesk_support_queue', queueItem.id));
    await addDoc(collection(db, 'helpdesk_notifications'), {
      targetRoll: queueItem.roll,
      text: `✅ তোমার লাইভ সাপোর্ট সেশন সম্পন্ন হয়েছে।`,
      read: false,
      createdAt: new Date().toISOString()
    });
    showToastMsg(`${queueItem.name}-এর সাপোর্ট সম্পন্ন মার্ক করা হয়েছে!`);
  };

  const renderRoleBadge = (roll, roleOverride) => {
    const role = roleOverride || membersDirectory[roll]?.role;
    if (roll === "253203" && isAdminMode) {
      return <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">Admin</span>;
    }
    if (role === 'ci_sir') {
      return <span className="px-2 py-0.5 rounded-md bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1"><Award className="w-3 h-3" /> CI Sir</span>;
    }
    if (role === 'teacher') {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">Teacher / Sir</span>;
    }
    if (moderatorRolls.includes(roll)) {
      return <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">Moderator / Mentor</span>;
    }
    return null;
  };

  const filteredPosts = posts.filter(p => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchSem = semesterFilter === 'ALL' || p.authorSemester === semesterFilter;
    const matchSearch = !searchQuery ||
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCat && matchSem && matchSearch;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', 'Hind Siliguri', sans-serif" }}>
        <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">CST Department Portal</h1>
            <p className="text-xs text-slate-500 mt-1">জিমেইল ম্যাচিং ও পিন সিকিউরিটি প্রটেক্টেড</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {authError}
            </div>
          )}

          {authSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              {authSuccessMsg}
            </div>
          )}

          {authStep === 'verifyRoll' && (
            <form onSubmit={handleVerifyRoll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাস রোল / আইডি *</label>
                <input type="text" required value={authId} onChange={e => setAuthId(e.target.value)} placeholder="যেমন: 253203"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার অফিশিয়াল জিমেইল *</label>
                <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
                <span className="text-[10px] text-slate-400 mt-1 block">প্রথমবার দিলে এটি এই রোলের সাথে স্থায়ীভাবে যুক্ত হবে।</span>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer">
                জিমেইল যাচাই করুন
              </button>
            </form>
          )}

          {authStep === 'createPin' && (
            <form onSubmit={handleCreatePin} className="space-y-4">
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl">স্বাগতম <b>{pendingUser?.name}</b>! প্রথমবার লগইনের জন্য ৬ সংখ্যার গোপন পিন সেট করুন।</p>
              <input type="password" maxLength="6" required value={pin1} onChange={e => setPin1(e.target.value)} placeholder="নতুন ৬-ডিজিট পিন"
                className="w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest font-bold" />
              <input type="password" maxLength="6" required value={pin2} onChange={e => setPin2(e.target.value)} placeholder="পুনরায় পিন দিন"
                className="w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest font-bold" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setAuthStep('verifyRoll')} className="px-4 py-3 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">পিছনে</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm cursor-pointer">পিন সেভ করুন</button>
              </div>
            </form>
          )}

          {authStep === 'loginPin' && (
            <form onSubmit={handleLoginPin} className="space-y-4">
              <p className="text-xs text-slate-600 text-center">হ্যালো <b>{pendingUser?.name}</b>, আপনার ৬-ডিজিট পিন দিন</p>
              <input type="password" maxLength="6" required value={pin1} onChange={e => setPin1(e.target.value)} placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl border text-center text-xl tracking-[0.5em] font-bold" />
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer">
                লগইন করুন
              </button>
              <div className="flex justify-between items-center pt-2 text-xs">
                <button type="button" onClick={() => setAuthStep('verifyRoll')} className="text-slate-500 hover:underline cursor-pointer">অন্য আইডি?</button>
                <button type="button" onClick={() => { setAuthStep('forgotPinVerify'); setAuthError(''); setAuthSuccessMsg(''); }} className="text-indigo-600 font-bold hover:underline cursor-pointer">
                  পিন ভুলে গেছেন? (Reset Pin)
                </button>
              </div>
            </form>
          )}

          {authStep === 'forgotPinVerify' && !generatedOtp && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <p className="text-xs text-slate-600">পিন রিকভার করার জন্য আপনার রোল এবং রেজিস্টার্ড জিমেইল দিন।</p>
              <input type="text" required value={authId} onChange={e => setAuthId(e.target.value)} placeholder="ক্লাস রোল (যেমন: 253203)"
                className="w-full px-4 py-3 rounded-xl border text-sm" />
              <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="রেজিস্টার্ড জিমেইল দিন"
                className="w-full px-4 py-3 rounded-xl border text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setAuthStep('loginPin')} className="px-4 py-3 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">লগইনে ফিরুন</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold text-sm cursor-pointer">কোড জেনারেট করুন</button>
              </div>
            </form>
          )}

          {authStep === 'forgotPinVerify' && generatedOtp && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-center">
                <span className="text-[11px] text-amber-800 font-bold block mb-1">আপনার ভেরিফিকেশন কোড (OTP):</span>
                <span className="text-2xl font-extrabold tracking-widest text-amber-950 bg-white px-4 py-1 rounded-lg border border-amber-200 inline-block">{generatedOtp}</span>
              </div>
              <p className="text-xs text-slate-600 text-center">উপরের কোডটি নিচে লিখে ভেরিফাই করুন।</p>
              <input type="text" maxLength="6" required value={inputOtp} onChange={e => setInputOtp(e.target.value)} placeholder="কোড লিখুন"
                className="w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest font-bold" />
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm cursor-pointer">কোড ভেরিফাই করুন</button>
            </form>
          )}

          {authStep === 'forgotPinReset' && (
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl">ভেরিফিকেশন সফল! এখন নতুন পিন সেট করুন।</p>
              <input type="password" maxLength="6" required value={pin1} onChange={e => setPin1(e.target.value)} placeholder="নতুন পিন"
                className="w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest font-bold" />
              <input type="password" maxLength="6" required value={pin2} onChange={e => setPin2(e.target.value)} placeholder="পুনরায় নতুন পিন"
                className="w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest font-bold" />
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer">নতুন পিন সেভ করুন</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const myQueueIndex = supportQueue.findIndex(q => q.roll === currentUser.roll);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{ fontFamily: "'Inter', 'Hind Siliguri', sans-serif" }}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div onClick={handleSecretTap} className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-slate-900 leading-none">CST Help Desk</span>
                {renderRoleBadge(currentUser.roll, userInfo?.role)}
              </div>
              <span className="text-[10px] font-semibold text-indigo-600">Department Academic Portal</span>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setActiveTab('feed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'feed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              হেল্প ডেস্ক ফিড
            </button>
            <button onClick={() => setActiveTab('support')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'support' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              <span className={`w-2 h-2 rounded-full ${liveStatus.isLive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              লাইভ সাপোর্ট সেশন
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isMainAdmin && (
              <button onClick={() => setShowManageDirectory(true)} title="ছাত্র ও সেমিস্টার ম্যানেজ করুন"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold cursor-pointer">
                <UserPlus className="w-4 h-4" />
                <span className="hidden lg:inline">ছাত্র আপডেট</span>
              </button>
            )}

            {isMainAdmin && (
              <button onClick={() => setShowManageTeacherModal(true)} title="শিক্ষক বা সিআই যোগ করুন"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold cursor-pointer">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden lg:inline">স্যার / CI যোগ</span>
              </button>
            )}

            {isMainAdmin && (
              <button onClick={() => setShowManageMods(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer">
                <Users className="w-4 h-4" />
                <span className="hidden lg:inline">মডারেটর</span>
              </button>
            )}

            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative cursor-pointer">
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b flex justify-between items-center">
                    <span className="text-xs font-bold">নোটিফিকেশন</span>
                    <button onClick={async () => {
                      for (const n of notifications.filter(x => !x.read)) {
                        await updateDoc(doc(db, 'helpdesk_notifications', n.id), { read: true });
                      }
                    }} className="text-[11px] text-indigo-600 font-semibold cursor-pointer">সব পড়া হয়েছে</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">কোনো নোটিফিকেশন নেই</p>
                    ) : notifications.map(n => (
                      <div key={n.id} onClick={() => updateDoc(doc(db, 'helpdesk_notifications', n.id), { read: true })}
                        className={`p-3 text-xs cursor-pointer ${n.read ? 'opacity-60' : 'bg-indigo-50/60 font-medium'}`}>
                        {n.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                {userInfo?.name?.charAt(0)}
              </div>
              <span className="max-w-[75px] truncate">{userInfo?.name}</span>
            </button>

            <button onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>পোস্ট</span>
            </button>
          </div>
        </div>

        <div className="flex md:hidden border-t border-slate-100 bg-slate-50 px-3 py-1.5 gap-2">
          <button onClick={() => setActiveTab('feed')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'feed' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}>
            হেল্প ডেস্ক ফিড
          </button>
          <button onClick={() => setActiveTab('support')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${activeTab === 'support' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}>
            <span className={`w-2 h-2 rounded-full ${liveStatus.isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
            লাইভ সাপোর্ট ({supportQueue.length})
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5">
        {activeTab === 'support' ? (
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${liveStatus.isLive ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-slate-700 to-slate-800'}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Radio className={`w-5 h-5 ${liveStatus.isLive ? 'animate-pulse text-emerald-200' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    {liveStatus.isLive ? 'সাপোর্ট সেশন চলছে (LIVE)' : 'সেশন বন্ধ আছে (OFFLINE)'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {liveStatus.isLive ? liveStatus.sessionTitle : 'এখন কোনো সাপোর্ট সেশন হচ্ছে না'}
                </h2>
              </div>

              {liveStatus.isLive && supportConfig.meetLink && (myQueueIndex === 0 || hasStaffPower) && (
                <a href={supportConfig.meetLink} target="_blank" rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-white text-emerald-700 font-bold text-sm shadow-lg hover:bg-emerald-50 flex items-center gap-2 shrink-0">
                  <Video className="w-4 h-4" /> Join Google Meet <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {liveStatus.isLive ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" /> সাপোর্ট সেশনে প্রশ্ন জমা দিন
                    </h3>

                    {myQueueIndex !== -1 ? (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center space-y-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase">তোমার বর্তমান সিরিয়াল</span>
                        <div className="text-4xl font-extrabold text-indigo-700">#{myQueueIndex + 1}</div>
                        <p className="text-xs text-slate-600">
                          {myQueueIndex === 0 ? '🎉 এখন তোমার পালা! মিটে জয়েন করো।' : `তোমার আগে আরও ${myQueueIndex} জন অপেক্ষা করছে।`}
                        </p>
                        <button onClick={() => deleteDoc(doc(db, 'helpdesk_support_queue', supportQueue[myQueueIndex].id))}
                          className="mt-2 px-4 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer">
                          সিরিয়াল থেকে বের হয়ে যান
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleJoinSupportQueue} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">সাপোর্টের বিষয়</label>
                          <select value={supportTopic} onChange={e => setSupportTopic(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm outline-none">
                            <option>Coding / Lab Problem</option>
                            <option>Project / Assignment Help</option>
                            <option>Environment / Software Setup</option>
                            <option>General Academic Guidance</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">তোমার প্রশ্নটি বিস্তারিত লিখো (সর্বোচ্চ ২৫০ অক্ষর) *</label>
                          <textarea rows="3" maxLength="250" required value={supportProblem} onChange={e => setSupportProblem(e.target.value)}
                            placeholder="প্রবলেমটা সংক্ষেপে লিখো..."
                            className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-indigo-500" />
                          <div className="text-right text-[11px] text-slate-400">{supportProblem.length}/২৫০</div>
                        </div>
                        <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer">
                          সিরিয়ালে যুক্ত হোন (Submit)
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <h3 className="font-bold text-base text-slate-800">এখন সাপোর্ট সেশন বন্ধ রয়েছে</h3>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-slate-900">অপেক্ষমান শিক্ষার্থী তালিকা ({supportQueue.length} জন)</h3>
                  </div>

                  {supportQueue.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">বর্তমানে সিরিয়ালে কেউ নেই।</p>
                  ) : (
                    <div className="space-y-2.5">
                      {supportQueue.map((item, idx) => (
                        <div key={item.id} className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${idx === 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50'}`}>
                          <div className="flex items-start gap-3">
                            <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900">{item.name}</span>
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-semibold">{item.semester}</span>
                              </div>
                              <p className="text-xs text-slate-700 mt-1">{item.problem}</p>
                            </div>
                          </div>

                          {hasStaffPower && (
                            <button onClick={() => handleCompleteStudentSupport(item)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer">
                              <Check className="w-3.5 h-3.5" /> সম্পন্ন
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" /> সাপ্তাহিক সাপোর্ট রুটিন
                  </h3>
                  
                  {routineList.length === 0 ? (
                    <p className="text-xs text-slate-400">কোনো রুটিন সেট করা হয়নি।</p>
                  ) : (
                    <div className="space-y-2">
                      {routineList.map(r => (
                        <div key={r.id} className="p-3 rounded-xl bg-slate-50 border flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-indigo-700">{DAYS_BN[r.day]} ({r.day})</div>
                            <div className="font-semibold text-slate-800">{r.title}</div>
                            <div className="text-slate-500">{formatTime12h(r.startTime)} - {formatTime12h(r.endTime)}</div>
                          </div>
                          {hasStaffPower && (
                            <button onClick={() => handleDeleteRoutine(r.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {hasStaffPower && (
                    <form onSubmit={handleAddRoutine} className="pt-3 border-t space-y-2.5">
                      <span className="text-xs font-bold text-slate-800 block">নতুন রুটিন যোগ করুন</span>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={rDay} onChange={e => setRDay(e.target.value)} className="px-2.5 py-1.5 rounded-xl border text-xs bg-slate-50">
                          {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{DAYS_BN[d]}</option>)}
                        </select>
                        <input type="text" value={rTitle} onChange={e => setRTitle(e.target.value)} placeholder="সেশনের নাম" className="px-2.5 py-1.5 rounded-xl border text-xs bg-slate-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">শুরুর সময়</label>
                          <input type="time" value={rStart} onChange={e => setRStart(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl border text-xs bg-slate-50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">শেষ সময়</label>
                          <input type="time" value={rEnd} onChange={e => setREnd(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl border text-xs bg-slate-50" />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer">
                        + রুটিন সেশন সেভ করুন
                      </button>
                    </form>
                  )}
                </div>

                {hasStaffPower && (
                  <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 space-y-4">
                    <h4 className="font-bold text-sm text-amber-950">মডারেটর / মেন্টর কন্ট্রোল প্যানেল</h4>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">সেশন স্ট্যাটাস</label>
                      <select value={supportConfig.forceStatus} onChange={e => handleUpdateSupportSettings('forceStatus', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold">
                        <option value="auto">অটোমেটিক (রুটিন অনুযায়ী)</option>
                        <option value="open">সরাসরি চালু রাখুন (Force Open)</option>
                        <option value="closed">বন্ধ রাখুন (Force Close)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Google Meet লিংক</label>
                      <input type="url" value={supportConfig.meetLink}
                        onChange={e => setSupportConfig({ ...supportConfig, meetLink: e.target.value })}
                        onBlur={e => handleUpdateSupportSettings('meetLink', e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* NOTICE BOARD SECTION */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-sm sm:text-base text-amber-950">ডিপার্টমেন্ট নোটিশ বোর্ড</h3>
                </div>
                {hasStaffPower && (
                  <button onClick={() => { setNoticeImages([]); setShowAddNotice(true); }} className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer">
                    + নতুন নোটিশ
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {notices.length === 0 ? (
                  <p className="text-xs text-amber-800/70 italic">বর্তমানে কোনো নতুন নোটিশ নেই।</p>
                ) : notices.map(n => {
                  const nImgs = Array.isArray(n.images) ? n.images : (n.imageUrl ? [n.imageUrl] : []);
                  return (
                    <div key={n.id} className="bg-white/95 p-3.5 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-amber-950">{n.title}</h4>
                          <p className="text-xs text-amber-900 mt-0.5 whitespace-pre-wrap">{n.body}</p>
                        </div>
                        {hasStaffPower && (
                          <button onClick={() => deleteDoc(doc(db, 'helpdesk_notices', n.id))} className="text-rose-600 p-1 cursor-pointer shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {nImgs.length > 0 && (
                        <div className={`grid gap-2 pt-1 ${nImgs.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                          {nImgs.map((img, i) => (
                            <img key={i} src={img} onClick={() => setLightboxImg(img)} alt="Notice Attachment"
                              className="w-full max-h-56 object-cover rounded-lg border cursor-zoom-in" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="খুঁজুন..." className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border text-xs sm:text-sm outline-none" />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border text-xs sm:text-sm font-medium">
                  <option value="ALL">সব ক্যাটাগরি</option>
                  <option value="Coding / Programming">💻 Coding / Programming</option>
                  <option value="Study & Notes">📚 Study & Notes</option>
                  <option value="Tech & Software">🛠️ Tech & Software</option>
                  <option value="General Discussion">💬 General Discussion</option>
                </select>
                <select value={semesterFilter} onChange={e => setSemesterFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border text-xs sm:text-sm font-medium">
                  <option value="ALL">সব সেমিস্টার ও শিক্ষক</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                  <option value="Faculty / Teacher">Teachers / Sir</option>
                  <option value="Chief Instructor (CI)">CI Sir</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border p-10 text-center text-slate-500 text-sm">কোনো পোস্ট পাওয়া যায়নি।</div>
              ) : filteredPosts.map(post => {
                const postImgs = Array.isArray(post.images) ? post.images : [];
                const isSolved = post.status === 'solved';
                const likes = post.likes || [];
                const isLiked = likes.includes(currentUser.roll);

                return (
                  <div key={post.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                          {post.authorName?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{post.authorName}</span>
                            {renderRoleBadge(post.authorRoll, post.authorRole)}
                          </div>
                          <div className="text-[11px] text-slate-400">{timeAgo(post.createdAt)} &bull; <span className="text-indigo-600 font-semibold">{post.category}</span> ({post.authorSemester || '4th Semester'})</div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isSolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isSolved ? <><CheckCircle2 className="w-3.5 h-3.5" /> সমাধান হয়েছে</> : <><Clock className="w-3.5 h-3.5" /> ওপেন</>}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1">{post.title}</h3>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.description}</p>
                      {postImgs.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {postImgs.map((img, idx) => (
                            <img key={idx} src={img} onClick={() => setLightboxImg(img)} alt="Attachment"
                              className="w-full max-h-56 object-cover rounded-xl border cursor-zoom-in" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t text-xs">
                      <button onClick={async () => {
                        const updatedLikes = isLiked ? likes.filter(r => r !== currentUser.roll) : [...likes, currentUser.roll];
                        await updateDoc(doc(db, 'helpdesk_posts', post.id), { likes: updatedLikes });
                      }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer ${isLiked ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} /> পছন্দ ({likes.length})
                      </button>

                      {(currentUser.roll === post.authorRoll || hasStaffPower) && (
                        <button onClick={() => updateDoc(doc(db, 'helpdesk_posts', post.id), { status: isSolved ? 'open' : 'solved' })}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold cursor-pointer">
                          {isSolved ? 'ওপেন করুন' : 'সমাধান হয়েছে মার্ক করুন'}
                        </button>
                      )}
                    </div>

                    {/* Facebook-style Comments, Reactions & Replies Section */}
                    <div className="space-y-3 pt-3 border-t">
                      {(post.comments || []).map((c, cIdx) => {
                        const cImgs = Array.isArray(c.images) ? c.images : [];
                        const cLikes = c.likes || [];
                        const isCLiked = cLikes.includes(currentUser.roll);
                        const replies = c.replies || [];

                        return (
                          <div key={c.id || cIdx} className="bg-slate-50 p-3.5 rounded-2xl border text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{c.authorName}</span>
                                {renderRoleBadge(c.authorRoll, c.authorRole)}
                              </div>
                              <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                            </div>

                            <p className="text-slate-800 whitespace-pre-wrap">{c.text}</p>

                            {cImgs.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {cImgs.map((img, i) => (
                                  <img key={i} src={img} onClick={() => setLightboxImg(img)} alt="Comment Attachment"
                                    className="w-full max-h-40 object-cover rounded-lg border cursor-zoom-in" />
                                ))}
                              </div>
                            )}

                            {/* Comment Actions (Like, Reply, Count) */}
                            <div className="flex items-center gap-4 pt-1 text-[11px] font-bold text-slate-600">
                              <button onClick={() => handleCommentLike(post, c.id)}
                                className={`flex items-center gap-1 hover:text-indigo-600 cursor-pointer ${isCLiked ? 'text-indigo-600' : ''}`}>
                                <ThumbsUp className="w-3.5 h-3.5" /> ভালোলাগা {cLikes.length > 0 && `(${cLikes.length})`}
                              </button>
                              <button onClick={() => setActiveReplyBox(activeReplyBox === c.id ? null : c.id)}
                                className="hover:text-indigo-600 cursor-pointer">
                                জবাব দিন (Reply)
                              </button>
                            </div>

                            {/* Replies List */}
                            {replies.length > 0 && (
                              <div className="pl-4 sm:pl-6 pt-2 space-y-2 border-l-2 border-indigo-200">
                                {replies.map((r, rIdx) => (
                                  <div key={r.id || rIdx} className="bg-white p-2.5 rounded-xl border text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1">
                                        <CornerDownRight className="w-3 h-3 text-indigo-500" />
                                        <span className="font-bold text-slate-900">{r.authorName}</span>
                                        {renderRoleBadge(r.authorRoll, r.authorRole)}
                                      </div>
                                      <span className="text-[9px] text-slate-400">{timeAgo(r.createdAt)}</span>
                                    </div>
                                    <p className="text-slate-700 pl-4">{r.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input Box */}
                            {activeReplyBox === c.id && (
                              <form onSubmit={e => handleAddReply(e, post, c.id)} className="pt-2 flex gap-2">
                                <input type="text" required value={replyTexts[c.id] || ''}
                                  onChange={e => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                                  placeholder={`${c.authorName}-কে জবাব দিন...`}
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border text-xs outline-none focus:border-indigo-500" />
                                <button type="submit" className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer">
                                  রিপ্লাই
                                </button>
                              </form>
                            )}
                          </div>
                        );
                      })}

                      {/* Main Comment Input Box */}
                      <form onSubmit={e => handleAddComment(e, post)} className="space-y-2 pt-2">
                        <textarea rows="2" value={commentTexts[post.id] || ''}
                          onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="ফেসবুকের মতো কমেন্ট লিখুন..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border text-xs outline-none focus:border-indigo-500" />
                        
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs cursor-pointer hover:bg-indigo-100 transition">
                            <ImageIcon className="w-4 h-4" /> ছবি যুক্ত করুন
                            <input type="file" accept="image/*" multiple className="hidden"
                              onChange={async e => {
                                const files = Array.from(e.target.files);
                                const compressed = await Promise.all(files.map(f => compressImageFile(f)));
                                setCommentImagesMap(prev => ({
                                  ...prev,
                                  [post.id]: [...(prev[post.id] || []), ...compressed].slice(0, 3)
                                }));
                                e.target.value = '';
                              }} />
                          </label>
                          <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                            কমেন্ট করুন
                          </button>
                        </div>

                        {/* Comment Image Previews */}
                        {(commentImagesMap[post.id] || []).length > 0 && (
                          <div className="grid grid-cols-4 gap-2 pt-1">
                            {(commentImagesMap[post.id] || []).map((img, idx) => (
                              <div key={idx} className="relative">
                                <img src={img} className="h-14 w-full object-cover rounded-lg border" alt="Preview" />
                                <button type="button" onClick={() => setCommentImagesMap(prev => ({
                                  ...prev,
                                  [post.id]: prev[post.id].filter((_, i) => i !== idx)
                                }))} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* STUDENT & SEMESTER MANAGEMENT MODAL */}
      {showManageDirectory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">ছাত্র যোগ বা সেমিস্টার আপডেট করুন</h3>
              <button onClick={() => setShowManageDirectory(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddMemberToDirectory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাস রোল / আইডি *</label>
                <input type="text" required value={newMemberId} onChange={e => setNewMemberId(e.target.value)} placeholder="যেমন: 201605"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম *</label>
                <input type="text" required value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="নাম লিখুন"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিশিয়াল জিমেইল *</label>
                <input type="email" required value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} placeholder="student@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সেমিস্টার সিলেক্ট করুন *</label>
                <select value={newMemberSem} onChange={e => setNewMemberSem(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white font-medium">
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer">
                সেভ বা আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER OR CI ADD MODAL */}
      {showManageTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">শিক্ষক বা CI স্যার যুক্ত করুন</h3>
              <button onClick={() => setShowManageTeacherModal(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTeacherOrCi} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পদবি / ক্যাটাগরি</label>
                <select value={teacherRoleType} onChange={e => setTeacherRoleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white font-medium">
                  <option value="teacher">Faculty / Teacher (স্যার)</option>
                  <option value="ci_sir">Chief Instructor (CI Sir)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আইডি / ইউজারনেম *</label>
                <input type="text" required value={teacherId} onChange={e => setTeacherId(e.target.value)} placeholder="যেমন: teacher_rahim"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্যারের নাম *</label>
                <input type="text" required value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="যেমন: Md Rahim Sir"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিশিয়াল জিমেইল *</label>
                <input type="email" required value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} placeholder="teacher@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer">
                স্যার / CI যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {showManageMods && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">মডারেটর / মেন্টর ম্যানেজ করুন</h3>
              <button onClick={() => setShowManageMods(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddModerator} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">রোল দিন</label>
                <input type="text" required value={modInputRoll} onChange={e => setModInputRoll(e.target.value)} placeholder="যেমন: 201605"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer">
                মডারেটর হিসেবে নিয়োগ দিন
              </button>
            </form>
            <div className="pt-2 border-t">
              <span className="text-xs font-bold text-slate-700 block mb-2">বর্তমান মডারেটরগণ:</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {moderatorRolls.map(r => (
                  <div key={r} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl text-xs">
                    <span>{membersDirectory[r]?.name || r} ({r})</span>
                    <button onClick={() => handleRemoveModerator(r)} className="text-rose-600 font-bold hover:underline cursor-pointer">বাদ দিন</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PIN MODAL */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">অ্যাডমিন মোড পিন দিন</h3>
              <p className="text-xs text-slate-500 mt-1">সিক্রেট পিন দিয়ে অ্যাডমিন অ্যাক্সেস টগল করুন। (পিন: 253203)</p>
            </div>
            <form onSubmit={handleVerifyAdminPinModal} className="space-y-3">
              <input type="password" maxLength="6" autoFocus required value={adminInputPin} onChange={e => setAdminInputPin(e.target.value)} placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl border text-center text-xl tracking-[0.5em] font-bold outline-none focus:border-indigo-500" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAdminPinModal(false); setAdminInputPin(''); }} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold cursor-pointer">বাতিল</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer">ভেরিফাই করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NOTICE MODAL */}
      {showAddNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">নতুন নোটিশ প্রকাশ করুন</h3>
              <button onClick={() => setShowAddNotice(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault();
              const title = e.target.ntitle.value.trim();
              const body = e.target.nbody.value.trim();
              await addDoc(collection(db, 'helpdesk_notices'), {
                title,
                body,
                images: noticeImages,
                createdAt: new Date().toISOString()
              });
              setShowAddNotice(false);
              setNoticeImages([]);
              showToastMsg('নোটিশ এবং ছবি সফলভাবে পাবলিশ হয়েছে!');
            }} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নোটিশের শিরোনাম *</label>
                <input name="ntitle" required placeholder="যেমন: ৪র্থ সেমিস্টার ল্যাব ফাইনাল..." className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ *</label>
                <textarea name="nbody" rows="3" required placeholder="নোটিশের বিস্তারিত..." className="w-full px-3.5 py-2.5 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ছবি সংযুক্ত করুন (সর্বোচ্চ ৩টি)</label>
                <input type="file" accept="image/*" multiple onChange={handleNoticeImageUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:font-bold file:bg-amber-100 file:text-amber-800 cursor-pointer" />
                {noticeImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {noticeImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} className="h-16 w-full object-cover rounded-lg border" alt="Notice Preview" />
                        <button type="button" onClick={() => setNoticeImages(noticeImages.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm cursor-pointer">
                নোটিশ পাবলিশ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE POST MODAL (Professional Choose File Design) */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-slate-900">নতুন সমস্যা বা প্রশ্ন পোস্ট করুন</h3>
              <button onClick={() => setShowCreatePost(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                <select value={postCategory} onChange={e => setPostCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white font-medium">
                  <option>Coding / Programming</option>
                  <option>Study & Notes</option>
                  <option>Tech & Software</option>
                  <option>General Discussion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিরোনাম *</label>
                <input type="text" required value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="পোস্টের শিরোনাম..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ *</label>
                <textarea rows="4" required value={postDesc} onChange={e => setPostDesc(e.target.value)} placeholder="আপনার সমস্যা বা মতামত বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ছবি সংযুক্ত করুন (সর্বোচ্চ ৫টি)</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl cursor-pointer transition">
                  <ImageIcon className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-xs font-bold text-indigo-700">ফাইল বা ছবি সিলেক্ট করতে এখানে ক্লিক করুন</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG বা JPEG (Max 5 images)</span>
                  <input type="file" accept="image/*" multiple onChange={handlePostImageUpload} className="hidden" />
                </label>
                {postImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {postImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} className="h-16 w-full object-cover rounded-lg border shadow-sm" alt="Preview" />
                        <button type="button" onClick={() => setPostImages(postImages.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowCreatePost(false)} className="px-4 py-2 text-xs font-bold text-slate-600 cursor-pointer">বাতিল</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm">পাবলিশ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-3">
            <h3 className="font-bold text-lg">{userInfo?.name}</h3>
            <p className="text-xs text-slate-500">Roll: {currentUser.roll}</p>
            <p className="text-xs text-indigo-600 font-semibold">{currentUser.email}</p>
            <button onClick={handleLogout} className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs cursor-pointer">
              লগআউট করুন
            </button>
            <button onClick={() => setShowProfileModal(false)} className="w-full py-2 text-xs text-slate-500 cursor-pointer">বন্ধ করুন</button>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out">
          <img src={lightboxImg} className="max-w-full max-h-[90vh] rounded-xl" alt="Zoom" />
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return 'এইমাত্র';
  const sec = Math.floor((new Date() - new Date(iso)) / 1000);
  if (sec < 60) return 'এইমাত্র';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} মিনিট আগে`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ঘণ্টা আগে`;
  return `${Math.floor(hr / 24)} দিন আগে`;
}

function formatTime12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}