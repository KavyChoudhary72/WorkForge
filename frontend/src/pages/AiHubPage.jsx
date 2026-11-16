import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, FileText, Clock, Zap, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../services/api';

export default function AiHubPage() {
  const { projects = [], tasks = [] } = useData();
  const { apiFetch } = useAuth();

  // Selected Project State
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');

  // Sync selectedProjectId when projects array changes
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Tool 1: AI Health Score State
  const [healthResult, setHealthResult] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [errorHealth, setErrorHealth] = useState('');

  // Tool 2: AI Task Estimation State
  const [taskInput, setTaskInput] = useState('');
  const [estimationResult, setEstimationResult] = useState(null);
  const [loadingEstimation, setLoadingEstimation] = useState(false);
  const [errorEstimation, setErrorEstimation] = useState('');

  // Tool 3: AI Meeting Notes Summarizer State
  const [meetingNotesInput, setMeetingNotesInput] = useState('');
  const [summaryResult, setSummaryResult] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  // Get active target project object
  const getTargetProject = () => {
    if (projects.length > 0) {
      const found = projects.find(p => p.id === selectedProjectId);
      return found || projects[0];
    }
    return null;
  };

  // Handler 1: AI Project Health Audit
  const runHealthAudit = async () => {
    const targetProject = getTargetProject();
    if (!targetProject) {
      setErrorHealth('Please create or select an active project to run an AI Health Audit.');
      return;
    }
    setLoadingHealth(true);
    setErrorHealth('');
    
    // Gather matching tasks for project grounding
    const projectTasks = tasks.filter(t => t.projectId === targetProject.id);
    const tasksSummary = projectTasks.length > 0 
      ? projectTasks.map(t => `${t.title} (${t.status})`).join(', ')
      : `${targetProject.tasksCount || 0} active deliverables`;

    const projectPayload = {
      ...targetProject,
      tasksSummary
    };

    try {
      let resData;
      if (apiFetch) {
        const { res, data } = await apiFetch('/ai/health-audit', {
          method: 'POST',
          body: JSON.stringify({ project: projectPayload })
        });
        if (!res?.ok || !data?.success) throw new Error(data?.message || 'Failed to compute AI Health Audit.');
        resData = data;
      } else {
        const response = await fetch(`${getApiBaseUrl()}/ai/health-audit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: projectPayload })
        });
        resData = await response.json();
        if (!response.ok || !resData.success) throw new Error(resData.message || 'Failed to compute AI Health Audit.');
      }

      setHealthResult(resData.data);
    } catch (err) {
      console.error('WorkForge AI Health Audit Error:', err);
      setErrorHealth(err.message || 'Error connecting to WorkForge AI.');
    } finally {
      setLoadingHealth(false);
    }
  };

  // Handler 2: AI Task Workload Estimation
  const runTaskEstimation = async () => {
    if (!taskInput.trim()) return;
    setLoadingEstimation(true);
    setErrorEstimation('');
    const targetProject = getTargetProject();

    try {
      let resData;
      const payload = {
        taskDescription: taskInput,
        projectName: targetProject?.name
      };

      if (apiFetch) {
        const { res, data } = await apiFetch('/ai/estimate-task', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (!res?.ok || !data?.success) throw new Error(data?.message || 'Failed to estimate task workload.');
        resData = data;
      } else {
        const response = await fetch(`${getApiBaseUrl()}/ai/estimate-task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        resData = await response.json();
        if (!response.ok || !resData.success) throw new Error(resData.message || 'Failed to estimate task workload.');
      }

      setEstimationResult(resData.data);
    } catch (err) {
      console.error('WorkForge AI Task Estimation Error:', err);
      setErrorEstimation(err.message || 'Error connecting to WorkForge AI.');
    } finally {
      setLoadingEstimation(false);
    }
  };

  // Handler 3: AI Meeting Notes Summarizer
  const runNotesSummarizer = async () => {
    if (!meetingNotesInput.trim()) return;
    setLoadingSummary(true);
    setErrorSummary('');

    try {
      let resData;
      if (apiFetch) {
        const { res, data } = await apiFetch('/ai/summarize-notes', {
          method: 'POST',
          body: JSON.stringify({ meetingNotes: meetingNotesInput })
        });
        if (!res?.ok || !data?.success) throw new Error(data?.message || 'Failed to summarize meeting notes.');
        resData = data;
      } else {
        const response = await fetch(`${getApiBaseUrl()}/ai/summarize-notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingNotes: meetingNotesInput })
        });
        resData = await response.json();
        if (!response.ok || !resData.success) throw new Error(resData.message || 'Failed to summarize meeting notes.');
      }

      setSummaryResult(resData.data);
    } catch (err) {
      console.error('WorkForge AI Notes Summarizer Error:', err);
      setErrorSummary(err.message || 'Error connecting to WorkForge AI.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // High-Contrast Score Badge Helper (Theme Adaptive)
  const getScoreBadge = (score) => {
    if (score >= 80) {
      return (
        <span className="px-3 py-1 text-sm font-extrabold rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
          {score}/100 (Optimal)
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="px-3 py-1 text-sm font-extrabold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs">
          {score}/100 (Moderate Risk)
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-sm font-extrabold rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-xs">
        {score}/100 (Critical Risk)
      </span>
    );
  };

  // High-Contrast Risk Badge Helper
  const getRiskBadge = (risk) => {
    if (risk?.toLowerCase() === 'high') {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          High Risk
        </span>
      );
    }
    if (risk?.toLowerCase() === 'moderate') {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          Moderate Risk
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        Low Operational Risk
      </span>
    );
  };

  const activeProject = getTargetProject();

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl border border-indigo-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>WorkForge AI Business Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            WorkForge AI Copilot Hub
          </h1>
          <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
            Real-time corporate project risk indexing, operational workload estimation, and meeting note synthesis strictly anchored to your workspace metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-950/80 border border-indigo-500/50 px-4 py-2 rounded-full text-xs font-bold text-indigo-100 shadow-md">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Real Gemini AI Active</span>
        </div>
      </div>

      {/* 3 AI Interactive Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool 1: AI Project Health Audit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1">
              <Zap className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">1. AI Project Health Audit</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate a 1-100 health index based on actual project budget, spent velocity, and milestone metrics.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Corporate Initiative</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {projects.length > 0 ? (
                    projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.budget ? p.budget.toLocaleString('en-IN') : 0})
                      </option>
                    ))
                  ) : (
                    <option value="">No projects found in workspace</option>
                  )}
                </select>
              </div>

              {/* Active Project Details Chip */}
              {activeProject ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <span>Client: <strong>{activeProject.clientName || 'Key Account'}</strong></span>
                    <span>Budget: <strong className="text-emerald-600 dark:text-emerald-400">₹{activeProject.budget ? activeProject.budget.toLocaleString('en-IN') : 0}</strong></span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Spent to date: ₹{activeProject.spent ? activeProject.spent.toLocaleString('en-IN') : 0}</span>
                    <span>Status: <span className="font-bold text-blue-600 dark:text-blue-400">{activeProject.status || 'Active'}</span></span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 text-center">
                  Create a project to analyze risk & health metrics
                </div>
              )}

              <button
                onClick={runHealthAudit}
                disabled={loadingHealth}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
              >
                {loadingHealth ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Auditing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Run AI Health Diagnosis</span>
                  </>
                )}
              </button>
            </div>

            {errorHealth && (
              <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start space-x-2 shadow-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{errorHealth}</span>
              </div>
            )}

            {/* High-Contrast AI Audit Result Card */}
            {healthResult && !loadingHealth && (
              <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 dark:text-slate-100 font-extrabold text-sm">Health Score:</span>
                  {getScoreBadge(healthResult.score)}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Executive Assessment:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{healthResult.status}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-slate-100 font-bold text-xs block">Analyzed Commercial Factors:</span>
                  {healthResult.factors?.map((factor, i) => (
                    <div key={i} className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{factor}</span>
                    </div>
                  ))}
                </div>

                {healthResult.recommendations && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-blue-700 dark:text-blue-400 font-extrabold block mb-1">Executive Recommendation:</span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{healthResult.recommendations}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: AI Workload & Risk Estimator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1">
              <Clock className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">2. AI Workload & Risk Estimator</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Input business task specifications to estimate work hours, commercial risk, and target delivery dates.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Task Specification</label>
                <textarea
                  rows={3}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your operational deliverable or business assignment..."
                />
              </div>

              <button
                onClick={runTaskEstimation}
                disabled={loadingEstimation}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
              >
                {loadingEstimation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Calculating Workload...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Estimate Effort & Risk</span>
                  </>
                )}
              </button>
            </div>

            {errorEstimation && (
              <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start space-x-2 shadow-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{errorEstimation}</span>
              </div>
            )}

            {/* High-Contrast Task Estimation Result Card */}
            {estimationResult && !loadingEstimation && (
              <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 dark:text-slate-100 font-extrabold text-sm">Estimated Effort:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">{estimationResult.estimatedHours} Hours</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Risk Assessment:</span>
                  {getRiskBadge(estimationResult.riskLevel)}
                </div>

                {estimationResult.completionDate && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Target Delivery Date:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">{estimationResult.completionDate}</span>
                  </div>
                )}

                {estimationResult.requiredSkills?.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-slate-100 font-bold text-xs block mb-1.5">Required Functional Competencies:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {estimationResult.requiredSkills.map((sk, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-bold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {estimationResult.rationale && (
                  <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-blue-700 dark:text-blue-400 font-bold text-xs block mb-1">Operational Breakdown:</span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      {estimationResult.rationale}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tool 3: AI Meeting Notes Summarizer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1">
              <FileText className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">3. AI Executive Meeting Summarizer</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste raw discussion transcripts to extract strategic takeaways and assigned team deliverables.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Raw Meeting Discussion</label>
                <textarea
                  rows={3}
                  value={meetingNotesInput}
                  onChange={(e) => setMeetingNotesInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste client call or internal review notes here..."
                />
              </div>

              <button
                onClick={runNotesSummarizer}
                disabled={loadingSummary}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
              >
                {loadingSummary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Extracting Deliverables...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Summarize & Extract Deliverables</span>
                  </>
                )}
              </button>
            </div>

            {errorSummary && (
              <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start space-x-2 shadow-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{errorSummary}</span>
              </div>
            )}

            {/* High-Contrast Meeting Summarizer Result Card */}
            {summaryResult && !loadingSummary && (
              <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-xs">
                <div className="font-extrabold text-blue-700 dark:text-blue-400 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                  {summaryResult.title}
                </div>

                {summaryResult.keyPoints?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-slate-900 dark:text-slate-100 font-bold text-xs block">Executive Takeaways:</span>
                    <ul className="space-y-1.5">
                      {summaryResult.keyPoints.map((kp, i) => (
                        <li key={i} className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start space-x-2">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                          <span className="leading-relaxed">{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summaryResult.actionItems?.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 text-xs block">Actionable Deliverables:</span>
                    <div className="space-y-2">
                      {summaryResult.actionItems.map((item, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-2xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.task}</span>
                          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <span>Owner: <strong className="text-slate-900 dark:text-slate-100 font-bold">{item.assignee}</strong></span>
                            <span>Target: <strong className="text-blue-600 dark:text-blue-400 font-bold">{item.deadline}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
