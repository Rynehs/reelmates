
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
}

export interface UserMovie {
  id: string;
  user_id: string;
  movie_id: number;
  status: 'watched' | 'to_watch' | 'favorite';
  rating?: number;
  notes?: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  created_by: string;
  code: string;
  created_at: string;
  members: RoomMember[];
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: User;
}

export interface RoomMovie {
  id: string;
  room_id: string;
  movie_id: number;
  added_by: string;
  status: 'suggested' | 'approved' | 'watched';
  created_at: string;
  user?: User;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface SearchResults {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}
