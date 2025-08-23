import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAjJH-gJjPcZeS1Ph-JL15_aN3cq5Ecr5Q",
  authDomain: "pinkpanther-27795.firebaseapp.com",
  databaseURL: "https://pinkpanther-27795-default-rtdb.firebaseio.com",
  projectId: "pinkpanther-27795",
  storageBucket: "pinkpanther-27795.appspot.com",
  messagingSenderId: "950188314786",
  appId: "1:950188314786:web:1be4f4c1e9ed874567c7fb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let dbData = {};
const selected = {};

// disable start buttons until we have data
document.querySelectorAll("#startChoice button").forEach(btn => {
  btn.disabled = true;
});

// load crown jewels from Firebase
get(child(ref(db), "crownJewels"))
  .then(snap => {
    if (snap.exists()) {
      dbData = snap.val();
      console.log("crown jewels loaded:", dbData);

      document.querySelectorAll("#startChoice button").forEach(btn => {
        btn.disabled = false;
      });
    } else {
      console.warn("no crown jewels found in db");
    }
  })
  .catch(err => console.error("error fetching data:", err));


// ----- game flow -----

window.chooseStart = (type) => {
  selected.startType = type;

  startChoice.style.display = "none";
  categoryChoice.style.display = "block";
  categoryButtons.innerHTML = "";

  const categories = Object.keys(dbData[type]);
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.classList.add("button-52");
    btn.onclick = () => chooseCategory(cat);
    categoryButtons.appendChild(btn);
  });
};

window.chooseCategory = (category) => {
  selected.category = category;

  categoryChoice.style.display = "none";
  timePeriodChoice.style.display = "block";
  timeButtons.innerHTML = "";

  const periods = Object.keys(dbData[selected.startType][category]);
  periods.forEach(period => {
    const btn = document.createElement("button");
    btn.textContent = period;
    btn.classList.add("button-52");
    btn.onclick = () => chooseTimePeriod(period);
    timeButtons.appendChild(btn);
  });
};

window.chooseTimePeriod = (period) => {
  selected.period = period;

  timePeriodChoice.style.display = "none";
  countryChoice.style.display = "block";
  countryButtons.innerHTML = "";

  const countries = Object.keys(
    dbData[selected.startType][selected.category][period]
  );

  countries.forEach(country => {
    const btn = document.createElement("button");
    btn.textContent = country;
    btn.classList.add("button-52");
    btn.onclick = () => chooseCountry(country);
    countryButtons.appendChild(btn);
  });
};

window.chooseCountry = (country) => {
  selected.country = country;
  countryChoice.style.display = "none";

  const jewels = dbData[selected.startType][selected.category][selected.period][country];
  showResult(jewels);
};

function showResult(jewels) {
  const jewelName = Object.keys(jewels)[0];
  const jewelInfo = jewels[jewelName];

  resultText.innerHTML = `
    <p><strong>Jewel:</strong> ${jewelName}</p>
    <p><strong>Material:</strong> ${jewelInfo.material}</p>
    <p><strong>Taken By:</strong> ${jewelInfo.takenBy}</p>
  `;

  result.style.display = "block";
}

// restart button resets everything
document.getElementById("restartBtn").onclick = () => {
  result.style.display = "none";

  selected.startType = null;
  selected.category = null;
  selected.period = null;
  selected.country = null;

  startChoice.style.display = "block";
};
