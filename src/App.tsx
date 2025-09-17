import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bridge from './pages/Bridge';
import './App.css';
import Header from './components/Header';
import Pool from './pages/Pool';
import MuUSD from './pages/muUsd';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col justify-center min-h-screen">
        {/* <header className="bg-white shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-end space-x-4">
            <Link to="/bridge" className="text-indigo-600 font-medium">Bridge</Link>
            <ConnectButton />
          </div>
        </header> */}

        {/* 主内容区域 */}
        <main className="flex-grow w-full flex max-md:pt-[64px] md:items-center justify-center">
          <Header></Header>
          <Routes>
            <Route path="/" element={<Bridge />} />
            <Route path="/bridge" element={<Bridge />} />
            <Route path="/pool" element={<Pool />} />
            <Route path="/muUSD" element={<MuUSD />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
