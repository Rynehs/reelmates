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
  media_type?: 'movie';
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  media_type?: 'tv';
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  watch_providers?: {
    results: {
      [countryCode: string]: {
        link: string;
        flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
        rent?: { provider_id: number; provider_name: string; logo_path: string }[];
        buy?: { provider_id: number; provider_name: string; logo_path: string }[];
      };
    };
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
  similar?: {
    results: Movie[];
  };
  reviews?: {
    results: {
      id: string;
      author: string;
      content: string;
      created_at: string;
    }[];
  };
}

export interface TVShowDetails extends TVShow {
  episodes_runtime: number[];
  genres: { id: number; name: string }[];
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  watch_providers?: {
    results: {
      [countryCode: string]: {
        link: string;
        flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
        rent?: { provider_id: number; provider_name: string; logo_path: string }[];
        buy?: { provider_id: number; provider_name: string; logo_path: string }[];
      };
    };
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
  similar?: {
    results: TVShow[];
  };
  reviews?: {
    results: {
      id: string;
      author: string;
      content: string;
      created_at: string;
    }[];
  };
}

export interface UserMedia {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  status: 'watched' | 'to_watch' | 'favorite';
  rating?: number;
  notes?: string;
  created_at: string;
}

export interface Genre {
  id: number;
  name: string;
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

export interface RoomMedia {
  id: string;
  room_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  added_by: string;
  status: 'suggested' | 'approved' | 'watched';
  created_at: string;
  votes?: number;
  title?: string;
  poster_path?: string;
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
  results: (Movie | TVShow | MediaItem)[];
  total_results: number;
  total_pages: number;
}
