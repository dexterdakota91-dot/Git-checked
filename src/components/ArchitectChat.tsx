import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, ChevronRight, Zap, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoadingIndicator } from './LoadingIndicator';
import { useStore } from '../store/useStore';

export function ArchitectChat() {
  const { 
    isChatOpen, setIsChatOpen, 
    chatMessages, 
    chatInput, setChatInput, 
    isChatLoading,
    handleSendMessage
  } = useStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatLoading, isChatOpen]);

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-2">
                <Bot className="text-primary" size={20} />
                <span className="font-bold font-display">Architect Chat</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                <ChevronRight size={20} />
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <div className="space-y-4 pb-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-xl max-w-[90%]",
                    msg.role === 'user' ? "bg-primary/10 ml-auto" : "bg-secondary/50"
                  )}>
                    <p className="text-xs font-bold mb-1 text-muted-foreground">{msg.role === 'user' ? 'You' : 'Architect'}</p>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="p-3 rounded-xl max-w-[90%] bg-secondary/50 flex items-center gap-2">
                    <LoadingIndicator icon={Zap} size={14} />
                    <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="p-4 border-t border-border bg-secondary/20">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask the Architect..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-background border-none focus-visible:ring-primary/50"
                  disabled={isChatLoading}
                />
                <Button variant="secondary" onClick={handleSendMessage} className="electric-glow size-icon" disabled={isChatLoading}>
                  {isChatLoading ? <LoadingIndicator icon={Zap} size={18} /> : <Zap size={18} />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <Button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 electric-glow z-40 shadow-xl transition-all",
          isChatOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <MessageSquare size={24} />
      </Button>
    </>
  );
}
