/* =========================================================
   Goggins Player - by Adrian Goggins
   ========================================================= */

/* -------- 1. CATÁLOGO DE GÉNEROS Y CANCIONES --------
   Aquí defines los géneros y las canciones famosas que irás
   agregando. Solo coloca los MP3 en la carpeta del género
   y agrega la línea correspondiente aquí.
------------------------------------------------------ */
 CATALOG = {
  rock: {
    name: "🎸 Rock",
    songs: [
      // Ejemplo: { title: "Bohemian Rhapsody", artist: "Queen", file: "bohemian-rhapsody.mp3" },
    ]
  },
  pop: {
    name: "🎤 Pop",
    songs: [
      // { title: "Blinding Lights", artist: "The Weeknd", file: "blinding-lights.mp3" },
    ]
  },
  "hip-hop": {
    name: "🎧 Hip-Hop",
    songs: [
      // { title: "Lose Yourself", artist: "Eminem", file: "lose-yourself.mp3" },
    ]
  },
  electronica: {
    name: "🎛️ Electrónica",
    songs: [
      // { title: "Strobe", artist: "deadmau5", file: "strobe.mp3" },
    ]
  },
 
  reggaeton: {
  name: "🔥 Reggaetón",
  songs: [
    { title: "Lo Que Pasó, Pasó", artist: "Daddy Yankee", file: "lo-que-paso-paso.mp3" },
    { title: "Wiki Wiki", artist: "Yaviah", file: "wiki-wiki.mp3"},
    { title: "Mendigo", artist: "Vico C", file: "mendigo.mp3"},
    { title: "Dejale Caer To El Peso", artist: "Hector El Father", file: "dejale-caer-to-el-peso.mp3"},

  ]
},
  jazz: {
    name: "🎷 Jazz",
    songs: [
      // { title: "So What", artist: "Miles Davis", file: "so-what.mp3" },
    ]
  }
};

/* -------- 2. ESTADO GLOBAL -------- */
let currentGenre = null;
let currentTrack = 0;
let isPlaying = false;
let audioCtx, sourceNode, bassFilter, midFilter, trebleFilter, gainNode;

/* -------- 3. ELEMENTOS DOM -------- */
const genreListEl   = document.getElementById("genreList");
const trackListEl   = document.getElementById("trackList");
const genreTitleEl  = document.getElementById("currentGenreTitle");
const trackCountEl  = document.getElementById("trackCount");
const audioEl       = document.getElementById("audio");
const playPauseBtn  = document.getElementById("playPause");
const prevBtn       = document.getElementById("prev");
const nextBtn       = document.getElementById("next");
const progressEl    = document.getElementById("progress");
const curTimeEl     = document.getElementById("curTime");
const durTimeEl     = document.getElementById("durTime");
const volumeEl      = document.getElementById("volume");
const nowTitleEl    = document.getElementById("nowTitle");
const nowArtistEl   = document.getElementById("nowArtist");

/* =========================================================
   RENDER DE GÉNEROS Y CANCIONES
   ========================================================= */
function renderGenres() {
  genreListEl.innerHTML = "";
  Object.keys(CATALOG).forEach(key => {
    const genre = CATALOG[key];
    const btn = document.createElement("button");
    btn.className = "genre-btn";
    btn.innerHTML = `<span>${genre.name}</span><span class="count">${genre.songs.length}</span>`;
    btn.onclick = () => selectGenre(key);
    genreListEl.appendChild(btn);
  });
}

function selectGenre(key) {
  currentGenre = key;
  currentTrack = 0;
  document.querySelectorAll(".genre-btn").forEach(b => b.classList.remove("active"));
  [...genreListEl.children].forEach(b => {
    if (b.textContent.includes(CATALOG[key].name)) b.classList.add("active");
  });
  renderTracks();
}

