// ==========================================
// 1. CRONÔMETRO COM DATA FIXA (Persistente)
// ==========================================
let savedStartDate = localStorage.getItem("couple_start_date");

if (!savedStartDate) {
  savedStartDate = new Date().toISOString();
  localStorage.setItem("couple_start_date", savedStartDate);
}

let startDate = new Date(savedStartDate);

function updateCounter() {
  const now = new Date();
  const diff = now - startDate;

  if (diff < 0) {
    document.getElementById("days").innerText = "0";
    document.getElementById("hours").innerText = "00";
    document.getElementById("minutes").innerText = "00";
    document.getElementById("seconds").innerText = "00";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("days").innerText = days;
  document.getElementById("hours").innerText = String(hours).padStart(2, '0');
  document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
  document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
}

setInterval(updateCounter, 1000);
updateCounter();

function openDateModal() {
  const formatted = startDate.toISOString().slice(0, 16);
  document.getElementById("start-date-input").value = formatted;
  document.getElementById("date-modal").classList.remove("hidden");
}

function closeDateModal() {
  document.getElementById("date-modal").classList.add("hidden");
}

function saveStartDate(e) {
  e.preventDefault();
  const inputVal = document.getElementById("start-date-input").value;
  if (inputVal) {
    startDate = new Date(inputVal);
    localStorage.setItem("couple_start_date", startDate.toISOString());
    updateCounter();
    closeDateModal();
  }
}

// ==========================================
// 2. MURAL DE FOTOS (GALERIA)
// ==========================================
const defaultPhotos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80",
    caption: "Nosso dia especial ❤️"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&q=80",
    caption: "Sorrisos inesquecíveis ✨"
  }
];

let photos = JSON.parse(localStorage.getItem("couple_photos")) || defaultPhotos;

function savePhotosToStorage() {
  localStorage.setItem("couple_photos", JSON.stringify(photos));
  renderPhotos();
}

function renderPhotos() {
  const container = document.getElementById("photo-grid");
  if (!container) return;

  container.innerHTML = "";

  if (photos.length === 0) {
    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 20px;">Nenhuma foto no mural ainda. Clique em "+ Adicionar Foto" para começar!</p>`;
    return;
  }

  photos.forEach((photo) => {
    const card = document.createElement("div");
    card.className = "photo-card";

    card.innerHTML = `
      <img src="${photo.url}" class="photo-thumb" onclick="viewPhoto('${photo.url}', '${photo.caption}')" alt="Foto">
      <div class="photo-caption">
        <span>${photo.caption || "Sem legenda"}</span>
        <button class="photo-delete-btn" onclick="deletePhoto(${photo.id})" title="Excluir">🗑️</button>
      </div>
    `;

    container.appendChild(card);
  });
}

function openPhotoModal() {
  document.getElementById("add-photo-modal").classList.remove("hidden");
}

function closePhotoModal() {
  document.getElementById("add-photo-modal").classList.add("hidden");
  document.getElementById("photo-url").value = "";
  document.getElementById("photo-caption").value = "";
}

function savePhoto(e) {
  e.preventDefault();
  const url = document.getElementById("photo-url").value.trim();
  const caption = document.getElementById("photo-caption").value.trim();

  if (url) {
    const newPhoto = {
      id: Date.now(),
      url,
      caption
    };
    photos.unshift(newPhoto);
    savePhotosToStorage();
    closePhotoModal();
  }
}

function deletePhoto(id) {
  if (confirm("Tem certeza que deseja excluir esta foto do mural?")) {
    photos = photos.filter(p => p.id !== id);
    savePhotosToStorage();
  }
}

function viewPhoto(url, caption) {
  document.getElementById("view-photo-img").src = url;
  document.getElementById("view-photo-caption").innerText = caption;
  document.getElementById("view-photo-modal").classList.remove("hidden");
}

function closeViewPhotoModal() {
  document.getElementById("view-photo-modal").classList.add("hidden");
}

renderPhotos();

