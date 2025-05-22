document.addEventListener('DOMContentLoaded', () => {
    const artCanvas = document.getElementById('artCanvas');
    const numElementsInput = document.getElementById('numElements');
    const numElementsValueSpan = document.getElementById('numElementsValue');
    const colorPaletteSelect = document.getElementById('colorPalette');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const generatedCssCode = document.getElementById('generatedCssCode');
    const copyCssBtn = document.getElementById('copyCssBtn');

    // --- Color Palette Definitions (more curated palettes) ---
    const palettes = {
        vibrant: null, // Indicates truly random generation (previous "random")
        organic: [
            { h: [20, 50], s: [20, 60], l: [50, 80] }, // Earthy greens, browns, muted yellows
            { h: [80, 150], s: [20, 50], l: [40, 70] }, // Muted greens, moss
            { h: [200, 240], s: [10, 40], l: [60, 80] } // Soft blues, greys
        ],
        deepOcean: [
            { h: [200, 240], s: [70, 100], l: [20, 50] }, // Deep blues
            { h: [180, 200], s: [60, 90], l: [30, 60] }, // Turquoises, teals
            { h: [250, 270], s: [50, 80], l: [20, 40] }  // Dark purples
        ],
        forestMist: [
            { h: [90, 150], s: [20, 50], l: [30, 60] }, // Forest greens
            { h: [180, 220], s: [10, 30], l: [50, 70] }, // Misty blues/greys
            { h: [30, 60], s: [10, 30], l: [40, 60] } // Muted yellows/browns
        ],
        sunsetGlow: [
            { h: [0, 40], s: [80, 100], l: [50, 80] },   // Vibrant reds, oranges
            { h: [40, 60], s: [80, 100], l: [60, 90] },  // Bright yellows
            { h: [280, 320], s: [60, 90], l: [40, 70] } // Pinks, magentas
        ]
    };

    // --- Helper Functions ---
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Generates a random border-radius for blob shapes
    function getBlobBorderRadius() {
        return `${getRandomInt(30, 70)}% ${getRandomInt(30, 70)}% ${getRandomInt(30, 70)}% ${getRandomInt(30, 70)}% / ${getRandomInt(30, 70)}% ${getRandomInt(30, 70)}% ${getRandomInt(30, 70)}% ${getRandomInt(30, 70)}%`;
    }

    function getRandomColor(paletteType) {
        if (paletteType === 'vibrant' || !palettes[paletteType]) {
            // Truly random vibrant color
            const h = getRandomInt(0, 360);
            const s = getRandomInt(70, 100);
            const l = getRandomInt(40, 75);
            return `hsl(${h}, ${s}%, ${l}%)`;
        } else {
            // Pick from predefined palette constraints
            const paletteConstraints = palettes[paletteType][getRandomInt(0, palettes[paletteType].length - 1)];
            const h = getRandomInt(paletteConstraints.h[0], paletteConstraints.h[1]);
            const s = getRandomInt(paletteConstraints.s[0], paletteConstraints.s[1]);
            const l = getRandomInt(paletteConstraints.l[0], paletteConstraints.l[1]);
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
    }

    // Function to get generated CSS
    function getGeneratedCssString() {
        let css = '';
        artCanvas.querySelectorAll('.art-element').forEach((element, index) => {
            const elStyle = element.style;
            css += `.art-element-${index + 1} {\n`;
            css += `    position: absolute;\n`;
            css += `    width: ${elStyle.width};\n`;
            css += `    height: ${elStyle.height};\n`;
            css += `    top: ${elStyle.top};\n`;
            css += `    left: ${elStyle.left};\n`;
            css += `    background-color: ${elStyle.backgroundColor};\n`;
            css += `    border-radius: ${elStyle.borderRadius};\n`;
            css += `    transform: ${elStyle.transform};\n`;
            if (elStyle.boxShadow) {
                css += `    box-shadow: ${elStyle.boxShadow};\n`;
            }
            css += `    opacity: ${elStyle.opacity};\n`;
            css += `    z-index: ${elStyle.zIndex};\n`;
            if (elStyle.filter) {
                css += `    filter: ${elStyle.filter};\n`;
            }
            if (elStyle.animation) {
                 // Clean up the animation name to remove random suffixes for simpler CSS copy
                const animationName = elStyle.animation.split(' ')[0].replace(/-\d+$/, '');
                const animationProps = elStyle.animation.split(' ').slice(1).join(' ');
                css += `    animation: ${animationName} ${animationProps};\n`;
            }
            css += `}\n\n`;
        });

        // Also include the keyframe definitions if they are used
        const animationNamesUsed = new Set();
        artCanvas.querySelectorAll('.art-element').forEach(element => {
            if (element.style.animation) {
                animationNamesUsed.add(element.style.animation.split(' ')[0].replace(/-\d+$/, ''));
            }
        });

        if (animationNamesUsed.has('pulse')) {
            css += `@keyframes pulse {\n`;
            css += `    0% { transform: scale(1); opacity: 1; }\n`;
            css += `    50% { transform: scale(1.03); opacity: 0.95; }\n`;
            css += `    100% { transform: scale(1); opacity: 1; }\n`;
            css += `}\n\n`;
        }
        if (animationNamesUsed.has('float')) {
            css += `@keyframes float {\n`;
            css += `    0% { transform: translateY(0) rotate(0deg); }\n`;
            css += `    25% { transform: translateY(-5px) rotate(1deg); }\n`;
            css += `    50% { transform: translateY(0) rotate(0deg); }\n`;
            css += `    75% { transform: translateY(5px) rotate(-1deg); }\n`;
            css += `    100% { transform: translateY(0) rotate(0deg); }\n`;
            css += `}\n\n`;
        }

        return css;
    }


    // --- Core Art Generation Function ---
    function generateArt() {
        // Clear previous art
        artCanvas.innerHTML = '';
        generatedCssCode.textContent = '';
        const numElements = parseInt(numElementsInput.value);
        const selectedPalette = colorPaletteSelect.value;

        // Determine canvas size for percentage calculations
        const canvasWidth = artCanvas.offsetWidth;
        const canvasHeight = artCanvas.offsetHeight;


        for (let i = 0; i < numElements; i++) {
            const element = document.createElement('div');
            element.classList.add('art-element', `art-element-${i + 1}`);

            // Randomize properties
            const width = getRandomInt(40, 250);
            const height = getRandomInt(40, 250);
            const top = getRandomInt(-20, 120); // Allow elements to start outside the canvas slightly
            const left = getRandomInt(-20, 120);
            const bgColor = getRandomColor(selectedPalette);
            const borderRadius = getBlobBorderRadius(); // Use blob shapes
            const rotation = getRandomInt(0, 360);
            const opacity = getRandomFloat(0.4, 0.9); // More transparency for layering
            const zIndex = getRandomInt(1, numElements);
            const blurAmount = (zIndex / numElements) * getRandomFloat(0, 5); // More blur for elements further back

            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
            element.style.top = `${top}%`;
            element.style.left = `${left}%`;
            element.style.backgroundColor = bgColor;
            element.style.borderRadius = borderRadius;
            // Apply initial transform including center translation and rotation
            element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            element.style.opacity = opacity;
            element.style.zIndex = zIndex;
            element.style.filter = `blur(${blurAmount.toFixed(1)}px)`; // Apply blur

            // Optional: Random box-shadow for depth
            if (Math.random() > 0.4) { // 60% chance of a shadow
                const offsetX = getRandomInt(-15, 15);
                const offsetY = getRandomInt(-15, 15);
                const blur = getRandomInt(10, 30);
                const spread = getRandomInt(-5, 5);
                const shadowColor = `rgba(0, 0, 0, ${getRandomFloat(0.1, 0.3).toFixed(2)})`;
                element.style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}`;
            }

            // Apply subtle animation
            const animationType = Math.random() > 0.5 ? 'pulse' : 'float';
            const animationDuration = getRandomFloat(8, 20); // Longer durations for subtlety
            const animationDelay = getRandomFloat(0, animationDuration * -1); // Stagger animations
            element.style.animation = `${animationType} ${animationDuration.toFixed(1)}s infinite ${animationDelay.toFixed(1)}s alternate ease-in-out`;


            artCanvas.appendChild(element);
        }

        // Display generated CSS
        generatedCssCode.textContent = getGeneratedCssString();
    }

    // --- Event Listeners ---
    numElementsInput.addEventListener('input', () => {
        numElementsValueSpan.textContent = numElementsInput.value;
    });

    generateBtn.addEventListener('click', generateArt);
    colorPaletteSelect.addEventListener('change', generateArt);
    numElementsInput.addEventListener('change', generateArt);

    downloadBtn.addEventListener('click', () => {
        // Use html2canvas to capture the artCanvas
        html2canvas(artCanvas, {
            scale: 2, // Capture at a higher resolution for better quality
            backgroundColor: artCanvas.style.backgroundColor || getComputedStyle(artCanvas).backgroundColor
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'generative_art.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    copyCssBtn.addEventListener('click', () => {
        const cssToCopy = generatedCssCode.textContent;
        navigator.clipboard.writeText(cssToCopy)
            .then(() => {
                copyCssBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyCssBtn.textContent = 'Copy CSS';
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy CSS: ', err);
                alert('Failed to copy CSS. Please try again or copy manually.');
            });
    });

    // Initial art generation on page load
    generateArt();
});
