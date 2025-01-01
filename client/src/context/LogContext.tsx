import React, { createContext, useState, ReactNode, useEffect } from "react";

type LogContextType = {
  logs: string[]; // Array of log messages
  addLog: (message: string) => void; // Function to add a log message
  clearLogs: () => void; // Clear all logs
};

export const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]); // Append new message
  };

  const clearLogs = () => {
    setLogs([]); // Clear all logs
  };

  useEffect(() => {
    console.log(logs);
  });

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

// import React, { createContext, useState, ReactNode, useEffect } from "react";

// type LogEntry = {
//   attribute: string;
//   initialValue: any;
//   finalValue: any;
//   timestamp: Date;
// };

// interface LogContextType {
//   logs: LogEntry[];
//   addLog: (attribute: string, initialValue: any, finalValue: any) => void;
//   clearLogs: () => void;
//   getLogs: () => LogEntry[];
// }

// export const LogContext = createContext<LogContextType | undefined>(undefined);

// export const LogProvider = ({ children }: { children: ReactNode }) => {
//   const [logs, setLogs] = useState<LogEntry[]>([]);

//   const clearLogs = () => setLogs([]);
//   const getLogs = () => logs;

//   // Log the `logs` state whenever it changes
//   useEffect(() => {
//     console.log("Current Logs:", logs);
//   }, [logs]);

//   return (
//     <LogContext.Provider value={{ logs, addLog, clearLogs, getLogs }}>
//       {children}
//     </LogContext.Provider>
//   );
// };