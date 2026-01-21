export type Maybe<T> = T | null;

// Table: ai_training_data
export interface AITrainingDataRow {
  date: string; // date/timestamp en ISO (Supabase le renvoie souvent en string)
  hometeam: string;
  awayteam: string;

  cote_dom_clean: Maybe<number>;
  cote_nul_clean: Maybe<number>;
  cote_ext_clean: Maybe<number>;

  home_forme_pts_last5: Maybe<number>; // max 15
  home_moy_buts_marques_last5: Maybe<number>;
  home_moy_buts_encaisse_last5: Maybe<number>;

  away_forme_pts_last5: Maybe<number>;
  away_moy_buts_marques_last5: Maybe<number>;
  away_moy_buts_encaisse_last5: Maybe<number>;
}

// Table: match_history
export interface MatchHistoryRow {
  date: string;
  saison?: Maybe<string>;
  hometeam: string;
  awayteam: string;
  fthg: Maybe<number>;
  ftag: Maybe<number>;
  ftr?: Maybe<string>; // 'H' (Home), 'D' (Draw), 'A' (Away)
  htr?: Maybe<string>; // 'H' (Home), 'D' (Draw), 'A' (Away) - Half Time Result
  cote_dom_clean?: Maybe<number>;
  cote_ext_clean?: Maybe<number>;
  hs?: Maybe<number>; // Tirs totaux domicile
  hst?: Maybe<number>; // Tirs cadrés domicile
}

export type H2HByMatchKey = Record<string, MatchHistoryRow[]>;


