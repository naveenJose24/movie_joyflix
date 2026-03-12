const setupScreen = document.getElementById('setup-screen');
const remoteScreen = document.getElementById('remote-screen');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const statusMsg = document.getElementById('statusMsg');
const inputs = Array.from(document.querySelectorAll('.code-inputs input'));

let peer = null;
let conn = null;

// Move focus for PIN input
inputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && input.value === '' && index > 0) {
      inputs[index - 1].focus();
    }
    if (e.key === 'Enter') {
      connectBtn.click();
    }
  });
});

function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

connectBtn.addEventListener('click', () => {
  const code = inputs.map(i => i.value).join('');
  if (code.length !== 4) {
    statusMsg.textContent = 'Please enter a 4-digit code.';
    return;
  }

  statusMsg.textContent = 'Connecting...';
  connectBtn.disabled = true;

  if (peer) peer.destroy();
  
  peer = new Peer();
  peer.on('open', (id) => {
    const targetId = `joyflix-tv-${code}`;
    conn = peer.connect(targetId);

    // Some networks/browsers drop the 'open' event on the data channel
    // So we listen for a 'ready' status message from the TV as well
    let connected = false;
    const handleConnected = () => {
      if (connected) return;
      connected = true;
      statusMsg.textContent = 'Connected!';
      setTimeout(() => {
        setupScreen.classList.remove('active');
        remoteScreen.classList.add('active');
        connectBtn.disabled = false;
        vibrate();
      }, 500);
    };

    conn.on('open', handleConnected);

    conn.on('data', (data) => {
      if (data && data.type === 'status' && data.status === 'ready') {
        handleConnected();
      }
    });

    conn.on('close', resetUI);
    conn.on('error', (err) => {
      statusMsg.textContent = 'Connection error.';
      connectBtn.disabled = false;
    });
  });

  peer.on('error', (err) => {
    console.error(err);
    statusMsg.textContent = 'Could not find TV. Check code.';
    connectBtn.disabled = false;
  });
});

function resetUI() {
  if (conn) { conn.close(); conn = null; }
  setupScreen.classList.add('active');
  remoteScreen.classList.remove('active');
  statusMsg.textContent = 'Disconnected.';
  inputs.forEach(i => i.value = '');
  inputs[0].focus();
}

disconnectBtn.addEventListener('click', () => {
  resetUI();
  vibrate();
});

// ── Remote buttons (Back, Home, and D-Pad) ──
document.querySelectorAll('[data-key]').forEach(btn => {
  const handlePress = (e) => {
    e.preventDefault();
    const key = btn.getAttribute('data-key');
    if (conn && conn.open) {
      conn.send({ type: 'key', key });
      vibrate();
    }
  };
  
  btn.addEventListener('touchstart', handlePress, { passive: false });
  btn.addEventListener('mousedown', handlePress);
});

// ── Voice Dictation (Microphone) ──
const micBtn = document.getElementById('micBtn');

let isRecording = false;

if (micBtn) {
  micBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    vibrate();

    // 1. Try Capacitor Native Plugin First (for Android APK)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SpeechRecognition) {
      const SpeechCap = window.Capacitor.Plugins.SpeechRecognition;
      
      try {
        const available = await SpeechCap.available();
        if (!available.available) {
          alert("Speech recognition isn't available on this native device.");
          return;
        }

        const perm = await SpeechCap.checkPermissions();
        if (perm.speechRecognition !== 'granted') {
          const req = await SpeechCap.requestPermissions();
          if (req.speechRecognition !== 'granted') {
            alert("Please grant Microphone permissions to use Voice Dictation.");
            return;
          }
        }

        micBtn.classList.add('listening');
        
        // This will launch the native Android Speech Dialog
        const result = await SpeechCap.start({
          language: "en-US",
          maxResults: 1,
          prompt: "Say what to search...",
          partialResults: false,
          popup: true
        });

        if (result && result.matches && result.matches.length > 0) {
           const transcript = result.matches[0];
           if (conn && conn.open && transcript) {
             conn.send({ type: 'text', text: transcript });
             vibrate();
           }
        }
      } catch (err) {
        console.error("Speech Error:", err);
        // If user cancelled the popup, ignore it, otherwise alert
        if (String(err).indexOf('cancel') === -1) {
          alert("Native Speech Error: " + err);
        }
      } finally {
        micBtn.classList.remove('listening');
      }
    } 
    // 2. Fallback to Web Speech API (if run in desktop Chrome)
    else if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const WebSpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new WebSpeechAPI();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = function() {
        micBtn.classList.add('listening');
      };

      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        if (conn && conn.open && transcript) {
          conn.send({ type: 'text', text: transcript });
          vibrate();
        }
      };

      recognition.onerror = function(event) {
        alert('Web Speech Error: ' + event.error);
        micBtn.classList.remove('listening');
      };

      recognition.onend = function() {
        micBtn.classList.remove('listening');
      };

      try {
        recognition.start();
      } catch(e) { /* already started */ }
    } else {
      alert("Speech Recognition API is not supported in this environment.");
    }
  });
}
