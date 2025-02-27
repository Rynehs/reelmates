
import { Movie } from "@/lib/types";
import { getPosterUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
  status?: "watched" | "to_watch" | "favorite" | undefined;
  onClick?: () => void;
}

const MovieCard = ({ movie, status, onClick }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown";
  
  // Format rating to one decimal place
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "?";
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <div 
      className="movie-card h-full flex flex-col"
      onClick={handleClick}
    >
      <Link to={`/movie/${movie.id}`} className="block flex-grow">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <div 
            className={`absolute inset-0 bg-muted animate-pulse ${imageLoaded ? 'hidden' : 'block'}`} 
          />
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className={`movie-poster ${imageLoaded ? 'visible' : 'invisible'}`}
            onLoad={() => setImageLoaded(true)}
          />
          {status && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={`${
                  status === 'watched' 
                    ? 'bg-green-500/10 text-green-600 border-green-200' 
                    : status === 'favorite' 
                    ? 'bg-red-500/10 text-red-600 border-red-200' 
                    : 'bg-blue-500/10 text-blue-600 border-blue-200'
                }`}
              >
                {status === 'watched' 
                  ? 'Watched' 
                  : status === 'favorite' 
                  ? 'Favorite' 
                  : 'Watch Later'}
              </Badge>
            </div>
          )}
          <div className="absolute bottom-2 right-2">
            <div className="bg-black/75 text-white text-xs font-medium py-0.5 px-2 rounded-full">
              {rating}
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium line-clamp-1">{movie.title}</h3>
          <p className="text-sm text-muted-foreground">{year}</p>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
