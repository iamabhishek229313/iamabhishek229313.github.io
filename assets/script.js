document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Update icon
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }

        // Update pie chart center color for dark mode
        updatePieChartTheme();
    });

    // Experience Accordion Logic
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach((targetDetail) => {
        targetDetail.addEventListener('click', () => {
            // Optional: Close others? Keeping them all open for now as per user preference.
        });
    });

    // Initialize Particle Background
    initParticleBackground();

    // Fetch LeetCode Stats
    fetchLeetCodeStats();
});

// Particle Background System
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    // Create particle grid
    function initParticles() {
        particles = [];
        const spacing = 40; // Distance between particles
        const cols = Math.ceil(canvas.width / spacing) + 1;
        const rows = Math.ceil(canvas.height / spacing) + 1;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                particles.push({
                    baseX: i * spacing,
                    baseY: j * spacing,
                    x: i * spacing,
                    y: j * spacing,
                    size: 2
                });
            }
        }
    }

    // Mouse move handler
    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

    // Animate particles
    function animate() {
        // Check if dark mode
        const isDarkMode = document.body.classList.contains('dark-mode');
        const bgColor = isDarkMode ? '#000000' : '#FFFFFF';
        const particleColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            let cursorDist = Infinity;

            // Calculate distance from mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - particle.x;
                const dy = mouse.y - particle.y;
                cursorDist = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150; // Maximum influence distance

                if (cursorDist < maxDistance) {
                    // Repulsion force - push particles away from cursor
                    const force = (1 - cursorDist / maxDistance) * 0.8;
                    const angle = Math.atan2(dy, dx);

                    // Apply repulsion force (negative to push away)
                    const pushX = -Math.cos(angle) * force * 30;
                    const pushY = -Math.sin(angle) * force * 30;

                    particle.x += pushX;
                    particle.y += pushY;
                }
            }

            // Always apply spring force to return to base position
            const dx = particle.baseX - particle.x;
            const dy = particle.baseY - particle.y;

            // Spring physics with damping
            particle.x += dx * 0.05; // Lower value = slower, smoother return
            particle.y += dy * 0.05;

            // Determine particle color based on cursor distance to BASE position
            // (not current position, which is displaced by repulsion)
            const innerRadius = 100;  // Orange zone
            const outerRadius = 250;  // Indigo/purple zone edge

            let fillColor = particleColor; // Default stale color

            if (mouse.x !== null && mouse.y !== null) {
                const bx = mouse.x - particle.baseX;
                const by = mouse.y - particle.baseY;
                const baseDist = Math.sqrt(bx * bx + by * by);

                if (baseDist < outerRadius) {
                    if (baseDist < innerRadius) {
                        // Close to cursor → bold orange
                        fillColor = 'rgb(255, 165, 0)'; // Solid orange
                    } else {
                        // Mid-range → bold indigo, slight fade at the very edge
                        const t = 1 - ((baseDist - innerRadius) / (outerRadius - innerRadius));
                        const opacity = 0.85 + t * 0.15; // 0.85 → 1.0 (always bold)
                        fillColor = `rgba(99, 102, 241, ${opacity})`; // Indigo (#6366F1)
                    }
                }
            }

            // Draw particle
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });

        animationId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Initialize
    resizeCanvas();
    animate();
}

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
    centerCircle.setAttribute('fill', document.body.classList.contains('dark-mode') ? '#1A1A1A' : '#FFFFFF');
    pieSvg.appendChild(centerCircle);
}

function updatePieChartTheme() {
    // Update the center circle color when theme changes
    const centerCircle = document.querySelector('#lc-pie-svg circle[r="50"]');
    if (centerCircle) {
        centerCircle.setAttribute('fill', document.body.classList.contains('dark-mode') ? '#1A1A1A' : '#FFFFFF');
    }
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
