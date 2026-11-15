import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import emailjs from '@emailjs/browser';
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import {
  MessageSquare, ShieldCheck, Bell, Plus, Search, CheckCircle2, Clock,
  Heart, Trash2, Edit3, Image as ImageIcon, Video, Users, UserPlus,
  Megaphone, LogOut, Lock, Radio, Calendar, ExternalLink, X, Check, Award, CornerDownRight, ThumbsUp, KeyRound, Mail, GraduationCap, ShieldAlert, Sun, Moon
} from 'lucide-react';

const EMAILJS_SERVICE_ID = 'service_cst-help26';
const EMAILJS_TEMPLATE_ID = 'template_r965t04';
const EMAILJS_PUBLIC_KEY = '_dvFgtl1UPcDlYxlb';

const DEFAULT_MEMBERS = {
  "253203": { name: "Sourov Islam", role: "admin", semester: "4th Semester", email: "sourov@gmail.com" },
  "272029": { name: "Sabina Murmu", role: "student", semester: "4th Semester", email: "sabina@gmail.com" },
  "272032": { name: "Irfan Ali", role: "student", semester: "4th Semester", email: "irfan@gmail.com" },
  "201605": { name: "Nurnobi", role: "student", semester: "4th Semester", email: "nurnobi@gmail.com" }
};

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
    const isResetDone = localStorage.getItem('hd_fresh_start_v24');
    if (!isResetDone) {
      localStorage.clear();
      localStorage.setItem('hd_fresh_start_v24', 'true');
      window.location.reload();
    }
  }, []);

  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('hd_verified_user') || 'null'));
  const [isAdminMode, setIsAdminMode] = useState(() => localStorage.getItem('hd_admin_mode') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('hd_dark_mode') !== 'false');
  const [membersDirectory, setMembersDirectory] = useState(DEFAULT_MEMBERS);
  const [moderatorRolls, setModeratorRolls] = useState(["201605"]);

  const [directorySemFilter, setDirectorySemFilter] = useState('ALL');

  // Auth States
  const [authStep, setAuthStep] = useState('verifyRoll');
  const [authId, setAuthId] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');

  const [activeTab, setActiveTab] = useState('feed');
  const [toast, setToast] = useState(null);

  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

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
  
  // স্টাফ পাওয়ার: শুধুমাত্র অ্যাডমিন অথবা মডারেটর হলেই সত্য হবে
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
    const cleanEmail = authEmail.trim().toLowerCase();
    const member = membersDirectory[cleanId];

    if (!member) {
      setAuthError(`দুঃখিত! "${cleanId}" রোল বা আইডি ডিপার্টমেন্ট তালিকায় পাওয়া যায়নি।`);
      return;
    }

    try {
      const userDocRef = doc(db, 'helpdesk_users', cleanId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const existingData = userSnap.data();
        if (existingData.email && existingData.email.toLowerCase() !== cleanEmail) {
          setAuthError('সিকিউরিটি অ্যালার্ট: এই রোলের জন্য পূর্বে অন্য জিমেইল রেজিস্টার্ড করা আছে। শুধুমাত্র সেই একই জিমেইল দিয়ে প্রবেশ করতে পারবেন!');
          return;
        }

        if (existingData.pin) {
          const userPayload = { ...existingData, roll: cleanId, email: cleanEmail };
          setPendingUser(userPayload);
          setAuthStep('loginPin');
          return;
        }
      }

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

      const existingData = userSnap.data();
      if (existingData.email && existingData.email.toLowerCase() !== cleanEmail) {
        setAuthError('সিকিউরিটি অ্যালার্ট: এই রোলে রেজিস্টার্ড জিমেইলের সাথে আপনার দেওয়া জিমেইল মিলছে না!');
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingUser({ ...existingData, roll: cleanId, email: cleanEmail });
      
      const templateParams = {
        to_email: cleanEmail,
        otp_code: otp,
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
        .then((response) => {
          setAuthSuccessMsg(`✅ ভেরিফিকেশন কোড সফলভাবে আপনার ${cleanEmail} ঠিকানায় পাঠানো হয়েছে।`);
        })
        .catch((err) => {
          setAuthError('ইমেইল পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
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
    showToastMsg(`${name} সফলভাবে যুক্ত হয়েছে!`);
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

  // ডাটাবেজ সহ সরাসরি মেম্বার ডিলিট করার ফাংশন (শুধুমাত্র অ্যাডমিন বা মডারেটরদের জন্য)
  const handleDeleteMemberFromDirectory = async (id, name) => {
    if (!hasStaffPower) {
      showToastMsg('আপনার মেম্বার ডিলিট করার অনুমতি নেই!', 'error');
      return;
    }
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" কে ডাটাবেজ ও ডিরেক্টরি থেকে স্থায়ীভাবে বাদ দিতে চান?`)) {
      try {
        const updatedMembers = { ...membersDirectory };
        delete updatedMembers[id];
        // ফায়ারবেস ডাটাবেজে আপডেট করা হচ্ছে যাতে রিয়েল-টাইমে সবার ডাটা থেকে মুছে যায়
        await setDoc(doc(db, 'helpdesk_settings', 'directory'), { members: updatedMembers }, { merge: true });
        setMembersDirectory(updatedMembers);
        showToastMsg(`${name} সফলভাবে ডাটাবেজ থেকে ডিলিট করা হয়েছে!`);
      } catch (err) {
        showToastMsg('ডাটাবেজ থেকে ডিলিট করতে সমস্যা হয়েছে!', 'error');
      }
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
    showToastMsg('সাপোর্ট সিরিয়ালে নাম যুক্ত হয়েছ!');
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

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await updateDoc(doc(db, 'helpdesk_notifications', notif.id), { read: true });
      } catch (e) {}
    }
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
                <input
                  type="text"
                  required
                  value={authId}
                  onChange={(e) => setAuthId(e.target.value)}
                  placeholder="যেমন: 201605 বা 253203"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফিশিয়াল জিমেইল *</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">⚠️ একবার জিমেইল সেট হলে পরবর্তীতে অন্য জিমেইল দিয়ে এই রোল অ্যাক্সেস করা যাবে না।</p>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
              >
                পরবর্তী ধাপ
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthError(''); setAuthSuccessMsg(''); setAuthStep('forgotPinRequest'); }}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  পিন ভুলে গেছেন? রিসেট করুন
                </button>
              </div>
            </form>
          )}

          {authStep === 'createPin' && (
            <form onSubmit={handleCreatePin} className="space-y-4">
              <p className="text-xs text-slate-600 bg-indigo-50 p-3 rounded-xl">
                স্বাগতম <b>{pendingUser?.name}</b>! আপনার অ্যাকাউন্ট সুরক্ষার জন্য একটি ৪-৬ ডিজিটের সিক্রেট পিন সেট করুন।
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সিক্রেট পিন দিন *</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin1}
                  onChange={(e) => setPin1(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পিন কনফার্ম করুন *</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center focus:outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                পিন সেট ও লগইন করুন
              </button>
            </form>
          )}

          {authStep === 'loginPin' && (
            <form onSubmit={handleLoginPin} className="space-y-4">
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                ফিরে আসার জন্য স্বাগতম, <b>{pendingUser?.name}</b>! আপনার সিক্রেট পিন দিয়ে প্রবেশ করুন।
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সিক্রেট পিন দিন *</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin1}
                  onChange={(e) => setPin1(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center focus:outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                লগইন করুন
              </button>
              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setAuthStep('verifyRoll'); setPin1(''); }}
                  className="text-slate-500 hover:underline"
                >
                  ← রোল পরিবর্তন করুন
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthError(''); setAuthSuccessMsg(''); setAuthId(pendingUser?.roll || ''); setAuthStep('forgotPinRequest'); }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  পিন রিসেট করুন
                </button>
              </div>
            </form>
          )}

          {authStep === 'forgotPinRequest' && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                🔒 পিন রিসেট করতে আপনার সঠিক রোল এবং পূর্বে রেজিস্টার্ড জিমেইল দিন। জিমেইলে ওটিপি কোড পাঠানো হবে।
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাস রোল / আইডি *</label>
                <input
                  type="text"
                  required
                  value={authId}
                  onChange={(e) => setAuthId(e.target.value)}
                  placeholder="যেমন: 201605"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পূর্বে রেজিস্টার্ড জিমেইল *</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                ওটিপি কোড পাঠান
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthStep('verifyRoll')}
                  className="text-xs text-slate-500 hover:underline"
                >
                  ← লগইনে ফিরে যান
                </button>
              </div>
            </form>
          )}

          {authStep === 'forgotPinVerify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-xs text-slate-600 bg-indigo-50 p-3 rounded-xl">
                আপনার জিমেইলে পাঠানো ৬ ডিজিটের ভেরিফিকেশন কোডটি এখানে লিখুন।
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ভেরিফিকেশন কোড *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center focus:outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                কোড যাচাই করুন
              </button>
            </form>
          )}

          {authStep === 'forgotPinReset' && (
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <p className="text-xs text-slate-600 bg-emerald-50 p-3 rounded-xl text-emerald-800">
                ভেরিফিকেশন সফল! এখন নতুন পিন সেট করুন।
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পিন *</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin1}
                  onChange={(e) => setPin1(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পিন কনফার্ম করুন *</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest text-center focus:outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                নতুন পিন সেভ করুন
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-16 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} style={{ fontFamily: "'Inter', 'Hind Siliguri', sans-serif" }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 border px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-medium ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          {toast.type === 'error' ? <X className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleSecretTap}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CST Help Desk</h1>
                {isMainAdmin && <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">Admin</span>}
              </div>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Batch 24-25 | DPI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title="থিম পরিবর্তন করুন"
              className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-indigo-600 hover:bg-slate-300'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`relative p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 border rounded-2xl shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <div className={`p-3 border-b flex justify-between items-center text-xs font-bold ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <span>রিয়েল-টাইম নোটিফিকেশন</span>
                    <button onClick={() => setShowNotifDropdown(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`max-h-80 overflow-y-auto divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">কোনো নতুন নোটিফিকেশন নেই</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs flex items-start gap-2.5 transition-all cursor-pointer ${n.read ? (isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500') : (isDarkMode ? 'bg-slate-800/60 text-slate-200 font-semibold' : 'bg-indigo-50/60 text-slate-900 font-semibold')}`}
                        >
                          <span className="mt-0.5">{n.read ? <Check className="w-4 h-4 text-slate-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}</span>
                          <p className="leading-relaxed">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'}`}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline">{userInfo?.name}</span>
            </button>

            <button
              onClick={handleLogout}
              title="লগআউট"
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'feed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700')}`}
          >
            <MessageSquare className="w-4 h-4" /> কোডিং ফিড & হেল্প
          </button>
          <button
            onClick={() => setActiveTab('notice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'notice' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700')}`}
          >
            <Megaphone className="w-4 h-4" /> নোটিশ বোর্ড
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'support' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700')}`}
          >
            <Radio className="w-4 h-4" /> লাইভ সাপোর্ট & রুটিন {liveStatus.isLive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700')}`}
          >
            <Users className="w-4 h-4" /> ডিপার্টমেন্টাল ডিরেক্টরি
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* --- TAB 1: FEED & HELP --- */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className={`border p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কোডিং সমস্যা বা পোস্ট খুঁজুন..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="open">Open (চলমান)</option>
                  <option value="solved">Solved (সমাধানকৃত)</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  <option value="ALL">সকল ক্যাটাগরি</option>
                  <option value="Coding / Programming">Coding / Programming</option>
                  <option value="Lab Practical">Lab Practical</option>
                  <option value="Hardware / Peripherals">Hardware / Peripherals</option>
                  <option value="Academic Question">Academic Question</option>
                  <option value="General Discussion">General Discussion</option>
                </select>

                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 ml-auto"
                >
                  <Plus className="w-4 h-4" /> প্রশ্ন করুন / পোস্ট দিন
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className={`border rounded-2xl p-12 text-center text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}>
                  কোনো পোস্ট পাওয়া যায়নি। প্রথম প্রশ্নটি আপনিই করুন!
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className={`border rounded-2xl p-5 shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.authorName}</span>
                            <span className="text-[10px] text-slate-400">রোল: {post.authorRoll}</span>
                            {renderRoleBadge(post.authorRoll, post.authorRole)}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(post.createdAt).toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${post.status === 'solved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {post.status === 'solved' ? 'Solved (সমাধানকৃত)' : 'Open (চলমান)'}
                        </span>
                        {(hasStaffPower || currentUser.roll === post.authorRoll) && (
                          <button
                            onClick={async () => {
                              const newStatus = post.status === 'solved' ? 'open' : 'solved';
                              await updateDoc(doc(db, 'helpdesk_posts', post.id), { status: newStatus });
                              showToastMsg('পোস্ট স্ট্যাটাস আপডেট হয়েছে!');
                            }}
                            className={`p-1.5 rounded-lg text-[10px] ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                            title="স্ট্যাটাস পরিবর্তন করুন"
                          >
                            🔄
                          </button>
                        )}
                        {(hasStaffPower || currentUser.roll === post.authorRoll) && (
                          <button
                            onClick={async () => {
                              if (window.confirm('এই পোস্টটি ডিলিট করতে চান?')) {
                                await deleteDoc(doc(db, 'helpdesk_posts', post.id));
                                showToastMsg('পোস্ট ডিলিট করা হয়েছে!');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold mb-2">
                        {post.category}
                      </span>
                      <h2 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.title}</h2>
                      <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{post.description}</p>
                    </div>

                    {post.images && post.images.length > 0 && (
                      <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                        {post.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="post-img"
                            onClick={() => setLightboxImg(img)}
                            className="w-full h-40 object-cover rounded-xl border border-slate-800 cursor-pointer hover:opacity-95"
                          />
                        ))}
                      </div>
                    )}

                    {post.videoUrl && (
                      <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <Video className="w-4 h-4 text-indigo-400" />
                        <a href={post.videoUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate">
                          {post.videoUrl}
                        </a>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className={`pt-3 border-t space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <h3 className="text-xs font-bold text-slate-400">কমেন্টস ({post.comments?.length || 0})</h3>

                      <div className="space-y-3">
                        {(post.comments || []).map(comm => (
                          <div key={comm.id} className={`p-3 rounded-xl border space-y-2 ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{comm.authorName}</span>
                                <span className="text-[10px] text-slate-500">রোল: {comm.authorRoll}</span>
                                {renderRoleBadge(comm.authorRoll, comm.authorRole)}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(comm.createdAt).toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{comm.text}</p>

                            {comm.images && comm.images.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto py-1">
                                {comm.images.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt="comm-img"
                                    onClick={() => setLightboxImg(img)}
                                    className="w-20 h-20 object-cover rounded-lg border border-slate-800 cursor-pointer"
                                  />
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 pt-1">
                              <button
                                onClick={() => handleCommentLike(post, comm.id)}
                                className={`flex items-center gap-1 text-[11px] font-semibold ${comm.likes?.includes(currentUser.roll) ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" /> {comm.likes?.length || 0} লাইক
                              </button>
                              <button
                                onClick={() => setActiveReplyBox(activeReplyBox === comm.id ? null : comm.id)}
                                className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1"
                              >
                                <CornerDownRight className="w-3.5 h-3.5" /> রিপ্লাই
                              </button>
                            </div>

                            {comm.replies && comm.replies.length > 0 && (
                              <div className="pl-4 border-l-2 border-indigo-500/30 space-y-2 mt-2">
                                {comm.replies.map(rep => (
                                  <div key={rep.id} className={`p-2.5 rounded-lg text-xs space-y-1 ${isDarkMode ? 'bg-slate-900/80' : 'bg-white border border-slate-200'}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{rep.authorName}</span>
                                        {renderRoleBadge(rep.authorRoll, rep.authorRole)}
                                      </div>
                                      <span className="text-[9px] text-slate-500">
                                        {new Date(rep.createdAt).toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{rep.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {activeReplyBox === comm.id && (
                              <form onSubmit={(e) => handleAddReply(e, post, comm.id)} className="flex gap-2 pt-2">
                                <input
                                  type="text"
                                  value={replyTexts[comm.id] || ''}
                                  onChange={(e) => setReplyTexts(prev => ({ ...prev, [comm.id]: e.target.value }))}
                                  placeholder="রিপ্লাই লিখুন..."
                                  className={`flex-1 border px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                />
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                  রিপ্লাই দিন
                                </button>
                              </form>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Comment Form */}
                      <form onSubmit={(e) => handleAddComment(e, post)} className="space-y-2 pt-2">
                        <div className="flex gap-2 items-center">
                          <label className={`p-2 rounded-xl border cursor-pointer flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}>
                            <ImageIcon className="w-4 h-4 text-indigo-400" />
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                const compressed = await Promise.all(files.map(f => compressImageFile(f)));
                                setCommentImagesMap(prev => ({
                                  ...prev,
                                  [post.id]: [...(prev[post.id] || []), ...compressed].slice(0, 3)
                                }));
                                e.target.value = '';
                              }}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="text"
                            value={commentTexts[post.id] || ''}
                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="একটি সমাধান বা কমেন্ট লিখুন..."
                            className={`flex-1 border px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                          />

                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0">
                            কমেন্ট
                          </button>
                        </div>

                        {commentImagesMap[post.id] && commentImagesMap[post.id].length > 0 && (
                          <div className="flex gap-2 py-1 pl-9">
                            {commentImagesMap[post.id].map((img, idx) => (
                              <img key={idx} src={img} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
                            ))}
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: NOTICE BOARD --- */}
        {activeTab === 'notice' && (
          <div className="space-y-6">
            <div className={`border p-4 rounded-2xl flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div>
                <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ডিপার্টমেন্টাল নোটিশ বোর্ড</h2>
                <p className="text-xs text-slate-400">গুরুত্বপূর্ণ অফিশিয়াল নোটিশ ও ঘোষণা</p>
              </div>
              {hasStaffPower && (
                <button
                  onClick={() => setShowAddNotice(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" /> নতুন নোটিশ দিন
                </button>
              )}
            </div>

            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className={`border rounded-2xl p-12 text-center text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}>
                  কোনো নোটিশ নেই।
                </div>
              ) : (
                notices.map(n => (
                  <div key={n.id} className={`border rounded-2xl p-6 shadow-xl space-y-3 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{n.authorRole || 'Official Notice'}</span>
                        <h2 className={`text-base font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{n.title}</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                        {hasStaffPower && (
                          <button
                            onClick={async () => {
                              if (window.confirm('নোটিশটি ডিলিট করতে চান?')) {
                                await deleteDoc(doc(db, 'helpdesk_notices', n.id));
                                showToastMsg('নোটিশ ডিলিট করা হয়েছে!');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{n.description}</p>

                    {n.images && n.images.length > 0 && (
                      <div className={`grid gap-2 mt-3 ${n.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                        {n.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="notice-img"
                            onClick={() => setLightboxImg(img)}
                            className="w-full h-48 object-cover rounded-xl border border-slate-800 cursor-pointer hover:opacity-95"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: LIVE SUPPORT & ROUTINE --- */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {liveStatus.isLive ? (
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">লাইভ সাপোর্ট সেশন চালু আছে</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{liveStatus.sessionTitle}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">সময়: {liveStatus.timeRange}</p>
                </div>

                {supportQueue.some(q => q.roll === currentUser.roll) || hasStaffPower ? (
                  <a
                    href={supportConfig.meetLink || "https://meet.google.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all animate-bounce"
                  >
                    <Video className="w-5 h-5" /> গুগল মিট জয়েন করুন <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <button
                      disabled
                      className="flex items-center gap-2 bg-slate-800 text-slate-500 px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed opacity-60"
                    >
                      <Video className="w-5 h-5" /> গুগল মিট জয়েন করুন
                    </button>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
                      <Lock className="w-3.5 h-3.5" /> আগে নিচে সিরিয়াল ফর্ম পূরণ করুন
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className={`border rounded-2xl p-6 text-center space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <Radio className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>বর্তমানে কোনো লাইভ সাপোর্ট সেশন চালু নেই</h2>
                <p className="text-xs text-slate-400">রুটিন অনুযায়ী নির্ধারিত সময়ে সেশন শুরু হবে।</p>
              </div>
            )}

            {hasStaffPower && (
              <div className={`border rounded-2xl p-5 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">লাইভ সাপোর্ট কন্ট্রোল প্যানেল</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>গুগল মিট লিংক সেট করুন</label>
                    <input
                      type="url"
                      defaultValue={supportConfig.meetLink}
                      onBlur={(e) => handleUpdateSupportSettings('meetLink', e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className={`w-full border px-3 py-2 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>সেশন স্ট্যাটাস ফোর্স কন্ট্রোল</label>
                    <select
                      value={supportConfig.forceStatus}
                      onChange={(e) => handleUpdateSupportSettings('forceStatus', e.target.value)}
                      className={`w-full border px-3 py-2 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    >
                      <option value="auto">অটোমেটিক (রুটিন অনুযায়ী)</option>
                      <option value="open">ফোর্স ওপেন (সব সময় লাইভ)</option>
                      <option value="closed">ফোর্স ক্লোজড (বন্ধ)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Support Queue Form */}
            <div className={`border rounded-2xl p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>সাপোর্ট সিরিয়ালে নাম লিখুন</h2>
              </div>

              <form onSubmit={handleJoinSupportQueue} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>সমস্যার বিষয় / টপিক *</label>
                    <select
                      value={supportTopic}
                      onChange={(e) => setSupportTopic(e.target.value)}
                      className={`w-full border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    >
                      <option value="Coding / Lab Problem">Coding / Lab Problem</option>
                      <option value="C Programming Debugging">C Programming Debugging</option>
                      <option value="Web Design / HTML-CSS">Web Design / HTML-CSS</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>আপনার সমস্যা সংক্ষেপে লিখুন *</label>
                    <textarea
                      rows={4}
                      required
                      value={supportProblem}
                      onChange={(e) => setSupportProblem(e.target.value)}
                      placeholder="যেমন: পয়েন্টার লজিক বুঝতে পারছি না..."
                      className={`w-full border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                >
                  সাপোর্ট সিরিয়ালে নাম যুক্ত করুন
                </button>
              </form>
            </div>

            <div className={`border rounded-2xl p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>বর্তমান সাপোর্ট সিরিয়াল ({supportQueue.length})</h2>
              <div className="space-y-3">
                {supportQueue.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4">বর্তমানে সিরিয়ালে কেউ নেই</div>
                ) : (
                  supportQueue.map((q, idx) => (
                    <div key={q.id} className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{q.name}</span>
                            <span className="text-[10px] text-slate-400">রোল: {q.roll}</span>
                            {renderRoleBadge(q.roll)}
                          </div>
                          <p className="text-xs text-indigo-400 mt-0.5"><b>টপিক:</b> {q.topic}</p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><b>সমস্যা:</b> {q.problem}</p>
                        </div>
                      </div>

                      {hasStaffPower && (
                        <button
                          onClick={() => handleCompleteStudentSupport(q)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                        >
                          সম্পন্ন করুন
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`border rounded-2xl p-6 space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>সাপ্তাহিক লাইভ সাপোর্ট রুটিন</h2>
                {hasStaffPower && (
                  <button
                    onClick={() => {
                      const title = prompt('সেশনের নাম দিন:', 'Evening Support');
                      if (title) {
                        setRTitle(title);
                        handleAddRoutine({ preventDefault: () => {} });
                      }
                    }}
                    className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> রুটিন যোগ করুন
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {DAYS_OF_WEEK.map(day => {
                  const slots = routineList.filter(r => r.day === day);
                  return (
                    <div key={day} className={`p-4 rounded-xl border space-y-2 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <h3 className="text-xs font-bold text-indigo-400">{DAYS_BN[day]}</h3>
                      {slots.length === 0 ? (
                        <p className="text-[11px] text-slate-500">কোনো সেশন নেই</p>
                      ) : (
                        slots.map(s => (
                          <div key={s.id} className={`p-2.5 rounded-lg border flex justify-between items-center text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div>
                              <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.title}</p>
                              <p className="text-[10px] text-slate-400">{s.startTime} - {s.endTime}</p>
                            </div>
                            {hasStaffPower && (
                              <button onClick={() => handleDeleteRoutine(s.id)} className="text-rose-400 hover:text-rose-300">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: DEPARTMENT DIRECTORY --- */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className={`border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ডিপার্টমেন্টাল ডিরেক্টরি</h2>
                <p className="text-xs text-slate-400 mt-0.5">সেমিস্টার অনুযায়ী শিক্ষক, সিআই ও ছাত্রছাত্রীবৃন্দ</p>
              </div>

              {hasStaffPower && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowManageDirectory(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" /> ছাত্র / মেম্বার যোগ করুন
                  </button>
                  <button
                    onClick={() => setShowManageTeacherModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg"
                  >
                    <Award className="w-4 h-4" /> শিক্ষক / CI যোগ করুন
                  </button>
                  <button
                    onClick={() => setShowManageMods(true)}
                    className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg"
                  >
                    <ShieldAlert className="w-4 h-4" /> মডারেটর ম্যানেজ
                  </button>
                </div>
              )}
            </div>

            {/* Semester Tabs / Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {SEMESTERS_LIST.map(sem => (
                <button
                  key={sem}
                  onClick={() => setDirectorySemFilter(sem)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${directorySemFilter === sem ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : (isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm')}`}
                >
                  {sem === 'ALL' ? 'সকল মেম্বার' : sem === 'TEACHERS' ? '👨‍🏫 শিক্ষক / CI' : sem}
                </button>
              ))}
            </div>

            {/* Members / Teachers Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(membersDirectory)
                .filter(([_, member]) => {
                  const isTeacherOrCI = member.role === 'teacher' || member.role === 'ci_sir';
                  if (directorySemFilter === 'ALL') {
                    return !isTeacherOrCI;
                  }
                  if (directorySemFilter === 'TEACHERS') {
                    return isTeacherOrCI;
                  }
                  return member.semester === directorySemFilter;
                })
                .map(([id, member]) => {
                  const isTeacherOrCI = member.role === 'teacher' || member.role === 'ci_sir';
                  return (
                    <div key={id} className={`border rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full ${member.role === 'ci_sir' ? 'bg-purple-600' : member.role === 'teacher' ? 'bg-emerald-600' : 'bg-indigo-600'}`}></div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</h3>
                            <p className="text-[11px] text-indigo-400 font-semibold">{member.semester} {!isTeacherOrCI && id !== '253203' && `(রোল: ${id})`}</p>
                            {renderRoleBadge(id, member.role)}
                          </div>
                        </div>

                        {/* ডিলিট বাটন: শুধুমাত্র অ্যাডমিন বা মডারেটর (hasStaffPower) হলে তবেই রেন্ডার বা দেখাবে */}
                        {hasStaffPower && (
                          <button
                            onClick={() => handleDeleteMemberFromDirectory(id, member.name)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer z-10"
                            title="ডাটাবেজ থেকে ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isTeacherOrCI && (
                        <div className={`pt-2 border-t text-xs flex items-center gap-2 ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'}`}>
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">নতুন পোস্ট বা প্রশ্ন তৈরি করুন</h2>
              <button onClick={() => setShowCreatePost(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">ক্যাটাগরি *</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="Coding / Programming">Coding / Programming</option>
                  <option value="Lab Practical">Lab Practical</option>
                  <option value="Hardware / Peripherals">Hardware / Peripherals</option>
                  <option value="Academic Question">Academic Question</option>
                  <option value="General Discussion">General Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">পোস্টের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="যেমন: C পয়েন্টার কিভাবে কাজ করে?"
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">বিবরণ *</label>
                <textarea
                  rows={4}
                  required
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder="আপনার সমস্যা বা আলোচনা বিস্তারিত লিখুন..."
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ভিডিও লিংক (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={postVideo}
                  onChange={(e) => setPostVideo(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs focus:outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ছবি যুক্ত করুন (সর্বোচ্চ ৫টি)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePostImageUpload}
                  className="w-full border px-3 py-2 rounded-xl text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
                />
                {postImages.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {postImages.map((img, idx) => (
                      <img key={idx} src={img} alt="preview" className="w-14 h-14 object-cover rounded-xl border border-slate-700" />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingPost}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isSubmittingPost ? 'পাবলিশ হচ্ছে...' : 'পোস্ট পাবলিশ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showManageDirectory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">নতুন ছাত্র বা মেম্বার যুক্ত করুন</h2>
              <button onClick={() => setShowManageDirectory(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberToDirectory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">ক্লাস রোল / আইডি *</label>
                <input
                  type="text"
                  required
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  placeholder="যেমন: 201635"
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">নাম *</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="যেমন: Tanvir Ahmed"
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">অফিশিয়াল জিমেইল *</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">সেমিস্টার সিলেক্ট করুন *</label>
                <select
                  value={newMemberSem}
                  onChange={(e) => setNewMemberSem(e.target.value)}
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
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
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">মেম্বার সেভ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showManageTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">শিক্ষক বা সিআই যুক্ত করুন</h2>
              <button onClick={() => setShowManageTeacherModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacherOrCi} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">পদবি / ধরণ *</label>
                <select
                  value={teacherRoleType}
                  onChange={(e) => setTeacherRoleType(e.target.value)}
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="ci_sir">Chief Instructor (CI Sir)</option>
                  <option value="teacher">Faculty / Teacher</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">আইডি / কোড *</label>
                <input
                  type="text"
                  required
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="যেমন: ci_01 বা teach_01"
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">নাম *</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="যেমন: Dr. Abdul Kader"
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">অফিশিয়াল জিমেইল *</label>
                <input
                  type="email"
                  required
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="teacher@gmail.com"
                  className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">শিক্ষক সেভ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showManageMods && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">মডারেটর ম্যানেজ করুন</h2>
              <button onClick={() => setShowManageMods(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddModerator} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">রোল দিয়ে মডারেটর বানান *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={modInputRoll}
                    onChange={(e) => setModInputRoll(e.target.value)}
                    placeholder="যেমন: 201605"
                    className={`flex-1 border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                  <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                    যুক্ত করুন
                  </button>
                </div>
              </div>
            </form>

            <div className={`pt-3 border-t space-y-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-xs font-bold text-slate-400">বর্তমান মডারেটরগণ:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {moderatorRolls.map(roll => (
                  <div key={roll} className={`flex justify-between items-center p-2.5 rounded-xl text-xs border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    <div>
                      <span className="font-bold">{membersDirectory[roll]?.name || roll}</span>
                      <span className="text-slate-400 ml-2">(রোল: {roll})</span>
                    </div>
                    <button onClick={() => handleRemoveModerator(roll)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">নতুন নোটিশ তৈরি করুন</h2>
              <button onClick={() => setShowAddNotice(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const title = e.target.noticeTitle.value;
              const desc = e.target.noticeDesc.value;
              await addDoc(collection(db, 'helpdesk_notices'), {
                title,
                description: desc,
                images: noticeImages,
                authorRole: userInfo.role === 'ci_sir' ? 'Chief Instructor Notice' : 'Department Notice',
                createdAt: new Date().toISOString()
              });
              setNoticeImages([]);
              setShowAddNotice(false);
              showToastMsg('নোটিশ পাবলিশ করা হয়েছে!');
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">নোটিশের শিরোনাম *</label>
                <input type="text" name="noticeTitle" required className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">বিস্তারিত বিবরণ *</label>
                <textarea rows={4} name="noticeDesc" required className={`w-full border px-3 py-2.5 rounded-xl text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">ছবি যুক্ত করুন (সর্বোচ্চ ৩টি)</label>
                <input type="file" multiple accept="image/*" onChange={handleNoticeImageUpload} className="w-full border px-3 py-2 rounded-xl text-xs text-slate-300" />
                {noticeImages.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {noticeImages.map((img, idx) => (
                      <img key={idx} src={img} alt="preview" className="w-14 h-14 object-cover rounded-xl border border-slate-700" />
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">নোটিশ পাবলিশ করুন</button>
            </form>
          </div>
        </div>
      )}

      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold">অ্যাডমিন মোড পিন</h2>
              <button onClick={() => setShowAdminPinModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleVerifyAdminPinModal} className="space-y-4">
              <input
                type="password"
                required
                value={adminInputPin}
                onChange={(e) => setAdminInputPin(e.target.value)}
                placeholder="সিক্রেট পিন দিন"
                className={`w-full border px-3 py-2.5 rounded-xl text-xs text-center tracking-widest ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">ভেরিফাই করুন</button>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-xl">
              {userInfo?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold">{userInfo?.name}</h2>
              <p className="text-xs text-indigo-400 mt-0.5">রোল: {currentUser.roll}</p>
              <p className="text-xs text-slate-400 mt-1">{userInfo?.semester}</p>
              <p className="text-xs text-slate-500 mt-0.5">{userInfo?.email}</p>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'}`}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="lightbox" className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-slate-800 shadow-2xl" />
        </div>
      )}
    </div>
  );
}