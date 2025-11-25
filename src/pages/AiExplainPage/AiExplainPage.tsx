import { Send, Eraser, StopCircle, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAiExplain } from '@/features/AiExplain/AiExplain';

export default function AIExplainPage() {
  const {
    input,
    setInput,
    messages,
    isLoading,
    scrollRef,
    handleStop,
    handleSubmit,
    handleClear,
    handleKeyDown,
  } = useAiExplain();

  return (
    <div className="flex flex-1 flex-col h-full p-6 gap-6 overflow-hidden bg-slate-50/50">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-slate-900">AI 答疑助手</h2>
      </div>

      <Card className="flex-1 flex flex-col shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white">
        <CardHeader className="px-6 py-4 border-b bg-white flex flex-row justify-between items-center shrink-0 space-y-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>智能解析与问答</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 px-2"
          >
            <Eraser className="w-4 h-4 mr-1" /> 清空
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/30 relative">
          <ScrollArea className="h-full px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-sm">输入题目或上传图片，开始智能问答</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-4 w-full',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                    )}
                  >
                    <Avatar className="w-8 h-8 border border-slate-100 bg-white shrink-0">
                      <AvatarImage
                        src={msg.role === 'ai' ? '/ai-avatar.png' : ''}
                      />
                      <AvatarFallback
                        className={
                          msg.role === 'ai'
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-slate-100 text-slate-600'
                        }
                      >
                        {msg.role === 'ai' ? (
                          <Bot size={16} />
                        ) : (
                          <User size={16} />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%]',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none',
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 ml-1 align-text-bottom bg-purple-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t bg-white shrink-0">
          <div className="max-w-3xl mx-auto w-full flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="在此输入题目..."
              className="min-h-[50px] max-h-[150px] resize-none shadow-sm bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-primary transition-all"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                variant="destructive"
                size="icon"
                className="h-[50px] w-[50px] shrink-0 rounded-xl"
                onClick={handleStop}
              >
                <StopCircle className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                className="h-[50px] w-[50px] shrink-0 rounded-xl shadow-sm"
                size="icon"
                onClick={handleSubmit}
                disabled={!input.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
