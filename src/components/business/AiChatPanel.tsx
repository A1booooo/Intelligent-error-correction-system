import { useState, useRef, useEffect } from "react";
import { Plus, Send, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAiExplain } from "@/features/AiExplain/AiExplain";

// StreamingText 组件
const StreamingText = ({ content, isStreaming }: { content: string; isStreaming: boolean }) => {
  return (
    <div className="whitespace-pre-wrap leading-relaxed break-words text-sm">
      {content}
      
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-current animate-pulse rounded-sm" />
      )}
    </div>
  );
};
// 
//  主组件 
interface AiChatPanelProps {
  className?: string;
  mode?: 'standard' | 'embedded'; 
}

export function AiChatPanel({ className, mode = 'standard' }: AiChatPanelProps) {
  const hookResult = useAiExplain();
  
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  if (!hookResult) return null;

  const {
    input, setInput, messages, isLoading, scrollRef,
    handleStop, handleSubmit, handleKeyDown,
  } = hookResult;

  const isEmbedded = mode === 'embedded';

  useEffect(() => {
    if (isInputExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputExpanded]);

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", 
      "border border-slate-800 shadow-lg bg-white rounded-xl",
      className
    )}>
      
      {/* 头部标题 */}
      <CardHeader className="pb-2 pt-4 px-4 shrink-1 bg-white">
        <CardTitle className="text-lg">
          {isEmbedded ? "AI问答区" : "智能解析与问答"}
        </CardTitle>
      </CardHeader>
      
      {/* 内容主体 */}
      <CardContent className="flex-1 p-4 overflow-hidden relative flex flex-col">
        
        {/* 消息列表容器 (灰色背景) */}
        <div className={cn("flex-1 rounded-xl overflow-hidden relative flex flex-col", isEmbedded ? "bg-[#f9fafb]" : "bg-slate-50")}>
          
          <div className="flex-1 h-full overflow-y-auto p-3 space-y-4 scroll-smooth">
              
              {/* 1. 默认欢迎语 (仅嵌入模式且无消息时显示) */}
              {isEmbedded && messages.length === 0 && (
                <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="bg-[#14b8a6] text-white px-4 py-3 rounded-2xl rounded-tl-none text-sm shadow-sm leading-relaxed max-w-[90%]">
                    欢迎使用智能错题提问系统，请您根据什么问题提问
                  </div>
                </div>
              )}

              {/* 2. 消息遍历 */}
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                      "px-4 py-2.5 rounded-2xl shadow-sm max-w-[90%]",
                      msg.role === "user" 
                        ? "bg-[#545cff] text-white rounded-tr-none" // 用户: 紫色
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none" // AI: 白色
                    )}>
                    
                    {/* StreamingText 组件 */}
                    <StreamingText content={msg.content} isStreaming={!!msg.isStreaming} />
                    
                  </div>
                </div>
              ))}
              
              <div ref={scrollRef} />
          </div>
        </div>

        <div className="mt-4 shrink-0 h-[50px] relative">
          
          {/* 状态 1:嵌入时的引导按钮 */}
          {!isInputExpanded && isEmbedded && (
            <Button 
              className="w-full h-full bg-[#545cff] hover:bg-[#434bdc] text-white rounded-xl text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all duration-300"
              onClick={() => setIsInputExpanded(true)}
            >
              <Plus className="w-4 h-4" />
              请用自然语言提问
            </Button>
          )}

          {/* 状态 2: 输入框 + 发送按钮 */}
          {(isInputExpanded || !isEmbedded) && (
            <div className="flex gap-2 items-end h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-1 relative h-full">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入问题..."
                  className="w-full h-full min-h-[50px] resize-none bg-white border border-slate-300 focus:bg-white focus-visible:ring-[#545cff] text-sm py-3 pr-2 rounded-xl shadow-sm"
                  disabled={isLoading}
                />
              </div>
              
              {/* 交互按钮 (发送 / 停止) */}
              <Button 
                size="icon" 
                className={cn(
                  "h-[50px] w-[50px] shrink-0 rounded-xl shadow-sm transition-all duration-300",
                  isLoading 
                    ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100" // 加载中样式
                    : "bg-[#545cff] hover:bg-[#434bdc] text-white" // 默认样式
                )}
                onClick={isLoading ? handleStop : handleSubmit} 
                disabled={!isLoading && !input.trim()}
              >
                {isLoading ? (
                  <div className="relative flex items-center justify-center group">
                    <Loader2 className="w-5 h-5 animate-spin group-hover:opacity-0 transition-opacity duration-200" />
                    <StopCircle className="w-5 h-5 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100" />
                  </div>
                ) : (
                  <Send className="w-5 h-5 ml-0.5" />
                )}
              </Button>
            </div>
          )}

        </div>

      </CardContent>
    </Card>
  );
}