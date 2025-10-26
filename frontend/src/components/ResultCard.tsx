import React, { useState } from 'react';
import { MarketingImage } from '../types';
import Spinner from './Spinner'; // Import the spinner for loading state

interface ResultCardProps {
  image: MarketingImage;
}

const ResultCard: React.FC<ResultCardProps> = ({ image }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch the image data from the URL.
      // 'no-cors' mode can be problematic, so we fetch directly.
      // The backend will need to ensure CORS headers are set if we store images on our own bucket.
      // For placeholder.com, this direct fetch works.
      const response = await fetch(image.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Convert the image response to a Blob.
      const blob = await response.blob();

      // Create a temporary URL for the Blob object.
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor tag to trigger the download.
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${image.theme.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${image.festiveHeadline.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      link.download = fileName;

      // Programmatically click the link to start the download.
      document.body.appendChild(link);
      link.click();

      // Clean up by removing the link and revoking the temporary URL.
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Could not download the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
      <img src={image.imageUrl} alt={image.festiveHeadline} className="w-full h-64 object-cover" />
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">{image.theme}</p>
        <h3 className="mt-2 text-lg font-semibold text-white">{image.festiveHeadline}</h3>
        <p className="mt-2 text-md text-gray-300 flex-grow">{image.marketingHeadline}</p>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="mt-4 w-full flex justify-center items-center h-10 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-colors disabled:bg-gray-500"
        >
          {isDownloading ? <Spinner className="w-5 h-5" /> : 'Download'}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;