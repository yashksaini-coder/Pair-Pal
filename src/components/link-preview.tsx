import Image from 'next/image';
import { Card, CardBody } from "@nextui-org/react";
import { Skeleton } from './ui/skeleton';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <Card className="w-full" shadow="sm">
        <CardBody className="p-3">
          <div className="space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </CardBody>
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
      <Card 
        className="w-full group hover:scale-[1.02] transition-transform duration-300"
        shadow="sm"
        isPressable
      >
        <CardBody className="overflow-hidden p-3">
          <div className="flex gap-4">
            {image && (
              <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={image}
                  alt={title || 'Link preview'}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium line-clamp-1 text-default-900">
                  {title}
                </h4>
                <ExternalLink className="h-4 w-4 text-default-400 shrink-0" />
              </div>
              {description && (
                <p className="text-sm text-default-500 line-clamp-2">
                  {description}
                </p>
              )}
              <p className="text-xs text-default-400 truncate">
                {url}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </a>
  );
} 