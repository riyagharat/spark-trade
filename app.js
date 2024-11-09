// Mock database and session data
let session = localStorage.getItem("session") || null;
let portfolio = JSON.parse(localStorage.getItem("portfolio")) || { Solar: 0, Wind: 0, Hydro: 0 };
let tradeHistory = JSON.parse(localStorage.getItem("tradeHistory")) || [];
let prices = { Solar: 50, Wind: 40, Hydro: 30 };

document.addEventListener("DOMContentLoaded", () => {
    session ? loadApp() : showLogin();
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {  // Mock check
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
    `;
}

function trade(action, commodity) {
    const price = prices[commodity];
    const quantity = action === 'buy' ? 1 : -1;

    portfolio[commodity] += quantity;
    tradeHistory.push(`${action.toUpperCase()} ${commodity} at $${price}/MWh`);

    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    localStorage.setItem("tradeHistory", JSON.stringify(tradeHistory));

    alert(`${action.toUpperCase()} ${commodity} - New holding: ${portfolio[commodity]} MWh`);
    showPortfolio();
}

// Simulate dynamic price changes
function updatePrices() {
    for (let key in prices) {
        prices[key] = (prices[key] * (1 + (Math.random() - 0.5) / 10)).toFixed(2);
    }
}
