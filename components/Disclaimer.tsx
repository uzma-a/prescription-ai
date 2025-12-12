import React from "react";
import { ShieldAlert } from "lucide-react";

export const Disclaimer: React.FC = () => {
  return (
    <div className="bg-amber-50 border-t border-b border-amber-200 p-4">
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        <ShieldAlert className="text-amber-600 shrink-0 mt-1" />
        <div className="text-sm text-amber-800">
          <p className="font-bold mb-1">AI Generated Content - Medical Disclaimer</p>
          <p>
            This tool uses artificial intelligence to interpret prescriptions. 
            <strong> Errors can occur.</strong> Do not rely solely on this information. 
            Always verify the medicine names and dosages with your pharmacist or doctor before use.
            This is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};
