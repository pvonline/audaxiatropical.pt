
/* ------ Inicio Reloj Digital ------*/

const $tiempo = document.querySelector('.tiempo'),
$fecha = document.querySelector('.fecha');

function digitalClock(){
    let f = new Date(),
    dia = f.getDate(),
    mes = f.getMonth() + 1,
    anio = f.getFullYear(),
    diaSemana = f.getDay();

    dia = ('0' + dia).slice(-2);
    mes = ('0' + mes).slice(-2)

    let timeString = f.toLocaleTimeString();
    $tiempo.innerHTML = timeString;

    let semana = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];
    let showSemana = (semana[diaSemana]);
    $fecha.innerHTML = `${showSemana}  ${dia}-${mes}-${anio}`
}
setInterval(() => {
    digitalClock()
}, 1000);
/* ------ Final Reloj Digital -------*/




/*----- Inicio Reproductor webSim.AI ------*/
const audio = new Audio();
audio.crossOrigin = "anonymous";
audio.src = 'https://stream.zeno.fm/qmen7kmxdf9uv';
const playBtn = document.getElementById('playBtn');
const playIcon = playBtn.querySelector('svg');
const volumeSlider = document.querySelector('.volume-slider');
const metadataDiv = document.getElementById('metadata');

// Auto start from 7 seconds
setTimeout(() => {
  audio.currentTime = 7;
}, 1000);

audio.autoplay = true;

// Handle audio loading errors
audio.onerror = (e) => {
  console.error('Audio error:', e);
  metadataDiv.textContent = 'Error cargando audio... intentando reconectar';
  // Try to reconnect after 5 seconds
  setTimeout(() => {
    audio.src = 'https://stream.zeno.fm/qmen7kmxdf9uv';
    audio.load();
    audio.play().catch(console.error);
  }, 5000);
};

// Update play button icon
function updatePlayButton(isPlaying) {
  if (isPlaying) {
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  } else {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

// Play/Pause toggle with error handling
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(error => {
      console.error('Playback failed:', error);
      metadataDiv.textContent = 'Error al reproducir... intentando nuevamente';
    });
  } else {
    audio.pause();
  }
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
  const value = e.target.value;
  audio.volume = value / 100;
  volumeSlider.style.background = `linear-gradient(90deg, var(--primary) 0%, var(--primary) ${value}%, #ffffff33 ${value}%)`;
  
  // Update volume percentage display
  document.querySelector('.volume-percentage').textContent = `${value}%`;
});

// Audio event listeners
audio.addEventListener('play', () => {
  updatePlayButton(true);
  metadataDiv.textContent = 'Conectando...';
});
audio.addEventListener('pause', () => updatePlayButton(false));
audio.addEventListener('playing', () => {
  metadataDiv.textContent = 'Reproduciendo...';
});

// Updated metadata handling
function updateMetadata() {
  fetch('https://api.radioking.io/radio/566375/track/current', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Metadata network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data && data.title) {
      metadataDiv.textContent = data.title;
    } else {
      metadataDiv.textContent = 'PALACIO TROPICAL - En vivo';
    }
  })
  .catch(error => {
    console.error('Error fetching metadata:', error);
    // Fallback to alternative metadata endpoint
    fetch('https://stream.zeno.fm/qmen7kmxdf9uv/metadata')
      .then(response => response.json())
      .then(data => {
        if (data.streamTitle) {
          metadataDiv.textContent = data.streamTitle;
        } else {
          metadataDiv.textContent = 'PALACIO TROPICAL - En vivo';
        }
      })
      .catch(err => {
        console.error('Fallback metadata fetch failed:', err);
        metadataDiv.textContent = 'PALACIO TROPICAL - En vivo';
      });
  });
}

// Update metadata more frequently
metadataTimer = setInterval(updateMetadata, 5000);
updateMetadata(); // Initial metadata fetch

// Cleanup
window.addEventListener('beforeunload', () => {
  clearInterval(metadataTimer);
  audio.pause();
  audio.src = '';
});

// Audio visualizer animation based on audio frequency
let audioContext;

function initAudioContext() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const bars = document.querySelectorAll('.bar');
    
    function animate() {
      requestAnimationFrame(animate);
      analyser.getByteFrequencyData(dataArray);
      
      bars.forEach((bar, index) => {
        const value = dataArray[index * 3];
        const scale = value / 255;
        bar.style.transform = `scaleY(${scale})`;
      });
    }
    
    animate();
  } catch (error) {
    console.error('Error initializing audio context:', error);
  }
}

// Initialize audio context on user interaction
playBtn.addEventListener('click', () => {
  if (!audioContext) {
    initAudioContext();
  }
});

// Force audio to start playing when ready
audio.addEventListener('canplay', () => {
  audio.play().catch(console.error);
});
  /*----- final Reproductor webSim.AI ------*/