function renderTracks() {
  const genre = CATALOG[currentGenre];
  genreTitleEl.textContent = genre.name;
  trackCountEl.textContent = `${genre.songs.length} canciones`;
  trackListEl.innerHTML = "";

  if (genre.songs.length === 0) {
    const li = document.createElement("li");
    li.className = "track empty";
    li.textContent = "Sin canciones todavía. Agrega MP3 en /music/" + currentGenre + "/ y edita script.js";
    trackListEl.appendChild(li);
    return;
  }

  genre.songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = "track";
    li.dataset.index = i;
    li.innerHTML = `
      <div class="track-num">${i + 1}</div>
      <div class="track-info">
        <div class="t-name">${song.title}</div>
        <div class="t-artist">${song.artist}</div>
      </div>
      <div class="track-dur">MP3</div>
    `;
    li.onclick = () => loadTrack(i, true);
    trackListEl.appendChild(li);
  });
}

/* =========================================================
   REPRODUCTOR
   ========================================================= */
function loadTrack(index, autoplay = false) {
  if (!currentGenre) return;
  const songs = CATALOG[currentGenre].songs;
  if (!songs[index]) return;

  currentTrack = index;
  const song = songs[index];
  audioEl.src = `music/${currentGenre}/${song.file}`;
  nowTitleEl.textContent = song.title;
  nowArtistEl.textContent = song.artist;

  document.querySelectorAll(".track").forEach((t, i) => {
    t.classList.toggle("playing", i === index);
  });

  if (autoplay) playAudio();
}

function playAudio() {
  initAudioContext();
  audioEl.play().then(() => {
    isPlaying = true;
    playPauseBtn.textContent = "⏸";
  }).catch(err => console.warn("Error al reproducir:", err));
}

function pauseAudio() {
  audioEl.pause();
  isPlaying = false;
  playPauseBtn.textContent = "▶";
}

playPauseBtn.onclick = () => isPlaying ? pauseAudio() : playAudio();

prevBtn.onclick = () => {
  const songs = CATALOG[currentGenre]?.songs || [];
  if (!songs.length) return;
  const i = (currentTrack - 1 + songs.length) % songs.length;
  loadTrack(i, isPlaying);
};

nextBtn.onclick = () => {
  const songs = CATALOG[currentGenre]?.songs || [];
  if (!songs.length) return;
  const i = (currentTrack + 1) % songs.length;
  loadTrack(i, isPlaying);
};

audioEl.addEventListener("ended", () => nextBtn.click());

/* Progreso */
audioEl.addEventListener("timeupdate", () => {
  if (!audioEl.duration) return;
  progressEl.value = (audioEl.currentTime / audioEl.duration) * 100;
  curTimeEl.textContent = formatTime(audioEl.currentTime);
  durTimeEl.textContent = formatTime(audioEl.duration);
});

progressEl.addEventListener("input", () => {
  if (!audioEl.duration) return;
  audioEl.currentTime = (progressEl.value / 100) * audioEl.duration;
});

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

/* Volumen */
volumeEl.value = 80;
audioEl.volume = 0.8;
volumeEl.addEventListener("input", () => {
  audioEl.volume = volumeEl.value / 100;
});

/* =========================================================
   ECUALIZADOR - Web Audio API
   Cadena: source -> bassFilter -> midFilter -> trebleFilter -> gainNode -> destination
   ========================================================= */
function initAudioContext() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  sourceNode = audioCtx.createMediaElementSource(audioEl);

  // Filtro de bajos (lowshelf)
  bassFilter = audioCtx.createBiquadFilter();
  bassFilter.type = "lowshelf";
  bassFilter.frequency.value = 200;
  bassFilter.gain.value = 0;

  // Filtro de medios (peaking)
  midFilter = audioCtx.createBiquadFilter();
  midFilter.type = "peaking";
  midFilter.frequency.value = 1000;
  midFilter.Q.value = 1;
  midFilter.gain.value = 0;

  // Filtro de agudos (highshelf)
  trebleFilter = audioCtx.createBiquadFilter();
  trebleFilter.type = "highshelf";
  trebleFilter.frequency.value = 3000;
  trebleFilter.gain.value = 0;

  // Ganancia general
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 1;

  // Cadena
  sourceNode
    .connect(bassFilter)
    .connect(midFilter)
    .connect(trebleFilter)
    .connect(gainNode)
    .connect(audioCtx.destination);
}

