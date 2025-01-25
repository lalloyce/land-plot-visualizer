/**
 * Handles the submission of the layout form by preventing the default form submission behavior,
 * converting the land size to square feet based on the selected unit, setting the canvas size,
 * and drawing the layout on the canvas.
 * 
 * @param {Event} event - The event object representing the form submission.
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('layoutForm');
    if (!form) {
        console.error('Layout form not found');
        return;
    }

    form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Retrieve the land size and unit from the form
    const landSize = parseFloat(document.getElementById('landSize').value);
    const unit = document.getElementById('unit').value;
    const canvas = document.getElementById('landCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

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
}); // Close form submit event listener
}); // Close DOMContentLoaded event listener

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
    try {
        // Validate input parameters
        if (!ctx || !landWidth || !landHeight || !scaleFactor) {
            throw new Error('Invalid parameters for drawLayout');
        }

        // Clear and set background
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Set minimum plot dimensions (50x100 feet)
        const minPlotWidth = 50 * scaleFactor;
        const minPlotLength = 100 * scaleFactor;
        const roadWidth = 12 * scaleFactor; // Standard road width

        // Calculate available space (without perimeter roads)
        const availableWidth = ctx.canvas.width;
        const availableHeight = ctx.canvas.height;

        // Calculate number of plots that can fit using minimum dimensions
        const plotsPerRow = Math.floor(availableWidth / minPlotWidth);
        const plotRows = Math.floor(availableHeight / minPlotLength);

        // Calculate actual plot dimensions including extra space distribution
        const plotWidth = availableWidth / plotsPerRow; // This may be larger than minPlotWidth
        const plotLength = availableHeight / plotRows; // This may be larger than minPlotLength

        // No need for gaps as we're using the full space
        const horizontalGap = 0;
        const verticalGap = 0;

        // Draw plots and roads
        let plotCount = 0;
        const startX = 0;
        const startY = 0;

        // Draw roads every two plots
        ctx.fillStyle = '#4A4A4A';
        
        // Horizontal roads
        for (let i = 2; i < plotRows; i += 2) {
            const y = startY + i * (plotLength + verticalGap) - roadWidth/2;
            ctx.fillRect(0, y, ctx.canvas.width, roadWidth);
        }

        // Vertical roads
        for (let i = 2; i < plotsPerRow; i += 2) {
            const x = startX + i * (plotWidth + horizontalGap) - roadWidth/2;
            ctx.fillRect(x, 0, roadWidth, ctx.canvas.height);
        }

        // Draw plots
        for (let row = 0; row < plotRows; row++) {
            for (let col = 0; col < plotsPerRow; col++) {
                const x = startX + col * (plotWidth + horizontalGap);
                const y = startY + row * (plotLength + verticalGap);
        
                // Determine plot status (randomly for demonstration)
                const status = Math.random() < 0.33 ? 'sold' : Math.random() < 0.5 ? 'reserved' : 'available';
                
                // Set plot color based on status
                switch(status) {
                    case 'sold':
                        ctx.fillStyle = '#FF0000'; // Red for sold plots
                        break;
                    case 'reserved':
                        ctx.fillStyle = '#FFD700'; // Yellow for reserved plots
                        break;
                    default:
                        ctx.fillStyle = '#90EE90'; // Light green for available plots
                }
        
                // Draw plot
                ctx.fillRect(x, y, plotWidth, plotLength);
                ctx.strokeStyle = '#228B22'; // Forest green for borders
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, plotWidth, plotLength);
        
                // Draw plot number and status with improved visibility
                plotCount++;
                const text = `Plot ${plotCount}`;
                const statusText = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
                
                // Add white background to plot number
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                const textWidth = ctx.measureText(text).width;
                const statusWidth = ctx.measureText(statusText).width;
                ctx.fillRect(x + 5, y + 5, Math.max(textWidth, statusWidth) + 10, 45);
                
                // Draw plot number and status
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(text, x + 10, y + 25);
                ctx.font = '14px Arial';
                ctx.fillText(statusText, x + 10, y + 45);
        
                // Add plot dimensions
                const actualWidth = Math.round(plotWidth / scaleFactor);
                const actualLength = Math.round(plotLength / scaleFactor);
                const dimensions = `${actualWidth} x ${actualLength} ft`;
                const dimWidth = ctx.measureText(dimensions).width;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(x + 5, y + plotLength - 30, dimWidth + 10, 25);
                
                ctx.fillStyle = '#000000';
                ctx.fillText(dimensions, x + 10, y + plotLength - 10);
            }
        }

        console.log(`Total plots drawn: ${plotCount}`);
        return plotCount;
    } catch (error) {
        console.error('Error in drawLayout:', error);
        throw error;
    }
}

// JavaScript to draw plots and roads
/**
 * Draws plots and roads on the canvas using a custom function to draw rectangles with borders and labels.
 */
function drawPlotsAndRoads() {
    const canvas = document.getElementById('landCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

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

// Function to set the canvas size to fit the window with improved responsiveness
function resizeCanvas() {
    try {
        const canvas = document.getElementById('landCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // Calculate responsive dimensions
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const maxWidth = 1200; // Maximum canvas width
        const minWidth = 320;  // Minimum canvas width
        const aspectRatio = 16/9; // Maintain aspect ratio

        // Calculate optimal canvas size
        let canvasWidth = Math.min(containerWidth - 40, maxWidth);
        canvasWidth = Math.max(canvasWidth, minWidth);
        let canvasHeight = Math.round(canvasWidth / aspectRatio);

        // Ensure canvas height doesn't exceed container height
        if (canvasHeight > containerHeight - 40) {
            canvasHeight = containerHeight - 40;
            canvasWidth = Math.round(canvasHeight * aspectRatio);
        }

        // Update canvas dimensions
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Apply high DPI screen support
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Redraw the plots and roads after resizing
        drawPlotsAndRoads();
    } catch (error) {
        console.error('Error in resizeCanvas:', error);
        // Display user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Failed to resize canvas. Please refresh the page.';
        canvas.parentNode.insertBefore(errorMessage, canvas);
    }
}
// Add this function
function clearCanvas() {
    const canvas = document.getElementById('landCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Modify generatePlot to include cleanup
function generatePlot() {
    clearCanvas();
    this.loading = true;
    const canvas = document.getElementById('landCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }
    
    // Get the land size and unit
    const landSize = parseFloat(document.getElementById('land_size').value);
    const unit = document.getElementById('unit').value;
    
    // Convert land size and draw the layout
    let totalArea = convertToSquareFeet(landSize, unit);
    const scaleFactor = 5;
    const landWidth = Math.sqrt(totalArea);
    const landHeight = totalArea / landWidth;
    
    // Set canvas dimensions
    canvas.width = (landWidth + 12) * scaleFactor;
    canvas.height = (landHeight + 12) * scaleFactor;
    
    // Draw the layout and update plot count
    const plotCount = drawLayout(ctx, landWidth, landHeight, scaleFactor);
    document.querySelector('[x-text="plotCount"]').textContent = plotCount;
    
    this.loading = false;
}

// Helper function to convert units to square feet
function convertToSquareFeet(size, unit) {
    switch(unit) {
        case 'acres':
            return size * 43560;
        case 'ha':
            return size * 107639;
        case 'm2':
            return size * 10.7639;
        default:
            throw new Error('Invalid unit');
    }
}