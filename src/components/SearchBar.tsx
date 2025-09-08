import React from "react";
import { useState, useRef, useEffect } from "react";
import { useLazyGetItemsQuery } from "../store/api/itemsApi";
import { Search, ChevronDown, ChevronUp, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
}

interface Item {
  id: number; // Updated to match backend
  name: string;
}

export default function SearchBar({
  placeholder = "Search...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Use the actual API hook with loading and error states
  const [trigger, { data: results = [], isFetching, error }] = useLazyGetItemsQuery();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(!!val.trim());
    setSelectedIndex(-1);

    // clear existing timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.trim()) {
      // set new debounce timer
      debounceTimer.current = window.setTimeout(() => {
        trigger(val); // This will call your Flask backend
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex] && listRef.current) {
      const selectedElement = itemRefs.current[selectedIndex];
      const container = listRef.current;
      
      if (selectedElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();
        
        const isAbove = elementRect.top < containerRect.top;
        const isBelow = elementRect.bottom > containerRect.bottom;
        
        if (isAbove) {
          selectedElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } else if (isBelow) {
          selectedElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }
    }
  }, [selectedIndex, results]);

  const highlight = (text: string) => {
    if (!query) return text;
    
    const regex = new RegExp(
      `(${query.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
      "ig"
    );
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // close dropdown on outside click
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? results.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selectedItem = results[selectedIndex];
      if (selectedItem) {
        setQuery(selectedItem.name);
        setOpen(false);
        setSelectedIndex(-1);
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleItemClick = (item: Item, _index: number) => {
    setQuery(item.name);
    setOpen(false);
    setSelectedIndex(-1);
  };

  // Reset itemRefs when results change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, results.length);
  }, [results]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto" data-testid="search-container">
      <div className="flex items-center p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
        <Search className="w-6 h-6 text-gray-700" data-testid="search-icon" />
        <input
          ref={inputRef}
          data-testid="search-input"
          onKeyDown={handleKeyDown}
          type="text"
          value={query}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 ml-4 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
        />
        {isFetching && (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" data-testid="loading-spinner" />
        )}
        {query && (
          <button
            data-testid="clear-button"
            className="ml-2 text-gray-500 hover:text-gray-800 focus:outline-none"
            onClick={handleClear}
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          data-testid="dropdown-toggle"
          className="ml-2 focus:outline-none"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? (
            <ChevronUp className="w-6 h-6 text-gray-700 transition-transform" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-700 transition-transform" />
          )}
        </button>
      </div>

      {open && (
        <div className="absolute z-10 w-full bg-white rounded-2xl shadow-lg overflow-hidden mt-0.5" data-testid="dropdown">
          {error && (
            <div className="px-4 py-2 text-red-600 text-sm" data-testid="error-message">
              Error loading results. Please try again.
            </div>
          )}
          {results.length > 0 && (
            <ul ref={listRef} className="max-h-60 overflow-y-auto" data-testid="results-list">
              {results.map((item, index) => (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  data-testid="search-result"
                  type="button"
                  className={`w-full text-left px-4 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-gray-200 highlighted"
                      : "hover:bg-gray-100"
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onMouseLeave={() => setSelectedIndex(-1)}
                  onClick={() => handleItemClick(item, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleItemClick(item, index);
                    }
                  }}
                  tabIndex={0}
                >
                  {highlight(item.name)}
                </button>
              ))}
            </ul>
          )}
          {query && !isFetching && results.length === 0 && !error && (
            <div className="px-4 py-2 text-gray-500 text-sm" data-testid="no-results">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}