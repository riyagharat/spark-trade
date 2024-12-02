// Constants
const CACHE_KEY = "live_prices_cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Initial setup for session and portfolio
let session = JSON.parse(localStorage.getItem("session")) || null;
let portfolio = {};
let tradeHistory = [];

const stockSymbols = { Solar: "AAPL", Wind: "AMRN", Hydro: "GOOG" };
let prices = { Solar: 0, Wind: 0, Hydro: 0 }; // Initial placeholder

const RAPIDAPI_KEY = "d8e32c10dbmsha541d67ebcdf919p140bc7jsn0e355ba46624";
const RAPIDAPI_HOST = "yahoo-finance15.p.rapidapi.com";

document.addEventListener("DOMContentLoaded", async () => {
    session = JSON.parse(localStorage.getItem("session")) || null;
    console.log("Session on page load:", session);

    if (session) {
        await fetchLivePrices(); // Ensure prices are fetched first
        loadApp(); // Load the app after fetching prices
    } else {
        showLogin(); // Show login page if no session
    }
});

async function fetchLivePrices() {
    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
    const now = Date.now();

    // Check if cached data exists and is within the valid duration
    if (cachedData && cachedData.prices && now - cachedData.timestamp < CACHE_DURATION) {
        console.log("Using cached data");
        prices = cachedData.prices; // Update prices with cached data
        if (session) showDashboard(); // Show dashboard if session exists
        return; // Exit the function since the cached data is still valid
    }

    console.log("Fetching live data from API...");

    let newPrices = {}; // Initialize an empty object to hold the new prices

    try {
        // Build the ticker query from the stockSymbols object
        const tickers = Object.values(stockSymbols).join(",");

        // Make the API call
        const response = await fetch(`https://${RAPIDAPI_HOST}/api/v1/markets/stock/quotes?ticker=${encodeURIComponent(tickers)}`, {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST,
            },
        });

        const data = await response.json();

        if (data && data.body) {
            // Map the API response to commodity prices
            for (let item of data.body) {
                const symbol = item.symbol; // Extract symbol
                const commodity = Object.keys(stockSymbols).find(
                    key => stockSymbols[key] === symbol
                );

                if (commodity) {
                    newPrices[commodity] = parseFloat(item.regularMarketPrice || 0);
                }
            }
        } else {
            console.error("Invalid API response:", data);
        }
    } catch (error) {
        console.error("Error fetching live prices:", error);
        // Set fallback prices to 0 if the API call fails
        for (let commodity of Object.keys(stockSymbols)) {
            newPrices[commodity] = 0;
        }
    }

    // Update the global prices variable with the new fetched prices
    prices = newPrices;

    // Cache the new prices with the current timestamp
    const cachePayload = {
        prices: newPrices,
        timestamp: now,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));

    // Once prices are fetched and stored, show the dashboard if session exists
    if (session) showDashboard();
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Mock check for credentials (replace with real authentication in production)
    if (username && password) {
        session = { username: username.trim() };
        localStorage.setItem("session", JSON.stringify(session));
        console.log("Session saved:", JSON.parse(localStorage.getItem("session")));
        location.reload(); // Reload to initialize session

        // Load the user's data from localStorage
        loadUserData(username);

        // Check for specific user
        if (username === "FPL") {
            loadFPLView(); // Load FPL-specific view
        } else {
            loadApp();
        }
    } else {
        alert("Please enter valid credentials.");
    }
}

function loadFPLView() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("content").innerHTML = `
        <h2>FPL Dashboard</h2>
        <p>Welcome, FPL! Here you can manage the platform.</p>
        <!--<button onclick="simulateAdminTask()">Perform Admin Task</button>-->
    `;
    document.getElementById("nav").style.display = "block";
}

function simulateAdminTask() {
    alert("FPL task performed successfully!");
}

function loadUserData(username) {
    // Load user's portfolio and trade history based on their username
    portfolio = JSON.parse(localStorage.getItem(`${username}_portfolio`)) || { Solar: 0, Wind: 0, Hydro: 0 };
    tradeHistory = JSON.parse(localStorage.getItem(`${username}_tradeHistory`)) || [];
}

function loadApp() {
    const logo = document.getElementById("logo");
    if (logo) {
        logo.src = "SparkTradelogo.png";
        logo.alt = "SparkTrade Logo";
    }

    const nav = document.getElementById("nav");
    if (nav) {
        nav.style.display = "block";
    }

    console.log(session);
    if (session.username === "FPL") {
        applyFPLBranding();
    }

    document.getElementById("login-section").style.display = "none";
    showDashboard();
}

function applyFPLBranding() {
    console.log('test');
    // Change the logo
    const logo = document.getElementById("logo");
    logo.src = "FPLsvg.png";
    logo.alt = "FPL Logo";

    // Add specific styling
    const header = document.querySelector("header");
    header.style.backgroundColor = "#0a0e2b"; // Optional specific background color

    // Add a specific style class
    document.body.classList.add("FPL-view");
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
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;">
                <span>${commodity}: $<strong id="${commodity}-price">${price || "N/A"}</strong>/MWh</span>
                <div>
                    <button style="background-color: #28a745;" onclick="trade('buy', '${commodity}')">Buy</button> 
                    <button style="background-color: #dc3545;" onclick="trade('sell', '${commodity}')">Sell</button>
                </div>
            </li>
        `)
        .join("");

    document.getElementById("content").innerHTML = `
        <h2>Dashboard</h2>
        <p><strong>Total Portfolio Value: $${portfolioValue}</strong></p>
        <ul>${updatedPrices}</ul>
        ${
        session.username === "FPL"
            ? `<div class="FPL-tools">
                    <h3>FPL Tools</h3>
                    <button onclick="simulateAdminTask()">Perform FPL Task</button>
                   </div>`
            : ""
    }
    `;

    // Ensure menu buttons are always present
    document.getElementById("nav").style.display = "block";
}


function trade(action, commodity) {
    const price = parseFloat(prices[commodity]);
    const quantity = action === "buy" ? 1 : -1;

    if (action === "sell") {
        // Check if the user has enough of the commodity to sell
        if (!portfolio[commodity] || portfolio[commodity] <= 0) {
            alert(`You don't have enough ${commodity} to sell!`);
            return;
        }
    }

    // Update the portfolio with the new quantity
    portfolio[commodity] = (portfolio[commodity] || 0) + quantity;

    // If holdings drop to 0, remove the commodity from the portfolio
    if (portfolio[commodity] <= 0) {
        delete portfolio[commodity];
    }

    // Record the trade in the trade history
    tradeHistory.push(`${action.toUpperCase()} ${commodity} at $${price}/MWh`);

    // Save updated portfolio and trade history to localStorage for the current user
    localStorage.setItem(`${session.username}_portfolio`, JSON.stringify(portfolio));
    localStorage.setItem(`${session.username}_tradeHistory`, JSON.stringify(tradeHistory));

    alert(`${action.toUpperCase()} ${commodity} - New holding: ${portfolio[commodity] || 0} MWh`);
    showPortfolio(); // Update the portfolio view
}

function calculatePortfolioValue() {
    let totalValue = 0;
    for (let key in portfolio) {
        const price = parseFloat(prices[key]) || 0;
        totalValue += portfolio[key] * price;
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
