import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HistoryItem } from "../types";
import { ArrowLeft, Clock, ChevronRight, Calendar, Trash2 } from "lucide-react";
import { PrescriptionResult } from "./PrescriptionResult";

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("prescription_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
        localStorage.removeItem("prescription_history");
      }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem("prescription_history");
      setHistory([]);
    }
  };

  const deleteItem = (id: string) => {
    // Removed window.confirm to prevent blocking issues in preview environments
    setHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter(
        (item) => item.id !== id
      );
      localStorage.setItem("prescription_history", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const handleCardClick = (item: HistoryItem) => {
    setSelectedItem(item);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedItem) {
    return (
      <div className="animate-fade-in pb-12">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to History
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">
            Recorded on {formatDate(selectedItem.timestamp)}
          </span>
        </div>
        <PrescriptionResult data={selectedItem.data} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in min-h-[60vh]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">History</h2>
          <p className="text-gray-500 mt-1">Your previously decoded prescriptions</p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            New Scan
          </Link>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear All History"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Clock size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No history yet</h3>
          <p className="text-gray-500 mb-6">Upload a prescription to get started</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Scan Prescription
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <Calendar size={24} />
                  </div>
                  <div className="pr-12">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.data.medicines.length > 0
                        ? `${item.data.medicines.length} Medicines Prescribed`
                        : "Prescription Scan"}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-sm text-gray-500">
                      <span>{formatDate(item.timestamp)}</span>
                      {item.data.medicines.length > 0 && (
                        <>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="truncate max-w-[200px]">
                            {item.data.medicines[0].decoded_name || item.data.medicines[0].name}
                            {item.data.medicines.length > 1 &&
                              ` +${item.data.medicines.length - 1} more`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-20 relative"
                    title="Delete Prescription"
                    aria-label="Delete Prescription"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};