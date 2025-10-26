import React, { useState, useEffect, useCallback } from 'react';
import { MarketingImage } from './types';
import { generateSuggestion, fileToBase64, generateMarketingContent } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import Spinner from './components/Spinner';

const THEME_PROMPTS = [
    { name: 'Modern & Minimalist', prompt: 'recreate this image with a modern, minimalist theme, using clean lines and a subtle color palette' },
    { name: 'Vibrant & Colorful', prompt: 'add traditional decorations to this image in a vibrant, colorful style that pops' },
    { name: 'Magical & Glowing', prompt: 'transform this image into a magical scene with a glowing, ethereal aesthetic and sparkles' },
    { name: 'Playful & Fun', prompt: 'give this image a playful and fun feeling, with whimsical elements like confetti and animated characters' },
    { name: 'Elegant & Vintage', prompt: 'reimagine this image with a cozy, warm, vintage greeting card aesthetic, using soft textures and classic typography' },
];


const App: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [companySummary, setCompanySummary] = useState('');
  const [festivalName, setFestivalName] = useState('Christmas');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [address, setAddress] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [currentPhone, setCurrentPhone] = useState('');
  
  const [generatedImages, setGeneratedImages] = useState<MarketingImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string>('');

  useEffect(() => {
    const fetchSuggestion = async () => {
      const suggestionText = await generateSuggestion();
      setSuggestion(suggestionText);
    };
    fetchSuggestion();
  }, []);
  
  const handleAddPhone = () => {
    if (currentPhone.trim() && !phoneNumbers.includes(currentPhone.trim())) {
      setPhoneNumbers([...phoneNumbers, currentPhone.trim()]);
      setCurrentPhone('');
    }
  };

  const handleRemovePhone = (phoneToRemove: string) => {
    setPhoneNumbers(phoneNumbers.filter(phone => phone !== phoneToRemove));
  };

  const handleGenerate = useCallback(async () => {
    if (!companyName || !festivalName) {
      setError('Please fill in Company Name and Festival or Celebration.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setGeneratedImages([]);

    try {
        let imagePayload;
        if (uploadedImage) {
            const base64_data = await fileToBase64(uploadedImage);
            imagePayload = {
                base64_data,
                mime_type: uploadedImage.type,
            };
        }

        const payload = {
            company_name: companyName,
            festival_name: festivalName,
            ...(companySummary && { company_summary: companySummary }),
            ...(imagePayload && { uploaded_image: imagePayload }),
            ...(address && { address: address }),
            ...(phoneNumbers.length > 0 && { phone_numbers: phoneNumbers }),
        };
        
        const newMarketingImages = await generateMarketingContent(payload);
        setGeneratedImages(newMarketingImages);

    } catch (err: any) {
      console.error(err);
      setError(`An error occurred during generation: ${err.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [companyName, companySummary, festivalName, uploadedImage, address, phoneNumbers]);
  
  const isFormValid = companyName && festivalName;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Festive Marketing Image Generator
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Turn your product photos into stunning, festival-themed marketing assets in seconds.
          </p>
        </header>

        {suggestion && (
            <div className="mb-10 p-5 bg-gray-800/50 border border-indigo-500/30 rounded-lg max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-indigo-400 mb-2">AI-Powered Suggestion</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{suggestion}</p>
            </div>
        )}

        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left Column */}
              <div className="space-y-6">
                  <div>
                      <label htmlFor="company-name" className="block text-sm font-medium text-gray-300">Company Name</label>
                      <input
                        type="text"
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3"
                        placeholder="e.g., Stellar Gadgets"
                      />
                  </div>
                  <div>
                      <label htmlFor="festival-name" className="block text-sm font-medium text-gray-300">Festival or Celebration</label>
                      <input
                        type="text"
                        id="festival-name"
                        value={festivalName}
                        onChange={(e) => setFestivalName(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3"
                        placeholder="e.g., Diwali, New Year's"
                      />
                  </div>
                   <div>
                      <label htmlFor="company-summary" className="block text-sm font-medium text-gray-300">Product Summary <span className="text-gray-400">(Optional)</span></label>
                      <textarea
                        id="company-summary"
                        value={companySummary}
                        onChange={(e) => setCompanySummary(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3"
                        placeholder="e.g., We sell high-quality, futuristic headphones."
                      />
                  </div>
                  <div>
                    <ImageUploader onImageUpload={setUploadedImage} />
                  </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                 <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-300">Shop Address <span className="text-gray-400">(Optional)</span></label>
                      <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3"
                        placeholder="e.g., 123 Cosmic Way, Galaxy Town, 98765"
                      />
                  </div>
                  <div>
                    <label htmlFor="phone-number" className="block text-sm font-medium text-gray-300">Phone Number(s) <span className="text-gray-400">(Optional)</span></label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="tel"
                            id="phone-number"
                            value={currentPhone}
                            onChange={(e) => setCurrentPhone(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhone(); }}}
                            className="block w-full bg-gray-700 border-gray-600 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3"
                            placeholder="e.g., 555-123-4567"
                        />
                        <button onClick={handleAddPhone} type="button" className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-600 text-sm font-medium rounded-r-md text-gray-300 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                            Add
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {phoneNumbers.map(phone => (
                            <span key={phone} className="inline-flex items-center py-1 pl-2.5 pr-1 text-sm font-medium bg-indigo-800 text-indigo-100 rounded-full">
                                {phone}
                                <button
                                    onClick={() => handleRemovePhone(phone)}
                                    type="button"
                                    className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-200 hover:bg-indigo-700 hover:text-indigo-100 focus:outline-none focus:bg-indigo-700"
                                >
                                    <span className="sr-only">Remove phone number</span>
                                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
              </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !isFormValid}
              className="w-full flex justify-center items-center h-12 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Generating... This may take a moment.</span>
                </>
              ) : (
                'Generate 5 Marketing Images'
              )}
            </button>
            {error && <p className="mt-4 text-center text-red-400">{error}</p>}
          </div>
        </div>

        {generatedImages.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Your Marketing Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generatedImages.map((image) => (
                <ResultCard key={image.id} image={image} />
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-6 mt-8 border-t border-gray-800">
        <p className="text-gray-500">Powered by Gemini AI & FastAPI</p>
      </footer>
    </div>
  );
};

export default App;
