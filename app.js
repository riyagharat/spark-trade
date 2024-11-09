function showDashboard() {
    document.getElementById('content').innerHTML = `
        <h2>Energy Commodities</h2>
        <ul>
            <li>Solar Power - $50/MWh <button onclick="trade('buy', 'Solar')">Buy</button> <button onclick="trade('sell', 'Solar')">Sell</button></li>
            <li>Wind Power - $40/MWh <button onclick="trade('buy', 'Wind')">Buy</button> <button onclick="trade('sell', 'Wind')">Sell</button></li>
            <li>Hydro Power - $30/MWh <button onclick="trade('buy', 'Hydro')">Buy</button> <button onclick="trade('sell', 'Hydro')">Sell</button></li>
        </ul>
    `;
}

function showPortfolio() {
    document.getElementById('content').innerHTML = `<h2>Your Portfolio</h2><p>Trading history and holdings go here.</p>`;
}

function showMarketNews() {
    document.getElementById('content').innerHTML = `<h2>Market News</h2><p>Latest energy market updates go here.</p>`;
}

function trade(action, commodity) {
    alert(`${action.toUpperCase()} ${commodity}`);
    // Further logic to track trades
}

// Load the dashboard by default
showDashboard();
