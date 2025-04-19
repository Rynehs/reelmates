
import { useState, useRef, useEffect } from "react";
import { MediaItem } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "@/components/MovieCard";

interface MovieCarouselProps {
  movies?: MediaItem[];
  title: string;
}

export const MovieCarousel = ({ movies = [], title }: MovieCarouselProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isLoading, setIsLoading] = useState(movies.length === 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(movies.length === 0);
    
    // Check if we need to show arrows based on content width
    const checkArrows = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      setShowLeftArrow(scrollPosition > 0);
      setShowRightArrow(
        scrollPosition < container.scrollWidth - container.clientWidth - 10
      );
    };
    
    checkArrows();
    
    // Update arrow visibility on window resize
    window.addEventListener('resize', checkArrows);
    return () => window.removeEventListener('resize', checkArrows);
  }, [movies, scrollPosition]);

  const scrollLeft = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const newPosition = Math.max(scrollPosition - container.clientWidth * 0.75, 0);
    setScrollPosition(newPosition);
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const newPosition = Math.min(
      scrollPosition + container.clientWidth * 0.75,
      container.scrollWidth - container.clientWidth
    );
    setScrollPosition(newPosition);
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    setScrollPosition(containerRef.current.scrollLeft);
  };

  return (
    <div className="relative w-full mt-6 mb-8 group">
      <div className="flex items-center mb-3">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Movie List */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-scroll no-scrollbar scroll-smooth"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64 w-full">
              <p className="text-muted-foreground">Loading movies...</p>
            </div>
          ) : (
            movies.map((movie) => (
              <div key={movie.id} className="w-48 min-w-[12rem] flex-shrink-0">
                <MovieCard 
                  media={movie} 
                  showActions={false}
                />
              </div>
            ))
          )}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
