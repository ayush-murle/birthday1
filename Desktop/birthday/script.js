/* ---------------- Floating stickers ---------------- */
const stickers = ['🌸','🦋','💗','🌷','✨','🎀','🍰','💌','🌼'];
const layer = document.getElementById('stickerLayer');
for(let i=0;i<18;i++){
  const s = document.createElement('div');
  s.className='sticker';
  s.textContent = stickers[Math.floor(Math.random()*stickers.length)];
  s.style.left = Math.random()*95+'%';
  s.style.top = Math.random()*95+'%';
  s.style.animationDelay = (Math.random()*5)+'s';
  s.style.fontSize = (18+Math.random()*22)+'px';
  layer.appendChild(s);
}

/* ---------------- Lock screen logic ---------------- */
const SECRET = "shourya"; // 🔑 change this to update the password
const lockScreen = document.getElementById('lockScreen');
const secretInput = document.getElementById('secretInput');
const unlockBtn = document.getElementById('unlockBtn');
const lockError = document.getElementById('lockError');
const mainContent = document.getElementById('mainContent');
const bgMusic = document.getElementById('bgMusic');

function tryUnlock(){
  const val = secretInput.value.trim().toLowerCase();
  if(val === SECRET){
    lockScreen.classList.add('hidden');
    mainContent.classList.add('show');
    bgMusic.volume = 0.55;
    bgMusic.play().catch(()=>{ /* browser blocked autoplay, user can press play manually if needed */ });
    document.body.style.overflow='auto';
  } else {
    lockError.textContent = "hmm, that's not quite it — try again 💭";
    const card = document.querySelector('.lock-card');
    card.style.animation='none';
    requestAnimationFrame(()=>{ card.style.animation='pop-in 0.4s ease'; });
  }
}
unlockBtn.addEventListener('click', tryUnlock);
secretInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') tryUnlock(); });

/* ---------------- Cake candle blow logic ---------------- */
const flame = document.getElementById('flame');
const smoke = document.getElementById('smoke');
const blowBtn = document.getElementById('blowBtn');
const relightBtn = document.getElementById('relightBtn');
const wishMsg = document.getElementById('wishMsg');
const cakeHint = document.getElementById('cakeHint');
let listening = false;
let audioCtx, analyser, micStream;

function extinguish(){
  flame.classList.add('out');
  smoke.classList.add('show');
  wishMsg.classList.add('show');
  blowBtn.style.display='none';
  relightBtn.style.display='inline-block';
  launchConfetti();
  stopListening();
}

function relight(){
  flame.classList.remove('out');
  smoke.classList.remove('show');
  wishMsg.classList.remove('show');
  blowBtn.style.display='inline-block';
  relightBtn.style.display='none';
  cakeHint.textContent = "tap the button and blow into your mic — or just tap again to blow it out";
}

function stopListening(){
  listening = false;
  if(micStream){ micStream.getTracks().forEach(t=>t.stop()); }
  if(audioCtx){ audioCtx.close().catch(()=>{}); }
}

async function startMicListening(){
  try{
    micStream = await navigator.mediaDevices.getUserMedia({ audio:true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    listening = true;
    cakeHint.textContent = "listening... blow now! 🌬️";

    let loudFrames = 0;
    function check(){
      if(!listening) return;
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a,b)=>a+b,0)/data.length;
      if(avg > 28){ loudFrames++; } else { loudFrames = Math.max(0,loudFrames-1); }
      if(loudFrames > 4){
        extinguish();
        return;
      }
      requestAnimationFrame(check);
    }
    check();
  } catch(err){
    cakeHint.textContent = "no mic access — just tap the button again to blow it out 😊";
  }
}

blowBtn.addEventListener('click', ()=>{
  if(!listening){
    startMicListening();
    blowBtn.dataset.armed = "true";
  } else {
    extinguish();
  }
});
blowBtn.addEventListener('click', function secondTapFallback(){
  if(blowBtn.dataset.armed === "true" && !flame.classList.contains('out')){
    blowBtn.dataset.tapCount = (parseInt(blowBtn.dataset.tapCount||"0") + 1);
    if(blowBtn.dataset.tapCount >= 2){ extinguish(); }
  }
});

relightBtn.addEventListener('click', relight);

/* ---------------- Confetti ---------------- */
function launchConfetti(){
  const colors = ['#E8607A','#F4B942','#D9C6F2','#C8EAD6','#FFD9E3'];
  for(let i=0;i<60;i++){
    const c = document.createElement('div');
    c.className='confetti';
    c.style.left = Math.random()*100+'vw';
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.transform = `rotate(${Math.random()*360}deg)`;
    c.style.borderRadius = Math.random()>0.5 ? '50%' : '2px';
    document.body.appendChild(c);
    const duration = 2500 + Math.random()*1500;
    c.animate([
      { transform:`translateY(0) rotate(0deg)`, opacity:1 },
      { transform:`translateY(100vh) rotate(${360+Math.random()*360}deg)`, opacity:0.9 }
    ], { duration, easing:'ease-in' });
    setTimeout(()=>c.remove(), duration+100);
  }
}
