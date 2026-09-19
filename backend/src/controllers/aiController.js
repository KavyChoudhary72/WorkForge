/**
 * WorkForge AI Controller using Google Gemini API (gemini-flash-latest)
 * Tailored for business operations, client project management, and commerce execution.
 */

async function callGemini(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: promptText }]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData.error?.message || `Gemini API returned status ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('No response content received from WorkForge AI.');
  }

  return JSON.parse(rawText);
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

    const prompt = `You are a Senior Management Consultant and Executive Operations Auditor.
Analyze the following corporate client project parameters and deliver a real, practical Business & Financial Health Audit:

STRICT GROUNDING DIRECTIVE:
Base your evaluation STRICTLY AND EXCLUSIVELY on the project facts provided below. Do not hallucinate external metrics or unverified figures. Analyze the actual numbers (budget, spent, status, description) given.

Project Overview:
- Project Title: ${project.name}
- Total Allocated Budget: ₹${project.budget || 0}
- Amount Spent to Date: ₹${project.spent || 0}
- Current Commercial Status: ${project.status || 'In Progress'}
- Enterprise Client: ${project.clientName || 'Key Corporate Account'}
- Strategic Description: ${project.description || 'Business operations initiative'}
- Associated Tasks / Milestones: ${project.tasksSummary || `${project.tasksCount || 4} active milestones`}

Respond STRICTLY with a JSON object in this exact schema:
{
  "score": <integer score from 1 to 100 calculated from budget ratio and status>,
  "status": "<Optimal | Moderate Risk | Critical Risk>",
  "factors": [
    "<insightful factor bullet 1 analyzing actual budget burn velocity vs progress>",
    "<insightful factor bullet 2 evaluating schedule or SLA risk>",
    "<insightful factor bullet 3 evaluating stakeholder alignment or profitability>"
  ],
  "recommendations": "<practical 1-2 sentence executive recommendation for the project manager>"
}`;

    const result = await callGemini(prompt);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[WorkForge AI Health Audit Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute WorkForge AI Health Audit.',
      error: error.message
    });
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

    const prompt = `You are a Chief Operations Officer (COO) & Business Project Director.
Estimate operational workload, commercial risk, target completion date, and required professional competencies for the following business task:

STRICT GROUNDING DIRECTIVE:
Analyze ONLY the task description provided below. Do not invent unrelated software engineering terms unless explicitly requested in the task text.

Task Specification: "${taskDescription}"
Context Initiative: "${projectName || 'Corporate Growth Initiative'}"
Today's Date: "${new Date().toISOString().split('T')[0]}"

Respond STRICTLY with a JSON object in this exact schema:
{
  "estimatedHours": <integer total estimated work hours>,
  "riskLevel": "<Low | Moderate | High>",
  "completionDate": "<YYYY-MM-DD calculated assuming standard 8-hour work days>",
  "requiredSkills": ["<business skill 1>", "<business skill 2>", "<business skill 3>", "<business skill 4>"],
  "rationale": "<practical business breakdown explaining effort distribution across audit/research, execution, and executive sign-off>"
}`;

    const result = await callGemini(prompt);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[WorkForge AI Task Estimate Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to estimate task workload.',
      error: error.message
    });
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

    const prompt = `You are a Chief of Staff and Executive Corporate Assistant. Summarize the following meeting discussion notes into clear executive takeaways and actionable deliverables:

STRICT GROUNDING DIRECTIVE:
Extract facts and tasks ONLY from the provided meeting notes. Do not hallucinate people or tasks not mentioned.

Meeting Transcript:
"""
${meetingNotes}
"""

Respond STRICTLY with a JSON object in this exact schema:
{
  "title": "<Professional Meeting Title>",
  "keyPoints": [
    "<Strategic takeaway point 1>",
    "<Strategic takeaway point 2>",
    "<Strategic takeaway point 3>"
  ],
  "actionItems": [
    {
      "task": "<Clear business deliverable task>",
      "assignee": "<Person name or Unassigned>",
      "deadline": "<Target Date YYYY-MM-DD or TBD>"
    }
  ]
}`;

    const result = await callGemini(prompt);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('[WorkForge AI Notes Summarizer Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to summarize meeting notes.',
      error: error.message
    });
  }
};
