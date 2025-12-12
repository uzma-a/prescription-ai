import React, { useState } from "react";
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { ImageUploader } from "./components/ImageUploader";
import { PrescriptionResult } from "./components/PrescriptionResult";
import { Disclaimer } from "./components/Disclaimer";
import { HistoryView } from "./components/HistoryView";
import { analyzePrescription } from "./services/geminiService";
import { PrescriptionResponse, HistoryItem } from "./types";
import { Stethoscope, Sparkles, History, Home } from "lucide-react";

// Home Component to manage scan state
const HomeView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrescriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzePrescription(file);
      setResult(data);
      
      // Save to History
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        data: data
      };
      
      const existingHistoryStr = localStorage.getItem("prescription_history");
      const existingHistory: HistoryItem[] = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      
      // Keep last 20 items
      const updatedHistory = [newItem, ...existingHistory].slice(0, 20);
      localStorage.setItem("prescription_history", JSON.stringify(updatedHistory));

    } catch (err) {
      console.error(err);
      setError("Failed to analyze the prescription. Please try again with a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero / Intro */}
      {!result && !loading && (
        <div className="text-center mb-10 max-w-2xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Understand your prescription <br />
            <span className="text-blue-600">in seconds.</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Upload a photo of your handwritten doctor's note. We'll decode the handwriting, explain the dosage, and translate it for you.
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className={`${result ? 'mb-8' : ''}`}>
        <ImageUploader onImageSelected={handleImageSelected} isLoading={loading} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center justify-center text-center animate-fade-in">
          <p>{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && <PrescriptionResult data={result} />}
    </>
  );
};

const Navbar: React.FC = () => {
    const location = useLocation();
    
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Stethoscope size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              PrescriptionAI
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
             <Link 
                to={location.pathname === "/history" ? "/" : "/history"}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    location.pathname === "/history" 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
             >
                {location.pathname === "/history" ? <Home size={18} /> : <History size={18} />}
                <span className="hidden sm:inline">
                    {location.pathname === "/history" ? "Home" : "History"}
                </span>
             </Link>
          </div>
        </div>
      </header>
    );
}

const App: React.FC = () => {
  return (
    <HashRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <Navbar />

        <main className="flex-grow p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
            <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/history" element={<HistoryView />} />
            </Routes>
            </div>
        </main>
        
        <Disclaimer />
        
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
            <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} PrescriptionAI. Private & Secure.</p>
            <p className="mt-2 flex items-center justify-center gap-1">
                Powered by Gemini <Sparkles size={10} className="text-purple-400" />
            </p>
            </div>
        </footer>
        </div>
    </HashRouter>
  );
};

export default App;