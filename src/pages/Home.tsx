import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          欢迎来到首页
        </h1>
        <div className="bg-white shadow-md rounded-lg p-8">
          <p className="text-lg text-gray-700 mb-6">
            这是一个使用 React + Vite + Tailwind CSS + React Router 构建的示例应用。
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/about" className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors">
              关于我们
            </a>
            <a href="/contact" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors">
              联系我们
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;