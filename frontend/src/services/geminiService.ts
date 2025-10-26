import { MarketingImage } from '../types';

// The base URL for the FastAPI backend
const API_BASE_URL = 'http://127.0.0.1:8000';

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const generateSuggestion = async (): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/generate-suggestion`);
        if (!response.ok) {
            throw new Error(`Error fetching suggestion: ${response.statusText}`);
        }
        const data = await response.json();
        return data.suggestion;
    } catch (error) {
        console.error("Error generating suggestion:", error);
        return "Could not connect to the backend to generate a suggestion. Please ensure the server is running. The core idea is strong: it automates creative generation for marketing campaigns, saving time and resources.";
    }
};

interface GenerateContentPayload {
    company_name: string;
    festival_name: string;
    company_summary?: string;
    uploaded_image?: {
        base64_data: string;
        mime_type: string;
    };
    address?: string;
    phone_numbers?: string[];
}

export const generateMarketingContent = async (payload: GenerateContentPayload): Promise<MarketingImage[]> => {
    const response = await fetch(`${API_BASE_URL}/generate-images`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An error occurred on the server.');
    }
    
    return response.json();
};
