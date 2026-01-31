'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
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

const stageQuestions: Record<number, { question: string; answer: string }[]> = {
    1: [
      { question: "Why do you need my academic details?", answer: "Your academic background helps me understand which universities are realistic for you. GPA, degree, and graduation year directly affect admission chances and intake eligibility." },
      { question: "What if my GPA is low?", answer: "A lower GPA does not mean you cannot study abroad. It means we need to balance universities carefully and strengthen other areas like exams, SOP, or university selection." },
      { question: "Can I change my profile later?", answer: "Yes. You can edit your profile anytime. Just remember—changing your profile may update recommendations, risks, and tasks automatically." },
    ],
    2: [
      { question: "Why is this university marked as “Dream”?", answer: "This university has strong competition or higher academic expectations compared to your current profile. It’s achievable, but not guaranteed—hence categorized as a Dream option." },
      { question: "What does “Target” university mean?", answer: "Target universities closely match your profile. If you complete required exams and documents properly, your chances are reasonably strong." },
      { question: "Are “Safe” universities low quality?", answer: "No. Safe universities are simply those where your profile exceeds the minimum requirements. They offer stability and reduce admission risk." },
    ],
    3: [
        { question: "What happens when I lock a university?", answer: "Locking a university tells the system to stop exploring and start preparing. Your tasks, documents, and timeline become specific to that university." },
        { question: "Can I unlock a university later?", answer: "Yes, but unlocking will reset your preparation tasks and strategy. This helps maintain focus and avoids half-prepared applications." },
        { question: "Should I lock more than one university?", answer: "You may lock more than one, but it’s best to keep the list focused. Too many locked choices can dilute preparation quality." },
    ],
    4: [
        { question: "Do I submit applications on this platform?", answer: "No. This platform prepares you. Actual application submission happens on university websites." },
        { question: "Why is SOP so important?", answer: "Your SOP explains your story, goals, and fit. It often carries more weight than GPA, especially for competitive programs." },
        { question: "What if I miss a task deadline?", answer: "Missing a task won’t block you, but it may compress your timeline. Completing tasks on time reduces stress later." },
    ],
    5: [
      { question: "Am I done now?", answer: "You’re done with preparation. Your focus now shifts to tracking deadlines, interviews, and final submissions externally." },
      { question: "What if something changes in my profile?", answer: "If you update your profile, I’ll reassess risks, recommendations, and next steps automatically." },
      { question: "What should I focus on now?", answer: "Stay organized, track deadlines, prepare for interviews, and keep documents ready." },
    ]
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
  const [showSuggested, setShowSuggested] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentQuestions = user ? stageQuestions[user.currentStage] || [] : [];

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

  const handleSuggestedQuestionClick = (question: string, answer: string) => {
    if (loading) return;
    setShowSuggested(false);
    setMessages(prev => [...prev, {role: 'user', content: question}, {role: 'model', content: answer}]);
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || loading || !user) return;

    setShowSuggested(false);

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
        currentStage: user.currentStage,
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
    <Card className="h-[260px] flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary" />
            AI Counsellor
        </CardTitle>
        <CardDescription>Your personal guide for your study abroad journey.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea className="h-full no-scrollbar" ref={scrollAreaRef}>
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

            {showSuggested && currentQuestions.length > 0 && (
                <div className="flex flex-col items-start gap-2 pt-4">
                    <p className="text-xs text-muted-foreground font-medium">Commonly asked questions:</p>
                    {currentQuestions.map((q, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="h-auto py-1.5 px-3 text-left"
                            onClick={() => handleSuggestedQuestionClick(q.question, q.answer)}
                            disabled={loading}
                        >
                            {q.question}
                        </Button>
                    ))}
                </div>
            )}

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
