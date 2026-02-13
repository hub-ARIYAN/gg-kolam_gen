import React, { createContext, useContext, useState } from "react";

const AnalysisContext = createContext<any>(null);

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [result, setResult] = useState<any>(null);
  return (
    <AnalysisContext.Provider value={{ result, setResult }}>
      {children}
    </AnalysisContext.Provider>
  );
};