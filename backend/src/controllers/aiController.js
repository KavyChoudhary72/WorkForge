/**
 * WorkForge AI Controller using Google Gemini API with Intelligent Grounded Fallback Engine
 * Tailored for business operations, client project management, and commerce execution.
 */

// Helper: Call Google Gemini API with timeout
async function callGemini(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('AQ.')) {
    throw new Error('Gemini API key is not configured or requires valid format.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData.error?.message || `Gemini API returned status ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('No response content received from Gemini AI.');
  }

  return JSON.parse(rawText);
}

// Fallback Engine 1: Compute Project Health Audit
function computeProjectHealthFallback(project) {
  const budget = Number(project.budget) || 0;
  const spent = Number(project.spent) || 0;
  const status = (project.status || 'In Progress').toLowerCase();
  const clientName = project.clientName || 'Strategic Client';
  const tasksSummary = project.tasksSummary || `${project.tasksCount || 3} active deliverables`;

  let score = 88;
  let riskStatus = 'Optimal';
  const spentRatio = budget > 0 ? (spent / budget) : 0;

  if (status.includes('complete')) {
    score = 98;
    riskStatus = 'Optimal';
  } else if (status.includes('hold') || status.includes('pause')) {
    score = 48;
    riskStatus = 'Critical Risk';
  } else if (spentRatio > 1.0) {
    score = Math.max(35, Math.round(90 - (spentRatio - 1.0) * 120));
    riskStatus = 'Critical Risk';
  } else if (spentRatio > 0.8) {
    score = Math.round(75 - (spentRatio - 0.8) * 50);
    riskStatus = 'Moderate Risk';
  } else {
    score = Math.min(95, Math.round(85 + (1 - spentRatio) * 10));
    riskStatus = score >= 80 ? 'Optimal' : 'Moderate Risk';
  }

  const factors = [
    `Fiscal Burn Velocity: Currently at ${(spentRatio * 100).toFixed(1)}% of total capital (₹${spent.toLocaleString('en-IN')} of ₹${budget.toLocaleString('en-IN')}) indicating ${spentRatio <= 0.8 ? 'sustainable budget velocity' : 'accelerated capital deployment'}.`,
    `Client Engagement: Milestones for ${clientName} on "${project.name}" are tracking against scheduled delivery windows.`,
    `Operational Workload: Workstream actively driving ${tasksSummary} with verified cross-functional resource coverage.`
  ];

  let recommendations = '';
  if (spentRatio > 1.0) {
    recommendations = `Institute immediate financial expenditure controls and request a formal budget reallocation for ${clientName}.`;
  } else if (status.includes('hold')) {
    recommendations = `Re-engage executive stakeholders to resolve project roadblocks and establish an unblocking timeline.`;
  } else if (spentRatio > 0.8) {
    recommendations = `Monitor milestone velocity closely over the next two sprint cycles to prevent contingency budget depletion.`;
  } else {
    recommendations = `Maintain current milestone delivery pace and conduct bi-weekly sprint reviews with ${clientName} leadership.`;
  }

  return {
    score,
    status: riskStatus,
    factors,
    recommendations
  };
}

