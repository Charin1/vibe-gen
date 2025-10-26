import React from 'react';
import { MarketingImage } from '../types';

interface ResultCardProps {
  image: MarketingImage;
}

const ResultCard: React.FC<ResultCardProps> = ({ image }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.imageUrl;
    const fileName = `${image.theme.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${image.festiveHeadline.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          className="mt-4 w-full flex justify-center items-center h-10 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
