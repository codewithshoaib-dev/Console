export default function PageSkeleton() {

  return (
    <div className="flex h-[60vh] w-full items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-4">

        <div className="relative h-12 w-12">
           
          <div className="absolute inset-0 rounded-full border-4 border-muted opacity-25" />
 
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        </div>

        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading data...
        </p>
      </div>
    </div>
  );
}
