import React from "react";
import { useTelepartyContext } from "../hooks/useTelepartyContext";
import { ConnectionState } from "../types/teleparty.types";

const ConnectionStatus: React.FC = () => {
  const { connectionState, roomId, reconnect } = useTelepartyContext();

  const getStatusConfig = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return {
          dotClass: "status-connected",
          text: "Connected",
          bgClass: "bg-teal-500/10 border-teal-500/20",
          textClass: "text-teal-400"
        };
      case ConnectionState.CONNECTING:
        return {
          dotClass: "status-connecting",
          text: "Connecting...",
          bgClass: "bg-orange-500/10 border-orange-500/20",
          textClass: "text-orange-400"
        };
      case ConnectionState.DISCONNECTED:
        return {
          dotClass: "status-disconnected",
          text: "Disconnected",
          bgClass: "bg-red-500/10 border-red-500/20",
          textClass: "text-red-400"
        };
      default:
        return {
          dotClass: "bg-gray-500",
          text: "Unknown",
          bgClass: "bg-gray-500/10 border-gray-500/20",
          textClass: "text-gray-400"
        };
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleReconnect = () => {
    reconnect();
  };

  const showReconnectButton = connectionState === ConnectionState.DISCONNECTED && roomId;
  const showReloadButton = connectionState === ConnectionState.DISCONNECTED && !roomId;
  
  const config = getStatusConfig();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-4 py-2.5 rounded-full border backdrop-blur-md flex items-center gap-3 shadow-lg ${config.bgClass}`}>
        {/* Status indicator */}
        <div className={config.dotClass}></div>
        
        {/* Status text */}
        <span className={`text-sm font-medium ${config.textClass}`}>
          {config.text}
        </span>
        
        {/* Action buttons */}
        {showReconnectButton && (
          <button
            onClick={handleReconnect}
            className="ml-2 px-3 py-1 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all"
          >
            Reconnect
          </button>
        )}
        
        {showReloadButton && (
          <button
            onClick={handleReload}
            className="ml-2 px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
          >
            Reload
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