/* Controles */
const bassEl   = document.getElementById("bass");
const midEl    = document.getElementById("mid");
const trebleEl = document.getElementById("treble");
const gainEl   = document.getElementById("gain");

function updateFilter(filter, value) {
  if (!filter) return;
  filter.gain.value = parseFloat(value);
}

bassEl.addEventListener("input", () => {
  initAudioContext();
  updateFilter(bassFilter, bassEl.value);
  document.getElementById("bassVal").textContent = bassEl.value + "dB";
});
midEl.addEventListener("input", () => {
  initAudioContext();
  updateFilter(midFilter, midEl.value);
  document.getElementById("midVal").textContent = midEl.value + "dB";
});
trebleEl.addEventListener("input", () => {
  initAudioContext();
  updateFilter(trebleFilter, trebleEl.value);
  document.getElementById("trebleVal").textContent = trebleEl.value + "dB";
});
gainEl.addEventListener("input", () => {
  initAudioContext();
  const g = gainEl.value / 100;
  gainNode.gain.value = g;
  document.getElementById("gainVal").textContent = gainEl.value + "%";
});

/* Presets */
document.querySelectorAll(".eq-presets button").forEach(btn => {
  btn.onclick = () => {
    initAudioContext();
    const preset = btn.dataset.preset;
    let b = 0, m = 0, t = 0, g = 100;

    switch (preset) {
      case "flat":       b = 0;   m = 0;   t = 0;   g = 100; break;
      case "bass":       b = 15;  m = 0;   t = 2;   g = 110; break;
      case "vocal":      b = -3;  m = 8;   t = 2;   g = 105; break;
      case "rock":       b = 8;   m = -2;  t = 6;   g = 110; break;
      case "electronic": b = 12;  m = 4;   t = 8;   g = 115; break;
    }

    bassEl.value = b;   bassFilter.gain.value = b;
    midEl.value = m;    midFilter.gain.value = m;
    trebleEl.value = t; trebleFilter.gain.value = t;
    gainEl.value = g;   gainNode.gain.value = g / 100;

    document.getElementById("bassVal").textContent = b + "dB";
    document.getElementById("midVal").textContent = m + "dB";
    document.getElementById("trebleVal").textContent = t + "dB";
    document.getElementById("gainVal").textContent = g + "%";
  };
});

/* Reset */
document.getElementById("resetEq").onclick = () => {
  bassEl.value = 0; midEl.value = 0; trebleEl.value = 0; gainEl.value = 100;
  if (bassFilter) {
    bassFilter.gain.value = 0;
    midFilter.gain.value = 0;
    trebleFilter.gain.value = 0;
    gainNode.gain.value = 1;
  }
  ["bass","mid","treble"].forEach(k => document.getElementById(k+"Val").textContent = "0dB");
  document.getElementById("gainVal").textContent = "100%";
};

/* Guardar ajustes en localStorage */
document.getElementById("saveEq").onclick = () => {
  const settings = {
    bass: bassEl.value,
    mid: midEl.value,
    treble: trebleEl.value,
    gain: gainEl.value
  };
  localStorage.setItem("goggins_eq", JSON.stringify(settings));
  alert("✅ Ecualización guardada");
};

/* Cargar ajustes guardados */
(function loadSavedEq() {
  const saved = JSON.parse(localStorage.getItem("goggins_eq") || "null");
  if (saved) {
    bassEl.value = saved.bass;
    midEl.value = saved.mid;
    trebleEl.value = saved.treble;
    gainEl.value = saved.gain;
    ["bassVal","midVal","trebleVal"].forEach((id, i) => {
      const key = ["bass","mid","treble"][i];
      document.getElementById(id).textContent = saved[key] + "dB";
    });
    document.getElementById("gainVal").textContent = saved.gain + "%";
  }
})();

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */
renderGenres();
selectGenre("rock"); // géneros inicial
