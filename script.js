function applyBackground(url) {
    const background = document.getElementById("background");
    if (background) {
        background.style.backgroundImage = `url('${url}')`;
    }
}

async function loadBackupFirst() {
    try {
        const response = await fetch("/backupimg.json");
        const backupImages = await response.json();
        const randomImg = backupImages[Math.floor(Math.random() * backupImages.length)];
        applyBackground(randomImg);
    } catch (error) {
        console.log("Backup failed to load");
    }
}

async function setNasaBackground() {
    const today = new Date().toDateString();
    const cachedResponse = localStorage.getItem("nasa_data");
    const cachedDate = localStorage.getItem("nasa_today_date");

    if (cachedResponse && cachedDate === today) {
        applyBackground(JSON.parse(cachedResponse).url);
        return; 
    }

    // 1. Load backup immediately so there is no white screen
    await loadBackupFirst();

    try {
        // 2. Fetch only the JSON data (this is fast)
        const response = await fetch("/api/nasa");
        if (!response.ok) throw new Error("NASA Offline");
        const result = await response.json();

        if (result.media_type === "image") {
            localStorage.setItem("nasa_data", JSON.stringify(result));
            localStorage.setItem("nasa_today_date", today);
            
            // 3. We do NOT 'await' the image actually appearing.
            // We just tell the CSS "here is your new URL" and move to the next function.
            applyBackground(result.url);
        }
    } catch (error) {
        console.log("Sticking with backup.");
    }
}

async function setWeather() {
    try {
        console.log("Weather process started...");
        const response = await fetch("/api/weather");
        const data = await response.json();
        displayWeather(data); 
    } catch (e) {
        console.error("Weather failed", e);
    }
}

function displayWeather(data) {
    const weatherElement = document.getElementById("weather");
    if (weatherElement && data.current) {
        const temp = data.current.temperature_2m;
        const wind = data.current.wind_speed_10m;
        const unit = data.current_units.temperature_2m;

        weatherElement.innerHTML = `${temp}${unit} | Wind: ${wind}km/h`;
    } else {
        console.error("Weather data format is unexpected:", data);
    }
}

function updateTime() {
    const timeElement = document.getElementById("time");
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    timeElement.innerText = `${hours}:${minutes}:${seconds}`;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime();

setNasaBackground(); 
setWeather();