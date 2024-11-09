// Initial setup for portfolio, trade history, and prices
let session = JSON.parse(localStorage.getItem("session")) || null;
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || { Solar: 0, Wind: 0, Hydro: 0 };
let tradeHistory = JSON.parse(localStorage.getItem("tradeHistory")) || [];
let prices = { Solar: 50, Wind: 40, Hydro: 30 };

document.addEventListener("DOMContentLoaded", () => {
    session ? loadApp() : showLogin();
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {  // Mock check, no backend needed
        session = { username };
        localStorage.setItem("session", JSON.stringify(session));
        loadApp();
    } else {
        alert("Please enter valid credentials.");
    }
}

function loadApp() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("nav").style.display = "block";
    showDashboard();
}

function logout() {
    session = null;
    localStorage.removeItem("session");
    location.reload();
}

function showLogin() {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("nav").style.display = "none";
}

function showDashboard() {
    updatePrices();
    document.getElementById('content').innerHTML = `
        <h2>Energy Commodities</h2>
        <ul>
            <li>Solar Power - $${prices.Solar}/MWh
                <button onclick="trade('buy', 'Solar')">Buy</button>
                <button onclick="trade('sell', 'Solar')">Sell</button>
            </li>
            <li>Wind Power - $${prices.Wind}/MWh
                <button onclick="trade('buy', 'Wind')">Buy</button>
                <button onclick="trade('sell', 'Wind')">Sell</button>
            </li>
            <li>Hydro Power - $${prices.Hydro}/MWh
                <button onclick="trade('buy', 'Hydro')">Buy</button>
                <button onclick="trade('sell', 'Hydro')">Sell</button>
            </li>
        </ul>
    `;
}

function showPortfolio() {
    const holdings = Object.entries(portfolio)
        .map(([commodity, amount]) => `<li>${commodity}: ${amount} MWh</li>`)
        .join('');

    const history = tradeHistory
        .map(trade => `<li>${trade}</li>`)
        .join('');

    document.getElementById('content').innerHTML = `
        <h2>Your Portfolio</h2>
        <ul>${holdings}</ul>
        <h3>Trade History</h3>
        <ul>${history}</ul>
    `;
}

function showMarketNews() {
    document.getElementById('content').innerHTML = `
        <h2>Market News</h2>
        <p>Latest energy market updates will appear here.</p>
        <section id="market-data">
            <h2>Market Data</h2>
            <p id="energy-price">Loading...</p>
        </section>
    `;
}

function trade(action, commodity) {
    const price = parseFloat(prices[commodity]);
    const quantity = action === 'buy' ? 1 : -1;

    portfolio[commodity] += quantity;
    tradeHistory.push(`${action.toUpperCase()} ${commodity} at $${price}/MWh`);

    // Update local storage with new portfolio and trade history
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    localStorage.setItem("tradeHistory", JSON.stringify(tradeHistory));

    alert(`${action.toUpperCase()} ${commodity} - New holding: ${portfolio[commodity]} MWh`);
    showPortfolio();
}

// Function to simulate price changes
function updatePrices() {
    for (let key in prices) {
        prices[key] = (parseFloat(prices[key]) * (1 + (Math.random() - 0.5) / 10)).toFixed(2);
    }
}

// This is a limit of 25 requests per day that are free
const ALPHA_VANTAGE_API_KEY = 'GYPITQ0B3M8UKCG2';

async function fetchEnergyData() {
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=CL=F&apikey=GYPITQ0B3M8UKCG2`);
    const data = await response.json();

    if (data['Time Series (Daily)']) {
        const latestDate = Object.keys(data['Time Series (Daily)'])[0];
        const latestPrice = data['Time Series (Daily)'][latestDate]['4. close'];
        document.getElementById('energy-price').innerText = `Crude Oil Price: $${parseFloat(latestPrice).toFixed(2)}`;
    } else {
        console.error("Failed to fetch energy data", data);
        document.getElementById('energy-price').innerText = 'Energy Data Unavailable';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchEnergyData();  // Call this function on load
});

