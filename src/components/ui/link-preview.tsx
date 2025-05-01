import Image from 'next/image';
import { Card } from './card';
import { Skeleton } from './skeleton';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  isLoading?: boolean;
}

export function LinkPreview({ 
  url, 
  title, 
  description, 
  image, 
  isLoading = false 
}: LinkPreviewProps) {
  if (isLoading) {
    return (
      <Card className="w-full overflow-hidden">
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block no-underline hover:no-underline"
    >
      <Card className="w-full overflow-hidden hover:bg-muted/50 transition-colors">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium line-clamp-1">{title}</h4>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {image && (
            <div className="relative h-32 w-full rounded-md overflow-hidden">
              <Image
                src={image}
                alt={title || 'Link preview'}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
        </div>
      </Card>
    </a>
  );
} 