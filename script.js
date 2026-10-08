import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, doc, getDoc, setDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ SUBSTITUA PELAS SUAS CONFIGURAÇÕES DO FIREBASE CONSOLE ⚠️
const firebaseConfig = {
    apiKey: "AIzaSyAB8cfZQ42O5raGqCSO61P51D87ejRumf4",
    authDomain: "lulu-94121.firebaseapp.com",
    projectId: "lulu-94121",
    storageBucket: "lulu-94121.firebasestorage.app",
    messagingSenderId: "306455304159",
    appId: "1:306455304159:web:cc002dbda35c9538e8966a",
    measurementId: "G-7WEL3F30CP"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 1. CRONÔMETRO DE TEMPO (Sincronizado no Firestore)
// ==========================================
let startDate = new Date();
const configRef = doc(db, "settings", "general");

// Escuta em tempo real a data salva no banco
onSnapshot(configRef, (docSnap) => {
  if (docSnap.exists() && docSnap.data().startDate) {
    startDate = new Date(docSnap.data().startDate);
  } else {
    // Se não existir no banco, cria com a data atual
    setDoc(configRef, { startDate: startDate.toISOString() });
  }
  updateCounter();
});

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

window.openDateModal = () => {
  const formatted = startDate.toISOString().slice(0, 16);
  document.getElementById("start-date-input").value = formatted;
  document.getElementById("date-modal").classList.remove("hidden");
};

window.closeDateModal = () => {
  document.getElementById("date-modal").classList.add("hidden");
};

window.saveStartDate = async (e) => {
  e.preventDefault();
  const inputVal = document.getElementById("start-date-input").value;
  if (inputVal) {
    const newDate = new Date(inputVal).toISOString();
    await setDoc(configRef, { startDate: newDate }, { merge: true });
    window.closeDateModal();
  }
};

// ==========================================
// 2. MURAL DE FOTOS (Sincronizado no Firestore)
// ==========================================
const photosRef = collection(db, "photos");

onSnapshot(photosRef, (snapshot) => {
  const container = document.getElementById("photo-grid");
  if (!container) return;
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 20px;">Nenhuma foto no mural ainda.</p>`;
    return;
  }

  snapshot.forEach((docSnap) => {
    const photo = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.className = "photo-card";
    card.innerHTML = `
      <img src="${photo.url}" class="photo-thumb" onclick="viewPhoto('${photo.url}', '${photo.caption || ''}')" alt="Foto">
      <div class="photo-caption">
        <span>${photo.caption || "Sem legenda"}</span>
        <button class="photo-delete-btn" onclick="deletePhoto('${id}')" title="Excluir">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
});

window.openPhotoModal = () => document.getElementById("add-photo-modal").classList.remove("hidden");
window.closePhotoModal = () => {
  document.getElementById("add-photo-modal").classList.add("hidden");
  document.getElementById("photo-url").value = "";
  document.getElementById("photo-caption").value = "";
};

window.savePhoto = async (e) => {
  e.preventDefault();
  const url = document.getElementById("photo-url").value.trim();
  const caption = document.getElementById("photo-caption").value.trim();

  if (url) {
    await addDoc(photosRef, { url, caption, createdAt: Date.now() });
    window.closePhotoModal();
  }
};

window.deletePhoto = async (id) => {
  if (confirm("Deseja excluir esta foto?")) {
    await deleteDoc(doc(db, "photos", id));
  }
};

window.viewPhoto = (url, caption) => {
  document.getElementById("view-photo-img").src = url;
  document.getElementById("view-photo-caption").innerText = caption;
  document.getElementById("view-photo-modal").classList.remove("hidden");
};

window.closeViewPhotoModal = () => document.getElementById("view-photo-modal").classList.add("hidden");

// ==========================================
// 3. CARTA PERSONALIZADA (Firestore)
// ==========================================
const letterDocRef = doc(db, "letters", "special");

onSnapshot(letterDocRef, (docSnap) => {
  if (docSnap.exists()) {
    document.getElementById("custom-letter-preview").innerText = docSnap.data().text;
  } else {
    document.getElementById("custom-letter-preview").innerText = "Escreva uma carta especial para ele ler aqui!";
  }
});

window.openCustomLetterModal = async () => {
  const docSnap = await getDoc(letterDocRef);
  if (docSnap.exists()) {
    document.getElementById("custom-letter-input").value = docSnap.data().text;
  }
  document.getElementById("custom-letter-modal").classList.remove("hidden");
};

window.closeCustomLetterModal = () => document.getElementById("custom-letter-modal").classList.add("hidden");

window.saveCustomLetter = async (e) => {
  e.preventDefault();
  const text = document.getElementById("custom-letter-input").value;
  await setDoc(letterDocRef, { text, updatedAt: Date.now() });
  window.closeCustomLetterModal();
};

// ==========================================
// 4. NOSSOS MARCOS / TIMELINE (Firestore)
// ==========================================
const milestonesRef = collection(db, "milestones");

onSnapshot(milestonesRef, (snapshot) => {
  const container = document.getElementById("timeline-list");
  if (!container) return;
  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const item = docSnap.data();
    const id = docSnap.id;

    const itemEl = document.createElement("div");
    itemEl.className = "timeline-item";
    const imgHtml = item.img ? `<img src="${item.img}" class="timeline-img" alt="Foto">` : '';

    itemEl.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-header">
          <span class="date">${item.date}</span>
          <div class="timeline-actions">
            <button class="btn-icon" onclick="editMilestone('${id}', '${item.date}', '${item.title}', '${item.desc}', '${item.img || ''}')">✏️</button>
            <button class="btn-icon" onclick="deleteMilestone('${id}')">🗑️</button>
          </div>
        </div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        ${imgHtml}
      </div>
    `;
    container.appendChild(itemEl);
  });
});