// ==========================================
// 3. CARTA ESPECIAL PERSONALIZADA
// ==========================================
const defaultCustomLetter = "Meu amor,\n\nEscrevi esta carta para te lembrar do quanto você é especial para mim. Cada momento ao seu lado torna a vida mais bonita e alegre.\n\nCom todo o meu amor!";

let customLetter = localStorage.getItem("couple_custom_letter") || defaultCustomLetter;

function renderCustomLetter() {
  document.getElementById("custom-letter-preview").innerText = customLetter;
}

function openCustomLetterModal() {
  document.getElementById("custom-letter-input").value = customLetter;
  document.getElementById("custom-letter-modal").classList.remove("hidden");
}

function closeCustomLetterModal() {
  document.getElementById("custom-letter-modal").classList.add("hidden");
}

function saveCustomLetter(e) {
  e.preventDefault();
  const text = document.getElementById("custom-letter-input").value;
  customLetter = text;
  localStorage.setItem("couple_custom_letter", text);
  renderCustomLetter();
  closeCustomLetterModal();
}

renderCustomLetter();

// ==========================================
// 4. GERENCIAMENTO DOS MARCOS (CRUD)
// ==========================================
const defaultMilestones = [
  {
    id: 1,
    date: "Hoje",
    title: "O Início da Nossa Nova Fase",
    desc: "Começamos a contar oficialmente o nosso tempo!",
    img: ""
  }
];

let milestones = JSON.parse(localStorage.getItem("couple_milestones")) || defaultMilestones;

function saveMilestonesToStorage() {
  localStorage.setItem("couple_milestones", JSON.stringify(milestones));
  renderMilestones();
}

