'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User as UserIcon, Send, Loader2 } from 'lucide-react';
import { aiChat } from '@/lib/actions';
import type { AIChatInput } from '@/ai/flows/ai-chat-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function AiChatCard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I'm your AI counsellor. How can I help you with your application journey today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('');

  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || loading || !user) return;

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    const chatHistory: AIChatInput['history'] = messages.map(msg => ({
      role: msg.role,
      content: [{ text: msg.content }],
    }));
    chatHistory.push({ role: 'user', content: [{ text: userMessage.content }] });

    const response = await aiChat({
        history: chatHistory,
        userProfile: JSON.stringify(user.profile),
        userState: JSON.stringify(user.state),
        shortlistedUniversities: user.shortlistedUniversities,
        lockedUniversities: user.lockedUniversities
    });

    if (response && response.response) {
      setMessages(prev => [...prev, { role: 'model', content: response.response }]);
    } else {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    }
    setLoading(false);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput('');
  };

  return (
    <Card className="h-[480px] flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary" />
            AI Counsellor
        </CardTitle>
        <CardDescription>Your personal guide for your study abroad journey.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 text-sm',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && user && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.fullName}`} alt={user.fullName || ''} />
                        <AvatarFallback>
                            {user.fullName ? getInitials(user.fullName) : <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}

            {loading && (
                <div className="flex items-start gap-3 text-sm justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Ask your AI counsellor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
