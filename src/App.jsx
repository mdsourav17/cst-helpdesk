import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import emailjs from '@emailjs/browser';
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, deleteField, onSnapshot
} from 'firebase/firestore';
import {
  MessageSquare, ShieldCheck, Bell, Plus, Search, CheckCircle2, Clock,
  Trash2, Image as ImageIcon, Video, Users, UserPlus,
  Megaphone, LogOut, Lock, Radio, Calendar, ExternalLink, X, Check, Award, CornerDownRight, ThumbsUp, Mail, GraduationCap, ShieldAlert, Sun, Moon, FileSpreadsheet
} from 'lucide-react';

const EMAILJS_SERVICE_ID = 'service_cst-help26';
const EMAILJS_TEMPLATE_ID = 'template_r965t04';
const EMAILJS_PUBLIC_KEY = '_dvFgtl1UPcDlYxlb';

const SEMESTERS_LIST = [
  "ALL",
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "TEACHERS"
];

const CLASS_SEMESTERS = [
  "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
  "5th Semester", "6th Semester", "7th Semester", "8th Semester"
];

const DAYS_OF_WEEK = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAYS_BN = {
  Saturday: "শনিবার", Sunday: "রবিবার", Monday: "সোমবার",
  Tuesday: "মঙ্গলবার", Wednesday: "বুধবার", Thursday: "বৃহস্পতিবার", Friday: "শুক্রবার"
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
};

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
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('hd_verified_user') || 'null'));
  const [isAdminMode, setIsAdminMode] = useState(() => localStorage.getItem('hd_admin_mode') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('hd_dark_mode') !== 'false');
  
  const [membersDirectory, setMembersDirectory] = useState({});
  const [moderatorRolls, setModeratorRolls] = useState([]);
  const [directorySemFilter, setDirectorySemFilter] = useState('ALL');

  // Auth States
  const [authStep, setAuthStep] = useState('verifyRoll');
  const [authId, setAuthId] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');

  const [activeTab, setActiveTab] = useState('feed');
  const [toast, setToast] = useState(null);

  // Feed & Notice States
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Class Routine States
  const [classRoutines, setClassRoutines] = useState([]);
  const [selectedRoutineSem, setSelectedRoutineSem] = useState('4th Semester');
  const [selectedRoutineDay, setSelectedRoutineDay] = useState('Saturday');
  const [crSubject, setCrSubject] = useState('');
  const [crTime, setCrTime] = useState('');
  const [crRoom, setCrRoom] = useState('');
  const [crType, setCrType] = useState('Theory Class');

  // Modals
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showManageDirectory, setShowManageDirectory] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkDataInput, setBulkDataInput] = useState('');
  const [showManageTeacherModal, setShowManageTeacherModal] = useState(false);
  const [showManageMods, setShowManageMods] = useState(false);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminInputPin, setAdminInputPin] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const [noticeImages, setNoticeImages] = useState([]);
  const [postCategory, setPostCategory] = useState('Coding / Programming');
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postVideo, setPostVideo] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const [commentTexts, setCommentTexts] = useState({});
  const [commentImagesMap, setCommentImagesMap] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);

  // Live Support States
  const [routineList, setRoutineList] = useState([]);
  const [supportConfig, setSupportConfig] = useState({ meetLink: '', forceStatus: 'auto' });
  const [supportQueue, setSupportQueue] = useState([]);
  const [supportProblem, setSupportProblem] = useState('');
  const [supportTopic, setSupportTopic] = useState('Coding / Lab Problem');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rDay, setRDay] = useState('Saturday');
  const [rTitle, setRTitle] = useState('Evening Support Session');
  const [rStart, setRStart] = useState('16:00');
  const [rEnd, setREnd] = useState('18:00');

  // Directory Form States
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberSem, setNewMemberSem] = useState('4th Semester');

  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherRoleType, setTeacherRoleType] = useState('teacher');

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

  // Firestore Real-time Listeners
  useEffect(() => {
    const unsubDir = onSnapshot(doc(db, 'helpdesk_settings', 'directory'), (snap) => {
      if (snap.exists() && snap.data().members) {
        setMembersDirectory(snap.data().members);
      } else {
        setMembersDirectory({});
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

    const unsubClassRoutines = onSnapshot(collection(db, 'helpdesk_class_routines'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      setClassRoutines(list);
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
      unsubDir(); unsubRoles(); unsubPosts(); unsubNotices();
      unsubClassRoutines(); unsubSupport(); unsubQueue();
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
  const isMainAdmin = (userInfo?.role === "admin" || currentUser?.roll === "253203") && isAdminMode;
  const isModerator = currentUser && moderatorRolls.includes(currentUser.roll);
  const hasStaffPower = isMainAdmin || isModerator;

  const toggleTheme = () => {
    const nextState = !isDarkMode;
    setIsDarkMode(nextState);
    localStorage.setItem('hd_dark_mode', nextState ? 'true' : 'false');
  };

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

  const handleVerifyRoll = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    const cleanId = authId.trim();

    try {
      const dirSnap = await getDoc(doc(db, 'helpdesk_settings', 'directory'));
      const dirMembers = dirSnap.exists() ? (dirSnap.data().members || {}) : {};
      const member = dirMembers[cleanId];

      if (!member) {
        setAuthError(`দুঃখিত! "${cleanId}" রোল বা আইডি ডিরেক্টরিতে পাওয়া যায়নি।`);
        return;
      }

      const userDocRef = doc(db, 'helpdesk_users', cleanId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data().hasPin) {
        setPendingUser({ roll: cleanId, name: member.name, role: member.role, semester: member.semester, savedEmail: userSnap.data().email });
        setAuthStep('loginPin');
      } else {
        setPendingUser({ roll: cleanId, name: member.name, role: member.role, semester: member.semester });
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
      const userSnap = await getDoc(doc(db, 'helpdesk_users', cleanId));
      if (!userSnap.exists()) {
        setAuthError('এই রোলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
        return;
      }
      const existingData = userSnap.data();

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingUser({ roll: cleanId, name: existingData.name, role: existingData.role, semester: existingData.semester, email: cleanEmail });
      
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: cleanEmail, otp_code: otp }, EMAILJS_PUBLIC_KEY)
        .then(() => setAuthSuccessMsg(`✅ ভেরিফিকেশন কোড আপনার ${cleanEmail} ঠিকানায় পাঠানো হয়েছে।`))
        .catch(() => setAuthError('ইমেইল পাঠাতে সমস্যা হয়েছে।'));

      setAuthStep('forgotPinVerify');
    } catch (err) {
      setAuthError('রিসেট রিকোয়েস্ট করতে সমস্যা হয়েছে।');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setAuthError('');
    if (inputOtp.trim() === generatedOtp) {
      setAuthSuccessMsg('কোড মিলেছে! এখন নতুন পিন সেট করুন।');
      setAuthStep('forgotPinReset');
    } else {
      setAuthError('ভুল ভেরিফিকেশন কোড দিয়েছেন!');
    }
  };

  const handleSaveNewPin = async (e) => {
    e.preventDefault();
    if (pin1 !== pin2) return setAuthError('দুটি পিন এক হয়নি!');
    try {
      await updateDoc(doc(db, 'helpdesk_users', pendingUser.roll), { pin: pin1, hasPin: true, email: pendingUser.email });
      setAuthSuccessMsg('পিন সফলভাবে পরিবর্তন হয়েছে! এবার লগইন করুন।');
      setTimeout(() => {
        setAuthStep('verifyRoll');
        setPin1(''); setPin2(''); setInputOtp(''); setAuthEmail('');
      }, 1500);
    } catch (err) {
      setAuthError('পিন আপডেট করা যায়নি।');
    }
  };

  const handleFinalLoginSuccess = (userData) => {
    const safeSessionData = {
      roll: userData.roll,
      name: userData.name,
      role: userData.role,
      semester: userData.semester
    };
    setCurrentUser(safeSessionData);
    localStorage.setItem('hd_verified_user', JSON.stringify(safeSessionData));
    showToastMsg(`স্বাগতম, ${userData.name}!`);
  };

  const handleCreatePin = async (e) => {
    e.preventDefault();
    if (pin1 !== pin2) return setAuthError('দুটি পিন এক হয়নি!');
    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail) return setAuthError('দয়া করে আপনার জিমেইল দিন!');

    try {
      const userPayload = {
        ...pendingUser,
        email: cleanEmail,
        pin: pin1,
        hasPin: true,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'helpdesk_users', pendingUser.roll), userPayload, { merge: true });
      handleFinalLoginSuccess(userPayload);
    } catch (err) {
      setAuthError('পিন ও জিমেইল সেভ করা যায়নি।');
    }
  };

  const handleLoginPin = async (e) => {
    e.preventDefault();
    const cleanLoginEmail = loginEmail.trim().toLowerCase();

    try {
      const snap = await getDoc(doc(db, 'helpdesk_users', pendingUser.roll));
      if (!snap.exists()) {
        setAuthError('অ্যাকাউন্ট পাওয়া যায়নি!');
        return;
      }

      const userData = snap.data();

      if (userData.email && userData.email.toLowerCase() !== cleanLoginEmail) {
        setAuthError('❌ আপনার দেওয়া জিমেইলটি এই রোলের সাথে রেজিস্টার করা জিমেইলের সাথে মিলেনি!');
        return;
      }

      if (userData.pin === pin1) {
        handleFinalLoginSuccess({ ...pendingUser, ...userData });
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
    if (userInfo?.role !== "admin" && currentUser?.roll !== "253203") return;
    logoTapRef.current.count += 1;
    clearTimeout(logoTapRef.current.timer);
    if (logoTapRef.current.count >= 5) {
      logoTapRef.current.count = 0;
      setShowAdminPinModal(true);
    } else {
      logoTapRef.current.timer = setTimeout(() => { logoTapRef.current.count = 0; }, 1500);
    }
  };

  const handleVerifyAdminPinModal = async (e) => {
    e.preventDefault();
    try {
      const adminSnap = await getDoc(doc(db, 'helpdesk_settings', 'admin_config'));
      const serverPin = adminSnap.exists() ? adminSnap.data().secretPin : "253203";
      
      if (adminInputPin === serverPin) {
        const newAdminState = !isAdminMode;
        setIsAdminMode(newAdminState);
        localStorage.setItem('hd_admin_mode', newAdminState ? 'true' : 'false');
        setShowAdminPinModal(false);
        setAdminInputPin('');
        showToastMsg(newAdminState ? '👑 অ্যাডমিন মোড অন হয়েছে!' : 'অ্যাডমিন মোড অফ হয়েছে!');
      } else {
        showToastMsg('ভুল সিক্রেট পিন!', 'error');
      }
    } catch (err) {
      showToastMsg('পিন যাচাই করতে সমস্যা হয়েছে!', 'error');
    }
  };

  const handleAddMemberToDirectory = async (e) => {
    e.preventDefault();
    const id = newMemberId.trim();
    const name = newMemberName.trim();
    const email = newMemberEmail.trim().toLowerCase();
    if (!id || !name || !email) return;

    await setDoc(doc(db, 'helpdesk_settings', 'directory'), {
      members: {
        [id]: { name, email, role: "student", semester: newMemberSem }
      }
    }, { merge: true });

    setNewMemberId(''); setNewMemberName(''); setNewMemberEmail('');
    setShowManageDirectory(false);
    showToastMsg(`${name} সফলভাবে যুক্ত হয়েছে!`);
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!bulkDataInput.trim()) return;
    try {
      const lines = bulkDataInput.trim().split('\n');
      const newMembersObj = {};
      
      lines.forEach(line => {
        const parts = line.split(/,|\t/).map(p => p.trim());
        if (parts.length >= 4) {
          const [roll, name, email, semester] = parts;
          newMembersObj[roll] = {
            name,
            email: email.toLowerCase(),
            role: "student",
            semester
          };
        }
      });

      if (Object.keys(newMembersObj).length === 0) {
        showToastMsg('সঠিক ফরম্যাটে ডাটা দিন (Roll, Name, Email, Semester)', 'error');
        return;
      }

      await setDoc(doc(db, 'helpdesk_settings', 'directory'), {
        members: newMembersObj
      }, { merge: true });

      setBulkDataInput('');
      setShowBulkUploadModal(false);
      showToastMsg('একাধিক ছাত্রের ডাটা সফলভাবে আপলোড হয়েছে!');
    } catch (err) {
      showToastMsg('বাল্ক আপলোড করতে সমস্যা হয়েছে!', 'error');
    }
  };

  const handleAddTeacherOrCi = async (e) => {
    e.preventDefault();
    const id = teacherId.trim();
    const name = teacherName.trim();
    const email = teacherEmail.trim().toLowerCase();
    if (!id || !name || !email) return;

    const semesterLabel = teacherRoleType === 'ci_sir' ? 'Chief Instructor (CI)' : 'Faculty / Teacher';

    await setDoc(doc(db, 'helpdesk_settings', 'directory'), {
      members: {
        [id]: { name, email, role: teacherRoleType, semester: semesterLabel }
      }
    }, { merge: true });

    setTeacherId(''); setTeacherName(''); setTeacherEmail('');
    setShowManageTeacherModal(false);
    showToastMsg(`${name} (${semesterLabel}) সফলভাবে যুক্ত হয়েছেন!`);
  };

  const handleDeleteMemberFromDirectory = async (id, name) => {
    if (!hasStaffPower) {
      showToastMsg('অনুমতি নেই!', 'error');
      return;
    }
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" কে ডাটাবেজ থেকে চিরতরে ডিলিট করতে চান?`)) {
      try {
        const dirRef = doc(db, 'helpdesk_settings', 'directory');
        await updateDoc(dirRef, {
          [`members.${id}`]: deleteField()
        });
        showToastMsg(`${name} ডাটাবেজ থেকে স্থায়ীভাবে ডিলিট হয়েছে!`);
      } catch (err) {
        showToastMsg('ডিলিট করতে সমস্যা হয়েছে!', 'error');
      }
    }
  };

  const handleAddClassRoutine = async (e) => {
    e.preventDefault();
    if (!hasStaffPower) return;
    if (!crSubject.trim() || !crTime.trim() || !crRoom.trim()) return;

    try {
      await addDoc(collection(db, 'helpdesk_class_routines'), {
        semester: selectedRoutineSem,
        day: selectedRoutineDay,
        subject: crSubject.trim(),
        time: crTime.trim(),
        room: crRoom.trim(),
        type: crType,
        createdBy: userInfo.name,
        createdAt: new Date().toISOString()
      });
      setCrSubject(''); setCrTime(''); setCrRoom('');
      showToastMsg('নতুন ক্লাস রুটিন যুক্ত হয়েছে!');
    } catch (err) {
      showToastMsg('রুটিন যোগ করতে সমস্যা হয়েছে!', 'error');
    }
  };

  const handleDeleteClassRoutine = async (id) => {
    if (!hasStaffPower) return;
    if (window.confirm('এই ক্লাস শিডিউলটি ডিলিট করতে চান?')) {
      await deleteDoc(doc(db, 'helpdesk_class_routines', id));
      showToastMsg('রুটিন ডিলিট করা হয়েছে!');
    }
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
      showToastMsg('সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে!', 'error');
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

  // কমেন্টে সর্বোচ্চ ৫টি ছবি আপলোড করার ফাংশন
  const handleCommentImageUpload = async (e, postId) => {
    const files = Array.from(e.target.files);
    const existing = commentImagesMap[postId] || [];
    if (files.length + existing.length > 5) {
      showToastMsg('কমেন্টে সর্বোচ্চ ৫টি ছবি দেওয়া যাবে!', 'error');
      return;
    }
    const compressed = await Promise.all(files.map(f => compressImageFile(f)));
    setCommentImagesMap(prev => ({ ...prev, [postId]: [...existing, ...compressed].slice(0, 5) }));
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
        return { ...c, likes: isLiked ? likes.filter(r => r !== currentUser.roll) : [...likes, currentUser.roll] };
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
      if (c.id === commentId) return { ...c, replies: [...(c.replies || []), newReply] };
      return c;
    });

    await updateDoc(doc(db, 'helpdesk_posts', post.id), { comments: updatedComments });
    setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
    setActiveReplyBox(null);
    showToastMsg('রিপ্লাই দেওয়া হয়েছে!');
  };

  const handleAddSupportRoutineSlot = async (e) => {
    e.preventDefault();
    if (!hasStaffPower) return;
    const newSlot = { id: Date.now().toString(), day: rDay, title: rTitle, startTime: rStart, endTime: rEnd };
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { routines: [...routineList, newSlot] }, { merge: true });
    showToastMsg('সাপোর্ট রুটিনে সেশন যোগ হয়েছে!');
  };

  const handleDeleteSupportRoutineSlot = async (id) => {
    if (!hasStaffPower) return;
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { routines: routineList.filter(r => r.id !== id) }, { merge: true });
    showToastMsg('রুটিন সেশন ডিলিট করা হয়েছে!');
  };

  const handleUpdateSupportConfig = async (field, value) => {
    if (!hasStaffPower) return;
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { [field]: value }, { merge: true });
    showToastMsg('সাপোর্ট সেটিংস আপডেট হয়েছে!');
  };

  const handleJoinSupportQueue = async (e) => {
    e.preventDefault();
    if (!supportProblem.trim()) return;
    if (supportQueue.some(q => q.roll === currentUser.roll)) return showToastMsg('তুমি ইতিমধ্যেই সিরিয়ালে আছো!', 'error');

    await addDoc(collection(db, 'helpdesk_support_queue'), {
      roll: currentUser.roll,
      name: userInfo.name,
      semester: userInfo.semester || '4th Semester',
      topic: supportTopic,
      problem: supportProblem.trim(),
      joinedAt: new Date().toISOString()
    });
    setSupportProblem('');
    showToastMsg('সাপোর্ট সিরিয়ালে নাম যুক্ত হয়েছ!');
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
    if ((role === 'admin' || roll === "253203") && isAdminMode) {
      return <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">Admin</span>;
    }
    if (role === 'ci_sir') {
      return <span className="px-2 py-0.5 rounded-md bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1"><Award className="w-3 h-3" /> CI Sir</span>;
    }
    if (role === 'teacher') {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">Teacher / Sir</span>;
    }
    if (moderatorRolls.includes(roll)) {
      return <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">Moderator</span>;
    }
    return null;
  };

  const filteredPosts = posts.filter(p => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchSearch = !searchQuery ||
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-900 flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: "'Inter', 'Hind Siliguri', sans-serif" }}>
        <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">CST Help Desk</h1>
            <p className="text-xs text-slate-500 mt-1">রোল ও সিক্রেট পিন প্রোটেক্টেড পোর্টাল</p>
          </div>

          {authError && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium break-words">{authError}</div>}
          {authSuccessMsg && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium break-words">{authSuccessMsg}</div>}

          {authStep === 'verifyRoll' && (
            <form onSubmit={handleVerifyRoll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাস রোল / আইডি *</label>
                <input type="text" required value={authId} onChange={(e) => setAuthId(e.target.value)} placeholder="আপনার রোল বা আইডি দিন" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg transition-all">পরবর্তী ধাপ</button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setAuthError(''); setAuthSuccessMsg(''); setAuthStep('forgotPinRequest'); }} className="text-xs text-indigo-600 font-semibold hover:underline">পিন ভুলে গেছেন? রিসেট করুন</button>
              </div>
            </form>
          )}

          {authStep === 'createPin' && (
            <form onSubmit={handleCreatePin} className="space-y-4">
              <p className="text-xs text-slate-600 bg-indigo-50 p-3 rounded-xl leading-relaxed">স্বাগতম <b>{pendingUser?.name}</b>! প্রথমবার অ্যাকাউন্ট সেটআপ করার জন্য আপনার জিমেইল এবং নতুন পিন দিন।</p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার জিমেইল *</label>
                <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="your-email@gmail.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পিন (৪-৬ সংখ্যা) *</label>
                <input type="password" required maxLength={6} value={pin1} onChange={(e) => setPin1(e.target.value)} placeholder="••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পিন কনফার্ম করুন *</label>
                <input type="password" required maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value)} placeholder="••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">পিন সেট ও লগইন করুন</button>
              <button type="button" onClick={() => setAuthStep('verifyRoll')} className="w-full text-xs text-slate-500 hover:underline pt-1">← রোল পরিবর্তনে ফিরে যান</button>
            </form>
          )}

          {authStep === 'loginPin' && (
            <form onSubmit={handleLoginPin} className="space-y-4">
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">ফিরে আসার জন্য স্বাগতম, <b>{pendingUser?.name}</b>! আপনার জিমেইল এবং পিন দিন।</p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার রেজিস্টার্ড জিমেইল *</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your-email@gmail.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার পিন *</label>
                <input type="password" required maxLength={6} value={pin1} onChange={(e) => setPin1(e.target.value)} placeholder="••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg">লগইন করুন</button>
              <div className="flex justify-between pt-2 text-xs">
                <button type="button" onClick={() => { setAuthStep('verifyRoll'); setPin1(''); setLoginEmail(''); }} className="text-slate-500 hover:underline">← রোল পরিবর্তন</button>
                <button type="button" onClick={() => { setAuthId(pendingUser?.roll || ''); setAuthStep('forgotPinRequest'); }} className="text-indigo-600 font-semibold hover:underline">পিন রিসেট</button>
              </div>
            </form>
          )}

          {authStep === 'forgotPinRequest' && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <input type="text" required value={authId} onChange={(e) => setAuthId(e.target.value)} placeholder="ক্লাস রোল / আইডি" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
              <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="আপনার জিমেইল" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm">ওটিপি পাঠান</button>
              <button type="button" onClick={() => setAuthStep('verifyRoll')} className="w-full text-xs text-slate-500 hover:underline">← ফিরে যান</button>
            </form>
          )}

          {authStep === 'forgotPinVerify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input type="text" required maxLength={6} value={inputOtp} onChange={(e) => setInputOtp(e.target.value)} placeholder="৬ ডিজিটের ওটিপি কোড" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center tracking-widest" />
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm">যাচাই করুন</button>
            </form>
          )}

          {authStep === 'forgotPinReset' && (
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <input type="password" required maxLength={6} value={pin1} onChange={(e) => setPin1(e.target.value)} placeholder="নতুন পিন" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center" />
              <input type="password" required maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value)} placeholder="পিন কনফার্ম করুন" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center" />
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">নতুন পিন সেভ করুন</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} style={{ fontFamily: "'Inter', 'Hind Siliguri', sans-serif" }}>
      {toast && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-50 border px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-medium ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          {toast.type === 'error' ? <X className="w-4 h-4 text-rose-500 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span className="break-words">{toast.msg}</span>
        </div>
      )}

      {/* Header - Fully Responsive */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none min-w-0" onClick={handleSecretTap}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className={`text-sm sm:text-base font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CST Help Desk</h1>
                {isMainAdmin && <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">Admin</span>}
              </div>
              <p className={`text-[10px] sm:text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Department Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button onClick={toggleTheme} className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-200 border-slate-300 text-indigo-600'}`} title="থিম পরিবর্তন">
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className={`relative p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'}`} title="নোটিফিকেশন">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className={`fixed sm:absolute right-3 sm:right-0 left-3 sm:left-auto mt-2 sm:w-80 border rounded-2xl shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <div className="p-3 border-b border-slate-800 flex justify-between items-center text-xs font-bold">
                    <span>নোটিফিকেশন</span>
                    <button onClick={() => setShowNotifDropdown(false)}><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">কোনো নোটিফিকেশন নেই</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => updateDoc(doc(db, 'helpdesk_notifications', n.id), { read: true })} className="p-3 text-xs flex items-start gap-2 cursor-pointer">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="break-words">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setShowProfileModal(true)} className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'}`}>
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">{userInfo?.name?.charAt(0) || 'U'}</div>
              <span className="hidden md:inline max-w-[100px] truncate">{userInfo?.name}</span>
            </button>

            <button onClick={handleLogout} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400" title="লগআউট">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Responsive Scrollable */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 pt-1 scrollbar-none">
          <button onClick={() => setActiveTab('feed')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ${activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-lg' : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> কোডিং ফিড
          </button>
          <button onClick={() => setActiveTab('class_routine')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ${activeTab === 'class_routine' ? 'bg-indigo-600 text-white shadow-lg' : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ক্লাস রুটিন
          </button>
          <button onClick={() => setActiveTab('notice')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ${activeTab === 'notice' ? 'bg-indigo-600 text-white shadow-lg' : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>
            <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> নোটিশ বোর্ড
          </button>
          <button onClick={() => setActiveTab('support')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ${activeTab === 'support' ? 'bg-indigo-600 text-white shadow-lg' : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> লাইভ সাপোর্ট {liveStatus.isLive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
          </button>
          <button onClick={() => setActiveTab('directory')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg' : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ডিরেক্টরি
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* --- TAB 1: FEED --- */}
        {activeTab === 'feed' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`border p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="কোডিং সমস্যা বা পোস্ট খুঁজুন..." className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto items-center">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`w-full sm:w-auto border px-2.5 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="open">Open (চলমান)</option>
                  <option value="solved">Solved (সমাধানকৃত)</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`w-full sm:w-auto border px-2.5 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                  <option value="ALL">সকল ক্যাটাগরি</option>
                  <option value="Coding / Programming">Coding / Programming</option>
                  <option value="Lab Practical">Lab Practical</option>
                  <option value="Academic Question">Academic Question</option>
                </select>
                <button onClick={() => setShowCreatePost(true)} className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg">
                  <Plus className="w-4 h-4" /> প্রশ্ন করুন
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPosts.map(post => (
                <div key={post.id} className={`border rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">{post.authorName.charAt(0)}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold truncate">{post.authorName}</span>
                          <span className="text-[10px] text-slate-400">রোল: {post.authorRoll}</span>
                          {renderRoleBadge(post.authorRoll, post.authorRole)}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{new Date(post.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] font-bold ${post.status === 'solved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {post.status === 'solved' ? 'Solved' : 'Open'}
                      </span>
                      {(hasStaffPower || currentUser.roll === post.authorRoll) && (
                        <>
                          <button onClick={() => updateDoc(doc(db, 'helpdesk_posts', post.id), { status: post.status === 'solved' ? 'open' : 'solved' })} className="p-1.5 rounded-lg bg-slate-800 text-xs text-slate-300" title="স্ট্যাটাস পরিবর্তন">🔄</button>
                          <button onClick={() => window.confirm('ডিলিট করতে চান?') && deleteDoc(doc(db, 'helpdesk_posts', post.id))} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400" title="ডিলিট"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold mb-2">{post.category}</span>
                    <h2 className="text-sm sm:text-base font-bold mb-1 break-words">{post.title}</h2>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap break-words opacity-90">{post.description}</p>
                  </div>

                  {post.images?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {post.images.map((img, idx) => (
                        <img key={idx} src={img} alt="post" onClick={() => setLightboxImg(img)} className="w-full h-32 sm:h-40 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-all" />
                      ))}
                    </div>
                  )}

                  {/* Comments Section - Responsive Grid for up to 5 images */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-slate-400">কমেন্টস ({post.comments?.length || 0})</h3>
                    {(post.comments || []).map(comm => (
                      <div key={comm.id} className={`p-3 rounded-xl border space-y-2 overflow-hidden ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span className="text-xs font-bold truncate">{comm.authorName}</span>
                            <span className="text-[10px] text-slate-400">রোল: {comm.authorRoll}</span>
                            {renderRoleBadge(comm.authorRoll, comm.authorRole)}
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">{new Date(comm.createdAt).toLocaleDateString('bn-BD')}</span>
                        </div>
                        {comm.text && <p className="text-xs leading-relaxed break-words">{comm.text}</p>}
                        
                        {/* কমেন্টের ছবির রেসপন্সিভ গ্রিড (সর্বোচ্চ ৫টি ছবি সুন্দরভাবে সাজানো থাকবে) */}
                        {comm.images?.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                            {comm.images.map((cImg, cIdx) => (
                              <img key={cIdx} src={cImg} alt="comment-img" onClick={() => setLightboxImg(cImg)} className="w-full h-20 sm:h-24 object-cover rounded-lg cursor-pointer border border-slate-700 hover:opacity-90 transition-all" />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-1">
                          <button onClick={() => handleCommentLike(post, comm.id)} className="flex items-center gap-1 text-[11px] text-indigo-400 font-semibold hover:opacity-80">
                            <ThumbsUp className="w-3.5 h-3.5" /> {comm.likes?.length || 0} লাইক
                          </button>
                          <button onClick={() => setActiveReplyBox(activeReplyBox === comm.id ? null : comm.id)} className="text-[11px] text-slate-400 flex items-center gap-1 hover:opacity-80">
                            <CornerDownRight className="w-3.5 h-3.5" /> রিপ্লাই
                          </button>
                        </div>
                        {comm.replies?.map(rep => (
                          <div key={rep.id} className="pl-3 sm:pl-4 border-l-2 border-indigo-500/30 text-xs mt-1 space-y-0.5 break-words">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <b>{rep.authorName}:</b>
                              {renderRoleBadge(rep.authorRoll, rep.authorRole)}
                            </div>
                            <p className="break-words">{rep.text}</p>
                          </div>
                        ))}
                        {activeReplyBox === comm.id && (
                          <form onSubmit={(e) => handleAddReply(e, post, comm.id)} className="flex gap-1.5 sm:gap-2 pt-2">
                            <input type="text" value={replyTexts[comm.id] || ''} onChange={(e) => setReplyTexts(prev => ({ ...prev, [comm.id]: e.target.value }))} placeholder="রিপ্লাই লিখুন..." className="flex-1 min-w-0 border px-3 py-1.5 rounded-lg text-xs bg-slate-900 border-slate-700 text-white" />
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">দিন</button>
                          </form>
                        )}
                      </div>
                    ))}

                    <form onSubmit={(e) => handleAddComment(e, post)} className="space-y-2 pt-1">
                      {commentImagesMap[post.id]?.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                          {commentImagesMap[post.id].map((imgPrv, iKey) => (
                            <div key={iKey} className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-slate-700">
                              <img src={imgPrv} alt="preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setCommentImagesMap(prev => ({ ...prev, [post.id]: prev[post.id].filter((_, idx) => idx !== iKey) }))} className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1.5 sm:gap-2 items-center">
                        <label className={`p-2.5 rounded-xl border cursor-pointer transition-all shrink-0 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-indigo-400 hover:bg-slate-800' : 'bg-slate-50 border-slate-300 text-indigo-600 hover:bg-slate-100'}`} title="সর্বোচ্চ ৫টি ছবি দিন">
                          <ImageIcon className="w-4 h-4" />
                          <input type="file" multiple accept="image/*" onChange={(e) => handleCommentImageUpload(e, post.id)} className="hidden" />
                        </label>
                        <input type="text" value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="সমাধান লিখুন (সর্বোচ্চ ৫টি ছবি)..." className={`flex-1 min-w-0 border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold shadow shrink-0">কমেন্ট</button>
                      </div>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: CLASS ROUTINE --- */}
        {activeTab === 'class_routine' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`border p-4 sm:p-5 rounded-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div>
                <h2 className="text-base sm:text-lg font-bold">সেমিস্টারভিত্তিক ক্লাস ও ল্যাব রুটিন</h2>
                <p className="text-xs text-slate-400">১ম থেকে ৮ম সেমিস্টারের ক্লাস, ল্যাব, সময় ও রুম নম্বর দেখুন</p>
              </div>

              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CLASS_SEMESTERS.map(sem => (
                  <button
                    key={sem}
                    onClick={() => setSelectedRoutineSem(sem)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${selectedRoutineSem === sem ? 'bg-indigo-600 text-white shadow-md' : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}`}
                  >
                    {sem}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pt-1 scrollbar-none">
                {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedRoutineDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${selectedRoutineDay === day ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : (isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600')}`}
                  >
                    {DAYS_BN[day]}
                  </button>
                ))}
              </div>
            </div>

            {hasStaffPower && (
              <form onSubmit={handleAddClassRoutine} className={`border p-4 sm:p-5 rounded-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  + নতুন শিডিউল যুক্ত করুন ({selectedRoutineSem} - {DAYS_BN[selectedRoutineDay]})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={crTime}
                    onChange={(e) => setCrTime(e.target.value)}
                    placeholder="সময় (যেমন: 09:00 AM - 09:45 AM)"
                    className={`border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    required
                    value={crSubject}
                    onChange={(e) => setCrSubject(e.target.value)}
                    placeholder="সাবজেক্ট ও কোড"
                    className={`border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <input
                    type="text"
                    required
                    value={crRoom}
                    onChange={(e) => setCrRoom(e.target.value)}
                    placeholder="রুম / ল্যাব নং"
                    className={`border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <select
                    value={crType}
                    onChange={(e) => setCrType(e.target.value)}
                    className={`border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  >
                    <option value="Theory Class">Theory Class (ক্লাস)</option>
                    <option value="Lab Practical">Lab Practical (ল্যাব)</option>
                  </select>
                </div>
                <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg">
                  রুটিনে সেভ করুন
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {classRoutines
                .filter(r => r.semester === selectedRoutineSem && r.day === selectedRoutineDay)
                .map(item => (
                  <div key={item.id} className={`border rounded-2xl p-4 flex items-center justify-between gap-2 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${item.type === 'Lab Practical' ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
                    <div className="space-y-1.5 pl-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'Lab Practical' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> {item.time}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold break-words">{item.subject}</h4>
                      <p className="text-xs text-slate-400">📍 রুম / ল্যাব: <b className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{item.room}</b></p>
                    </div>

                    {hasStaffPower && (
                      <button onClick={() => handleDeleteClassRoutine(item.id)} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 shrink-0" title="ডিলিট করুন">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

              {classRoutines.filter(r => r.semester === selectedRoutineSem && r.day === selectedRoutineDay).length === 0 && (
                <div className={`col-span-full border rounded-2xl p-8 sm:p-10 text-center text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                  {selectedRoutineSem}-এর {DAYS_BN[selectedRoutineDay]} কোনো ক্লাস বা ল্যাব শিডিউল যুক্ত করা হয়নি।
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: NOTICE BOARD --- */}
        {activeTab === 'notice' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div>
                <h2 className="text-base font-bold">ডিপার্টমেন্টাল নোটিশ বোর্ড</h2>
                <p className="text-xs text-slate-400">অফিশিয়াল নোটিশ ও ঘোষণা</p>
              </div>
              {hasStaffPower && (
                <button onClick={() => setShowAddNotice(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                  <Plus className="w-4 h-4" /> নতুন নোটিশ
                </button>
              )}
            </div>

            <div className="space-y-4">
              {notices.map(n => (
                <div key={n.id} className={`border rounded-2xl p-4 sm:p-6 space-y-3 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-indigo-400 font-bold uppercase">{n.authorRole}</span>
                      <h2 className="text-sm sm:text-base font-bold mt-0.5 break-words">{n.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleDateString('bn-BD')}</span>
                      {hasStaffPower && (
                        <button onClick={() => window.confirm('নোটিশ ডিলিট করতে চান?') && deleteDoc(doc(db, 'helpdesk_notices', n.id))} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap break-words opacity-90">{n.description}</p>
                  
                  {n.images?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                      {n.images.map((nImg, niKey) => (
                        <img key={niKey} src={nImg} alt="notice-img" onClick={() => setLightboxImg(nImg)} className="w-full h-32 sm:h-36 object-cover rounded-xl cursor-pointer border border-slate-700" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: LIVE SUPPORT & ROUTINE --- */}
        {activeTab === 'support' && (
          <div className="space-y-4 sm:space-y-6">
            {liveStatus.isLive ? (
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase">লাইভ সাপোর্ট সেশন চালু আছে</span>
                  <h2 className="text-base sm:text-lg font-bold text-white">{liveStatus.sessionTitle}</h2>
                  <p className="text-xs text-slate-400">সময়: {liveStatus.timeRange}</p>
                </div>
                {(supportQueue.some(q => q.roll === currentUser.roll) || hasStaffPower) ? (
                  <a href={supportConfig.meetLink || "https://meet.google.com"} target="_blank" rel="noreferrer" className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg">
                    <Video className="w-5 h-5" /> গুগল মিট জয়েন করুন <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-xs text-amber-400 font-semibold flex items-center gap-1"><Lock className="w-4 h-4 shrink-0" /> আগে নিচে সিরিয়াল ফর্ম পূরণ করুন</span>
                )}
              </div>
            ) : (
              <div className={`border rounded-2xl p-5 sm:p-6 text-center space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <Radio className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
                <h2 className="text-sm sm:text-base font-bold">বর্তমানে লাইভ সাপোর্ট সেশন চলছে না</h2>
                <p className="text-xs text-slate-400">নিচে সাপ্তাহিক রুটিন দেখে নির্ধারিত সময়ে জয়েন করুন অথবা সেশন চালু হলে সিরিয়ালে নাম দিতে পারবেন।</p>
              </div>
            )}

            {liveStatus.isLive && (
              <div className={`border rounded-2xl p-4 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" /> সাপোর্ট সিরিয়ালে নাম লিখুন
                </h2>
                <form onSubmit={handleJoinSupportQueue} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">সমস্যার বিষয় / টপিক *</label>
                    <select value={supportTopic} onChange={(e) => setSupportTopic(e.target.value)} className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                      <option value="Coding / Lab Problem">Coding / Lab Problem</option>
                      <option value="C Programming">C Programming</option>
                      <option value="Web Development">Web Development</option>
                      <option value="General Support">General Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">আপনার সমস্যা সংক্ষেপে লিখুন *</label>
                    <textarea rows={3} required value={supportProblem} onChange={(e) => setSupportProblem(e.target.value)} placeholder="যেমন: পয়েন্টার লজিক বুঝতে পারছি না..." className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg">সাপোর্ট সিরিয়ালে নাম যুক্ত করুন</button>
                </form>
              </div>
            )}

            <div className={`border rounded-2xl p-4 sm:p-6 space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h2 className="text-sm sm:text-base font-bold">বর্তমান সাপোর্ট সিরিয়াল ({supportQueue.length})</h2>
              {supportQueue.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">বর্তমানে সিরিয়ালে কেউ নেই</p>
              ) : (
                supportQueue.map((q, idx) => (
                  <div key={q.id} className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">#{idx + 1} {q.name} (রোল: {q.roll})</span>
                      <p className="text-xs opacity-80 mt-1 break-words"><b>[{q.topic}]</b> {q.problem}</p>
                    </div>
                    {hasStaffPower && (
                      <button onClick={() => handleCompleteStudentSupport(q)} className="w-full sm:w-auto bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0">সম্পন্ন</button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className={`border rounded-2xl p-4 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h2 className="text-sm sm:text-base font-bold">সাপ্তাহিক লাইভ সাপোর্ট রুটিন</h2>
              <div className="space-y-3">
                {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                  const daySlots = routineList.filter(r => r.day === day);
                  return (
                    <div key={day} className={`p-3.5 sm:p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-400">{DAYS_BN[day]}</span>
                        {hasStaffPower && (
                          <span className="text-[10px] text-slate-500">অ্যাডমিন কন্ট্রোল নিচে</span>
                        )}
                      </div>
                      {daySlots.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">কোনো সেশন নেই</p>
                      ) : (
                        daySlots.map(slot => (
                          <div key={slot.id} className="flex justify-between items-center text-xs bg-indigo-500/10 p-2.5 rounded-xl gap-2">
                            <div className="min-w-0">
                              <b className="block truncate">{slot.title}</b>
                              <p className="text-[11px] text-emerald-400">{formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}</p>
                            </div>
                            {hasStaffPower && (
                              <button onClick={() => handleDeleteSupportRoutineSlot(slot.id)} className="text-rose-400 p-1 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>

              {hasStaffPower && (
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase">অ্যাডমিন: সাপোর্ট কন্ট্রোল ও নতুন রুটিন</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="url" defaultValue={supportConfig.meetLink} onBlur={(e) => handleUpdateSupportConfig('meetLink', e.target.value)} placeholder="গুগল মিট লিংক দিন" className={`border px-3 py-2 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                    <select value={supportConfig.forceStatus} onChange={(e) => handleUpdateSupportConfig('forceStatus', e.target.value)} className={`border px-3 py-2 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}>
                      <option value="auto">স্ট্যাটাস: অটোমেটিক (রুটিন অনুযায়ী)</option>
                      <option value="open">ফোর্স ওপেন (সবসময় চালু)</option>
                      <option value="closed">ফোর্স ক্লোজড (সবসময় বন্ধ)</option>
                    </select>
                  </div>

                  <form onSubmit={handleAddSupportRoutineSlot} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-2">
                    <select value={rDay} onChange={(e) => setRDay(e.target.value)} className={`border px-2.5 py-2 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}>
                      {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => <option key={d} value={d}>{DAYS_BN[d]}</option>)}
                    </select>
                    <input type="text" value={rTitle} onChange={(e) => setRTitle(e.target.value)} placeholder="সেশনের নাম" className={`border px-2.5 py-2 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                    <input type="time" value={rStart} onChange={(e) => setRStart(e.target.value)} className={`border px-2.5 py-2 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                    <input type="time" value={rEnd} onChange={(e) => setREnd(e.target.value)} className={`border px-2.5 py-2 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">সেশন যোগ করুন</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 5: DIRECTORY --- */}
        {activeTab === 'directory' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`border p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div>
                <h2 className="text-base sm:text-lg font-bold">ডিপার্টমেন্টাল ডিরেক্টরি</h2>
                <p className="text-xs text-slate-400">সেমিস্টার অনুযায়ী শিক্ষক, সিআই ও ছাত্রছাত্রীবৃন্দ</p>
              </div>

              {hasStaffPower && (
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">
                  <button onClick={() => setShowManageDirectory(true)} className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold">
                    <UserPlus className="w-4 h-4 shrink-0" /> ছাত্র যোগ
                  </button>
                  <button onClick={() => setShowBulkUploadModal(true)} className="flex items-center justify-center gap-1.5 bg-purple-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold">
                    <FileSpreadsheet className="w-4 h-4 shrink-0" /> বাল্ক আপলোড
                  </button>
                  <button onClick={() => setShowManageTeacherModal(true)} className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold">
                    <Award className="w-4 h-4 shrink-0" /> শিক্ষক / CI
                  </button>
                  <button onClick={() => setShowManageMods(true)} className="flex items-center justify-center gap-1.5 bg-slate-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> মডারেটর
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
              {SEMESTERS_LIST.map(sem => (
                <button
                  key={sem}
                  onClick={() => setDirectorySemFilter(sem)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${directorySemFilter === sem ? 'bg-indigo-600 text-white shadow-lg' : (isDarkMode ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-700 border border-slate-200')}`}
                >
                  {sem === 'ALL' ? 'সকল মেম্বার' : sem === 'TEACHERS' ? '👨‍🏫 শিক্ষক / CI' : sem}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(membersDirectory)
                .filter(([_, member]) => {
                  const isTeacherOrCI = member.role === 'teacher' || member.role === 'ci_sir';
                  if (directorySemFilter === 'ALL') return !isTeacherOrCI;
                  if (directorySemFilter === 'TEACHERS') return isTeacherOrCI;
                  return member.semester === directorySemFilter;
                })
                .map(([id, member]) => {
                  const isTeacherOrCI = member.role === 'teacher' || member.role === 'ci_sir';
                  return (
                    <div key={id} className={`border rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full ${member.role === 'ci_sir' ? 'bg-purple-600' : member.role === 'teacher' ? 'bg-emerald-600' : 'bg-indigo-600'}`}></div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold truncate">{member.name}</h3>
                            <p className="text-[11px] text-indigo-400 font-semibold truncate">{member.semester} {!isTeacherOrCI && member.role !== 'admin' && `(রোল: ${id})`}</p>
                            <div className="mt-1">{renderRoleBadge(id, member.role)}</div>
                          </div>
                        </div>

                        {hasStaffPower && member.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteMemberFromDirectory(id, member.name)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer shrink-0"
                            title="স্থায়ীভাবে ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isTeacherOrCI && (
                        <div className={`pt-2 border-t text-xs flex items-center gap-2 ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{member.email || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">নতুন প্রশ্ন বা পোস্ট</h2>
              <button onClick={() => setShowCreatePost(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)} className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                <option value="Coding / Programming">Coding / Programming</option>
                <option value="Lab Practical">Lab Practical</option>
                <option value="Academic Question">Academic Question</option>
              </select>
              <input type="text" required value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="শিরোনাম *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <textarea rows={4} required value={postDesc} onChange={(e) => setPostDesc(e.target.value)} placeholder="বিস্তারিত লিখুন *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}></textarea>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">ছবি যুক্ত করুন (সর্বোচ্চ ৫টি)</label>
                <input type="file" multiple accept="image/*" onChange={handlePostImageUpload} className="w-full text-xs" />
                {postImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {postImages.map((pImg, pi) => (
                      <div key={pi} className="relative h-20 rounded-xl overflow-hidden border border-slate-700">
                        <img src={pImg} alt="prv" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== pi))} className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmittingPost} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg">পোস্ট পাবলিশ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showManageDirectory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">নতুন ছাত্র যুক্ত করুন</h2>
              <button onClick={() => setShowManageDirectory(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddMemberToDirectory} className="space-y-4">
              <input type="text" required value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} placeholder="ক্লাস রোল *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <input type="text" required value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="নাম *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <input type="email" required value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="অফিশিয়াল জিমেইল *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <select value={newMemberSem} onChange={(e) => setNewMemberSem(e.target.value)} className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                {CLASS_SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">সেভ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">বাল্ক ছাত্র ডাটা আপলোড (Google Form / CSV)</h2>
              <button onClick={() => setShowBulkUploadModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-[11px] text-slate-400">প্রতি লাইনে রোল, নাম, জিমেইল এবং সেমিস্টার কমা (,) দিয়ে নিচে পেস্ট করুন:</p>
            <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
              <textarea
                rows={6}
                required
                value={bulkDataInput}
                onChange={(e) => setBulkDataInput(e.target.value)}
                placeholder="201605, Nurnobi, nurnobi@gmail.com, 4th Semester&#10;201606, Rahim, rahim@gmail.com, 4th Semester"
                className={`w-full border px-3 py-2.5 rounded-xl text-xs font-mono ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              ></textarea>
              <button type="submit" className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg">একসাথে সব সেভ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showManageTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">শিক্ষক বা সিআই যুক্ত করুন</h2>
              <button onClick={() => setShowManageTeacherModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTeacherOrCi} className="space-y-4">
              <select value={teacherRoleType} onChange={(e) => setTeacherRoleType(e.target.value)} className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                <option value="ci_sir">Chief Instructor (CI Sir)</option>
                <option value="teacher">Faculty / Teacher</option>
              </select>
              <input type="text" required value={teacherId} onChange={(e) => setTeacherId(e.target.value)} placeholder="আইডি / কোড (যেমন: ci_01) *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <input type="text" required value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="শিক্ষকের নাম *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <input type="email" required value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} placeholder="অফিশিয়াল জিমেইল *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs">শিক্ষক সেভ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showManageMods && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">মডারেটর ম্যানেজ</h2>
              <button onClick={() => setShowManageMods(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddModerator} className="flex gap-2">
              <input type="text" required value={modInputRoll} onChange={(e) => setModInputRoll(e.target.value)} placeholder="ছাত্রের রোল দিন" className={`flex-1 min-w-0 border px-3 py-2 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <button type="submit" className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0">যুক্ত করুন</button>
            </form>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {moderatorRolls.map(roll => (
                <div key={roll} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="truncate">{membersDirectory[roll]?.name || roll} ({roll})</span>
                  <button onClick={() => handleRemoveModerator(roll)} className="text-rose-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">নতুন নোটিশ</h2>
              <button onClick={() => setShowAddNotice(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await addDoc(collection(db, 'helpdesk_notices'), {
                title: e.target.noticeTitle.value,
                description: e.target.noticeDesc.value,
                images: noticeImages,
                authorRole: userInfo.role === 'ci_sir' ? 'Chief Instructor Notice' : 'Department Notice',
                createdAt: new Date().toISOString()
              });
              setNoticeImages([]); setShowAddNotice(false); showToastMsg('নোটিশ পাবলিশ হয়েছে!');
            }} className="space-y-4">
              <input type="text" name="noticeTitle" required placeholder="শিরোনাম *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <textarea rows={4} name="noticeDesc" required placeholder="বিবরণ *" className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}></textarea>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">ছবি যুক্ত করুন (সর্বোচ্চ ৩টি)</label>
                <input type="file" multiple accept="image/*" onChange={handleNoticeImageUpload} className="w-full text-xs" />
                {noticeImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {noticeImages.map((nImg, ni) => (
                      <div key={ni} className="relative h-20 rounded-xl overflow-hidden border border-slate-700">
                        <img src={nImg} alt="prv" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setNoticeImages(prev => prev.filter((_, idx) => idx !== ni))} className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">পাবলিশ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">অ্যাডমিন পিন ভেরিফিকেশন</h2>
              <button onClick={() => setShowAdminPinModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleVerifyAdminPinModal} className="space-y-4">
              <input type="password" required value={adminInputPin} onChange={(e) => setAdminInputPin(e.target.value)} placeholder="সিক্রেট পিন দিন" className={`w-full border px-3 py-2.5 rounded-xl text-xs text-center tracking-widest ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">ভেরিফাই</button>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto">{userInfo?.name?.charAt(0)}</div>
            <div>
              <h2 className="text-lg font-bold">{userInfo?.name}</h2>
              <p className="text-xs text-indigo-400">রোল: {currentUser.roll}</p>
              <p className="text-xs text-slate-400">{userInfo?.semester}</p>
            </div>
            <button onClick={() => setShowProfileModal(false)} className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-700">বন্ধ করুন</button>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="lightbox" className="max-w-full max-h-[88vh] rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
}