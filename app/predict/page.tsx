"use client";

import { useState, useEffect } from "react";
import { predictMatch, checkApiHealth, checkModelsStatus, trainModels, type PredictionRequest, type PredictionResponse } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BrainCircuit, 
  Loader2, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Wand2,
  Cpu,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function PredictPage() {
  const [formData, setFormData] = useState<PredictionRequest>({
    hometeam: "",
    awayteam: "",
    cote_dom_clean: 1.5,
    cote_nul_clean: 3.5,
    cote_ext_clean: 5.0,
    home_forme_pts_last5: 12.0,
    away_forme_pts_last5: 10.0,
    home_moy_buts_marques_last5: 2.0,
    away_moy_buts_encaisse_last5: 1.2,
    home_moy_buts_encaisse_last5: 0.8,
    away_moy_buts_marques_last5: 1.5,
  });

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const [modelsTrained, setModelsTrained] = useState<boolean | null>(null);
  const [modelsStatusMessage, setModelsStatusMessage] = useState<string>("");

  // Vérifier le statut de l'API et des modèles au chargement
  useEffect(() => {
    const checkStatus = async () => {
      const health = await checkApiHealth();
      setApiStatus(health);
      
      if (health) {
        const status = await checkModelsStatus();
        setModelsTrained(status.trained);
        setModelsStatusMessage(status.message);
      }
    };
    checkStatus();
  }, []);

  const handleInputChange = (field: keyof PredictionRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? value : Number(value),
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si les modèles sont entraînés
    if (modelsTrained === false) {
      setError("Les modèles ne sont pas entraînés. Veuillez les entraîner d'abord.");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await predictMatch(formData);
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModels = async () => {
    if (!confirm("L'entraînement des modèles peut prendre plusieurs minutes. Continuer ?")) {
      return;
    }

    setTraining(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await trainModels();
      
      // Mettre à jour le statut après l'entraînement
      const status = await checkModelsStatus();
      setModelsTrained(status.trained);
      setModelsStatusMessage(status.message);
      
      // Afficher un message de succès avec les métriques
      setError(null);
      const successMessage = `✅ Modèles entraînés avec succès !\n\n` +
        `📊 Random Forest:\n` +
        `   • Précision: ${(result.random_forest.accuracy * 100).toFixed(1)}%\n` +
        `   • F1-Score: ${Object.values(result.random_forest.f1_score).map(v => (v * 100).toFixed(1)).join(" / ")}\n\n` +
        `📊 SVM:\n` +
        `   • Précision: ${(result.svm.accuracy * 100).toFixed(1)}%\n` +
        `   • F1-Score: ${Object.values(result.svm.f1_score).map(v => (v * 100).toFixed(1)).join(" / ")}\n\n` +
        `🎯 AUC Score: ${(result.auc_score * 100).toFixed(1)}%`;
      
      alert(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'entraînement");
      // Vérifier quand même le statut en cas d'erreur
      const status = await checkModelsStatus().catch(() => null);
      if (status) {
        setModelsTrained(status.trained);
        setModelsStatusMessage(status.message);
      }
    } finally {
      setTraining(false);
    }
  };

  const getPredictionColor = (prediction: "H" | "D" | "A") => {
    switch (prediction) {
      case "H":
        return "text-blue-600 dark:text-blue-400";
      case "D":
        return "text-amber-600 dark:text-amber-400";
      case "A":
        return "text-purple-600 dark:text-purple-400";
    }
  };

  const getPredictionLabel = (prediction: "H" | "D" | "A") => {
    switch (prediction) {
      case "H":
        return "Victoire Domicile 🏠";
      case "D":
        return "Match Nul 🤝";
      case "A":
        return "Victoire Extérieur ✈️";
    }
  };

  // Génère des données aléatoires mais cohérentes
  const fillRandomData = () => {
    // Liste d'équipes de Ligue 1
    const teams = [
      "Paris SG", "Marseille", "Lyon", "Monaco", "Nice",
      "Lille", "Rennes", "Lens", "Toulouse", "Reims",
      "Nantes", "Montpellier", "Strasbourg", "Brest", "Lorient",
      "Le Havre", "Metz", "Clermont", "Troyes", "Angers"
    ];

    // Sélectionner 2 équipes aléatoires
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const hometeam = shuffled[0];
    const awayteam = shuffled[1];

    // Générer une forme aléatoire pour chaque équipe (3 à 15 points)
    const homeForme = Math.round((Math.random() * 12 + 3) * 10) / 10; // 3.0 à 15.0
    const awayForme = Math.round((Math.random() * 12 + 3) * 10) / 10;

    // Calculer les probabilités basées sur la forme (plus de points = plus forte)
    // On ajoute un bonus domicile de +2 points pour l'équipe à domicile
    const homeStrength = homeForme + 2;
    const awayStrength = awayForme;
    const totalStrength = homeStrength + awayStrength;

    // Probabilités approximatives
    const probHome = homeStrength / (totalStrength + 3); // +3 pour le nul
    const probAway = awayStrength / (totalStrength + 3);
    const probDraw = 3 / (totalStrength + 3);

    // Convertir les probabilités en cotes (avec marge bookmaker de ~5%)
    const margin = 1.05;
    const coteDom = Math.round((1 / probHome) * margin * 100) / 100;
    const coteExt = Math.round((1 / probAway) * margin * 100) / 100;
    const coteNul = Math.round((1 / probDraw * margin * 100) / 100);

    // Statistiques offensives cohérentes avec la forme
    // Meilleure forme = plus de buts marqués, moins de buts encaissés
    const homeButsMarques = Math.round((homeForme / 15 * 2.5 + 0.5 + Math.random() * 0.8) * 10) / 10;
    const homeButsEncaisses = Math.round((1.5 - homeForme / 15 * 0.8 + Math.random() * 0.4) * 10) / 10;
    
    const awayButsMarques = Math.round((awayForme / 15 * 2.5 + 0.5 + Math.random() * 0.8) * 10) / 10;
    const awayButsEncaisses = Math.round((1.5 - awayForme / 15 * 0.8 + Math.random() * 0.4) * 10) / 10;

    // S'assurer que les valeurs sont dans des plages raisonnables
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    setFormData({
      hometeam,
      awayteam,
      cote_dom_clean: clamp(coteDom, 1.1, 10),
      cote_nul_clean: clamp(coteNul, 2.5, 8),
      cote_ext_clean: clamp(coteExt, 1.1, 10),
      home_forme_pts_last5: clamp(homeForme, 3, 15),
      away_forme_pts_last5: clamp(awayForme, 3, 15),
      home_moy_buts_marques_last5: clamp(homeButsMarques, 0.5, 3.5),
      away_moy_buts_encaisse_last5: clamp(awayButsEncaisses, 0.5, 2.5),
      home_moy_buts_encaisse_last5: clamp(homeButsEncaisses, 0.3, 2.5),
      away_moy_buts_marques_last5: clamp(awayButsMarques, 0.5, 3.5),
    });

    // Réinitialiser les résultats précédents
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-small opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <BrainCircuit size={16} />
            Prédiction IA — Random Forest
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Prédire un Match
            <br />
            <span className="text-gradient">avec l&apos;IA</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Utilisez notre modèle Random Forest entraîné sur 15 ans de données 
            pour prédire le résultat d&apos;un match de Ligue 1.
          </p>
          
          {/* API Status & Models Status */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            {apiStatus !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                {apiStatus ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-sm text-muted-foreground">API connectée</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-sm text-muted-foreground">API non disponible</span>
                  </>
                )}
              </div>
            )}
            
            {apiStatus && modelsTrained !== null && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                modelsTrained ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
              }`}>
                {modelsTrained ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-sm text-emerald-800 dark:text-emerald-200">Modèles entraînés</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-amber-600" />
                    <span className="text-sm text-amber-800 dark:text-amber-200">Modèles non entraînés</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Message d'avertissement si modèles non entraînés */}
          {apiStatus && modelsTrained === false && (
            <div className="mt-6 max-w-2xl mx-auto p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Modèles non entraînés
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                    {modelsStatusMessage || "Les modèles doivent être entraînés avant de faire des prédictions."}
                  </p>
                  <Button
                    onClick={handleTrainModels}
                    disabled={training}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    size="sm"
                  >
                    {training ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Entraînement en cours...
                      </>
                    ) : (
                      <>
                        <Cpu size={16} className="mr-2" />
                        Entraîner les modèles
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                    ⏱️ L&apos;entraînement peut prendre plusieurs minutes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Formulaire */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Données du Match
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillRandomData}
                  className="flex items-center gap-2"
                >
                  <Wand2 size={16} />
                  Remplir automatiquement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Équipes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hometeam">Équipe Domicile</Label>
                    <Input
                      id="hometeam"
                      value={formData.hometeam}
                      onChange={(e) => handleInputChange("hometeam", e.target.value)}
                      placeholder="Paris SG"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awayteam">Équipe Extérieur</Label>
                    <Input
                      id="awayteam"
                      value={formData.awayteam}
                      onChange={(e) => handleInputChange("awayteam", e.target.value)}
                      placeholder="Marseille"
                      required
                    />
                  </div>
                </div>

                {/* Cotes */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Cotes Bookmakers
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cote_dom">Cote Domicile</Label>
                      <Input
                        id="cote_dom"
                        type="number"
                        step="0.01"
                        min="1.0"
                        value={formData.cote_dom_clean}
                        onChange={(e) => handleInputChange("cote_dom_clean", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cote_nul">Cote Nul</Label>
                      <Input
                        id="cote_nul"
                        type="number"
                        step="0.01"
                        min="1.0"
                        value={formData.cote_nul_clean}
                        onChange={(e) => handleInputChange("cote_nul_clean", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cote_ext">Cote Extérieur</Label>
                      <Input
                        id="cote_ext"
                        type="number"
                        step="0.01"
                        min="1.0"
                        value={formData.cote_ext_clean}
                        onChange={(e) => handleInputChange("cote_ext_clean", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Forme */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Forme Récente (5 derniers matchs)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home_forme">Points Domicile</Label>
                      <Input
                        id="home_forme"
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        value={formData.home_forme_pts_last5}
                        onChange={(e) => handleInputChange("home_forme_pts_last5", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away_forme">Points Extérieur</Label>
                      <Input
                        id="away_forme"
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        value={formData.away_forme_pts_last5}
                        onChange={(e) => handleInputChange("away_forme_pts_last5", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Statistiques Offensives */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Statistiques Offensives (Moyenne 5 matchs)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home_buts_marques">Buts Marqués (Domicile)</Label>
                      <Input
                        id="home_buts_marques"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.home_moy_buts_marques_last5}
                        onChange={(e) => handleInputChange("home_moy_buts_marques_last5", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away_buts_marques">Buts Marqués (Extérieur)</Label>
                      <Input
                        id="away_buts_marques"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.away_moy_buts_marques_last5 || 0}
                        onChange={(e) => handleInputChange("away_moy_buts_marques_last5", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Statistiques Défensives */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Statistiques Défensives (Moyenne 5 matchs)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home_buts_encaisse">Buts Encaissés (Domicile)</Label>
                      <Input
                        id="home_buts_encaisse"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.home_moy_buts_encaisse_last5 || 0}
                        onChange={(e) => handleInputChange("home_moy_buts_encaisse_last5", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away_buts_encaisse">Buts Encaissés (Extérieur)</Label>
                      <Input
                        id="away_buts_encaisse"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.away_moy_buts_encaisse_last5}
                        onChange={(e) => handleInputChange("away_moy_buts_encaisse_last5", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton Submit */}
                <Button
                  type="submit"
                  disabled={loading || apiStatus === false || modelsTrained === false}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Prédiction en cours...
                    </>
                  ) : (
                    <>
                      <Zap size={20} className="mr-2" />
                      Lancer la Prédiction
                    </>
                  )}
                </Button>

                {/* Message si modèles non entraînés */}
                {modelsTrained === false && (
                  <p className="text-xs text-center text-muted-foreground">
                    ⚠️ Les modèles doivent être entraînés avant de faire des prédictions.
                  </p>
                )}

                {/* Erreur */}
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                      <AlertCircle size={20} />
                      <span className="font-semibold">Erreur</span>
                    </div>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Résultats */}
          <div className="space-y-6">
            {prediction ? (
              <>
                {/* Résultat Principal */}
                <Card className="bg-card border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles size={20} />
                      Prédiction Random Forest
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Match */}
                    <div className="text-center p-6 rounded-xl bg-muted/50">
                      <div className="text-2xl font-bold mb-2">
                        {prediction.hometeam} <span className="text-muted-foreground">vs</span> {prediction.awayteam}
                      </div>
                    </div>

                    {/* Prédiction */}
                    <div className="text-center">
                      <div className={`text-4xl font-black mb-2 ${getPredictionColor(prediction.random_forest.prediction)}`}>
                        {prediction.random_forest.prediction_text}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Confiance : {Math.round(prediction.random_forest.probabilities[prediction.random_forest.prediction] * 100)}%
                      </p>
                    </div>

                    {/* Probabilités */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Probabilités détaillées
                      </h4>
                      <div className="space-y-2">
                        {(["H", "D", "A"] as const).map((outcome) => {
                          const prob = prediction.random_forest.probabilities[outcome];
                          const isPredicted = prediction.random_forest.prediction === outcome;
                          return (
                            <div key={outcome} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className={isPredicted ? "font-semibold" : ""}>
                                  {getPredictionLabel(outcome)}
                                </span>
                                <span className={isPredicted ? "font-bold" : ""}>
                                  {Math.round(prob * 100)}%
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isPredicted
                                      ? "bg-primary"
                                      : outcome === "H"
                                      ? "bg-blue-500"
                                      : outcome === "D"
                                      ? "bg-amber-500"
                                      : "bg-purple-500"
                                  }`}
                                  style={{ width: `${prob * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Comparaison SVM */}
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prédiction SVM :</span>
                        <span className="font-medium">{prediction.svm.prediction_text}</span>
                      </div>
                      {prediction.random_forest.prediction !== prediction.svm.prediction && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          ⚠️ Les deux modèles ne sont pas d&apos;accord
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommandation */}
                <Card className="bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <TrendingUp size={24} className="text-primary shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-2">Recommandation</h4>
                        <p className="text-sm text-muted-foreground">
                          Basé sur une probabilité de {Math.round(prediction.random_forest.probabilities[prediction.random_forest.prediction] * 100)}%, 
                          le modèle Random Forest prédit une <strong>{prediction.random_forest.prediction_text.toLowerCase()}</strong>.
                          {prediction.random_forest.probabilities[prediction.random_forest.prediction] > 0.5 && (
                            " Cette prédiction a une confiance élevée."
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-12 text-center">
                  <BrainCircuit size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Remplissez le formulaire et lancez une prédiction pour voir les résultats ici.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            SECTION STATISTIQUES DES MODÈLES
            ═══════════════════════════════════════════════════════════════════════════ */}
        <section className="mt-20 pt-12 border-t border-border">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Cpu size={16} />
              Performance des Modèles
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Métriques d&apos;Entraînement
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Statistiques détaillées des modèles Random Forest et SVM entraînés sur {5321} matchs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* Random Forest Stats */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  Random Forest
                  <span className="ml-auto text-xs font-normal text-muted-foreground bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">
                    🏆 Meilleur modèle
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Métriques Globales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {(0.4779 * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">AUC-ROC</div>
                    <div className="text-2xl font-bold text-primary">
                      {(0.6544 * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Métriques par Classe */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Performance par issue
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Domicile 🏠", precision: 0.5942, recall: 0.5638, f1: 0.5786, color: "blue" },
                      { label: "Extérieur ✈️", precision: 0.4609, recall: 0.5080, f1: 0.4833, color: "purple" },
                      { label: "Nul 🤝", precision: 0.3102, recall: 0.3014, f1: 0.3058, color: "amber" },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{metric.label}</span>
                          <span className="text-muted-foreground">
                            F1: {(metric.f1 * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Precision</div>
                            <div className="font-semibold">{(metric.precision * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Recall</div>
                            <div className="font-semibold">{(metric.recall * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">F1-Score</div>
                            <div className="font-semibold">{(metric.f1 * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moyennes */}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Precision (macro)</div>
                      <div className="font-semibold">{(0.4551 * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Recall (macro)</div>
                      <div className="font-semibold">{(0.4577 * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">F1-Score (macro)</div>
                      <div className="font-semibold">{(0.4559 * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SVM Stats */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  SVM (Support Vector Machine)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Métriques Globales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(0.4761 * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">AUC-ROC</div>
                    <div className="text-2xl font-bold text-primary">
                      {(0.6481 * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Métriques par Classe */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Performance par issue
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Domicile 🏠", precision: 0.6160, recall: 0.5085, f1: 0.5571, color: "blue" },
                      { label: "Extérieur ✈️", precision: 0.4820, recall: 0.5144, f1: 0.4977, color: "purple" },
                      { label: "Nul 🤝", precision: 0.3120, recall: 0.3794, f1: 0.3424, color: "amber" },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{metric.label}</span>
                          <span className="text-muted-foreground">
                            F1: {(metric.f1 * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Precision</div>
                            <div className="font-semibold">{(metric.precision * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Recall</div>
                            <div className="font-semibold">{(metric.recall * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">F1-Score</div>
                            <div className="font-semibold">{(metric.f1 * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moyennes */}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Precision (macro)</div>
                      <div className="font-semibold">{(0.4700 * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Recall (macro)</div>
                      <div className="font-semibold">{(0.4674 * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">F1-Score (macro)</div>
                      <div className="font-semibold">{(0.4657 * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparaison Visuelle */}
          <Card className="bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Comparaison des Modèles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Accuracy */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Accuracy
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Random Forest</span>
                        <span className="font-semibold">{(0.4779 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${0.4779 * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>SVM</span>
                        <span className="font-semibold">{(0.4761 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${0.4761 * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* F1-Score Macro */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    F1-Score (macro)
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Random Forest</span>
                        <span className="font-semibold">{(0.4559 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${0.4559 * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>SVM</span>
                        <span className="font-semibold">{(0.4657 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${0.4657 * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AUC-ROC */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    AUC-ROC
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Random Forest</span>
                        <span className="font-semibold">{(0.6544 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${0.6544 * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>SVM</span>
                        <span className="font-semibold">{(0.6481 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${0.6481 * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Dataset</div>
                    <div className="font-semibold">5,321 matchs (train: 4,256 | test: 1,065)</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Distribution des classes</div>
                    <div className="font-semibold">Domicile: 2,349 | Nul: 1,411 | Extérieur: 1,561</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer avec lien vers analytics */}
          <div className="mt-12 text-center">
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Sparkles size={16} />
              Découvrir comment fonctionne notre modèle
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

