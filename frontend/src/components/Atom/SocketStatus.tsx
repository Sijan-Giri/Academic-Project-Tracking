import { useEffect, useState } from 'react';
import { getSocket } from '@/lib';
import { cn } from '@/lib';

export default function SocketStatus({ className }: { className?: string }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)} title={connected ? 'Real-time connected' : 'Real-time disconnected'}>
      <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-success animate-pulse' : 'bg-muted-foreground')} />
      <span className="text-muted-foreground">{connected ? 'Live' : 'Offline'}</span>
    </div>
  );
}

export { SocketStatus };
