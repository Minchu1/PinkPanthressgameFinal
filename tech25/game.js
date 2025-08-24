// Track game state + timing
window.gameStartTime = Date.now();
let stage = 1;
let clickCount = 0;
let clickTimer = null;

/* ------------------ Main Branches ------------------ */

function answerYes() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  if (stage === 1) {
    q.textContent = "Do you want to gather intel first?";
    stage = 2;

  } else if (stage === 2) {
    q.textContent = "You discover guard rotations every 20 minutes, where the cameras are, and an unguarded tunnel entrance.";
    stage = 3;

    choices.innerHTML = `
      <button class="game-btn" onclick="inspectBrick()">Inspect suspicious brick</button>
      <button class="game-btn" onclick="fail('You walk right in and trip the alarm!')">Ignore it, go straight in</button>
    `;
  } else if (stage === 4) {
    // continue after tunnel path
  }
}

function answerNo() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  if (stage === 1) {
    q.textContent = "You stroll into the Tower of London and spot the jewels behind glass.";
    choices.innerHTML = `
      <button class="game-btn" onclick="fail('You smash the glass — alarms blare and guards arrest you!')">Smash the glass</button>
      <button class="game-btn" onclick="fail('You beg the guard... he throws you out in shame.')">Beg the guard</button>
    `;
  } else if (stage === 2) {
    q.textContent = "Skipping intel was a mistake — you’re spotted!";
    choices.innerHTML = `<button class="game-btn" onclick="restart()">Restart</button>`;
  }
}

/* ------------------ Brick Challenge ------------------ */

function inspectBrick() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  q.textContent = "A hidden control panel! Click 50 times in 10 seconds to disable the alarm.";

  clickCount = 0;
  let timeLeft = 10;

  choices.innerHTML = `
    <div id="countdown" style="font-size:1.5rem; margin-bottom:15px;">Time left: ${timeLeft}s</div>
    <button class="game-btn" id="clicker">Click me!</button>
  `;

  const countdownEl = document.getElementById("countdown");
  const clicker = document.getElementById("clicker");

  const countdown = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 3) countdownEl.style.color = "red";
    if (timeLeft <= 0) clearInterval(countdown);
  }, 1000);

  clicker.onclick = () => {
    clickCount++;
    clicker.textContent = `${clickCount} clicks`;

    if (clickCount >= 50) {
      clearTimeout(clickTimer);
      clearInterval(countdown);
      congratulationsScreen();
    }
  };

  clickTimer = setTimeout(() => {
    clearInterval(countdown);
    if (clickCount < 50) fail("You didn’t click fast enough!");
  }, 10000);
}

function congratulationsScreen() {
  document.getElementById("question").textContent = "🎉 You disabled the alarm! 🎉";
  document.getElementById("choices").innerHTML = `
    <button class="game-btn continue-btn" onclick="tunnelSuccessBranch()">Continue →</button>
  `;
}

/* ------------------ Tunnel Path ------------------ */

function tunnelSuccessBranch() {
  stage = 4;
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  q.textContent = "You crawl through the tunnel undetected and end up in the vents. Where do you drop down?";
  choices.innerHTML = `
    <button class="game-btn" onclick="headGuardOffice()">Head Guard’s Office</button>
    <button class="game-btn" onclick="lockerRoom()">Locker Room</button>
    <button class="game-btn" onclick="fail('You trip the lasers and alarms!')">Jewel Room</button>
  `;
}

/* ------------------ Branch: Guard’s Office ------------------ */

function headGuardOffice() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  q.textContent = "You land in the head guard’s office and knock over a chair with a loud bang.";
  choices.innerHTML = `
    <button class="game-btn" onclick="fail('You freeze and get caught.')">Stay still</button>
    <button class="game-btn" onclick="hideUnderDesk()">Hide under the desk</button>
  `;
}

function hideUnderDesk() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  q.textContent = "The guard enters, tidies up some files, and leaves without noticing you.";
  choices.innerHTML = `
    <button class="game-btn" onclick="fail('You pass a guard in your hurry, he spots you.— you’re caught leaving.')">Sneak out</button>
  `;
}

/* ------------------ Branch: Locker Room ------------------ */

function lockerRoom() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  q.textContent = "You enter the locker room. Do you search it?";
  choices.innerHTML = `
    <button class="game-btn" onclick="foundUniform()">Yes</button>
    <button class="game-btn" onclick="fail('You leave and run right into a guard.')">No</button>
  `;
}

function foundUniform() {
  document.getElementById("question").textContent = "You find a guard uniform — now you blend in!";
  document.getElementById("choices").innerHTML = `
    <button class="game-btn" onclick="shiftChange()">Wait for shift change</button>
  `;
}

function shiftChange() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  q.textContent = "Shift change begins. How do you enter the vault?";
  choices.innerHTML = `
    <button class="game-btn" onclick="vaultCamera()">Swipe the badge you found in your uniform pocket</button>
    <button class="game-btn" onclick="fail('Biometric scan fails — alarms ring!')">Try the biometric scanner</button>
  `;
}

/* ------------------ Vault ------------------ */

function vaultCamera() {
  const q = document.getElementById("question");
  const choices = document.getElementById("choices");

  q.textContent = "You’re inside the vault, but a camera is watching. What do you do?";
  choices.innerHTML = `
    <button class="game-btn" onclick="viralWin()">look daringly into the camera</button>
    <button class="game-btn" onclick="quietWin()">Keep your head down and grab the jewels</button>
  `;
}

/* ------------------ Endings ------------------ */

function saveCompletionTime() {
  if (!window.gameStartTime) return console.error("Game start time not set!");
  const timeTaken = (Date.now() - window.gameStartTime) / 1000;

  const user = window.auth?.currentUser || null;
  if (!user) return console.error("No logged-in user.");

  const payload = {
    time: Number(timeTaken.toFixed(2)),
    finishedAt: new Date().toISOString(),
    uid: user.uid,
    username: user.displayName || "Anonymous",
  };

  window.setToDb(`completionTimes/${user.uid}`, payload);
}

function viralWin() {
  saveCompletionTime();
  document.getElementById("question").textContent = "You win — the world sees your heist all over social media, you’re viral!";
  document.getElementById("choices").innerHTML = `
    <button class="game-btn" onclick="restart()">Play again</button>
    <a href="about-jewels.html" class="game-btn">Learn about stolen jewels</a>
    <a href="home.html" class="game-btn">Back to home</a>
    <a href="leaderboard.html" class="game-btn">Leaderboard</a>
  `;
}

function quietWin() {
  saveCompletionTime();
  document.getElementById("question").textContent = "Success! You quietly steal the jewels and disappear without a trace.";
  document.getElementById("choices").innerHTML = `
    <button class="game-btn" onclick="restart()">Play again</button>
    <a href="about-jewels.html" class="game-btn">Learn about stolen jewels</a>
  `;
}

/* ------------------ Fail + Restart ------------------ */

function fail(message) {
  document.getElementById("question").textContent = `${message} You failed — try again.`;
  document.getElementById("choices").innerHTML = `
    <button class="game-btn" onclick="restart()">Restart</button>
  `;
}

function restart() {
  stage = 1;
  window.gameStartTime = Date.now();

  document.getElementById("question").textContent = "Do you want to plan the heist?";
  document.getElementById("choices").innerHTML = `
    <button class="game-btn" onclick="answerYes()">Yes</button>
    <button class="game-btn" onclick="answerNo()">No</button>
  `;
}

