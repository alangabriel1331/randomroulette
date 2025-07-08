// Modal reutilizable para sobreviviente o elegido
window.showSurvivorModal = function(name, mode) {
  var modal = document.getElementById('survivorModal');
  var nameDiv = document.getElementById('survivorName');
  var titleDiv = document.getElementById('modalTitle');
  if (modal && nameDiv && titleDiv) {
    nameDiv.textContent = `"${name}"`;
    if (mode === 'first') {
      titleDiv.textContent = '👑 ¡HA SIDO ELEGIDO! 👑';
    } else {
      titleDiv.textContent = '👑 ¡SOBREVIVIENTE! 👑';
    }
    // Asegurar que el modal esté visible y al frente
    modal.style.display = 'flex';
    modal.style.opacity = 0;
    modal.style.zIndex = 9999;
    // Forzar reflow para que la transición funcione siempre
    void modal.offsetWidth;
    setTimeout(function() {
      modal.style.opacity = 1;
    }, 10);
  } else {
    // Si por alguna razón no existe, intentar mostrarlo después de un pequeño delay
    setTimeout(function() {
      window.showSurvivorModal(name, mode);
    }, 100);
  }
}

window.closeSurvivorModal = function() {
  var modal = document.getElementById('survivorModal');
  if (modal) {
    modal.style.opacity = 0;
    setTimeout(() => { modal.style.display = 'none'; }, 310);
  }
}
// Reiniciar configuración actual
function resetConfig() {
  // Limpiar inputs
  document.getElementById('username').value = '';
  document.getElementById('lives').value = '';
  document.getElementById('spinTime').value = '';
  // Reiniciar radios
  document.querySelector('input[name="mode"][value="sudden"]').checked = true; // Cambia a "sudden"
  if (typeof highlightMode === 'function') highlightMode();
  // Limpiar jugadores y ruleta
  users = [];
  if (window.players) window.players = [];
  angle = 0;
  if (typeof renderPlayers === 'function') renderPlayers();
  if (typeof drawWheel === 'function') drawWheel();
  // Limpiar historial de sucesos
  var ul = document.getElementById('eventList');
  if (ul) ul.innerHTML = '';
}
// Mezclar aleatoriamente los jugadores
// Mezclar aleatoriamente los jugadores en la ruleta
function shufflePlayers() {
  if (users.length < 2) return;
  for (let i = users.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  drawWheel();
}

let users = [];
let angle = 0;
let spinTime = 10;
let spinCount = 0;
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const colors = ['#6f42c1', '#8e44ad', '#5dade2', '#48c9b0', '#f39c12', '#d35400'];

function drawHearts(user) {
  let hearts = '';
  for (let i = 0; i < user.originalLives; i++) {
    hearts += i < user.lives ? '❤️' : '🖤';
  }
  return hearts;
}

function getUniqueColor(index, prevColor, usedColors) {
  let tries = 0;
  let color;
  do {
    color = colors[Math.floor(Math.random() * colors.length)];
    tries++;
  } while (
    (color === prevColor || usedColors.includes(color)) &&
    tries < 20
  );
  usedColors.push(color);
  return color;
}

function addUser() {
  const name = document.getElementById("username").value.trim();
  let livesInput = document.getElementById("lives").value;
  let lives = parseInt(livesInput);
  if (name) {
    if (!livesInput || isNaN(lives) || lives < 1) lives = 1;
    users.push({ name, lives, originalLives: lives });
    drawWheel();
    const hearts = '❤️'.repeat(lives);
    addEventHistory(`➕ "${name}" fue agregado con ${hearts}`);
    document.getElementById("username").value = "";
    document.getElementById("lives").value = "";
  }
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const segments = users.length;
  if (segments === 0) return;
  const anglePerSegment = (2 * Math.PI) / segments;

  let usedColors = [];
  let prevColor = null;
  for (let i = 0; i < segments; i++) {
    const start = i * anglePerSegment;
    const end = start + anglePerSegment;
    const color = getUniqueColor(i, prevColor, usedColors);
    prevColor = color;

    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, start, end);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.lineTo(250 + 250 * Math.cos(start), 250 + 250 * Math.sin(start));
    ctx.stroke();

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(start + anglePerSegment / 2); // CENTRO del segmento
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.fillText(`${users[i].name} ${drawHearts(users[i])}`, 230, 5);
    ctx.restore();
  }
}

// HISTORIAL DE SUCESOS
function addEventHistory(text) {
  let ul = document.getElementById('eventList');
  if (!ul) {
    // Si no existe, lo creamos dentro de #eventHistory
    const historyDiv = document.getElementById('eventHistory');
    ul = document.createElement('ul');
    ul.id = 'eventList';
    ul.style = 'margin:8px 0 0 0;padding-left:18px;';
    if (historyDiv) historyDiv.appendChild(ul);
  }
  const li = document.createElement('li');
  li.textContent = text;
  // Asignar clase según tipo de evento
  if (/^➕/.test(text)) li.classList.add('add');
  else if (/☠️|💀/.test(text)) li.classList.add('lose');
  else if (/❌/.test(text)) li.classList.add('elim');
  else if (/👑/.test(text)) li.classList.add('win');
  else li.classList.add('other');
  ul.insertBefore(li, ul.firstChild);
  // Mostrar todos los eventos, sin límite
}

