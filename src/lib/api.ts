
import { Movie, MovieDetails, SearchResults } from './types';

// For now, we'll use a placeholder API key - this should be replaced with a proper environment variable
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // Replace with your API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const getPosterUrl = (path: string | null): string => {
  if (!path) return '/placeholder.svg';
  return `${POSTER_BASE_URL}${path}`;
};

export const getBackdropUrl = (path: string | null): string => {
  if (!path) return '/placeholder.svg';
  return `${BACKDROP_BASE_URL}${path}`;
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    // In a real app, we'd make an actual API call
    // For now, let's return mock data
    const mockResults: Movie[] = [
      {
        id: 1,
        title: "Inception",
        poster_path: null,
        backdrop_path: null,
        release_date: "2010-07-16",
        vote_average: 8.4,
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genre_ids: [28, 878, 12]
      },
      {
        id: 2,
        title: "The Shawshank Redemption",
        poster_path: null,
        backdrop_path: null,
        release_date: "1994-09-23",
        vote_average: 8.7,
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genre_ids: [18, 80]
      },
      {
        id: 3,
        title: "The Dark Knight",
        poster_path: null,
        backdrop_path: null,
        release_date: "2008-07-18",
        vote_average: 8.5,
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        genre_ids: [28, 80, 18]
      }
    ];
    
    return mockResults.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails | null> => {
  try {
    // In a real app, we'd make an actual API call
    // For now, let's return mock data
    const mockMovies: Record<number, MovieDetails> = {
      1: {
        id: 1,
        title: "Inception",
        poster_path: null,
        backdrop_path: null,
        release_date: "2010-07-16",
        vote_average: 8.4,
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genre_ids: [28, 878, 12],
        runtime: 148,
        genres: [
          { id: 28, name: "Action" },
          { id: 878, name: "Science Fiction" },
          { id: 12, name: "Adventure" }
        ],
        tagline: "Your mind is the scene of the crime."
      },
      2: {
        id: 2,
        title: "The Shawshank Redemption",
        poster_path: null,
        backdrop_path: null,
        release_date: "1994-09-23",
        vote_average: 8.7,
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genre_ids: [18, 80],
        runtime: 142,
        genres: [
          { id: 18, name: "Drama" },
          { id: 80, name: "Crime" }
        ],
        tagline: "Fear can hold you prisoner. Hope can set you free."
      },
      3: {
        id: 3,
        title: "The Dark Knight",
        poster_path: null,
        backdrop_path: null,
        release_date: "2008-07-18",
        vote_average: 8.5,
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        genre_ids: [28, 80, 18],
        runtime: 152,
        genres: [
          { id: 28, name: "Action" },
          { id: 80, name: "Crime" },
          { id: 18, name: "Drama" }
        ],
        tagline: "Why so serious?"
      }
    };
    
    return mockMovies[movieId] || null;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    return null;
  }
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    // In a real app, we'd make an actual API call
    // For now, let's return mock data
    const mockResults: Movie[] = [
      {
        id: 1,
        title: "Inception",
        poster_path: null,
        backdrop_path: null,
        release_date: "2010-07-16",
        vote_average: 8.4,
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genre_ids: [28, 878, 12]
      },
      {
        id: 2,
        title: "The Shawshank Redemption",
        poster_path: null,
        backdrop_path: null,
        release_date: "1994-09-23",
        vote_average: 8.7,
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genre_ids: [18, 80]
      },
      {
        id: 3,
        title: "The Dark Knight",
        poster_path: null,
        backdrop_path: null,
        release_date: "2008-07-18",
        vote_average: 8.5,
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        genre_ids: [28, 80, 18]
      }
    ];
    
    return mockResults;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};
