import React from 'react';
import { useNavigate } from 'react-router-dom';

const Test: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Page</h1>
      <p className="text-lg text-gray-600 mb-8">
        If you can see this page, the routing is working correctly!
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Go to Home
      </button>
    </div>
  );
};

export default Test;
