import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { PREDEFINED_CONDITIONS, CONDITION_CATEGORIES, type PredefinedCondition } from '@/data/predefinedConditions';

interface ConditionPickerProps {
  onSelect: (condition: PredefinedCondition) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  existingNames?: string[];
}

export function ConditionPicker({
  onSelect,
  inputValue,
  onInputChange,
  existingNames = [],
}: ConditionPickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  const filtered = useMemo(() => {
    if (!inputValue.trim()) return [];
    const q = inputValue.toLowerCase();
    return PREDEFINED_CONDITIONS.filter(
      (c) =>
        (c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) &&
        !existingNames.includes(c.name)
    );
  }, [inputValue, existingNames]);

  const showDropdown = isFocused && inputValue.trim().length > 0 && filtered.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search conditions or type custom..."
          className="pl-9"
          autoFocus
        />
      </div>
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <ScrollArea className="max-h-60">
            <div className="p-1">
              {filtered.slice(0, 30).map((cond) => (
                <button
                  key={cond.name}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(cond);
                  }}
                >
                  <span className="font-medium">{cond.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{cond.category}</Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
