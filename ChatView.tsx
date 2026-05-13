import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, MessageSquare, Zap, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoadingIndicator } from '../LoadingIndicator';
import { useStore } from '../../store/useStore';

/**
 * Renders the chat interface for the Business Architect AI, displaying the message list, composer, and an agent-blocked banner when applicable.
 *
 * The view auto-scrolls to the newest message, aligns user messages to the right, and provides a text input and send button (disabled while loading). When a project agent has status `waiting-for-input`, a banner is shown with an action to open the Agents tab.
 *
 * @returns The ChatView React element.
 */
export default function ChatView() {
  const { 
    chatMessages, 
    chatInput, 
    setChatInput, 
    handleSendMessage, 
    isChatLoading,
    selectedProject,
    setActiveTab
  } = useStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Check if any agent is waiting for input
  const waitingAgent = selectedProject?.agents?.find(a => a.status === 'waiting-for-input');

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-4"
    >
      {waitingAgent && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3 items-center">
            <AlertCircle size={24} className="animate-pulse" />
            <div>
              <p className="font-bold text-sm">Agent Blocked: {waitingAgent.name}</p>
              <p className="text-xs">{waitingAgent.currentTask || 'An agent requires your input to proceed.'}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
            onClick={() => setActiveTab('agents')}
          >
            Resolve in Agents
          </Button>
        </div>
      )}

      <Card className="flex-1 aetheris-card flex flex-col overflow-hidden border-none">
        <CardHeader className="border-b border-accent/10 bg-background/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center gold-glow">
              <Bot className="text-accent-foreground w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Business Architect AI</CardTitle>
              <CardDescription className="text-muted-foreground">Brainstorming & Strategy Refinement (Gemini 2.0 Flash)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <MessageSquare size={48} className="mx-auto text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground">Ask me anything about starting a 0-capital AI business.</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-4 max-w-[80%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}>
                  <Avatar className="w-8 h-8 shrink-0 border border-accent/20">
                    <AvatarFallback className={msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}>
                      {msg.role === 'user' ? 'U' : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm",
                    msg.role === 'user' ? "bg-primary text-primary-foreground electric-glow" : "bg-secondary/80 text-foreground border border-accent/10"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t border-accent/10 bg-background/20">
          <div className="flex gap-2">
            <Input 
              placeholder="Type your business idea or question..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-background/50 border-accent/20 focus-visible:ring-primary/50 text-foreground"
            />
            <Button onClick={handleSendMessage} className="electric-glow" disabled={isChatLoading}>
              {isChatLoading ? <LoadingIndicator icon={Zap} size={18} /> : <Zap size={18} />}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
