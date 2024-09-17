/**
 * Handles the submission of the layout form by preventing the default form submission behavior,
 * converting the land size to square feet based on the selected unit, setting the canvas size,
 * and drawing the layout on the canvas.
 * 
 * @param {Event} event - The event object representing the form submission.
 */
document.getElementById('layoutForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Retrieve the land size and unit from the form
    const landSize = parseFloat(document.getElementById('landSize').value);
    const unit = document.getElementById('unit').value;
    const canvas = document.getElementById('layoutCanvas');
    const ctx = canvas.getContext('2d');

    console.log(`Form submitted with land size: ${landSize} and unit: ${unit}`);

    // Convert land size to square feet based on the selected unit
    let totalArea;
    switch (unit) {
        case 'acres':
            totalArea = acresToSquareFeet(landSize);
            break;
        case 'ha':
            totalArea = haToSquareFeet(landSize);
            break;
        case 'm2':
            totalArea = m2ToSquareFeet(landSize);
            break;
        default:
            console.error("Invalid unit selected");
            alert("Invalid unit");
            return;
    }

    console.log(`Total area in square feet: ${totalArea}`);

    // Set canvas size based on the total area and a scale factor
    const scaleFactor = 5; // 1 foot = 5 pixels
    const landWidth = Math.sqrt(totalArea);
    const landHeight = totalArea / landWidth;
    canvas.width = (landWidth + 12) * scaleFactor; // Add road width
    canvas.height = (landHeight + 12) * scaleFactor; // Add road height

    console.log(`Canvas size set to: ${canvas.width} x ${canvas.height}`);

    // Draw the layout on the canvas
    drawLayout(ctx, landWidth, landHeight, scaleFactor);
});

/**
 * Converts acres to square feet.
 * 
 * @param {number} acres - The area in acres.
 * @returns {number} The area in square feet.
 */
function acresToSquareFeet(acres) {
    return acres * 43560;
}

/**
 * Converts hectares to square feet.
 * 
 * @param {number} ha - The area in hectares.
 * @returns {number} The area in square feet.
 */
function haToSquareFeet(ha) {
    return ha * 107639;
}

/**
 * Converts square meters to square feet.
 * 
 * @param {number} m2 - The area in square meters.
 * @returns {number} The area in square feet.
 */
function m2ToSquareFeet(m2) {
    return m2 * 10.7639;
}

/**
 * Draws the layout on the canvas including the background, roads, and plots.
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D drawing context of the canvas.
 * @param {number} landWidth - The width of the land in feet.
 * @param {number} landHeight - The height of the land in feet.
 * @param {number} scaleFactor - The scale factor to convert feet to pixels.
 */
function drawLayout(ctx, landWidth, landHeight, scaleFactor) {
    ctx.fillStyle = '#E0E0E0'; // Light grey background
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw road
    ctx.fillStyle = '#4A4A4A'; // Road color
    ctx.fillRect(0, 0, ctx.canvas.width, 12 * scaleFactor); // Top road

    // Draw plots
    ctx.fillStyle = '#FFD700'; // Plot color
    const plotWidth = 50 * scaleFactor;
    const plotLength = 100 * scaleFactor;
    let plotCount = 0;

    for (let y = 12 * scaleFactor; y < landHeight * scaleFactor; y += plotLength) {
        for (let x = 0; x < landWidth * scaleFactor; x += plotWidth) {
            ctx.fillRect(x, y, plotWidth, plotLength);
            plotCount++;
            ctx.fillStyle = '#000000'; // Text color
            ctx.font = '16px Arial';
            ctx.fillText(plotCount, x + 5, y + 20); // Plot number
            ctx.fillStyle = '#FFD700'; // Reset plot color
        }
    }

    console.log(`Total plots drawn: ${plotCount}`);
}

// JavaScript to draw plots and roads
/**
 * Draws plots and roads on the canvas using a custom function to draw rectangles with borders and labels.
 */
function drawPlotsAndRoads() {
    const canvas = document.getElementById('landCanvas');
    const ctx = canvas.getContext('2d');

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Function to draw a rectangle with a border
    function drawRectangle(x, y, width, height, fillColor, borderColor, label) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label
        ctx.fillStyle = borderColor;
        ctx.font = '16px Arial';
        ctx.fillText(label, x + 5, y + 20); // Adjust position for label
    }

    // Calculate plot dimensions based on canvas size
    const plotWidth = canvas.width / 3 - 20; // 3 plots with some margin
    const plotHeight = 100;

    // Draw plots of land
    drawRectangle(10, 10, plotWidth, plotHeight, '#FFD700', '#D4AF37', 'Plot 1');
    drawRectangle(plotWidth + 20, 10, plotWidth, plotHeight, '#FFD700', '#D4AF37', 'Plot 2');
    drawRectangle((plotWidth + 20) * 2, 10, plotWidth, plotHeight, '#FFD700', '#D4AF37', 'Plot 3');

    // Draw roads
    drawRectangle(10, plotHeight + 20, canvas.width - 20, 50, '#4A4A4A', '#FFFFFF', 'Main Road');
}

// Initial canvas size setup
resizeCanvas();

// Event listener for window resize
window.addEventListener('resize', resizeCanvas);

// Function to set the canvas size to fit the window
function resizeCanvas() {
    const canvas = document.getElementById('landCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas width and height to the window's inner width and height
    canvas.width = window.innerWidth - 20; // Subtracting some margin
    canvas.height = window.innerHeight - 20; // Subtracting some margin

    // Redraw the plots and roads after resizing
    drawPlotsAndRoads();
}