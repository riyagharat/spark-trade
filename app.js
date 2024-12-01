// Initial setup for portfolio, trade history, and prices
let session = JSON.parse(localStorage.getItem("session")) || null;
let portfolio = {};
let tradeHistory = [];
// TODO: have these set up to be against different stocks instead and pull live data for those instead

let prices = { Solar: 50, Wind: 40, Hydro: 30 };

document.addEventListener("DOMContentLoaded", () => {
    session ? loadApp() : showLogin();
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Mock check for credentials (replace with real authentication in production)
    if (username && password) {
        session = { username };
        localStorage.setItem("session", JSON.stringify(session));

        // Load the user's data from localStorage
        loadUserData(username);

        loadApp();
    } else {
        alert("Please enter valid credentials.");
    }
}

function loadUserData(username) {
    // Load user's portfolio and trade history based on their username
    portfolio = JSON.parse(localStorage.getItem(`${username}_portfolio`)) || { Solar: 0, Wind: 0, Hydro: 0 };
    tradeHistory = JSON.parse(localStorage.getItem(`${username}_tradeHistory`)) || [];
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
    const portfolioValue = calculatePortfolioValue();

    const updatedPrices = Object.entries(prices)
        .map(([commodity, price]) => `
            <li>
                ${commodity}: $<span id="${commodity}-price">${price}</span>/MWh 
                <button onclick="trade('buy', '${commodity}')">Buy</button> 
                <button onclick="trade('sell', '${commodity}')">Sell</button>
            </li>
        `)
        .join('');

    document.getElementById('content').innerHTML = `
        <h2>Dashboard</h2>
        <p><strong>Total Portfolio Value:</strong> $${portfolioValue}</p>
        <p><strong>Latest Market Prices:</strong></p>
        <ul>
            ${updatedPrices}
        </ul>
        <button onclick="showMarketNews()">View Market News</button>
    `;
}


function trade(action, commodity) {
    const price = parseFloat(prices[commodity]);
    const quantity = action === 'buy' ? 1 : -1;

    if (action === 'sell' && portfolio[commodity] <= 0) {
        alert(`You have no ${commodity} to sell!`);
        return;
    }

    portfolio[commodity] += quantity;
    tradeHistory.push(`${action.toUpperCase()} ${commodity} at $${price}/MWh`);

    // Save the updated portfolio and trade history to localStorage for the current user
    localStorage.setItem(`${session.username}_portfolio`, JSON.stringify(portfolio));
    localStorage.setItem(`${session.username}_tradeHistory`, JSON.stringify(tradeHistory));

    alert(`${action.toUpperCase()} ${commodity} - New holding: ${portfolio[commodity]} MWh`);
    showPortfolio();
}

function calculatePortfolioValue() {
    let totalValue = 0;
    for (let key in portfolio) {
        totalValue += portfolio[key] * prices[key];
    }
    return totalValue.toFixed(2);
}

function showPortfolio() {
    const holdings = Object.entries(portfolio)
        .map(([commodity, amount]) => `<li>${commodity}: ${amount} MWh</li>`)
        .join('');

    const totalValue = calculatePortfolioValue();

    const history = tradeHistory
        .map(trade => `<li>${trade}</li>`)
        .join('');

    document.getElementById('content').innerHTML = `
        <h2>Your Portfolio</h2>
        <ul>${holdings}</ul>
        <p><strong>Total Portfolio Value:</strong> $${totalValue}</p>
        <h3>Trade History</h3>
        <ul>${history}</ul>
    `;
}

// Price simulation with color indicators
function simulatePriceUpdates() {
    setInterval(() => {
        for (let commodity in prices) {
            // Adjust prices dynamically with small random variations
            const oldPrice = parseFloat(prices[commodity]);
            const newPrice = (oldPrice * (1 + (Math.random() - 0.5) / 10)).toFixed(2);

            prices[commodity] = newPrice;

            // Update the displayed prices
            const priceElement = document.getElementById(`${commodity}-price`);
            if (priceElement) {
                priceElement.textContent = newPrice;

                // Add price-up or price-down classes for visual feedback
                if (newPrice > oldPrice) {
                    priceElement.classList.add("price-up");
                    priceElement.classList.remove("price-down");
                } else if (newPrice < oldPrice) {
                    priceElement.classList.add("price-down");
                    priceElement.classList.remove("price-up");
                }
            }
        }

        // Refresh portfolio value dynamically
        const totalPortfolioValue = calculatePortfolioValue();
        const portfolioValueElement = document.querySelector("strong:nth-child(2)");
        if (portfolioValueElement) {
            portfolioValueElement.textContent = `Total Portfolio Value: $${totalPortfolioValue}`;
        }
    }, 5000); // Updates every 5 seconds
}

document.addEventListener("DOMContentLoaded", () => {
    simulatePriceUpdates();
});
