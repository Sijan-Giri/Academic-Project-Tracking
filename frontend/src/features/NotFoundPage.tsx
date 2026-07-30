import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 text-center space-y-6 px-4">
        <div className="text-[10rem] font-black leading-none bg-gradient-to-br from-indigo-400 to-violet-600 bg-clip-text text-transparent select-none">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
          <p className="text-gray-400 max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')} size="lg" id="back-home-btn">
          <Home className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
