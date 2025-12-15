// User types
export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  favorite_team: string | null;
  favorite_driver: string | null;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  favorite_team?: string;
  favorite_driver?: string;
  theme?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Jolpica types
export interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
    nationality: string;
  }>;
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  grid: string;
  laps: string;
  status: string;
  Time?: {
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
    AverageSpeed: {
      speed: string;
    };
  };
}

// FastF1 types
export interface LapData {
  driver: string;
  lap_number: number;
  lap_time: string | null;
  lap_time_seconds: number | null;
  sector1_time: number | null;
  sector2_time: number | null;
  sector3_time: number | null;
  compound: string | null;
  tyre_life: number | null;
  stint: number;
  is_personal_best: boolean;
}

export interface TelemetryPoint {
  distance: number;
  speed: number;
  throttle: number;
  brake: boolean;
  gear: number;
  rpm: number | null;
  drs: number | null;
}

export interface TelemetryData {
  driver: string;
  lap_number: number;
  lap_time: string | null;
  compound: string | null;
  telemetry: TelemetryPoint[];
}

export interface StintData {
  driver: string;
  stint: number;
  compound: string | null;
  start_lap: number;
  end_lap: number;
  num_laps: number;
  avg_lap_time: number | null;
}

// API Response types
export interface ScheduleResponse {
  season: number;
  races: Race[];
}

export interface DriverStandingsResponse {
  season: number;
  standings: DriverStanding[];
}

export interface ConstructorStandingsResponse {
  season: number;
  standings: ConstructorStanding[];
}

export interface RaceResultsResponse {
  season: number;
  round: number;
  race: {
    raceName: string;
    Circuit: Race["Circuit"];
    date: string;
    Results: RaceResult[];
  };
}

export interface LapTimesResponse {
  year: number;
  race: number | string;
  session_type: string;
  laps: LapData[];
  total_laps: number;
}

export interface StintsResponse {
  year: number;
  race: number | string;
  session_type: string;
  stints: StintData[];
}

