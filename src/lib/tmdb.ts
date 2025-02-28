
// TMDB API client
import { Movie, TVShow, MovieDetails, TVShowDetails, Genre, MediaItem, SearchResults } from "@/lib/types";

const API_KEY = "22766f958212a9c2cf269d2e6b06a577";
const BASE_URL = "https://api.themoviedb.org/3";

export interface MediaResponse {
  results: (Movie | TVShow | MediaItem)[];
  total_results: number;
  total_pages: number;
  page: number;
}

// MOVIES
export const fetchTrendingMovies = async (): Promise<MediaResponse> => {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch trending movies");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie'
  }));
  
  return data;
};

export const fetchPopularMovies = async (page = 1): Promise<MediaResponse> => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch popular movies");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie'
  }));
  
  return data;
};

export const searchMovies = async (query: string, page = 1): Promise<MediaResponse> => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}&include_adult=false&page=${page}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to search movies");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie'
  }));
  
  return data;
};

export const fetchMovieDetails = async (id: number): Promise<MovieDetails> => {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits,similar,reviews`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }
  
  return response.json();
};

export const fetchMovieWatchProviders = async (id: number) => {
  const response = await fetch(
    `${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch movie watch providers");
  }
  
  return response.json();
};

// TV SHOWS
export const fetchTrendingTVShows = async (): Promise<MediaResponse> => {
  const response = await fetch(
    `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch trending TV shows");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((show: any) => ({
    ...show,
    media_type: 'tv'
  }));
  
  return data;
};

export const fetchPopularTVShows = async (page = 1): Promise<MediaResponse> => {
  const response = await fetch(
    `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch popular TV shows");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((show: any) => ({
    ...show,
    media_type: 'tv'
  }));
  
  return data;
};

export const searchTVShows = async (query: string, page = 1): Promise<MediaResponse> => {
  const response = await fetch(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}&include_adult=false&page=${page}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to search TV shows");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((show: any) => ({
    ...show,
    media_type: 'tv'
  }));
  
  return data;
};

export const fetchTVShowDetails = async (id: number): Promise<TVShowDetails> => {
  const response = await fetch(
    `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits,similar,reviews`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch TV show details");
  }
  
  return response.json();
};

export const fetchTVShowWatchProviders = async (id: number) => {
  const response = await fetch(
    `${BASE_URL}/tv/${id}/watch/providers?api_key=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch TV show watch providers");
  }
  
  return response.json();
};

// MULTI-SEARCH (Movies, TV Shows, People)
export const multiSearch = async (query: string, page = 1): Promise<SearchResults> => {
  const response = await fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}&include_adult=false&page=${page}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to search movies, TV shows, and people");
  }
  
  return response.json();
};

// GENRES
export const fetchMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  const response = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch movie genres");
  }
  
  return response.json();
};

export const fetchTVGenres = async (): Promise<{ genres: Genre[] }> => {
  const response = await fetch(
    `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch TV genres");
  }
  
  return response.json();
};

// DISCOVER
export const discoverMovies = async (params: { 
  with_genres?: string,
  year?: string,
  sort_by?: string,
  page?: number 
}): Promise<MediaResponse> => {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    include_adult: 'false',
    include_video: 'false',
    page: params.page?.toString() || '1',
    ...params
  });
  
  const response = await fetch(
    `${BASE_URL}/discover/movie?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to discover movies");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((movie: any) => ({
    ...movie,
    media_type: 'movie'
  }));
  
  return data;
};

export const discoverTVShows = async (params: { 
  with_genres?: string,
  first_air_date_year?: string,
  sort_by?: string,
  page?: number 
}): Promise<MediaResponse> => {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    include_adult: 'false',
    include_null_first_air_dates: 'false',
    page: params.page?.toString() || '1',
    ...params
  });
  
  const response = await fetch(
    `${BASE_URL}/discover/tv?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to discover TV shows");
  }
  
  const data = await response.json();
  // Add media_type to ensure proper typing
  data.results = data.results.map((show: any) => ({
    ...show,
    media_type: 'tv'
  }));
  
  return data;
};

// UTILS
export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getMediaTitle = (item: Movie | TVShow | MediaItem): string => {
  if (item.media_type === 'tv' && 'name' in item) {
    return item.name || '';
  }
  return (item as Movie).title || '';
};

export const getMediaReleaseDate = (item: Movie | TVShow | MediaItem): string => {
  if (item.media_type === 'tv' && 'first_air_date' in item) {
    return item.first_air_date || '';
  }
  return (item as Movie).release_date || '';
};
