import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { 
  ArrowRight, 
  Database, 
  Cpu, 
  LineChart, 
  TrendingUp,
  Target,
  Zap,
  BrainCircuit,
  BarChart3,
  Sparkles
} from "lucide-react";

export const revalidate = 3600;

export default async function Home() {
  const supabase = createSupabaseServerClient();

  // Fetch stats for the hero
  const { count: matchCount } = await supabase
    .from("match_history")
    .select("*", { count: "exact", head: true });

  const { count: trainingCount } = await supabase
    .from("ai_training_data")
    .select("*", { count: "exact", head: true });

  const totalMatches = matchCount || 5400;

  return (
    <div className="relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION A: HERO
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-pulse">
            <Sparkles size={16} />
            Projet Data Science — MIAGE 2025
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            L&apos;Intelligence Artificielle
            <br />
            <span className="text-gradient">au service du Football</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Dépassez l&apos;intuition. Nous avons entraîné un modèle sur 
            <span className="text-foreground font-semibold"> 15 ans de Ligue 1 </span>
            pour prédire l&apos;imprévisible.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/predict"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
            >
              <Zap size={20} />
              Tester la Prédiction IA
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-colors"
            >
              Voir les Statistiques
            </Link>
            <Link
              href="#methodology"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-colors"
            >
              Comprendre le Modèle
            </Link>
          </div>

          {/* Stats Preview */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Database size={20} className="text-primary" />
              <span><strong className="text-foreground">{totalMatches.toLocaleString()}</strong> matchs</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={20} className="text-primary" />
              <span><strong className="text-foreground">15</strong> saisons</span>
            </div>
            <div className="flex items-center gap-2">
              <LineChart size={20} className="text-primary" />
              <span><strong className="text-foreground">10+</strong> features</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION B: BENTO GRID
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Notre Arsenal de Données
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Une infrastructure de données robuste pour alimenter des prédictions fiables.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Card 1 - Large */}
            <div className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Database size={24} className="text-primary" />
                </div>
                <h3 className="text-5xl font-black text-gradient mb-2">
                  {totalMatches.toLocaleString()}+
                </h3>
                <p className="text-xl font-semibold mb-2">Matchs Analysés</p>
                <p className="text-muted-foreground">
                  Chaque match de Ligue 1 depuis 2010, enrichi de statistiques détaillées :
                  scores, tirs, corners, cartons, et plus encore.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <BarChart3 size={20} className="text-purple-500" />
                </div>
                <h3 className="text-3xl font-bold mb-1">2</h3>
                <p className="font-semibold mb-2">Tables SQL</p>
                <p className="text-sm text-muted-foreground">
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">match_history</code> pour le passé, 
                  <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">ai_training_data</code> pour l&apos;IA.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Target size={20} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-bold mb-1">10+</h3>
                <p className="font-semibold mb-2">Indicateurs Clés</p>
                <p className="text-sm text-muted-foreground">
                  Forme récente, cotes bookmakers, buts marqués/encaissés, et features engineered.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <TrendingUp size={20} className="text-amber-500" />
                </div>
                <h3 className="text-3xl font-bold mb-1">15</h3>
                <p className="font-semibold mb-2">Saisons Complètes</p>
                <p className="text-sm text-muted-foreground">
                  De 2010 à 2025 : évolution des styles, des équipes, et des tendances.
                </p>
              </div>
            </div>

            {/* Card 5 - Wide */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                  <Zap size={24} className="text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Pipeline Automatisé</h3>
                  <p className="text-muted-foreground">
                    Les données sont ingérées, nettoyées et transformées automatiquement via des scripts Python.
                    Le modèle est ré-entraîné régulièrement pour capturer les nouvelles tendances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION C: METHODOLOGY
          ═══════════════════════════════════════════════════════════════════════ */}
      <section id="methodology" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <BrainCircuit size={14} />
                Méthodologie
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Pourquoi l&apos;IA peut battre l&apos;intuition humaine ?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Le football est un <strong className="text-foreground">système non-linéaire</strong>. 
                  Les règles simples ("Le favori gagne toujours") échouent face à la complexité du jeu.
                </p>
                <p>
                  Notre modèle de Machine Learning détecte des <strong className="text-foreground">patterns invisibles</strong> : 
                  corrélations entre forme récente, historique H2H, et performances selon le contexte (domicile/extérieur, météo, fatigue).
                </p>
                <p>
                  L&apos;objectif ? Identifier les <strong className="text-foreground">erreurs de pricing des bookmakers</strong> 
                  — ces moments où la cote ne reflète pas la vraie probabilité d&apos;un événement.
                </p>
              </div>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                Explorer les preuves statistiques
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-card border border-border/50 rounded-2xl p-8 space-y-6">
                <h4 className="font-semibold text-lg">Ce que l&apos;IA capture :</h4>
                <ul className="space-y-4">
                  {[
                    { icon: "📊", text: "Non-linéarités entre tirs et buts" },
                    { icon: "🔄", text: "Inertie du score (effet remontada)" },
                    { icon: "🏠", text: "Profils domicile/extérieur par équipe" },
                    { icon: "🎯", text: "Efficacité sur coups de pied arrêtés" },
                    { icon: "📅", text: "Saisonnalité des performances" },
                    { icon: "⚠️", text: "Risque disciplinaire (cartons)" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">10 chapitres analytiques</strong> démontrent pourquoi les stats simples ne suffisent pas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION D: CTA FINAL
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Prêt à voir les données ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Notre masterclass en 10 chapitres vous montre pourquoi le football est prévisible... 
            si vous savez où regarder.
          </p>
          <Link
            href="/analytics"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
          >
            Découvrir l&apos;Analytics
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
