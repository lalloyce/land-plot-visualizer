import math
from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO

app = Flask(__name__)

def acres_to_square_feet(acres):
    return acres * 43560

def ha_to_square_feet(ha):
    return ha * 107639

def m2_to_square_feet(m2):
    return m2 * 10.7639

def create_horseshoe_layout(land_size, unit='acres'):
    # Convert land size to square feet
    if unit == 'acres':
        total_area = acres_to_square_feet(land_size)
    elif unit == 'ha':
        total_area = ha_to_square_feet(land_size)
    elif unit == 'm2':
        total_area = m2_to_square_feet(land_size)
    else:
        raise ValueError("Invalid unit. Use 'acres', 'ha', or 'm2'.")

    # Define plot and road dimensions (in feet)
    plot_width, plot_length = 50, 100
    road_width = 12

    # Calculate the dimensions of the land
    land_width = int(math.sqrt(total_area))
    land_height = int(total_area / land_width)

    # Calculate the number of plots that can fit in each dimension
    plots_x = (land_width + road_width) // (plot_width + road_width)
    plots_y = (land_height + road_width) // (plot_length + road_width)

    # Ensure odd number of plots for symmetry
    plots_x = plots_x - 1 if plots_x % 2 == 0 else plots_x
    plots_y = plots_y - 1 if plots_y % 2 == 0 else plots_y

    # Calculate total width and height
    total_width = (plots_x * plot_width) + ((plots_x + 1) * road_width)
    total_height = (plots_y * plot_length) + ((plots_y + 1) * road_width)

    # Create an image
    scale_factor = 5  # 1 foot = 5 pixels
    img = Image.new('RGB', (total_width * scale_factor, total_height * scale_factor), color='#E0E0E0')  # Light grey background
    draw = ImageDraw.Draw(img)

    plot_count = 0

    # Draw horseshoe layout
    for layer in range(min(plots_x, plots_y) // 2):
        # Draw top and bottom rows
        for x in range(layer, plots_x - layer):
            # Top row
            plot_x = x * (plot_width + road_width) + road_width
            plot_y = layer * (plot_length + road_width) + road_width
            draw.rectangle(
                [(plot_x * scale_factor, plot_y * scale_factor),
                 ((plot_x + plot_width) * scale_factor, (plot_y + plot_length) * scale_factor)],
                fill='#FFD700', outline='#D4AF37'
            )
            plot_count += 1

            # Bottom row
            plot_y = (plots_y - layer - 1) * (plot_length + road_width) + road_width
            draw.rectangle(
                [(plot_x * scale_factor, plot_y * scale_factor),
                 ((plot_x + plot_width) * scale_factor, (plot_y + plot_length) * scale_factor)],
                fill='#FFD700', outline='#D4AF37'
            )
            plot_count += 1

        # Draw left and right columns
        for y in range(layer + 1, plots_y - layer - 1):
            # Left column
            plot_x = layer * (plot_width + road_width) + road_width
            plot_y = y * (plot_length + road_width) + road_width
            draw.rectangle(
                [(plot_x * scale_factor, plot_y * scale_factor),
                 ((plot_x + plot_width) * scale_factor, (plot_y + plot_length) * scale_factor)],
                fill='#FFD700', outline='#D4AF37'
            )
            plot_count += 1

            # Right column
            plot_x = (plots_x - layer - 1) * (plot_width + road_width) + road_width
            plot_y = y * (plot_length + road_width) + road_width
            draw.rectangle(
                [(plot_x * scale_factor, plot_y * scale_factor),
                 ((plot_x + plot_width) * scale_factor, (plot_y + plot_length) * scale_factor)],
                fill='#FFD700', outline='#D4AF37'
            )
            plot_count += 1

    # Draw roads
    for x in range(plots_x + 1):
        road_x = x * (plot_width + road_width)
        draw.rectangle(
            [(road_x * scale_factor, 0),
             ((road_x + road_width) * scale_factor, total_height * scale_factor)],
            fill='#4A4A4A'
        )

    for y in range(plots_y + 1):
        road_y = y * (plot_length + road_width)
        draw.rectangle(
            [(0, road_y * scale_factor),
             (total_width * scale_factor, (road_y + road_width) * scale_factor)],
            fill='#4A4A4A'
        )

    # Draw horizontal road across the middle
    middle_y = (plots_y // 2) * (plot_length + road_width) + road_width
    draw.rectangle(
        [(0, middle_y * scale_factor),
         (total_width * scale_factor, (middle_y + road_width) * scale_factor)],
        fill='#4A4A4A'
    )

    # Add road name
    font_size = 24
    font = ImageFont.load_default()
    road_name = "Horseshoe Avenue"
    text_width, text_height = draw.textsize(road_name, font=font)
    draw.text(
        ((total_width * scale_factor - text_width) / 2, (middle_y + road_width / 2) * scale_factor - text_height / 2),
        road_name,
        font=font,
        fill='#FFFFFF'  # White text
    )

    return img, plot_count

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    land_size = float(request.form['land_size'])
    unit = request.form['unit']

    img, plot_count = create_horseshoe_layout(land_size, unit)

    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    img_data = base64.b64encode(img_io.getvalue()).decode()

    return jsonify({'image': img_data, 'plot_count': plot_count})

if __name__ == '__main__':
    app.run(debug=True)