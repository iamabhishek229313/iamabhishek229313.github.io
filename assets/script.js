document.addEventListener('DOMContentLoaded', () => {
    // Experience Accordion Logic
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach((targetDetail) => {
        targetDetail.addEventListener('click', () => {
            // Optional: Close others? Keeping them all open for now as per user preference.
        });
    });

    // Fetch LeetCode Stats
    fetchLeetCodeStats();
});

async function fetchLeetCodeStats() {
    const username = 'iamabhishek229313';
    const apiUrl = `https://leetcode-stats-api.herokuapp.com/${username}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("API call failed");

        const data = await response.json();

        if (data.status === "success") {
            updateLeetCodeUI(data);
        } else {
            console.error("LeetCode API returned error:", data.message);
        }
    } catch (error) {
        console.error("Failed to fetch LeetCode stats:", error);
    }
}

function updateLeetCodeUI(data) {
    // Elements
    const totalEl = document.getElementById('lc-total');
    const easyCountEl = document.getElementById('lc-easy-count');
    const mediumCountEl = document.getElementById('lc-medium-count');
    const hardCountEl = document.getElementById('lc-hard-count');

    // Bars
    const easyBar = document.getElementById('lc-easy-bar');
    const mediumBar = document.getElementById('lc-medium-bar');
    const hardBar = document.getElementById('lc-hard-bar');

    // Update Text
    totalEl.innerText = data.totalSolved;
    easyCountEl.innerText = data.easySolved;
    mediumCountEl.innerText = data.mediumSolved;
    hardCountEl.innerText = data.hardSolved;

    // Calculate Percentages for Bars (relative to total questions? or relative to max? 
    // Let's make bars fill relative to the total solved for visualization or just 100% of their count vs total questions?
    // Actually, usually users like to see the distribution. Let's do % of Total Solved.
    // OR, simpler: just animate them to full width if we treat them as independent bars. 
    // Let's use % of Total Questions available to show "progress" or just standard visual.
    // "graphs ... like it shows at the leetcode profile" -> The profile puts them in a circle usually.
    // A simple bar relative to the total questions in that category is best.

    const easyPct = (data.easySolved / data.totalEasy) * 100;
    const mediumPct = (data.mediumSolved / data.totalMedium) * 100;
    const hardPct = (data.hardSolved / data.totalHard) * 100;

    easyBar.style.width = `${Math.max(5, easyPct)}%`; // Min 5% so it shows
    mediumBar.style.width = `${Math.max(5, mediumPct)}%`;
    hardBar.style.width = `${Math.max(5, hardPct)}%`;
}
