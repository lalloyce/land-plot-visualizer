
# Land Plot Visualizer

## Overview

Land Plot Visualizer is a web application that helps users visualize how a parcel of land can be divided into smaller plots. Users can input the size of their land in acres, hectares, or square meters, and the application generates a visual representation of the plot layout, optimizing for the maximum number of 50x100 feet plots while ensuring accessibility with 12-foot wide roads.

## Features

- Input land size in acres, hectares, or square meters
- Generate a visual layout of land plots
- Calculate the maximum number of 50x100 feet plots that can fit in the given area
- Ensure all plots are accessible via 12-foot wide roads
- Responsive web interface for easy use on desktop and mobile devices

## Technologies Used

- Backend: Python, Flask
- Frontend: HTML, JavaScript (Alpine.js)
- Styling: Tailwind CSS
- Image Processing: Pillow (Python Imaging Library)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/lalloyce/land-plot-visualizer.git
   cd land-plot-visualizer
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install flask pillow
   ```

## Usage

1. Start the Flask application:
   ```
   python app.py
   ```

2. Open a web browser and navigate to `http://localhost:5000`

3. Enter the land size and select the unit (acres, hectares, or square meters)

4. Click "Generate Plot Layout" to view the visualization

## Project Structure

```
land-plot-visualizer/
│
├── app.py                 # Flask application and backend logic
├── templates/
│   └── index.html         # Frontend HTML/JS/CSS
├── README.md              # This file
└── requirements.txt       # Python dependencies
```

## Contributing

Contributions to the Land Plot Visualizer project are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions, feel free to reach out to Lawrence Juma at lalloyce@gmail.com.
