import { FOOD_TAGS, FoodTag } from '@/types/health';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

const TAG_EMOJI: Record<FoodTag, string> = {
  gluten: '🌾',
  dairy: '🥛',
  sugar: '🍬',
  caffeine: '☕',
  alcohol: '🍷',
  processed: '🍟',
  spicy: '🌶️',
  soy: '🫘',
  eggs: '🥚',
  nuts: '🥜',
};

interface FoodTagPickerProps {
  selected: FoodTag[];
  onChange: (tags: FoodTag[]) => void;
}

export function FoodTagPicker({ selected, onChange }: FoodTagPickerProps) {
  const toggle = (tag: FoodTag) => {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  };

  return (
    <Card className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="font-semibold text-sm sm:text-base">Diet today</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {FOOD_TAGS.map(tag => {
          const active = selected.includes(tag);
          return (
            <Badge
              key={tag}
              variant={active ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer select-none transition-colors text-xs px-2.5 py-1',
                active && 'bg-primary text-primary-foreground',
                !active && 'hover:bg-muted',
              )}
              onClick={() => toggle(tag)}
              role="checkbox"
              aria-checked={active}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(tag); }}}
            >
              {TAG_EMOJI[tag]} {tag}
            </Badge>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {selected.length} tag{selected.length !== 1 ? 's' : ''} selected — these will be correlated with your symptoms
        </p>
      )}
    </Card>
  );
}
