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
    const pieSvg = document.getElementById('lc-pie-svg');

    // Update Text
    totalEl.innerText = data.totalSolved;
    easyCountEl.innerText = data.easySolved;
    mediumCountEl.innerText = data.mediumSolved;
    hardCountEl.innerText = data.hardSolved;

    // Generate Pie Chart
    const total = data.easySolved + data.mediumSolved + data.hardSolved;
    const easyPercent = (data.easySolved / total) * 100;
    const mediumPercent = (data.mediumSolved / total) * 100;
    const hardPercent = (data.hardSolved / total) * 100;

    // Colors
    const colors = {
        easy: '#00B8A3',
        medium: '#FFC01E',
        hard: '#FF375F'
    };

    // Create pie slices
    let currentAngle = -90; // Start from top
    const slices = [
        { percent: easyPercent, color: colors.easy, label: 'Easy' },
        { percent: mediumPercent, color: colors.medium, label: 'Medium' },
        { percent: hardPercent, color: colors.hard, label: 'Hard' }
    ];

    // Clear existing content
    pieSvg.innerHTML = '';

    // Draw each slice
    slices.forEach(slice => {
        if (slice.percent > 0) {
            const path = createPieSlice(100, 100, 80, currentAngle, currentAngle + (slice.percent * 3.6), slice.color);
            pieSvg.appendChild(path);
            currentAngle += slice.percent * 3.6;
        }
    });

    // Add center circle for donut effect
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', '100');
    centerCircle.setAttribute('cy', '100');
    centerCircle.setAttribute('r', '50');
    centerCircle.setAttribute('fill', '#FFFFFF');
    pieSvg.appendChild(centerCircle);
}

function createPieSlice(cx, cy, radius, startAngle, endAngle, color) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
        'M', cx, cy,
        'L', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'Z'
    ].join(' ');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', color);
    path.setAttribute('class', 'lc-pie-slice');

    return path;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
