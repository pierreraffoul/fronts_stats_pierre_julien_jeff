// Client API pour communiquer avec l'API FastAPI de prédiction

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type PredictionRequest = {
  hometeam: string;
  awayteam: string;
  cote_dom_clean: number;
  cote_nul_clean: number;
  cote_ext_clean: number;
  home_forme_pts_last5: number;
  away_forme_pts_last5: number;
  home_moy_buts_marques_last5: number;
  away_moy_buts_encaisse_last5: number;
  home_moy_buts_encaisse_last5?: number;
  away_moy_buts_marques_last5?: number;
};

export type PredictionResponse = {
  hometeam: string;
  awayteam: string;
  random_forest: {
    prediction: "H" | "D" | "A";
    probabilities: {
      H: number;
      D: number;
      A: number;
    };
    prediction_text: string;
  };
  svm: {
    prediction: "H" | "D" | "A";
    prediction_text: string;
  };
};

export type TrainResponse = {
  status: string;
  random_forest: {
    accuracy: number;
    precision: Record<string, number>;
    recall: Record<string, number>;
    f1_score: Record<string, number>;
  };
  svm: {
    accuracy: number;
    precision: Record<string, number>;
    recall: Record<string, number>;
    f1_score: Record<string, number>;
  };
  best_params: Record<string, any>;
  auc_score: number;
};

export async function predictMatch(data: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erreur lors de la prédiction" }));
    throw new Error(error.detail || "Erreur lors de la prédiction");
  }

  return response.json();
}

export async function trainModels(): Promise<TrainResponse> {
  const response = await fetch(`${API_BASE_URL}/train`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erreur lors de l'entraînement" }));
    throw new Error(error.detail || "Erreur lors de l'entraînement");
  }

  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export type ModelsStatusResponse = {
  trained: boolean;
  message: string;
};

export async function checkModelsStatus(): Promise<ModelsStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/models/status`);
    if (!response.ok) {
      return { trained: false, message: "Erreur lors de la vérification du statut" };
    }
    return response.json();
  } catch {
    return { trained: false, message: "Impossible de contacter l'API" };
  }
}

