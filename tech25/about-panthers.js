// about-panthers.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAjJH-gJjPcZeS1Ph-JL15_aN3cq5Ecr5Q",
    authDomain: "pinkpanther-27795.firebaseapp.com",
    databaseURL: "https://pinkpanther-27795-default-rtdb.firebaseio.com",
    projectId: "pinkpanther-27795",
    storageBucket: "pinkpanther-27795.appspot.com",
    messagingSenderId: "950188314786",
    appId: "1:950188314786:web:1be4f4c1e9ed874567c7fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let pantherData = {};
let currentPath = [];

// Fetch data
async function fetchPantherInfo() {
    const dbRef = ref(db, 'pinkPanthers');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        console.error("No data available");
        return {};
    }
}

// Render choices for the current path
function renderChoices(obj) {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

    if (typeof obj === "string") {
        // Final info text
        const sectionDiv = document.createElement("div");
        sectionDiv.classList.add("section");
        sectionDiv.innerHTML = `<p>${obj}</p>`;
        contentDiv.appendChild(sectionDiv);

        addBackButton();
        return;
    }

    if (Array.isArray(obj)) {
        // Array of facts or items
        obj.forEach(item => {
            if (typeof item === "string") {
                const sectionDiv = document.createElement("div");
                sectionDiv.classList.add("section");
                sectionDiv.innerHTML = `<p>${item}</p>`;
                contentDiv.appendChild(sectionDiv);
            } else if (item.name || item.title) {
                const btn = document.createElement("button");
                btn.classList.add("game-btn");
                // Fix labels with proper spacing
                btn.textContent = (item.name || item.title)
                                  .replace(/([a-z])([A-Z])/g, '$1 $2'); 
                btn.onclick = () => {
                    currentPath.push(btn.textContent);
                    showDetails(item);
                };
                contentDiv.appendChild(btn);
            }
        });
        addBackButton();
        return;
    }

    // Object with keys → show them as buttons
    Object.keys(obj).forEach(key => {
        const btn = document.createElement("button");
        btn.classList.add("game-btn");
        // Fix labels with proper spacing
        btn.textContent = key.replace(/([a-z])([A-Z])/g, '$1 $2');
        btn.onclick = () => {
            currentPath.push(key);
            renderChoices(obj[key]);
        };
        contentDiv.appendChild(btn);
    });

    if (currentPath.length > 0) {
        addBackButton();
    }
}

// Show all details for an object in a user-friendly block
function showDetails(item) {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

    const sectionDiv = document.createElement("div");
    sectionDiv.classList.add("section");

    Object.entries(item).forEach(([key, value]) => {
        sectionDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
    });

    contentDiv.appendChild(sectionDiv);
    addBackButton();
}

// Back button
function addBackButton() {
    const contentDiv = document.getElementById("content");
    const backBtn = document.createElement("button");
    backBtn.textContent = "⬅ Back";
    backBtn.classList.add("game-btn");
    backBtn.style.backgroundColor = "#999";
    backBtn.onclick = () => {
        currentPath.pop();
        let obj = pantherData;
        currentPath.forEach(p => {
            obj = obj[p];
        });
        renderChoices(obj);
    };
    contentDiv.appendChild(document.createElement("br"));
    contentDiv.appendChild(backBtn);
}

// Main load
document.addEventListener("DOMContentLoaded", async () => {
    pantherData = await fetchPantherInfo();
    renderChoices(pantherData);
});
