import React, { useState } from 'react';
import {
  FolderGit2,
  Upload,
  Search,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  HardDrive,
  Download,
  Trash2,
  X,
  Eye,
  History,
  Lock,
  Globe,
  Users
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function FileManagerPage() {
  const { files = [], addFile, deleteFile, addNotification } = useData();
  const { currentUser } = useAuth();

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const dataURLtoBlob = (dataurl) => {
    try {
      let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
    } catch (e) {
      console.error('Error converting base64 to blob', e);
      return null;
    }
  };

  const getSafePreviewUrl = (url) => {
    if (url && url.startsWith('data:')) {
      const blob = dataURLtoBlob(url);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    }
    return url;
  };
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [versionHistoryFile, setVersionHistoryFile] = useState(null);

  const categories = ['All', 'Operations', 'Legal', 'Financial', 'Strategy'];

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                          (f.uploadedBy && f.uploadedBy.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Operations',
    size: '0 KB',
    type: 'Document',
    permission: 'Team Only'
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      let sizeStr = '0 KB';
      if (file.size > 1024 * 1024) {
        sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      } else {
        sizeStr = (file.size / 1024).toFixed(0) + ' KB';
      }

      let typeStr = 'Document';
      if (file.type.includes('image')) typeStr = 'Image';
      else if (file.type.includes('pdf')) typeStr = 'PDF Document';
      else if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('compressed')) typeStr = 'ZIP Archive';
      else if (file.type.includes('excel') || file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) typeStr = 'Spreadsheet';
      else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) typeStr = 'Word Document';

      setUploadForm(prev => ({
        ...prev,
        name: file.name,
        size: sizeStr,
        type: typeStr
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    let fileUrl = 'https://s3.aws.amazon.com/vault/' + uploadForm.name;
    if (selectedFile) {
      try {
        fileUrl = await convertToBase64(selectedFile);
      } catch (err) {
        console.error('Failed to convert file to Base64', err);
      }
    }
    
    addFile({
      name: uploadForm.name,
      category: uploadForm.category,
      sizeBytes: selectedFile ? selectedFile.size : 102400,
      formattedSize: uploadForm.size,
      type: uploadForm.type,
      url: fileUrl,
      permission: uploadForm.permission,
      uploadedBy: currentUser?.name || 'Operations Lead',
      versionHistory: [
        { version: 'v1.0', date: new Date().toISOString().split('T')[0], author: currentUser?.name || 'Operations Lead', note: 'Initial upload from PC' }
      ]
    });

    addNotification('File Uploaded', `Asset "${uploadForm.name}" uploaded successfully.`, 'success');
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadForm({ name: '', category: 'Operations', size: '0 KB', type: 'Document', permission: 'Team Only' });
  };

  const handleDeleteFile = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this document from the vault?')) {
      deleteFile(id);
    }
  };

  const getPermissionBadge = (perm) => {
    if (perm === 'Confidential') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center space-x-1"><Lock className="w-3 h-3 mr-0.5" /> Confidential</span>;
    if (perm === 'Public') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1"><Globe className="w-3 h-3 mr-0.5" /> Public</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center space-x-1"><Users className="w-3 h-3 mr-0.5" /> Team Only</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4" />
            <span>Document Vault & Version Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Enterprise File Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Store corporate contracts, financial audits, strategy presentations, and track document version history.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Categories & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
            placeholder="Search filename or uploader..."
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto text-xs">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                categoryFilter === c
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                {getPermissionBadge(file.permission || 'Team Only')}
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{file.name}</h3>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{file.size || '4.2 MB'}</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{file.version || 'v1.0'}</span>
                  <span>•</span>
                  <span>{file.category}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>Uploaded by: <strong className="text-slate-800 dark:text-slate-200">{file.uploadedBy || 'Operations'}</strong></span>
                <span className="font-mono">{file.uploadedAt || '2026-08-01'}</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold">
              <button
                onClick={() => setPreviewFile(file)}
                className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => setVersionHistoryFile(file)}
                className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <History className="w-3.5 h-3.5" />
                <span>Version History</span>
              </button>

              <a
                href={getSafePreviewUrl(file.url) || "#download"}
                download={file.name}
                onClick={(e) => {
                  if (!file.url || file.url.startsWith('https://s3.aws.amazon.com/')) {
                    e.preventDefault();
                    addNotification('Downloading File', `Started download for ${file.name}`, 'info');
                  }
                }}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                title="Download Document"
              >
                <Download className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleDeleteFile(file.id)}
                className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Delete Document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold">Upload New Asset</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Choose File from PC</label>
                <input
                  type="file"
                  required
                  onChange={handleFileSelect}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Display Title & Filename</label>
                <input
                  type="text"
                  required
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700"
                  placeholder="e.g. Q4_Executive_Financial_Report_2026.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Vault Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Legal">Legal</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Access Permission</label>
                  <select
                    value={uploadForm.permission}
                    onChange={(e) => setUploadForm({ ...uploadForm, permission: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700"
                  >
                    <option value="Team Only">Team Only</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionHistoryFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-extrabold">Version History</h3>
              </div>
              <button onClick={() => setVersionHistoryFile(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100">{versionHistoryFile.name}</div>
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 block">v1.2 (Current Active)</span>
                    <span className="text-slate-500 text-[11px]">Updated by Sarah Chen on 2026-08-05</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold text-[10px]">Active</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">v1.1</span>
                    <span className="text-slate-500 text-[11px]">Updated by David Miller on 2026-07-28</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:underline">Restore</button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">v1.0 (Original Upload)</span>
                    <span className="text-slate-500 text-[11px]">Created on 2026-07-15</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:underline">Restore</button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setVersionHistoryFile(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold truncate">{previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const isImage = previewFile.type?.toLowerCase().includes('image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(previewFile.name);
              const isPdf = previewFile.type?.toLowerCase().includes('pdf') || /\.(pdf)$/i.test(previewFile.name);

              const safeUrl = getSafePreviewUrl(previewFile.url);

              return (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  {isImage ? (
                    <div className="flex justify-center items-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <img src={safeUrl} alt={previewFile.name} className="max-h-64 rounded object-contain shadow-xs" />
                    </div>
                  ) : isPdf ? (
                    <div className="w-full h-96 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                      <iframe src={safeUrl} title={previewFile.name} className="w-full h-full" />
                    </div>
                  ) : (
                    <div className="py-8 space-y-3">
                      <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto animate-pulse" />
                      <div className="font-extrabold text-sm">{previewFile.name}</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                        This file format does not support in-browser rendering. Please download the file to view its contents.
                      </p>
                      <a
                        href={safeUrl}
                        download={previewFile.name}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download to PC</span>
                      </a>
                    </div>
                  )}

                  {(isImage || isPdf) && (
                    <div className="text-left mt-2 space-y-1">
                      <div className="font-extrabold text-xs text-slate-950 dark:text-white truncate">{previewFile.name}</div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Document preview loaded via WorkForge Vault. Access level: <strong>{previewFile.permission || 'Team Only'}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-mono">{previewFile.size || previewFile.formattedSize} • {previewFile.version || 'v1.0'}</span>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
