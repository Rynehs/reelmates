
// TMDB API client
import { Movie, MovieDetails, SearchResults } from "@/lib/types";

const API_KEY = "22766f958212a9c2cf269d2e6b06a577";
const BASE_URL = "https://api.themoviedb.org/3";

export interface MovieResponse {
  results: Movie[];
  total_results: number;
  total_pages: number;
  page: number;
}

export const fetchTrendingMovies = async (): Promise<MovieResponse> => {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch trending movies");
  }
  
  return response.json();
};

export const searchMovies = async (query: string): Promise<MovieResponse> => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}&include_adult=false`
  );
  
  if (!response.ok) {
    throw new Error("Failed to search movies");
  }
  
  return response.json();
};

export const fetchMovieDetails = async (id: number): Promise<MovieDetails> => {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,similar`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }
  
  return response.json();
};

export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