window.openMilestoneModal = () => document.getElementById("milestone-modal").classList.remove("hidden");
window.closeMilestoneModal = () => {
  document.getElementById("milestone-modal").classList.add("hidden");
  document.getElementById("milestone-form").reset();
  document.getElementById("milestone-id").value = "";
};

window.saveMilestone = async (e) => {
  e.preventDefault();
  const id = document.getElementById("milestone-id").value;
  const date = document.getElementById("milestone-date").value;
  const title = document.getElementById("milestone-title").value;
  const desc = document.getElementById("milestone-desc").value;
  const img = document.getElementById("milestone-img").value;

  if (id) {
    await updateDoc(doc(db, "milestones", id), { date, title, desc, img });
  } else {
    await addDoc(milestonesRef, { date, title, desc, img, createdAt: Date.now() });
  }
  window.closeMilestoneModal();
};

window.editMilestone = (id, date, title, desc, img) => {
  document.getElementById("milestone-id").value = id;
  document.getElementById("milestone-date").value = date;
  document.getElementById("milestone-title").value = title;
  document.getElementById("milestone-desc").value = desc;
  document.getElementById("milestone-img").value = img;
  document.getElementById("milestone-modal").classList.remove("hidden");
};

window.deleteMilestone = async (id) => {
  if (confirm("Deseja excluir este marco?")) {
    await deleteDoc(doc(db, "milestones", id));
  }
};

// ==========================================
// 5. NAVEGAÇÃO E DEMAIS FUNÇÕES
// ==========================================
window.switchTab = (tabId, element) => {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  element.classList.add('active');
};

const lettersData = {
  triste: { title: "Quando estiver triste 🥺", icon: "🥺", text: "Nenhum dia ruim dura para sempre. Estou do seu lado sempre!" },
  saudade: { title: "Quando estiver com saudades 💭", icon: "💭", text: "Lembre do nosso último abraço. Logo estarei aí com você!" },
  sorrir: { title: "Quando precisar sorrir 😄", icon: "😄", text: "Lembre-se do nosso momento mais engraçado! Seu sorriso é meu motivo de alegria." },
  bravo: { title: "Quando estiver bravo comigo 🙈", icon: "🙈", text: "Eu te amo muito! Vamos conversar e resolver juntos." }
};

window.openLetter = (type) => {
  const data = lettersData[type];
  document.getElementById("modal-icon").innerText = data.icon;
  document.getElementById("modal-title").innerText = data.title;
  document.getElementById("modal-text").innerText = data.text;
  document.getElementById("letter-modal").classList.remove("hidden");
};

window.closeLetter = () => document.getElementById("letter-modal").classList.add("hidden");

const dateIdeas = [
  "🍕 Noite da Pizza Feita em Casa", "🍿 Maratona do Nosso Filme Favorito",
  "🧺 Piquenique no Fim de Tarde", "🍔 Ir Conhecer uma Hamburgueria Nova",
  "🎮 Noite de Jogos e Petiscos", "🍦 Sair Só Para Comer Sobremesa"
];

window.spinDate = () => {
  const resultElem = document.getElementById("date-result");
  let counter = 0;
  const interval = setInterval(() => {
    resultElem.innerText = dateIdeas[Math.floor(Math.random() * dateIdeas.length)];
    counter++;
    if (counter > 12) {
      clearInterval(interval);
      resultElem.innerText = dateIdeas[Math.floor(Math.random() * dateIdeas.length)];
    }
  }, 100);
};

// Quiz
const quizData = [
  { question: "Qual é a nossa atividade favorita juntos?", options: ["Assistir séries no sofá", "Sair para comer", "Viajar e passear", "Ficar conversando bobagem"], correct: 1 },
  { question: "Qual detalhe eu mais amo em você?", options: ["O seu sorriso", "O seu abraço", "A sua risada", "Tudo isso junto!"], correct: 3 }
];
let currentQuizIndex = 0;

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  if (!container) return;
  if (currentQuizIndex >= quizData.length) {
    container.innerHTML = `<div style="text-align: center; padding: 20px;"><span style="font-size: 3rem;">🎉</span><h3>Quiz Concluído!</h3></div>`;
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
    btn.onclick = () => { currentQuizIndex++; renderQuiz(); };
    optionsDiv.appendChild(btn);
  });
}
renderQuiz();