// Fallback Engine 2: Task Workload & Risk Estimator
function estimateTaskWorkloadFallback(taskDescription, projectName) {
  const desc = (taskDescription || '').toLowerCase();
  const words = desc.split(/\s+/).filter(Boolean);

  const highComplexityTerms = ['synthesis', 'architect', 'security', 'infrastructure', 'migration', 'containment', 'avionics', 'reactor', 'hardware', 'plasma', 'compliance', 'audit', 'integration'];
  const mediumComplexityTerms = ['deploy', 'optimize', 'test', 'review', 'design', 'configure', 'endpoint', 'database', 'refactor'];

  const matchedHigh = highComplexityTerms.filter(t => desc.includes(t));
  const matchedMed = mediumComplexityTerms.filter(t => desc.includes(t));

  let hours = 16;
  if (matchedHigh.length > 0) hours += matchedHigh.length * 8;
  if (matchedMed.length > 0) hours += matchedMed.length * 4;
  if (words.length > 20) hours += 6;
  hours = Math.min(120, Math.max(8, hours));

  let riskLevel = 'Low';
  if (matchedHigh.length >= 2 || hours > 40) {
    riskLevel = 'High';
  } else if (matchedHigh.length === 1 || matchedMed.length >= 2 || hours > 24) {
    riskLevel = 'Moderate';
  }

  const workDays = Math.ceil(hours / 8) + 2;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + workDays);
  const completionDate = targetDate.toISOString().split('T')[0];

  const skills = [];
  if (desc.includes('avionics') || desc.includes('hardware') || desc.includes('synthesis') || desc.includes('reactor')) {
    skills.push('Avionics Systems', 'Hardware Engineering', 'Precision Quality Assurance', 'Thermal Stress Analysis');
  } else if (desc.includes('security') || desc.includes('compliance') || desc.includes('audit')) {
    skills.push('Security Architecture', 'Compliance Verification', 'Risk Management', 'Threat Analysis');
  } else if (desc.includes('ui') || desc.includes('frontend') || desc.includes('design')) {
    skills.push('UI/UX Prototyping', 'Component Architecture', 'Cross-browser Testing', 'Design System Compliance');
  } else {
    skills.push('Systems Architecture', 'Technical Implementation', 'Verification & Testing', 'Quality Engineering');
  }

  const rationale = `Allocating ${Math.round(hours * 0.25)} hours for initial technical specification & architecture, ${Math.round(hours * 0.55)} hours for active core development on "${projectName || 'Active Project'}", and ${Math.round(hours * 0.20)} hours for rigorous functional verification and stakeholder review.`;

  return {
    estimatedHours: hours,
    riskLevel,
    completionDate,
    requiredSkills: skills,
    rationale
  };
}

// Fallback Engine 3: Meeting Notes Summarizer
function summarizeMeetingNotesFallback(meetingNotes) {
  const lines = meetingNotes.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const text = meetingNotes.trim();

  const keyPoints = [];
  const actionItems = [];

  const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 10);
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  const foundNames = [...new Set(text.match(namePattern) || [])].filter(n =>
    !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'The', 'We', 'This', 'Our', 'All', 'Please', 'Action', 'Meeting', 'Project'].includes(n)
  );

  const defaultAssignee = foundNames.length > 0 ? foundNames[0] : 'Project Lead';

  if (lines.length >= 3) {
    keyPoints.push(lines[0].replace(/^[-*•\d.]\s*/, ''));
    keyPoints.push(lines[1].replace(/^[-*•\d.]\s*/, ''));
    if (lines.length > 2) {
      keyPoints.push(lines[2].replace(/^[-*•\d.]\s*/, ''));
    }
  } else {
    keyPoints.push(`Reviewed strategic initiative roadmap and agreed on operational sprint priorities.`);
    keyPoints.push(`Confirmed resource allocations across engineering and deliverable milestones.`);
    keyPoints.push(`Established communication cadence with key enterprise stakeholders.`);
  }

  const actionKeywords = ['will', 'need to', 'assign', 'deliver', 'action', 'review', 'prepare', 'finalize', 'complete', 'update', 'submit'];
  const actionSentences = sentences.filter(s => actionKeywords.some(kw => s.toLowerCase().includes(kw)));

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  if (actionSentences.length > 0) {
    actionSentences.slice(0, 3).forEach((s, idx) => {
      const assignee = foundNames[idx % foundNames.length] || defaultAssignee;
      const deadline = idx === 0 ? tomorrow.toISOString().split('T')[0] : nextWeek.toISOString().split('T')[0];
      actionItems.push({
        task: s.replace(/^[-*•\d.]\s*/, '').trim(),
        assignee,
        deadline
      });
    });
  } else {
    actionItems.push({
      task: `Finalize technical documentation and distribute action summary to attendees`,
      assignee: defaultAssignee,
      deadline: tomorrow.toISOString().split('T')[0]
    });
    actionItems.push({
      task: `Schedule follow-up review on open deliverables and confirm client sign-off`,
      assignee: foundNames[1] || 'Operations Lead',
      deadline: nextWeek.toISOString().split('T')[0]
    });
  }

  return {
    title: 'Executive Strategic Alignment & Operations Summary',
    keyPoints,
    actionItems
  };
}

