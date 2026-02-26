/**
 * Individual model item within the Select dropdown
 * Displays model name + inline badges (context window, speed)
 */

import React from 'react';
import { SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Model } from '@/types/model';

interface ModelSelectItemProps {
  model: Model;
}

export function ModelSelectItem({ model }: ModelSelectItemProps) {
  return (
    <SelectItem value={model.id}>
      <div className="flex items-center justify-between w-full gap-3">
        <span className="font-medium">{model.name}</span>
        <div className="flex gap-1.5">
          <Badge variant="outline" className="text-xs">
            {model.contextWindow}k
          </Badge>
          <Badge
            variant={model.speed === 'fast' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {model.speed}
          </Badge>
        </div>
      </div>
    </SelectItem>
  );
}
