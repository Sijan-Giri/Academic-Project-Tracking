import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Send, Search, MessageSquare, Trash2, ChevronLeft, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useConversations, useMessages, useChattableUsers } from '@/hooks';
import { cn } from '@/lib';
import { PageHeader, Skeleton, SkeletonCircle } from '@/components';
import type { ConversationSummary, ChatMessage } from '@/types';
import { useDebounce } from '@/hooks';

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d, HH:mm');
}

function formatConvoTime(dateStr: string | null): string {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

function AvatarInitial({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={cn('rounded-full gradient-brand-br flex items-center justify-center text-white font-semibold shrink-0', sizeClass)}>
      {initial}
    </div>
  );
}

function NewChatModal({ onStart, onClose }: { onStart: (userId: string) => Promise<void>; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: users = [], isLoading } = useChattableUsers(debouncedSearch);
  const [starting, setStarting] = useState<string | null>(null);

  const handleSelect = async (userId: string) => {
    setStarting(userId);
    try {
      await onStart(userId);
      onClose();
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overlay-dark" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">New Message</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonCircle size="w-9 h-9" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {debouncedSearch ? 'No users found' : 'Type a name to search'}
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id)}
                disabled={starting === user.id}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary transition-colors text-left disabled:opacity-60"
              >
                <AvatarInitial name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md badge-muted shrink-0">
                  {user.role}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({ convo, isActive, onClick }: { convo: ConversationSummary; isActive: boolean; onClick: () => void }) {
  const displayName = convo.otherUser?.name ?? 'Unknown User';
  const lastContent = convo.lastMessage?.isDeleted
    ? 'Message deleted'
    : convo.lastMessage?.content ?? 'No messages yet';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-secondary/70 border-b border-border/50',
        isActive && 'bg-brand-subtle border-l-2 border-l-brand-strong'
      )}
    >
      <div className="relative shrink-0">
        <AvatarInitial name={displayName} size="sm" />
        {convo.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
            {convo.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={cn('text-sm truncate', convo.unreadCount > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
            {displayName}
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatConvoTime(convo.lastMessageAt)}
          </span>
        </div>
        <p className={cn('text-xs truncate', convo.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground font-normal')}>
          {lastContent}
        </p>
      </div>
    </button>
  );
}

function MessageBubble({ msg, isOwn, onDelete }: { msg: ChatMessage; isOwn: boolean; onDelete: (id: string) => void }) {
  const [hover, setHover] = useState(false);

  if (msg.isDeleted) {
    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="px-4 py-2 rounded-2xl text-xs italic text-muted-foreground border border-border bg-secondary/50 max-w-xs">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isOwn && (
        <AvatarInitial name={msg.sender.name} size="sm" />
      )}

      <div className={cn('flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <span className="text-[11px] font-medium text-muted-foreground ml-1">{msg.sender.name}</span>
        )}
        <div className={cn('relative group flex items-center gap-1.5', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl text-sm max-w-xs lg:max-w-md xl:max-w-lg break-words leading-relaxed',
              isOwn
                ? 'gradient-brand-br text-white rounded-br-sm'
                : 'bg-secondary border border-border text-foreground rounded-bl-sm'
            )}
          >
            {msg.content}
          </div>
          {isOwn && hover && (
            <button
              onClick={() => onDelete(msg.id)}
              className="text-muted-foreground hover:text-danger transition-colors p-1 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className={cn('text-[10px] text-muted-foreground px-1', isOwn ? 'text-right' : 'text-left')}>
          {formatMessageTime(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}

function ChatWindow({ conversationId, otherName }: { conversationId: string; otherName: string }) {
  const { user } = useAuthStore();
  const { messages, isLoading, send, isSending, deleteMessage } = useMessages(conversationId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending) return;
    setInput('');
    try {
      await send(content);
    } catch (_) {
      setInput(content);
    }
  }, [input, isSending, send]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card shrink-0">
        <button
          onClick={() => navigate('/chat')}
          className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <AvatarInitial name={otherName} size="md" />
        <div>
          <p className="text-sm font-semibold text-foreground">{otherName}</p>
          <p className="text-xs text-muted-foreground">Direct message</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn('flex items-end gap-2', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                {i % 2 !== 0 && <SkeletonCircle size="w-8 h-8" />}
                <Skeleton className={cn('rounded-2xl h-10', i % 2 === 0 ? 'w-48' : 'w-64')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Start the conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Send the first message to {otherName}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.senderId === user?.id}
              onDelete={deleteMessage}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-4 border-t border-border bg-card shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Message ${otherName}…`}
            rows={1}
            disabled={isSending}
            className="flex-1 resize-none rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all max-h-36 overflow-y-auto disabled:opacity-70"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              isSending
                ? 'gradient-brand-br text-white opacity-85 cursor-wait'
                : input.trim()
                ? 'gradient-brand-br text-white hover:opacity-90 active:scale-95'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
            )}
            title={isSending ? 'Sending…' : 'Send message'}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { conversationId: paramId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { conversations, isLoading: convosLoading, startConversation, isStarting } = useConversations();
  const [showNewChat, setShowNewChat] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(paramId ?? null);

  useEffect(() => {
    if (paramId) setActiveId(paramId);
  }, [paramId]);

  const activeConvo = conversations.find((c) => c.id === activeId);
  const otherName = activeConvo?.otherUser?.name ?? 'Conversation';

  const handleSelectConvo = (id: string) => {
    setActiveId(id);
    navigate(`/chat/${id}`, { replace: true });
  };

  const handleStartConvo = async (userId: string) => {
    const convId = await startConversation(userId);
    handleSelectConvo(convId);
  };

  return (
    <div className="space-y-0 -mt-6 -mx-6 lg:-mx-8 h-[calc(100vh-4rem)]">
      <div className="flex h-full border border-border rounded-none lg:rounded-xl overflow-hidden bg-card shadow-sm">
        <div className={cn(
          'flex flex-col border-r border-border bg-card transition-all',
          activeId ? 'hidden lg:flex lg:w-72 xl:w-80 shrink-0' : 'flex w-full lg:w-72 xl:w-80 shrink-0'
        )}>
          <div className="px-4 py-4 border-b border-border">
            <PageHeader title="Messages" className="mb-0 border-none pb-0" />
          </div>

          <div className="px-3 py-3 border-b border-border">
            <button
              onClick={() => setShowNewChat(true)}
              disabled={isStarting}
              className="w-full btn-primary text-sm py-2.5 rounded-xl"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Message
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convosLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonCircle size="w-9 h-9" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32 rounded" />
                      <Skeleton className="h-3 w-48 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start by clicking New Message</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <ConversationItem
                  key={convo.id}
                  convo={convo}
                  isActive={convo.id === activeId}
                  onClick={() => handleSelectConvo(convo.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className={cn(
          'flex-1 flex flex-col',
          !activeId && 'hidden lg:flex'
        )}>
          {activeId ? (
            <ChatWindow conversationId={activeId} otherName={otherName} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Your Messages</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Select a conversation from the list or start a new one with any user.
              </p>
            </div>
          )}
        </div>
      </div>

      {showNewChat && (
        <NewChatModal
          onStart={handleStartConvo}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
}
