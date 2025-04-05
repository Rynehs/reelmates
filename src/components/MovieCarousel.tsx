
import { useState } from "react";
import { Movie } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MovieCarouselProps {
  movies?: Movie[];
}

export const MovieCarousel = ({ movies = [] }: MovieCarouselProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(movies.length === 0);

  const scrollLeft = () => {
    setScrollPosition((prev) => Math.max(prev - 500, 0));
  };

  const scrollRight = () => {
    setScrollPosition((prev) => prev + 500);
  };

  return (
    <div className="relative w-full mt-6">
      <h2 className="text-xl font-bold mb-3">Trending Now</h2>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Movie List */}
        <div
          className="flex gap-4 overflow-x-scroll no-scrollbar scroll-smooth"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {isLoading ? (
            <p>Loading movies...</p>
          ) : (
            movies.map((movie) => (
              <div key={movie.id} className="w-40 min-w-[160px]">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="rounded-lg shadow-lg hover:scale-105 transition-transform"
                />
                <p className="text-sm mt-2">{movie.title}</p>
              </div>
            ))
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
