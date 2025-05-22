document.addEventListener('DOMContentLoaded', () => {
    const artCanvas = document.getElementById('artCanvas');
    const numElementsInput = document.getElementById('numElements');
    const numElementsValueSpan = document.getElementById('numElementsValue');
    const colorPaletteSelect = document.getElementById('colorPalette');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const generatedCssCode = document.getElementById('generatedCssCode');
    const copyCssBtn = document.getElementById('copyCssBtn');

    // --- Color Palette Definitions ---
    const palettes = {
        random: null, // Indicates truly random generation
        pastel: [
            { h: [0, 360], s: [70, 90], l: [75, 90] }, // Light, muted colors
        ],
        grayscale: [
            { h: [0, 0], s: [0, 0], l: [20, 80] }, // Black to white
        ],
        warm: [
            { h: [0, 60], s: [70, 100], l: [40, 70] }, // Reds, Oranges, Yellows
            { h: [330, 20], s: [80, 100], l: [50, 70] } // Pinks, light reds
        ],
        cool: [
            { h: [180, 240], s: [70, 100], l: [40, 70] }, // Blues, Cyans
            { h: [90, 150], s: [70, 100], l: [40, 70] } // Greens
        ]
    };

    // --- Helper Functions ---
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomColor(paletteType) {
        if (paletteType === 'random' || !palettes[paletteType]) {
            // Truly random color
            const h = getRandomInt(0, 360);
            const s = getRandomInt(50, 100); // Keep saturation high for vibrancy
            const l = getRandomInt(40, 80);  // Keep lightness in a good range
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

    function getGeneratedCssString() {
        let css = '';
        artCanvas.querySelectorAll('.art-element').forEach((element, index) => {
            css += `.art-element-${index + 1} {\n`;
            css += `    position: absolute;\n`; // Add position absolute as it's common to all
            css += `    width: ${element.style.width};\n`;
            css += `    height: ${element.style.height};\n`;
            css += `    top: ${element.style.top};\n`;
            css += `    left: ${element.style.left};\n`;
            css += `    background-color: ${element.style.backgroundColor};\n`;
            css += `    border-radius: ${element.style.borderRadius};\n`;
            css += `    transform: ${element.style.transform};\n`;
            if (element.style.boxShadow) {
                css += `    box-shadow: ${element.style.boxShadow};\n`;
            }
            css += `    opacity: ${element.style.opacity};\n`;
            css += `    z-index: ${element.style.zIndex};\n`;
            css += `}\n\n`;
        });
        return css;
    }


    // --- Core Art Generation Function ---
    function generateArt() {
        // Clear previous art
        artCanvas.innerHTML = '';
        generatedCssCode.textContent = ''; // Clear CSS output
        const numElements = parseInt(numElementsInput.value);
        const selectedPalette = colorPaletteSelect.value;
        let cssString = '';

        for (let i = 0; i < numElements; i++) {
            const element = document.createElement('div');
            element.classList.add('art-element', `art-element-${i + 1}`);

            // Randomize properties
            const width = getRandomInt(20, 200);
            const height = getRandomInt(20, 200);
            const top = getRandomInt(-50, 100); // Allow elements to start outside the canvas slightly
            const left = getRandomInt(-50, 100);
            const bgColor = getRandomColor(selectedPalette);
            const borderRadius = `${getRandomInt(0, 100)}% ${getRandomInt(0, 100)}% ${getRandomInt(0, 100)}% ${getRandomInt(0, 100)}% / ${getRandomInt(0, 100)}% ${getRandomInt(0, 100)}% ${getRandomInt(0, 100)}% ${getRandomInt(0, 100)}%`; // Elliptical or circular shapes
            const rotation = getRandomInt(0, 360);
            const opacity = getRandomFloat(0.5, 1.0); // Slightly transparent to allow layering
            const zIndex = getRandomInt(1, numElements); // Layering order

            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
            element.style.top = `${top}%`;
            element.style.left = `${left}%`;
            element.style.backgroundColor = bgColor;
            element.style.borderRadius = borderRadius;
            element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`; // Center element and rotate
            element.style.opacity = opacity;
            element.style.zIndex = zIndex;

            // Optional: Random box-shadow
            if (Math.random() > 0.3) { // 70% chance of a shadow
                const offsetX = getRandomInt(-10, 10);
                const offsetY = getRandomInt(-10, 10);
                const blur = getRandomInt(5, 20);
                const spread = getRandomInt(-5, 5);
                const shadowColor = `rgba(0, 0, 0, ${getRandomFloat(0.1, 0.4).toFixed(2)})`;
                element.style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}`;
            }

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
    colorPaletteSelect.addEventListener('change', generateArt); // Regenerate when palette changes
    numElementsInput.addEventListener('change', generateArt); // Regenerate when range input is released

    downloadBtn.addEventListener('click', () => {
        // Use html2canvas to capture the artCanvas
        html2canvas(artCanvas, {
            scale: 2, // Capture at a higher resolution for better quality
            backgroundColor: artCanvas.style.backgroundColor || getComputedStyle(artCanvas).backgroundColor // Ensure background is captured
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
