import React, { useState } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Building,
  Phone,
  Calendar,
  Shield,
  Tag,
  Plus,
  X,
  Save,
  CheckCircle,
  Crop
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserAvatar } from '../components/common/UserAvatar';
import ImageCropperModal from '../components/common/ImageCropperModal';

export default function ProfilePage() {
  const { currentUser, updateUserProfileImage, apiFetch } = useAuth();
  const { addNotification } = useData();

  const [showCropModal, setShowCropModal] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Workspace Member',
    email: currentUser?.email || 'user@workforge.in',
    phone: currentUser?.phone || '+91 98765 00000',
    department: currentUser?.department || 'Engineering',
    designation: currentUser?.designation || 'Senior Full Stack Engineer',
    role: currentUser?.role || 'EMPLOYEE'
  });

  const [skills, setSkills] = useState(['React.js', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Docker', 'REST API', 'Socket.IO']);
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const { res, data } = await apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSavedMsg('Profile changes saved successfully.');
        addNotification('Profile Updated', 'Your employee profile details have been saved.', 'success');
      } else {
        setSavedMsg('Profile updated locally.');
      }
    } catch (err) {
      setSavedMsg('Profile updated locally.');
    }
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleCropSave = (croppedDataUrl) => {
    updateUserProfileImage(croppedDataUrl);
    addNotification('Photo Updated', 'Your profile picture has been updated.', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Personnel & Identity Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            My Employee Profile
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Manage your personal profile information, competencies, skills tags, and account privileges.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center shadow-xs">
          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-5 text-center flex flex-col items-center">
          <div className="relative group cursor-pointer" onClick={() => setShowCropModal(true)}>
            <UserAvatar name={formData.name} src={currentUser?.avatar || currentUser?.profileImage} size="xl" />
            <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Crop className="w-6 h-6 text-white" />
            </div>
          </div>

          <button
            onClick={() => setShowCropModal(true)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Change & Crop Photo
          </button>

          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{formData.name}</h2>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{formData.designation}</p>
            <span className="inline-block mt-1 px-3 py-1 text-[10px] font-extrabold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {formData.role}
            </span>
          </div>

          <div className="w-full text-left space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <Building className="w-4 h-4 mr-2 text-slate-400" />
              <span>{formData.department}</span>
            </div>
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 mr-2 text-slate-400" />
              <span className="truncate">{formData.email}</span>
            </div>
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <span>Joined: August 2024</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Form & Skills */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-2xl space-y-5 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-800">
              Personal & Professional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Official Email</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full p-2.5 bg-slate-200/60 dark:bg-slate-800/40 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Designation Title</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Assigned Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Privilege Role</label>
                <input
                  type="text"
                  disabled
                  value={formData.role}
                  className="w-full p-2.5 bg-slate-200/60 dark:bg-slate-800/40 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Information</span>
              </button>
            </div>
          </form>

          {/* Skills & Technical Competencies Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center">
                  <Tag className="w-4 h-4 text-blue-500 mr-2" />
                  <span>Skills & Core Competencies</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Badges displayed across project team allocations and task delegation.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold rounded-full text-xs shadow-2xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add new competency (e.g. AWS, GraphQL)..."
                className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
              />
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <ImageCropperModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCropSave={handleCropSave}
        title="Crop User Avatar Photo"
        cropShape="circle"
      />
    </div>
  );
}
