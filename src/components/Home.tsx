import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTelepartyContext } from "../hooks/useTelepartyContext";
import ConnectionStatus from "./ConnectionStatus";
import RoomSetup from "./RoomSetup";

const Home: React.FC = () => {
  const { roomId } = useTelepartyContext();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (roomId) {
      navigate(`/room/${roomId}`, { replace: true });
    }
  }, [roomId, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen pb-16 md:pb-20 relative overflow-hidden">
      {/* Interactive gradient that follows mouse */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 107, 53, 0.15) 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 animate-float opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 animate-float opacity-60" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-1/4 w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 animate-float opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-4 h-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 animate-float opacity-50" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container-custom py-8 md:py-16 relative z-10">
        <div className="text-center mb-8 md:mb-14 animate-slide-up">
          {/* Simple chat icon */}
          <div className="inline-block mb-6 text-6xl md:text-7xl animate-float">
            💬
          </div>
          
          {/* App name - simple */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 text-white">
            Group Chat
          </h1>
          
          {/* Simple tagline */}
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md mx-auto">
            Create a room or join one to start chatting
          </p>
        </div>

        <RoomSetup />
      </div>
      
      <ConnectionStatus />
    </div>
  );
};

export default Home;
