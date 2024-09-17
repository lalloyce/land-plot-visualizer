import math
from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO

app = Flask(__name__)

def acres_to_square_feet(acres):
    """
    Converts acres to square feet.
    
    Parameters:
    acres (float): The area in acres.
    
    Returns:
    float: The area in square feet.
    """
    return acres * 43560

def ha_to_square_feet(ha):
    """
    Converts hectares to square feet.
    
    Parameters:
    ha (float): The area in hectares.
    
    Returns:
    float: The area in square feet.
    """
    return ha * 107639

def m2_to_square_feet(m2):
    """
    Converts square meters to square feet.
    
    Parameters:
    m2 (float): The area in square meters.
    
    Returns:
    float: The area in square feet.
    """
    return m2 * 10.7639

def create_horseshoe_layout(land_size, unit='acres'):
    """
    Creates a horseshoe layout for a given land size and unit.
    
    Parameters:
    land_size (float): The size of the land.
    unit (str, optional): The unit of the land size. Defaults to 'acres'.
    
    Returns:
    tuple: A tuple containing the PIL Image object and the total plot count.
    """
    # Convert land size to square feet
    if unit == 'acres':
        total_area = acres_to_square_feet(land_size)
    elif unit == 'ha':
        total_area = ha_to_square_feet(land_size)
    elif unit == 'm2':
        total_area = m2_to_square_feet(land_size)
    else:
        raise ValueError("Invalid unit. Use 'acres', 'ha', or 'm2'.")

    # Initialize total_width and total_height
    total_width = 0
    total_height = 0

    # Define plot and road dimensions (in feet)
    plot_width, plot_length = 50, 100
    road_width = 12

    # Calculate the dimensions of the land
    land_width = int(math.sqrt(total_area))
    land_height = int(total_area / land_width)

    # Add a road along the longer side
    if land_width > land_height:
        total_height += road_width
    else:
        total_width += road_width

    # Create an image
    scale_factor = 5  # 1 foot = 5 pixels
    img = Image.new('RGB', (total_width * scale_factor, total_height * scale_factor), color='#E0E0E0')  # Light grey background
    draw = ImageDraw.Draw(img)

    plot_count = 0

    # Draw the first batch of plots
    for y in range(0, land_height, plot_length):
        for x in range(0, land_width, plot_width):
            if x + plot_width <= land_width and y + plot_length <= land_height:
                plot_x = x * scale_factor
                plot_y = y * scale_factor
                draw.rectangle(
                    [(plot_x, plot_y),
                     (plot_x + plot_width * scale_factor, plot_y + plot_length * scale_factor)],
                    fill='#FFD700', outline='#D4AF37'
                )
                plot_count += 1
                # Add plot number
                draw.text((plot_x + 5, plot_y + 5), str(plot_count), fill='#000000', font=ImageFont.load_default())

    # Draw inner roads for accessibility
    for y in range(0, land_height, plot_length):
        draw.rectangle(
            [(0, (y + plot_length) * scale_factor),
             (total_width * scale_factor, (y + plot_length + road_width) * scale_factor)],
            fill='#4A4A4A'
        )

    # Draw additional rows of plots
    for y in range(0, land_height, plot_length + road_width):
        for x in range(0, land_width, plot_width):
            if x + plot_width <= land_width and y + plot_length <= total_height:
                plot_x = x * scale_factor
                plot_y = (y + road_width) * scale_factor
                draw.rectangle(
                    [(plot_x, plot_y),
                     (plot_x + plot_width * scale_factor, plot_y + plot_length * scale_factor)],
                    fill='#FFD700', outline='#D4AF37'
                )
                plot_count += 1
                # Add plot number
                draw.text((plot_x + 5, plot_y + 5), str(plot_count), fill='#000000', font=ImageFont.load_default())

    # Draw roads along the longer side
    if land_width > land_height:
        draw.rectangle(
            [(0, 0),
             (total_width * scale_factor, road_width * scale_factor)],
            fill='#4A4A4A'
        )
    else:
        draw.rectangle(
            [(0, 0),
             (road_width * scale_factor, total_height * scale_factor)],
            fill='#4A4A4A'
        )

    # Add road names
    road_name = "Main Road"
    draw.text((total_width * scale_factor / 2, 5), road_name, fill='#FFFFFF', font=ImageFont.load_default())

    return img, plot_count

@app.route('/')
def index():
    """
    Handles the root URL and renders the index.html template.
    """
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    """
    Handles the POST request to generate a horseshoe layout image.
    
    Returns:
    dict: A dictionary containing the base64 encoded image data and the total plot count.
    """
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