# Festive Marketing Image Generator

An AI-powered tool that takes your company info, a festival name, and an optional product image to generate 5 unique, themed marketing images, each with custom festive and promotional headlines.

## ✨ Features

- **AI-Powered Creativity**: Leverages the Google Gemini API to generate unique and creative marketing assets.
- **Themed Outputs**: Creates five distinct images based on different themes like 'Modern', 'Vibrant', 'Magical', 'Playful', and 'Elegant'.
- **Highly Customizable**: Incorporates your company name, festival, product summary, address, and phone numbers directly into the generated images.
- **Flexible Inputs**: Works with or without a user-uploaded product image.
- **Instant Downloads**: Easily download your favorite generated images with a single click.
- **Secure Architecture**: A Python FastAPI backend keeps your Google Gemini API key safe and off the client-side.
- **Modern UI**: A sleek and responsive user interface built with React, TypeScript, and Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI
- **AI Model**: Google Gemini

## 📂 Project Structure

The project is organized into two main directories for a clean separation of concerns:

- **/frontend**: Contains the React single-page application that the user interacts with.
- **/backend**: Contains the Python FastAPI server that handles business logic and communication with the Gemini API.

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (or just Python for serving the frontend)
- [Python 3.7+](https://www.python.org/downloads/) and `pip`
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/).

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    venv\Scripts\activate
    ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    -   Create a file named `.env` in the `backend` directory (you can copy `.env.example`).
    -   Add your Google Gemini API key to it:
        ```env
        API_KEY="YOUR_GEMINI_API_KEY"
        ```

### Frontend Setup

The frontend is a simple static application and does not require a build step. You just need to serve the files from the `frontend` directory.

### Running the Application

1.  **Start the Backend Server:**
    -   Make sure you are in the `backend` directory with your virtual environment activated.
    -   Run the Uvicorn server:
        ```bash
        uvicorn main:app --reload
        ```
    -   The backend will be running at `http://127.0.0.1:8000`.

2.  **Serve the Frontend Application:**
    -   Open a **new terminal window**.
    -   Navigate to the `frontend` directory:
        ```bash
        cd frontend
        ```
    -   Start a simple HTTP server. You can use Python's built-in server for this:
        ```bash
        # This will serve the frontend on port 3000 to avoid conflict with the backend
        python -m http.server 3000
        ```
        *If you don't have Python available for serving, you can use any other static file server, like Node's `serve` package (`npx serve -l 3000`).*

3.  **Access the App:**
    -   Open your web browser and go to `http://localhost:3000`.

## 💡 How It Works

1.  The user fills out the form in the React frontend with their company details and festival name.
2.  On submission, the frontend sends a request to the FastAPI backend.
3.  The backend constructs detailed prompts for the Gemini API, combining the user's input with predefined themes.
4.  It calls the Gemini API to generate headlines and five unique images.
5.  The results are sent back to the frontend and displayed to the user in a series of result cards.
6.  The user can then download any of the generated marketing assets.
