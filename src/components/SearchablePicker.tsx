import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface SearchablePickerProps {
  items: string[];
  onSelect: (item: string) => void;
  placeholder?: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  existingItems?: string[];
}

export function SearchablePicker({
  items,
  onSelect,
  placeholder = 'Search or type custom...',
  inputValue,
  onInputChange,
  existingItems = [],
}: SearchablePickerProps) {
  const [isFocused, setIsFocused] = useState(false);

  const filtered = useMemo(() => {
    if (!inputValue.trim()) return items.slice(0, 20);
    const q = inputValue.toLowerCase();
    return items.filter(
      (item) =>
        item.toLowerCase().includes(q) && !existingItems.includes(item)
    );
  }, [inputValue, items, existingItems]);

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
          placeholder={placeholder}
          className="pl-9"
          autoFocus
        />
      </div>
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <ScrollArea className="max-h-48">
            <div className="p-1">
              {filtered.slice(0, 30).map((item) => (
                <button
                  key={item}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(item);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