function renderMilestones() {
  const container = document.getElementById("timeline-list");
  if (!container) return;

  container.innerHTML = "";

  milestones.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "timeline-item";
    
    const imgHtml = item.img ? `<img src="${item.img}" class="timeline-img" alt="Foto">` : '';

    itemEl.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-header">
          <span class="date">${item.date}</span>
          <div class="timeline-actions">
            <button class="btn-icon" onclick="editMilestone(${item.id})" title="Editar">✏️</button>
            <button class="btn-icon" onclick="deleteMilestone(${item.id})" title="Excluir">🗑️</button>
          </div>
        </div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        ${imgHtml}
      </div>
    `;

    container.appendChild(itemEl);
  });
}

function openMilestoneModal(isEdit = false) {
  document.getElementById("milestone-modal-title").innerText = isEdit ? "Editar Marco" : "Novo Marco";
  document.getElementById("milestone-modal").classList.remove("hidden");
}

function closeMilestoneModal() {
  document.getElementById("milestone-modal").classList.add("hidden");
  document.getElementById("milestone-form").reset();
  document.getElementById("milestone-id").value = "";
}

function saveMilestone(e) {
  e.preventDefault();
  
  const id = document.getElementById("milestone-id").value;
  const date = document.getElementById("milestone-date").value;
  const title = document.getElementById("milestone-title").value;
  const desc = document.getElementById("milestone-desc").value;
  const img = document.getElementById("milestone-img").value;

  if (id) {
    const index = milestones.findIndex(m => m.id == id);
    if (index !== -1) {
      milestones[index] = { id: Number(id), date, title, desc, img };
    }
  } else {
    const newMilestone = {
      id: Date.now(),
      date,
      title,
      desc,
      img
    };
    milestones.unshift(newMilestone);
  }

  saveMilestonesToStorage();
  closeMilestoneModal();
}

function editMilestone(id) {
  const milestone = milestones.find(m => m.id == id);
  if (!milestone) return;

  document.getElementById("milestone-id").value = milestone.id;
  document.getElementById("milestone-date").value = milestone.date;
  document.getElementById("milestone-title").value = milestone.title;
  document.getElementById("milestone-desc").value = milestone.desc;
  document.getElementById("milestone-img").value = milestone.img || "";

  openMilestoneModal(true);
}

function deleteMilestone(id) {
  if (confirm("Tem certeza que deseja excluir este marco?")) {
    milestones = milestones.filter(m => m.id !== id);
    saveMilestonesToStorage();
  }
}

renderMilestones();

// ==========================================
// 5. NAVEGAÇÃO POR ABAS
// ==========================================
function switchTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).classList.add('active');
  element.classList.add('active');
}

// ==========================================
// 6. CARTAS "ABRIR QUANDO..."
// ==========================================
const lettersData = {
  triste: {
    title: "Quando estiver triste 🥺",
    icon: "🥺",
    text: "Lembre-se de que nenhum dia ruim dura para sempre e que eu estou sempre aqui para te ouvir e te dar o abraço mais apertado do mundo!"
  },
  saudade: {
    title: "Quando estiver com saudades 💭",
    icon: "💭",
    text: "Feche os olhos por 5 segundos e lembre do nosso último abraço. Logo estarei ao seu lado para te encher de carinho!"
  },
  sorrir: {
    title: "Quando precisar sorrir 😄",
    icon: "😄",
    text: "Lembre-se de quando a gente deu risada sem parar por causa daquela bobagem... Ver o seu sorriso é minha coisa favorita no mundo!"
  },
  bravo: {
    title: "Quando estiver bravo comigo 🙈",
    icon: "🙈",
    text: "Respira fundo! Eu te amo demais e tenho certeza de que podemos resolver tudo juntos."
  }
};

function openLetter(type) {
  const data = lettersData[type];
  document.getElementById("modal-icon").innerText = data.icon;
  document.getElementById("modal-title").innerText = data.title;
  document.getElementById("modal-text").innerText = data.text;
  document.getElementById("letter-modal").classList.remove("hidden");
}

function closeLetter() {
  document.getElementById("letter-modal").classList.add("hidden");
}

// ==========================================
// 7. SORTEADOR DE ENCONTROS
// ==========================================
const dateIdeas = [
  "🍕 Noite da Pizza Feita em Casa",
  "🍿 Maratona do Nosso Filme/Série Favorito",
  "🧺 Piquenique no Fim de Tarde",
  "🍔 Ir Conhecer uma Hamburgueria Nova",
  "🎮 Noite de Jogos e Petiscos",
  "🍦 Sair Só Para Comer Sobremesa"
];

function spinDate() {
  const resultElem = document.getElementById("date-result");
  let counter = 0;
  
  const interval = setInterval(() => {
    const randomTemp = dateIdeas[Math.floor(Math.random() * dateIdeas.length)];
    resultElem.innerText = randomTemp;
    counter++;
    if (counter > 12) {
      clearInterval(interval);
      const finalChoice = dateIdeas[Math.floor(Math.random() * dateIdeas.length)];
      resultElem.innerText = finalChoice;
    }
  }, 100);
}

// ==========================================
// 8. QUIZ DO CASAL
// ==========================================
const quizData = [
  {
    question: "Qual é a nossa atividade favorita juntos?",
    options: ["Assistir séries no sofá", "Sair para comer", "Viajar e passear", "Ficar conversando bobagem"],
    correct: 1
  },
  {
    question: "Qual detalhe eu mais amo em você?",
    options: ["O seu sorriso", "O seu abraço", "A sua risada", "Tudo isso junto!"],
    correct: 3
  }
];

let currentQuizIndex = 0;
let score = 0;

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  if (!container) return;
  
  if (currentQuizIndex >= quizData.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <span style="font-size: 3rem;">🎉</span>
        <h3 style="margin: 12px 0;">Quiz Concluído!</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Você completou o quiz do nosso relacionamento com sucesso!</p>
      </div>
    `;
    return;
  }

  const q = quizData[currentQuizIndex];
  document.getElementById("quiz-progress").innerText = `Pergunta ${currentQuizIndex + 1} de ${quizData.length}`;
  document.getElementById("quiz-question").innerText = q.question;

  const optionsDiv = document.getElementById("quiz-options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(index);
    optionsDiv.appendChild(btn);
  });
}

function handleAnswer(index) {
  if (index === quizData[currentQuizIndex].correct) {
    score++;
  }
  currentQuizIndex++;
  renderQuiz();
}

renderQuiz();
