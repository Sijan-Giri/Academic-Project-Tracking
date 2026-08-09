
interface LoadingSpinnerProps {
  fullscreen?: boolean;
  message?: string;
  className?: string;
}

const Spinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary text-primary" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

export default function LoadingSpinner({
  fullscreen = false,
  message = "Loading...",
}: LoadingSpinnerProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Spinner message={message} />
      </div>
    );
  }

  return (
    <div className="min-h-60 w-full flex items-center justify-center">
      <Spinner message={message} />
    </div>
  );
}
