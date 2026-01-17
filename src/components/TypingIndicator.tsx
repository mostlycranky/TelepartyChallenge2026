import { useTelepartyContext } from '../hooks/useTelepartyContext';

const TypingIndicator: React.FC = () => {
  const { isAnyoneTyping } = useTelepartyContext();

  if (!isAnyoneTyping) {
    return null;
  }

  return (
    <div className="px-4 md:px-6 py-2">
      <div className="flex items-center gap-3 text-sm text-gray-400 animate-slide-up">
        {/* Animated wave dots */}
        <div className="flex items-center gap-1">
          <span className="wave-dot"></span>
          <span className="wave-dot"></span>
          <span className="wave-dot"></span>
        </div>
        
        {/* Typing text */}
        <span className="text-xs font-medium">
          <span className="text-orange-400">Someone is typing...</span>
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
