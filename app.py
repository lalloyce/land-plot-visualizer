# app.py
from flask import Flask, render_template, request, send_file
from io import BytesIO
import base64
from PIL import Image, ImageDraw
import math

app = Flask(__name__)

def acres_to_square_feet(acres):
    return acres * 43560

def ha_to_square_feet(ha):
    return ha * 107639

def m2_to_square_feet(m2):
    return m2 * 10.7639

def create_plot_layout(land_size, unit='acres'):
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

    # Calculate the maximum number of plots that can fit in each dimension
    max_plots_x = int((math.sqrt(total_area) - road_width) / (plot_width + road_width))
    max_plots_y = int((math.sqrt(total_area) - road_width) / (plot_length + road_width))

    # Ensure even number of plots for symmetry
    max_plots_x = max_plots_x - 1 if max_plots_x % 2 != 0 else max_plots_x
    max_plots_y = max_plots_y - 1 if max_plots_y % 2 != 0 else max_plots_y

    # Calculate total width and height
    total_width = (max_plots_x * plot_width) + ((max_plots_x + 1) * road_width)
    total_height = (max_plots_y * plot_length) + ((max_plots_y + 1) * road_width)

    # Create an image
    scale_factor = 5  # 1 foot = 5 pixels
    img = Image.new('RGB', (total_width * scale_factor, total_height * scale_factor), color='green')
    draw = ImageDraw.Draw(img)

    plot_count = 0

    # Draw plots and roads
    for y in range(max_plots_y):
        for x in range(max_plots_x):
            # Calculate plot position
            plot_x = x * (plot_width + road_width) + road_width
            plot_y = y * (plot_length + road_width) + road_width

            # Draw plot
            draw.rectangle(
                [(plot_x * scale_factor, plot_y * scale_factor),
                 ((plot_x + plot_width) * scale_factor, (plot_y + plot_length) * scale_factor)],
                fill='yellow', outline='black'
            )
            plot_count += 1

    # Draw roads
    for x in range(max_plots_x + 1):
        road_x = x * (plot_width + road_width)
        draw.rectangle(
            [(road_x * scale_factor, 0),
             ((road_x + road_width) * scale_factor, total_height * scale_factor)],
            fill='gray'
        )

    for y in range(max_plots_y + 1):
        road_y = y * (plot_length + road_width)
        draw.rectangle(
            [(0, road_y * scale_factor),
             (total_width * scale_factor, (road_y + road_width) * scale_factor)],
            fill='gray'
        )

    return img, plot_count

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    land_size = float(request.form['land_size'])
    unit = request.form['unit']

    img, plot_count = create_plot_layout(land_size, unit)

    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    img_data = base64.b64encode(img_io.getvalue()).decode()

    return {'image': img_data, 'plot_count': plot_count}

if __name__ == '__main__':
    app.run(debug=True)