import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  Pill,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Languages,
  Download,
  Loader2,
  Volume2
} from "lucide-react";
import { PrescriptionResponse, Medicine } from "../types";
// @ts-ignore
import { jsPDF } from "jspdf";
// @ts-ignore
import html2canvas from "html2canvas";

interface PrescriptionResultProps {
  data: PrescriptionResponse;
}

export const PrescriptionResult: React.FC<PrescriptionResultProps> = ({
  data,
}) => {
  const [activeLang, setActiveLang] = useState<"english" | "hindi" | "urdu" | "tamil">("english");
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);

    try {
      // Small delay to ensure UI is stable
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher scale for better resolution
        backgroundColor: "#ffffff",
        ignoreElements: (element) => element.classList.contains("no-pdf"),
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF with dynamic height if content is longer than A4
      // This creates a continuous "receipt-style" PDF if it's long, or standard A4 if short
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [imgWidth, Math.max(pageHeight, imgHeight + 20)] 
      });

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("prescription-decoded.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Controls Header (Excluded from PDF) */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-500" size={20} />
                Prescription Details
            </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {(["english", "hindi", "urdu", "tamil"] as const).map((lang) => (
                    <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                        activeLang === lang
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    >
                    {lang}
                    </button>
                ))}
            </div>
            
            <button 
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm shadow-blue-200"
            >
                {isDownloading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Download size={16} />
                )}
                {isDownloading ? "Saving..." : "Save PDF"}
            </button>
        </div>
      </div>

      {/* Printable Content Area */}
      <div ref={contentRef} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* PDF-only Header Branding (Hidden normally, but html2canvas captures visible stuff. 
            We'll use a visible header that looks good on both) */}
        <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Medical Prescription Analysis</h1>
            <p className="text-sm text-gray-500">Decoded on {new Date().toLocaleDateString()} • AI Generated Report</p>
        </div>

        {/* Doctor Notes */}
        {data.notes_from_doctor && (
            <div className="mb-6 bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <FileText size={16} /> Doctor's Notes
                </h3>
                <p className="text-blue-900 leading-relaxed">{data.notes_from_doctor}</p>
            </div>
        )}

        {/* General Safety */}
        {data.general_safety_observations && (
            <div className="mb-8 bg-amber-50 p-5 rounded-xl border border-amber-100">
                <h3 className="text-sm font-bold text-amber-800 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Activity size={16}/> General Safety
                </h3>
                <p className="text-amber-900 leading-relaxed">{data.general_safety_observations}</p>
            </div>
        )}

        {/* Uncertain Items */}
        {data.uncertain_items && data.uncertain_items.length > 0 && (
          <div className="mb-8 bg-red-50 p-5 rounded-xl border border-red-100">
            <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
              <AlertTriangle size={16} />
              Unclear Items
            </h3>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {data.uncertain_items.map((item, idx) => (
                <li key={idx}>{item} (Could not clearly decipher)</li>
              ))}
            </ul>
          </div>
        )}

        {/* Medicines List */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Prescribed Medicines</h3>
          {data.medicines.map((med, index) => (
            <MedicineCard key={index} medicine={med} activeLang={activeLang} />
          ))}
        </div>

        {/* Footer for PDF */}
        <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Generated by PrescriptionAI. This is not a substitute for professional medical advice.</p>
        </div>
      </div>
    </div>
  );
};

const MedicineCard: React.FC<{ medicine: Medicine; activeLang: string }> = ({
  medicine,
  activeLang,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isTranslated = activeLang !== "english";
  
  // Helper to get displayed text based on language selection
  const getTranslatedText = () => {
      if (activeLang === "english") return null;
      // @ts-ignore - dynamic access to properties
      return medicine.translation[activeLang];
  };

  const handlePlayAudio = () => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    let textToSpeak = medicine.spoken_summary?.english;
    let langCode = 'en-US';

    // Set text and language based on active selection
    if (activeLang === 'hindi') {
        textToSpeak = medicine.spoken_summary?.hindi;
        langCode = 'hi-IN';
    } 
    // Urdu and Tamil excluded from audio playback as per request
    
    // Fallback to English if translation is missing
    if (!textToSpeak) {
        textToSpeak = medicine.spoken_summary?.english;
        langCode = 'en-US';
    }

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const translatedContent = getTranslatedText();
  
  // Only show play button for English and Hindi
  const showPlayButton = medicine.spoken_summary && (activeLang === 'english' || activeLang === 'hindi');

  return (
    <div className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden break-inside-avoid">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                Medicine
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {medicine.decoded_name || medicine.name}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Original text: "{medicine.name}"
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-xl text-center min-w-[100px] shadow-sm">
                <span className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Dosage</span>
                <span className="font-bold text-lg text-blue-600">{medicine.dosage_raw}</span>
            </div>
            
            {showPlayButton && (
                 <button 
                    onClick={handlePlayAudio}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all no-pdf ${
                        isPlaying 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                >
                    <Volume2 size={14} className={isPlaying ? 'animate-pulse' : ''} />
                    {isPlaying ? 'Playing...' : `Play (${activeLang})`}
                </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-1 bg-white p-1.5 rounded-lg text-indigo-500 border border-gray-100 shadow-sm h-fit">
                <Pill size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Purpose</h4>
                <p className="text-gray-700 font-medium leading-relaxed">{medicine.purpose}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-1 bg-white p-1.5 rounded-lg text-teal-500 border border-gray-100 shadow-sm h-fit">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">How to Take</h4>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {medicine.dosage_explained}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {(medicine.warnings || medicine.side_effects) && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3 h-full">
                {medicine.side_effects && (
                    <div>
                        <h4 className="text-xs font-bold text-orange-600 flex items-center gap-1 mb-1 uppercase tracking-wide">
                            <Activity size={12}/> Side Effects
                        </h4>
                        <p className="text-sm text-gray-600">{medicine.side_effects}</p>
                    </div>
                )}
                 {medicine.warnings && (
                    <div className={`${medicine.side_effects ? 'pt-3 border-t border-gray-100' : ''}`}>
                        <h4 className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1 uppercase tracking-wide">
                            <AlertCircle size={12}/> Warning
                        </h4>
                        <p className="text-sm text-gray-600">{medicine.warnings}</p>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Translation Section */}
        {isTranslated && translatedContent && (
          <div className="mt-6 pt-5 border-t border-gray-200">
             <h4 className="text-xs font-bold text-purple-600 flex items-center gap-2 mb-2 uppercase tracking-wide">
                <Languages size={14} />
                Translation ({activeLang})
             </h4>
             <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-purple-900 text-lg leading-relaxed font-medium">
                {translatedContent}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};