function spinWheel() {
  if (users.length === 0) return alert("No hay jugadores.");
  // Deshabilitar el botón de girar mientras gira
  var spinBtn = document.getElementById('spinButton');
  if (spinBtn) spinBtn.disabled = true;
  // Si modo muerte súbita, cambiar a calavera
  var spinMode = document.querySelector("input[name='mode']:checked")?.value;
  var btn = document.getElementById('spinButton');
  // Modo muerte súbita: calavera negra
  if (spinMode === 'sudden' && btn) {
    // Quitar cualquier corona previa
    var prevCrown = btn.querySelector('.crown-emoji');
    if (prevCrown) prevCrown.remove();
    // Quitar cualquier calavera previa
    var prevSkull = btn.querySelector('.skull-emoji');
    if (prevSkull) prevSkull.remove();
    var skull = document.createElement('span');
    skull.className = 'skull-emoji';
    skull.textContent = '💀';
    btn.appendChild(skull);
    btn.classList.add('skull');
    btn.classList.remove('crown');
  }
  // Modo elegido: corona dorada
  if (spinMode === 'first' && btn) {
    // Quitar cualquier calavera previa
    var prevSkull = btn.querySelector('.skull-emoji');
    if (prevSkull) prevSkull.remove();
    // Quitar cualquier corona previa
    var prevCrown = btn.querySelector('.crown-emoji');
    if (prevCrown) prevCrown.remove();
    var crown = document.createElement('span');
    crown.className = 'crown-emoji';
    crown.innerHTML = '&#x1F451;'; // 👑 corona unicode
    btn.appendChild(crown);
    btn.classList.add('crown');
    btn.classList.remove('skull');
  }
  const anglePerSegment = 360 / users.length;
  // Elegimos un índice aleatorio
  const i = Math.floor(Math.random() * users.length);
  // Calculamos el ángulo central del segmento
  const targetAngle = i * anglePerSegment + anglePerSegment / 2;
  // Giramos la ruleta para que ese ángulo central quede en -90° (arriba)
  angle += 360 * 5 + (targetAngle - 90);
  document.getElementById("wheel").style.transition = `transform ${spinTime}s cubic-bezier(.4,2,.6,1)`;
  document.getElementById("wheel").style.transform = `rotate(-${angle}deg)`;

  setTimeout(() => {
    // Calcular el índice del segmento bajo la punta del puntero (arriba, -90° canvas)
    const segments = users.length;
    const anglePerSegment = 360 / segments;
    // El ángulo bajo el puntero es (angle - 90) en sentido horario
    let pointerAngle = (angle - 90) % 360;
    if (pointerAngle < 0) pointerAngle += 360;
    let index = Math.floor(pointerAngle / anglePerSegment) % segments;
    if (index < 0) index += segments;
    const selected = users[index];
    const mode = document.querySelector("input[name='mode']:checked").value;

    if (mode === "first") {
      addEventHistory(`👑 "${selected.name}" fue elegido como ganador.`);
      window.showSurvivorModal(selected.name, 'first');
    } else {
      if (selected.lives > 1) {
        selected.lives--;
        addEventHistory(`☠️ "${selected.name}" perdió una vida (${drawHearts(selected)})`);
        drawWheel();
      } else if (selected.lives === 1) {
        selected.lives = 0;
        addEventHistory(`💀 "${selected.name}" perdió su última vida (${drawHearts(selected)})`);
        drawWheel();
        setTimeout(() => {
          addEventHistory(`❌ "${selected.name}" fue eliminado de la ruleta.`);
          users.splice(index, 1);
          drawWheel();
          if (users.length === 1) {
            addEventHistory(`👑 Sobreviviente: "${users[0].name}"`);
            setTimeout(function() {
              window.showSurvivorModal(users[0].name, 'sudden');
            }, 100);
          }
        }, 700);
      }
    }
    // Rehabilitar el botón de girar al finalizar la animación
    if (spinBtn) spinBtn.disabled = false;
    // Restaurar botón a flecha y color original
    var spinMode = document.querySelector("input[name='mode']:checked")?.value;
    var btn = document.getElementById('spinButton');
    if (btn) {
      btn.classList.remove('skull');
      btn.classList.remove('crown');
      var skull = btn.querySelector('.skull-emoji');
      if (skull) skull.remove();
      var crown = btn.querySelector('.crown-emoji');
      if (crown) crown.remove();
    }
  }, spinTime * 1000 + 200);
}

function getShuffleInterval() {
  const selected = document.querySelector("input[name='shuffle']:checked").value;
  if (selected === "custom") {
    return parseInt(document.getElementById("customShuffle").value) || 5;
  }
  return parseInt(selected);
}

function manualShuffle() {
  for (let i = users.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  drawWheel();
}

function setSpinTime() {
  const time = parseInt(document.getElementById("spinTime").value);
  if (time > 0) {
    spinTime = time;
  }
}
