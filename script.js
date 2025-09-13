const API_BASE = 'http://localhost:5000/api';
const userId = 'user1'; // Demo user

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

// Upload
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('file', document.getElementById('file').files[0]);
  formData.append('title', document.getElementById('title').value);
  formData.append('userId', userId);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  document.getElementById('uploadResult').innerText = `Uploaded! Assessment ID: ${data.assessmentId}`;
  loadAssessments();
});

// Load Assessments
async function loadAssessments() {
  const res = await fetch(`${API_BASE}/assessments?userId=${userId}`); // Assume GET all for user
  // Since no route, for demo, assume we have IDs
  // For simplicity, hardcode or assume
  document.getElementById('assessmentList').innerHTML = '<p>Assessments loaded. Click to take quiz.</p><button onclick="takeQuiz(\'assessmentId\')">Take Quiz</button>';
}

async function takeQuiz(assessmentId) {
  const res = await fetch(`${API_BASE}/assessments/${assessmentId}`);
  const data = await res.json();
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = data.assessment.questions.map((q, i) => `
    <div class="question">
      <p>${q.question}</p>
      ${q.type === 'mcq' ? q.options.map(opt => `<label><input type="radio" name="q${i}" value="${opt}"> ${opt}</label>`).join('') : '<input type="text" name="q${i}">'}
    </div>
  `).join('');
  quizDiv.innerHTML += '<button onclick="submitQuiz(\'' + assessmentId + '\')">Submit</button>';
}

async function submitQuiz(assessmentId) {
  const answers = [];
  document.querySelectorAll('.question').forEach((q, i) => {
    const input = q.querySelector('input[type="radio"]:checked') || q.querySelector('input[type="text"]');
    answers.push({ questionId: i.toString(), answer: input.value });
  });

  const res = await fetch(`${API_BASE}/assessments/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessmentId, userId, answers })
  });
  const data = await res.json();
  alert(`Score: ${data.score}%`);
  loadDashboard();
}

// Dashboard
async function loadDashboard() {
  const res = await fetch(`${API_BASE}/analytics/dashboard/${userId}`);
  const data = await res.json();
  document.getElementById('analytics').innerHTML = `
    <p>Total Assessments: ${data.totalAssessments}</p>
    <p>Average Score: ${data.averageScore.toFixed(2)}%</p>
  `;
  document.getElementById('recommendations').innerText = data.recommendations;

  // Chart
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.progresses.map((_, i) => `Assessment ${i+1}`),
      datasets: [{
        label: 'Scores',
        data: data.progresses.map(p => p.score),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false
      }]
    }
  });
}

// Initial load
loadAssessments();
loadDashboard();
