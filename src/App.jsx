import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import emailjs from '@emailjs/browser';
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import {
  MessageSquare, ShieldCheck, Bell, Plus, Search, CheckCircle2, Clock,
  Heart, Trash2, Edit3, Image as ImageIcon, Video, Users, UserPlus,
  Megaphone, LogOut, Lock, Radio, Calendar, ExternalLink, X, Check, Award, CornerDownRight, ThumbsUp, KeyRound, Mail, GraduationCap
} from 'lucide-react';

// EmailJS Configuration (এখানে তোমার রিয়েল আইডিগুলো বসিয়ে নাও)
const EMAILJS_SERVICE_ID = 'service_cst-help26';
const EMAILJS_TEMPLATE_ID = 'template_r965t04';
const EMAILJS_PUBLIC_KEY = '_dvFgtl1UPcDlYxlb';

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
  const [activeReplyBox, setActiveReplyBox] = useState(null);

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
  const [teacherRoleType, setTeacherRoleType] = useState('teacher');

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
      setAuthError(`দুঃখিত! "${cleanId}" রোল বা আইডি ডিপার্টমেন্ট তালিকায় পাওয়া যায়নি।`);
      return;
    }

    try {
      const userDocRef = doc(db, 'helpdesk_users', cleanId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data().pin) {
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
      setAuthError('কানেকশন সমস্যা হয়েছে। আবার চেষ্টা করুন।');
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
        setAuthError('এই রোলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingUser({ ...userSnap.data(), roll: cleanId, email: cleanEmail });
      
      // EmailJS দিয়ে রিয়েল জিমেইলে ওটিপি পাঠানোর রিকোয়েস্ট
      const templateParams = {
        to_email: cleanEmail,
        otp_code: otp,
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
        .then((response) => {
          console.log('SUCCESS!', response.status, response.text);
          setAuthSuccessMsg(`✅ ভেরিফিকেশন কোড সফলভাবে আপনার ${cleanEmail} ঠিকানায় পাঠানো হয়েছে।`);
        })
        .catch((err) => {
          console.log('FAILED...', err);
          setAuthError('ইমেইল পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
          return;
        });

      setAuthStep('forgotPinVerify');
    } catch (err) {
      setAuthError('রিসেট রিকোয়েস্ট করতে সমস্যা হয়েছে।');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setAuthError('');
    if (inputOtp.trim() === generatedOtp) {
      setAuthSuccessMsg('কোড মিলেছে! এখন আপনার নতুন পিন সেট করুন।');
      setAuthStep('forgotPinReset');
    } else {
      setAuthError('ভুল ভেরিফিকেশন কোড দিয়েছেন!');
    }
  };

  const handleSaveNewPin = async (e) => {
    e.preventDefault();
    if (pin1 !== pin2) return setAuthError('দুটি পিন এক হয়নি!');
    try {
      const userDocRef = doc(db, 'helpdesk_users', pendingUser.roll);
      await updateDoc(userDocRef, { pin: pin1 });
      setAuthSuccessMsg('পিন সফলভাবে পরিবর্তন হয়েছে! এবার লগইন করুন।');
      setTimeout(() => {
        setAuthStep('verifyRoll');
        setPin1(''); setPin2(''); setInputOtp('');
      }, 1500);
    } catch (err) {
      setAuthError('পিন আপডেট করা যায়নি।');
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
    if (pin1 !== pin2) return setAuthError('দুটি পিন এক হয়নি!');
    try {
      await handleFinalLoginSuccess({
        ...pendingUser, pin: pin1, createdAt: new Date().toISOString()
      });
    } catch (err) {
      setAuthError('পিন সেভ করা যায়নি।');
    }
  };

  const handleLoginPin = async (e) => {
    e.preventDefault();
    try {
      const snap = await getDoc(doc(db, 'helpdesk_users', pendingUser.roll));
      if (snap.exists() && snap.data().pin === pin1) {
        await handleFinalLoginSuccess(pendingUser);
      } else {
        setAuthError('ভুল পিন দিয়েছেন!');
      }
    } catch (err) {
      setAuthError('লগইন সমস্যা হয়েছে।');
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
      showToastMsg(newAdminState ? '👑 অ্যাডমিন মোড অন হয়েছে!' : 'অ্যাডমিন মোড অফ হয়েছে!');
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
    showToastMsg(`${name} (${newMemberSem}) সফলভাবে সেভ হয়েছে!`);
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
    showToastMsg(`${name} (${semesterLabel}) সফলভাবে যুক্ত হয়েছেন!`);
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
    showToastMsg('নতুন মডারেটর সফলভাবে যুক্ত হয়েছে!');
  };

  const handleRemoveModerator = async (roll) => {
    const updatedMods = moderatorRolls.filter(r => r !== roll);
    await setDoc(doc(db, 'helpdesk_settings', 'roles'), { moderators: updatedMods }, { merge: true });
    showToastMsg('মডারেটর বাদ দেওয়া হয়েছে!');
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
      showToastMsg('পোস্ট পাবলিশ হয়েছে!');
    } catch (err) {
      showToastMsg('পোস্ট করতে সমস্যা হয়েছে', 'error');
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
    showToastMsg('কমেন্ট যোগ করা হয়েছে!');
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
    showToastMsg('রিপ্লাই দেওয়া হয়েছে!');
  };

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    const newSlot = { id: Date.now().toString(), day: rDay, title: rTitle, startTime: rStart, endTime: rEnd };
    const updated = [...routineList, newSlot];
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { routines: updated }, { merge: true });
    showToastMsg('রুটিনে নতুন সেশন যোগ হয়েছে!');
  };

  const handleDeleteRoutine = async (id) => {
    const updated = routineList.filter(r => r.id !== id);
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { routines: updated }, { merge: true });
    showToastMsg('রুটিন সেশন ডিলিট করা হয়েছে!');
  };

  const handleUpdateSupportSettings = async (field, value) => {
    await setDoc(doc(db, 'helpdesk_settings', 'support_session'), { [field]: value }, { merge: true });
    showToastMsg('সাপোর্ট সেটিংস আপডেট হয়েছে!');
  };

  const handleJoinSupportQueue = async (e) => {
    e.preventDefault();
    if (!supportProblem.trim()) return;
    const alreadyInQueue = supportQueue.some(q => q.roll === currentUser.roll);
    if (alreadyInQueue) return showToastMsg('তুমি ইতিমধ্যেই সিরিয়ালে আছো!', 'error');

    await addDoc(collection(db, 'helpdesk_support_queue'), {
      roll: currentUser.roll,
      name: userInfo.name,
      semester: userInfo.semester || '4th Semester',
      topic: supportTopic,
      problem: supportProblem.trim(),
      joinedAt: new Date().toISOString()
    });
    setSupportProblem('');
    showToastMsg('সাপোর্ট সিরিয়ালে যুক্ত হয়েছ!');
  };

  const handleCompleteStudentSupport = async (queueItem) => {
    await deleteDoc(doc(db, 'helpdesk_support_queue', queueItem.id));
    await addDoc(collection(db, 'helpdesk_notifications'), {
      targetRoll: queueItem.roll,
      text: `✅ তোমার লাইভ সাপোর্ট সেশন সম্পন্ন হয়েছে।`,
      read: false,
      createdAt: new Date().toISOString()
    });
    showToastMsg(`${queueItem.name}-এর সাপোর্ট সম্পন্ন মার্ক করা হয়েছে!`);
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
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার অফিশিয়াল জিমেইল *</label>
                <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
                সামনে এগিয়ে যান
              </button>
            </form>
          )}

          {authStep === 'createPin' && (
            <form onSubmit={handleCreatePin} className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-800 font-medium">
                👤 {pendingUser?.name} ({pendingUser?.roll}) — প্রথমবার লগইনের জন্য নতুন ৬ ডিজিটের সিক্রেট পিন সেট করুন।
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পিন দিন *</label>
                <input type="password" required maxLength="6" value={pin1} onChange={e => setPin1(e.target.value)} placeholder="যেমন: 123456"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পিনটি পুনরায় লিখুন *</label>
                <input type="password" required maxLength="6" value={pin2} onChange={e => setPin2(e.target.value)} placeholder="পুনরায় পিন"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
                পিন সেট ও লগইন করুন
              </button>
            </form>
          )}

          {authStep === 'loginPin' && (
            <form onSubmit={handleLoginPin} className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-800 font-medium">
                স্বাগতম, <b>{pendingUser?.name}</b>! আপনার সিক্রেট পিন দিয়ে প্রবেশ করুন।
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার সিক্রেট পিন *</label>
                <input type="password" required maxLength="6" value={pin1} onChange={e => setPin1(e.target.value)} placeholder="সিক্রেট পিন দিন"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
                লগইন করুন
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setAuthStep('forgotPinRequest')} className="text-xs text-indigo-600 hover:underline font-semibold">
                  পিন ভুলে গেছেন? রিসেট করুন
                </button>
              </div>
            </form>
          )}

          {authStep === 'forgotPinRequest' && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <p className="text-xs text-slate-500">আপনার রোল এবং জিমেইল দিয়ে ভেরিফিকেশন কোড নিন।</p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাস রোল / আইডি *</label>
                <input type="text" required value={authId} onChange={e => setAuthId(e.target.value)} placeholder="যেমন: 253203"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিশিয়াল জিমেইল *</label>
                <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
                কোড পাঠান
              </button>
              <button type="button" onClick={() => setAuthStep('verifyRoll')} className="w-full text-center text-xs text-slate-500 hover:underline">
                ফিরে যান
              </button>
            </form>
          )}

          {authStep === 'forgotPinVerify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">আপনার জিমেইলে পাঠানো ওটিপি কোড দিন *</label>
                <input type="text" required maxLength="6" value={inputOtp} onChange={e => setInputOtp(e.target.value)} placeholder="৬ ডিজিটের কোড"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm text-center tracking-widest font-bold" />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
                কোড ভেরিফাই করুন
              </button>
            </form>
          )}

          {authStep === 'forgotPinReset' && (
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পিন দিন *</label>
                <input type="password" required maxLength="6" value={pin1} onChange={e => setPin1(e.target.value)} placeholder="নতুন পিন"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পিন নিশ্চিত করুন *</label>
                <input type="password" required maxLength="6" value={pin2} onChange={e => setPin2(e.target.value)} placeholder="কনফার্ম পিন"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm">
                পিন পরিবর্তন সম্পন্ন করুন
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20" style={{ fontFamily: "'Inter', 'Hind Siliguri', sans-serif" }}>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className={`w-3 h-3 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <p className="text-sm font-medium">{toast.msg}</p>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleSecretTap}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white"/>
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                CST Help Desk {renderRoleBadge(currentUser.roll)}
              </h1>
              <p className="text-[10px] text-slate-400">Batch 24-25 | DPI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                <Bell className="w-5 h-5"/>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
                  <h3 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">রিয়েল-টাইম নোটিফিকেশন</h3>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">কোনো নতুন নোটিফিকেশন নেই</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-800 text-xs text-slate-200 border border-slate-700/50">
                          {n.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {userInfo.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden sm:inline">{userInfo.name}</span>
            </button>

            <button onClick={handleLogout} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400">
              <LogOut className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-2 sticky top-[65px] z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'feed', label: 'কোডিং ফিড & হেল্প', icon: MessageSquare },
            { id: 'notices', label: 'নোটিশ বোর্ড', icon: Megaphone },
            { id: 'support', label: 'লাইভ সাপোর্ট & রুটিন', icon: Radio, badge: liveStatus.isLive ? 'LIVE' : null },
            { id: 'directory', label: 'ডিপার্টমেন্ট ডিরেক্টরি', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}>
                <Icon className="w-4 h-4"/>
                {tab.label}
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-extrabold animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500"/>
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="কোডিং সমস্যা বা পোস্ট খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold outline-none">
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="open">Open (চলমান)</option>
                  <option value="solved">Solved (সমাধানকৃত)</option>
                </select>

                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold outline-none">
                  <option value="ALL">সকল ক্যাটাগরি</option>
                  <option value="Coding / Programming">Coding / Programming</option>
                  <option value="Lab Practical">Lab Practical</option>
                  <option value="Hardware / Peripherals">Hardware / Peripherals</option>
                  <option value="Academic Question">Academic Question</option>
                  <option value="General Discussion">General Discussion</option>
                </select>

                <button onClick={() => setShowCreatePost(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg">
                  <Plus className="w-4 h-4"/> প্রশ্ন করুন / পোস্ট দিন
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                  কোনো পোস্ট বা প্রশ্ন পাওয়া যায়নি। প্রথম প্রশ্নটি আপনিই করুন!
                </div>
              ) : (
                filteredPosts.map(post => {
                  const isLiked = (post.likes || []).includes(currentUser.roll);
                  const canDelete = hasStaffPower || post.authorRoll === currentUser.roll;
                  return (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center">
                            {post.authorName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              {post.authorName} {renderRoleBadge(post.authorRoll, post.authorRole)}
                            </h4>
                            <p className="text-[10px] text-slate-400">রোল: {post.authorRoll} • {post.authorSemester}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${post.status === 'solved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {post.status === 'solved' ? 'Solved' : 'Open'}
                          </span>
                          {canDelete && (
                            <button onClick={async () => {
                              if (window.confirm('পোস্টটি ডিলিট করতে চান?')) {
                                await deleteDoc(doc(db, 'helpdesk_posts', post.id));
                                showToastMsg('পোস্ট ডিলিট করা হয়েছে!');
                              }
                            }} className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-600/10 text-indigo-400 text-[10px] font-bold mb-2">
                          {post.category}
                        </span>
                        <h3 className="text-base font-bold text-white mb-2">{post.title}</h3>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{post.description}</p>
                      </div>

                      {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {post.images.map((img, idx) => (
                            <img key={idx} src={img} alt="attachment" onClick={() => setLightboxImg(img)}
                              className="w-full h-48 object-cover rounded-2xl cursor-pointer hover:opacity-90 border border-slate-800" />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-3 border-t border-slate-800 text-xs">
                        <button onClick={async () => {
                          const likes = post.likes || [];
                          const newLikes = isLiked ? likes.filter(r => r !== currentUser.roll) : [...likes, currentUser.roll];
                          await updateDoc(doc(db, 'helpdesk_posts', post.id), { likes: newLikes });
                        }} className={`flex items-center gap-1.5 font-bold ${isLiked ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
                          <ThumbsUp className="w-4 h-4"/> {post.likes?.length || 0} লাইক
                        </button>

                        {hasStaffPower && (
                          <button onClick={async () => {
                            const newStatus = post.status === 'solved' ? 'open' : 'solved';
                            await updateDoc(doc(db, 'helpdesk_posts', post.id), { status: newStatus });
                            showToastMsg(`পোস্টটি ${newStatus} করা হয়েছে!`);
                          }} className="text-indigo-400 hover:underline font-bold">
                            স্ট্যাটাস পরিবর্তন ({post.status === 'solved' ? 'Open করুন' : 'Solved করুন'})
                          </button>
                        )}
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-800">
                        <h5 className="text-xs font-bold text-slate-400">মন্তব্যসমূহ ({post.comments?.length || 0})</h5>

                        {(post.comments || []).map(comment => {
                          const isCommentLiked = (comment.likes || []).includes(currentUser.roll);
                          return (
                            <div key={comment.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                                    {comment.authorName.charAt(0)}
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-bold text-white flex items-center gap-1.5">
                                      {comment.authorName} {renderRoleBadge(comment.authorRoll, comment.authorRole)}
                                    </h6>
                                    <p className="text-[9px] text-slate-400">রোল: {comment.authorRoll}</p>
                                  </div>
                                </div>

                                {(hasStaffPower || comment.authorRoll === currentUser.roll) && (
                                  <button onClick={async () => {
                                    const updated = post.comments.filter(c => c.id !== comment.id);
                                    await updateDoc(doc(db, 'helpdesk_posts', post.id), { comments: updated });
                                    showToastMsg('কমেন্ট ডিলিট করা হয়েছে!');
                                  }} className="text-slate-500 hover:text-rose-400 text-xs">
                                    <Trash2 className="w-3.5 h-3.5"/>
                                  </button>
                                )}
                              </div>

                              <p className="text-xs text-slate-200 whitespace-pre-wrap pl-9">{comment.text}</p>

                              {comment.images && comment.images.length > 0 && (
                                <div className="pl-9 grid grid-cols-3 gap-2 mt-2">
                                  {comment.images.map((img, i) => (
                                    <img key={i} src={img} alt="comment-att" onClick={() => setLightboxImg(img)}
                                      className="w-full h-24 object-cover rounded-xl cursor-pointer border border-slate-800" />
                                  ))}
                                </div>
                              )}

                              <div className="pl-9 flex items-center gap-4 pt-1 text-[11px]">
                                <button onClick={() => handleCommentLike(post, comment.id)} className={`flex items-center gap-1 font-bold ${isCommentLiked ? 'text-indigo-400' : 'text-slate-400'}`}>
                                  <ThumbsUp className="w-3 h-3"/> {comment.likes?.length || 0}
                                </button>
                                <button onClick={() => setActiveReplyBox(activeReplyBox === comment.id ? null : comment.id)} className="text-indigo-400 font-bold hover:underline">
                                  রিপ্লাই ({comment.replies?.length || 0})
                                </button>
                              </div>

                              {comment.replies && comment.replies.length > 0 && (
                                <div className="pl-9 space-y-2 mt-2 pt-2 border-t border-slate-800/60">
                                  {comment.replies.map(reply => (
                                    <div key={reply.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                          <CornerDownRight className="w-3 h-3 text-indigo-400"/> {reply.authorName} {renderRoleBadge(reply.authorRoll, reply.authorRole)}
                                        </span>
                                        {(hasStaffPower || reply.authorRoll === currentUser.roll) && (
                                          <button onClick={async () => {
                                            const updatedComments = post.comments.map(c => {
                                              if (c.id === comment.id) {
                                                return { ...c, replies: c.replies.filter(r => r.id !== reply.id) };
                                              }
                                              return c;
                                            });
                                            await updateDoc(doc(db, 'helpdesk_posts', post.id), { comments: updatedComments });
                                            showToastMsg('রিপ্লাই ডিলিট করা হয়েছে!');
                                          }} className="text-slate-500 hover:text-rose-400">
                                            <Trash2 className="w-3 h-3"/>
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-300 pl-4">{reply.text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {activeReplyBox === comment.id && (
                                <form onSubmit={e => handleAddReply(e, post, comment.id)} className="pl-9 flex gap-2 mt-2">
                                  <input type="text" value={replyTexts[comment.id] || ''} onChange={e => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                    placeholder="রিপ্লাই লিখুন..." className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500" />
                                  <button type="submit" className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                                    রিপ্লাই দিন
                                  </button>
                                </form>
                              )}
                            </div>
                          );
                        })}

                        <form onSubmit={e => handleAddComment(e, post)} className="space-y-2 pt-2">
                          <div className="flex gap-2">
                            <input type="text" value={commentTexts[post.id] || ''} onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="একটি মন্তব্য করুন অথবা ছবি যুক্ত করুন..." className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500" />
                            <label className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer flex items-center justify-center">
                              <ImageIcon className="w-4 h-4"/>
                              <input type="file" accept="image/*" multiple onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                const compressed = await Promise.all(files.map(f => compressImageFile(f)));
                                setCommentImagesMap(prev => ({ ...prev, [post.id]: [...(prev[post.id] || []), ...compressed].slice(0, 6) }));
                                e.target.value = '';
                              }} className="hidden" />
                            </label>
                            <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                              কমেন্ট
                            </button>
                          </div>

                          {commentImagesMap[post.id] && commentImagesMap[post.id].length > 0 && (
                            <div className="flex gap-2 flex-wrap pt-1">
                              {commentImagesMap[post.id].map((img, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => {
                                    const filtered = commentImagesMap[post.id].filter((_, i) => i !== idx);
                                    setCommentImagesMap(prev => ({ ...prev, [post.id]: filtered }));
                                  }} className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]">
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">ডিপার্টমেন্ট নোটিশ বোর্ড</h2>
                <p className="text-xs text-slate-400 mt-0.5">অফিশিয়াল ক্লাস নোটিশ ও গুরুত্বপূর্ণ ঘোষণা</p>
              </div>
              {hasStaffPower && (
                <button onClick={() => setShowAddNotice(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg">
                  <Plus className="w-4 h-4"/> নোটিশ দিন
                </button>
              )}
            </div>

            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                  কোনো নোটিশ নেই।
                </div>
              ) : (
                notices.map(notice => (
                  <div key={notice.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                          <Megaphone className="w-5 h-5"/>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{notice.authorName}</h4>
                          <p className="text-[10px] text-slate-400">{new Date(notice.createdAt).toLocaleString('bn-BD')}</p>
                        </div>
                      </div>

                      {hasStaffPower && (
                        <button onClick={async () => {
                          if (window.confirm('নোটিশটি ডিলিট করতে চান?')) {
                            await deleteDoc(doc(db, 'helpdesk_notices', notice.id));
                            showToastMsg('নোটিশ ডিলিট করা হয়েছে!');
                          }
                        }} className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{notice.title}</h3>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{notice.description}</p>

                    {notice.images && notice.images.length > 0 && (
                      <div className={`grid gap-2 ${notice.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {notice.images.map((img, idx) => (
                          <img key={idx} src={img} alt="notice-att" onClick={() => setLightboxImg(img)}
                            className="w-full h-56 object-cover rounded-2xl cursor-pointer border border-slate-800" />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className={`rounded-3xl p-6 border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${liveStatus.isLive ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className={`w-3 h-3 rounded-full ${liveStatus.isLive ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
                  <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                    {liveStatus.isLive ? 'লাইভ সাপোর্ট সেশন চালু আছে' : 'বর্তমানে কোনো লাইভ সেশন নেই'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{liveStatus.isLive ? liveStatus.sessionTitle : 'নির্ধারিত রুটিন অনুযায়ী সাপোর্ট সেশন অনুষ্ঠিত হয়'}</h2>
                <p className="text-xs text-slate-300">{liveStatus.isLive ? `সময়: ${liveStatus.timeRange}` : 'নিচে রুটিন চেক করুন এবং সিরিয়ালে নাম যুক্ত করুন।'}</p>
              </div>

              {liveStatus.isLive && supportConfig.meetLink && (
                <a href={supportConfig.meetLink} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl flex items-center gap-2 text-sm whitespace-nowrap">
                  <Video className="w-5 h-5"/> গুগল মিট জয়েন করুন <ExternalLink className="w-4 h-4"/>
                </a>
              )}
            </div>

            {hasStaffPower && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400"/> লাইভ সাপোর্ট কন্ট্রোল প্যানেল
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">গুগল মিট লিংক সেট করুন</label>
                    <div className="flex gap-2">
                      <input type="text" defaultValue={supportConfig.meetLink} onBlur={e => handleUpdateSupportSettings('meetLink', e.target.value)}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx" className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">সেশন স্ট্যাটাস ফোর্স কন্ট্রোল</label>
                    <select value={supportConfig.forceStatus} onChange={e => handleUpdateSupportSettings('forceStatus', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold outline-none">
                      <option value="auto">অটো (রুটিন অনুযায়ী)</option>
                      <option value="open">ফোর্স ওপেন (সব সময় লাইভ)</option>
                      <option value="closed">ফোর্স ক্লোজড (বন্ধ রাখুন)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400"/> সাপোর্ট সিরিয়ালে নাম লিখুন
              </h3>

              <form onSubmit={handleJoinSupportQueue} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">সমস্যার বিষয় / টপিক *</label>
                    <select value={supportTopic} onChange={e => setSupportTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none">
                      <option value="Coding / Lab Problem">Coding / Lab Problem</option>
                      <option value="C Programming Debugging">C Programming Debugging</option>
                      <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                      <option value="HTML / Web Lab">HTML / Web Lab</option>
                      <option value="General Academic Help">General Academic Help</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">আপনার সমস্যা সংক্ষেপে লিখুন *</label>
                    <input type="text" required value={supportProblem} onChange={e => setSupportProblem(e.target.value)}
                      placeholder="যেমন: পয়েন্টার লজিক বুঝতে পারছি না..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg">
                  সাপোর্ট সিরিয়ালে নাম যুক্ত করুন
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">বর্তমান সাপোর্ট সিরিয়াল ({supportQueue.length})</h3>

              {supportQueue.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">বর্তমানে কেউ সিরিয়ালে নেই।</p>
              ) : (
                <div className="space-y-3">
                  {supportQueue.map((item, index) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.name} (রোল: {item.roll})</h4>
                          <p className="text-xs text-indigo-300 font-semibold mt-0.5">টপিক: {item.topic}</p>
                          <p className="text-xs text-slate-300 mt-1">সমস্যা: {item.problem}</p>
                        </div>
                      </div>

                      {hasStaffPower && (
                        <button onClick={() => handleCompleteStudentSupport(item)} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow">
                          সম্পন্ন করুন
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400"/> সাপ্তাহিক সাপোর্ট রুটিন
                </h3>
              </div>

              {hasStaffPower && (
                <form onSubmit={handleAddRoutine} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">বার</label>
                    <select value={rDay} onChange={e => setRDay(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none">
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{DAYS_BN[d]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">সেশনের নাম</label>
                    <input type="text" value={rTitle} onChange={e => setRTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">শুরু</label>
                    <input type="time" value={rStart} onChange={e => setRStart(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">শেষ</label>
                    <input type="time" value={rEnd} onChange={e => setREnd(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
                  </div>
                  <button type="submit" className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                    রুটিন যোগ করুন
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS_OF_WEEK.map(day => {
                  const dayRoutines = routineList.filter(r => r.day === day);
                  return (
                    <div key={day} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{DAYS_BN[day]} ({day})</h4>
                      {dayRoutines.length === 0 ? (
                        <p className="text-xs text-slate-500">কোনো সেশন নেই</p>
                      ) : (
                        <div className="space-y-2">
                          {dayRoutines.map(r => (
                            <div key={r.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-white">{r.title}</p>
                                <p className="text-[10px] text-slate-400">{formatTime12h(r.startTime)} - {formatTime12h(r.endTime)}</p>
                              </div>
                              {hasStaffPower && (
                                <button onClick={() => handleDeleteRoutine(r.id)} className="text-slate-500 hover:text-rose-400">
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">ডিপার্টমেন্ট মেম্বার ডিরেক্টরি</h2>
                <p className="text-xs text-slate-400 mt-0.5">CST Batch 24-25 এবং শিক্ষকবৃন্দ</p>
              </div>

              {hasStaffPower && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setShowManageDirectory(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow">
                    <UserPlus className="w-4 h-4"/> ছাত্র / মেম্বার যোগ করুন
                  </button>
                  <button onClick={() => setShowManageTeacherModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow">
                    <Award className="w-4 h-4"/> শিক্ষক / CI যোগ করুন
                  </button>
                  <button onClick={() => setShowManageMods(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow">
                    <ShieldCheck className="w-4 h-4"/> মডারেটর ম্যানেজ
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(membersDirectory).map(([roll, member]) => (
                <div key={roll} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold text-base flex items-center justify-center">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {member.name} {renderRoleBadge(roll, member.role)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">রোল: {roll}</p>
                      <p className="text-[10px] text-slate-500">{member.semester}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-400"/>
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showCreatePost && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">নতুন প্রশ্ন বা পোস্ট তৈরি করুন</h3>
              <button onClick={() => setShowCreatePost(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ক্যাটাগরি *</label>
                <select value={postCategory} onChange={e => setPostCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none">
                  <option value="Coding / Programming">Coding / Programming</option>
                  <option value="Lab Practical">Lab Practical</option>
                  <option value="Hardware / Peripherals">Hardware / Peripherals</option>
                  <option value="Academic Question">Academic Question</option>
                  <option value="General Discussion">General Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">শিরোনাম *</label>
                <input type="text" required value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="যেমন: সি প্রোগ্রামিং পয়েন্টার এরর..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">বিস্তারিত বর্ণনা *</label>
                <textarea required rows="4" value={postDesc} onChange={e => setPostDesc(e.target.value)} placeholder="আপনার সমস্যা বা আলোচনা বিস্তারিত লিখুন..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ছবি যুক্ত করুন (সর্বোচ্চ ৫টি)</label>
                <input type="file" accept="image/*" multiple onChange={handlePostImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
              </div>

              {postImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {postImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" disabled={isSubmittingPost}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg">
                {isSubmittingPost ? 'পোস্ট হচ্ছে...' : 'পোস্ট পাবলিশ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">নতুন নোটিশ বা ঘোষণা দিন</h3>
              <button onClick={() => setShowAddNotice(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!postTitle.trim() || !postDesc.trim()) return;
              try {
                await addDoc(collection(db, 'helpdesk_notices'), {
                  title: postTitle.trim(),
                  description: postDesc.trim(),
                  images: noticeImages,
                  authorName: userInfo.name,
                  authorRoll: currentUser.roll,
                  createdAt: new Date().toISOString()
                });
                setPostTitle(''); setPostDesc(''); setNoticeImages([]);
                setShowAddNotice(false);
                showToastMsg('নোটিশ পাবলিশ হয়েছে!');
              } catch (err) {
                showToastMsg('নোটিশ দিতে সমস্যা হয়েছে', 'error');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">নোটিশ শিরোনাম *</label>
                <input type="text" required value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="যেমন: ৪র্থ সেমিস্টার ল্যাব ক্লাস রুটিন..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">বিস্তারিত বিবরণ *</label>
                <textarea required rows="4" value={postDesc} onChange={e => setPostDesc(e.target.value)} placeholder="নোটিশের বিস্তারিত লিখুন..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ছবি যুক্ত করুন (সর্বোচ্চ ৩টি)</label>
                <input type="file" accept="image/*" multiple onChange={handleNoticeImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
              </div>

              {noticeImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {noticeImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNoticeImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg">
                নোটিশ পাবলিশ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {showManageDirectory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">নতুন ছাত্র / মেম্বার যোগ করুন</h3>
              <button onClick={() => setShowManageDirectory(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddMemberToDirectory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ক্লাস রোল *</label>
                <input type="text" required value={newMemberId} onChange={e => setNewMemberId(e.target.value)} placeholder="যেমন: 201635"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">পূর্ণ নাম *</label>
                <input type="text" required value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Student Name"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">অফিশিয়াল জিমেইল *</label>
                <input type="email" required value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} placeholder="student@gmail.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">সেমিস্টার</label>
                <input type="text" value={newMemberSem} onChange={e => setNewMemberSem(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {showManageTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">শিক্ষক বা চিফ ইনস্ট্রাক্টর যোগ করুন</h3>
              <button onClick={() => setShowManageTeacherModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddTeacherOrCi} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ভূমিকা নির্বাচন করুন *</label>
                <select value={teacherRoleType} onChange={e => setTeacherRoleType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none">
                  <option value="teacher">Faculty / Teacher (স্যার)</option>
                  <option value="ci_sir">Chief Instructor - CI (সিআই স্যার)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">আইডি / কোড *</label>
                <input type="text" required value={teacherId} onChange={e => setTeacherId(e.target.value)} placeholder="যেমন: T-01 বা CI-01"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">পূর্ণ নাম *</label>
                <input type="text" required value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Teacher Name"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">অফিশিয়াল জিমেইল *</label>
                <input type="email" required value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} placeholder="teacher@gmail.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs">
                সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {showManageMods && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">মডারেটর ও মেন্টর ম্যানেজ করুন</h3>
              <button onClick={() => setShowManageMods(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddModerator} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ছাত্রের ক্লাস রোল দিন *</label>
                <div className="flex gap-2">
                  <input type="text" required value={modInputRoll} onChange={e => setModInputRoll(e.target.value)} placeholder="যেমন: 201605"
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none" />
                  <button type="submit" className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs">
                    যুক্ত করুন
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-800 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-slate-400">বর্তমান মডারেটরগণ:</p>
              {moderatorRolls.map(roll => {
                const mem = membersDirectory[roll];
                return (
                  <div key={roll} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800 text-xs">
                    <div>
                      <p className="font-bold text-white">{mem ? mem.name : 'Unknown'} ({roll})</p>
                    </div>
                    {roll !== "201605" && (
                      <button onClick={() => handleRemoveModerator(roll)} className="text-rose-400 hover:underline font-bold">
                        বাদ দিন
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6"/>
            </div>
            <h3 className="text-base font-bold text-white">অ্যাডমিন সিক্রেট পিন দিন</h3>
            <form onSubmit={handleVerifyAdminPinModal} className="space-y-3">
              <input type="password" required maxLength="6" value={adminInputPin} onChange={e => setAdminInputPin(e.target.value)}
                placeholder="সিক্রেট পিন" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-sm font-bold text-white outline-none tracking-widest" />
              <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg">
                যাচাই করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">আপনার প্রফাইল</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <p className="text-slate-400">নাম:</p>
                <p className="font-bold text-white text-sm">{userInfo.name}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <p className="text-slate-400">রোল / আইডি:</p>
                <p className="font-bold text-white">{currentUser.roll}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <p className="text-slate-400">অফিশিয়াল জিমেইল:</p>
                <p className="font-bold text-white">{userInfo.email}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                <p className="text-slate-400">সেমিস্টার / রোল:</p>
                <p className="font-bold text-white">{userInfo.semester}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-4xl w-full">
            <button onClick={() => setLightboxImg(null)} className="absolute -top-10 right-0 text-white p-2">
              <X className="w-8 h-8"/>
            </button>
            <img src={lightboxImg} alt="lightbox" className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}