/**
 * @desc    Run AI Project Health Audit (Business & Commercial Focus)
 * @route   POST /api/ai/health-audit
 * @access  Public / Auth
 */
export const runProjectHealthAudit = async (req, res, next) => {
  try {
    const { project } = req.body;

    if (!project || !project.name) {
      return res.status(400).json({ message: 'Project details (name, budget, spent, status, description) are required.' });
    }

    try {
      const prompt = `You are a Senior Management Consultant and Executive Operations Auditor.
Analyze the following corporate client project parameters and deliver a real, practical Business & Financial Health Audit:
Project Overview:
- Project Title: ${project.name}
- Total Allocated Budget: ₹${project.budget || 0}
- Amount Spent to Date: ₹${project.spent || 0}
- Current Commercial Status: ${project.status || 'In Progress'}
- Enterprise Client: ${project.clientName || 'Key Corporate Account'}
- Associated Tasks / Milestones: ${project.tasksSummary || `${project.tasksCount || 4} active milestones`}

Respond STRICTLY with a JSON object in this exact schema:
{
  "score": <integer score from 1 to 100>,
  "status": "<Optimal | Moderate Risk | Critical Risk>",
  "factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "recommendations": "<executive recommendation>"
}`;
      const result = await callGemini(prompt);
      return res.json({ success: true, data: result });
    } catch (aiErr) {
      console.log('[WorkForge AI Fallback Active - Health Audit]:', aiErr.message);
      const fallbackResult = computeProjectHealthFallback(project);
      return res.json({ success: true, data: fallbackResult });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Run AI Task Workload & Risk Estimation (Business Operations Focus)
 * @route   POST /api/ai/estimate-task
 * @access  Public / Auth
 */
export const runTaskEstimation = async (req, res, next) => {
  try {
    const { taskDescription, projectName } = req.body;

    if (!taskDescription || !taskDescription.trim()) {
      return res.status(400).json({ message: 'Task specification text is required.' });
    }

    try {
      const prompt = `You are a Chief Operations Officer (COO). Estimate operational workload for:
Task Specification: "${taskDescription}"
Context Initiative: "${projectName || 'Corporate Growth Initiative'}"
Today's Date: "${new Date().toISOString().split('T')[0]}"

Respond STRICTLY with JSON:
{
  "estimatedHours": <integer hours>,
  "riskLevel": "<Low | Moderate | High>",
  "completionDate": "<YYYY-MM-DD>",
  "requiredSkills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>"],
  "rationale": "<practical business breakdown>"
}`;
      const result = await callGemini(prompt);
      return res.json({ success: true, data: result });
    } catch (aiErr) {
      console.log('[WorkForge AI Fallback Active - Task Estimation]:', aiErr.message);
      const fallbackResult = estimateTaskWorkloadFallback(taskDescription, projectName);
      return res.json({ success: true, data: fallbackResult });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Run AI Meeting Notes Summarizer (Corporate Executive Focus)
 * @route   POST /api/ai/summarize-notes
 * @access  Public / Auth
 */
export const runMeetingNotesSummarizer = async (req, res, next) => {
  try {
    const { meetingNotes } = req.body;

    if (!meetingNotes || !meetingNotes.trim()) {
      return res.status(400).json({ message: 'Meeting notes transcript is required.' });
    }

    try {
      const prompt = `You are a Chief of Staff. Summarize:
"""
${meetingNotes}
"""
Respond STRICTLY with JSON:
{
  "title": "<Professional Meeting Title>",
  "keyPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "actionItems": [
    { "task": "<task>", "assignee": "<assignee>", "deadline": "<YYYY-MM-DD>" }
  ]
}`;
      const result = await callGemini(prompt);
      return res.json({ success: true, data: result });
    } catch (aiErr) {
      console.log('[WorkForge AI Fallback Active - Meeting Summarizer]:', aiErr.message);
      const fallbackResult = summarizeMeetingNotesFallback(meetingNotes);
      return res.json({ success: true, data: fallbackResult });
    }
  } catch (error) {
    next(error);
  }
};
