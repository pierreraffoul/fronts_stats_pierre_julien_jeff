# ⚽ Football Advanced Analytics & AI Prediction Platform

Ce projet s'inscrit dans le cadre du module PSID (Projet de Système d'Information Décisionnel). Il vise à concevoir une architecture complète de traitement de données sportives, allant de l'ingestion de données historiques brutes jusqu'à la restitution d'analyses décisionnelles et la préparation d'un modèle d'Intelligence Artificielle prédictif.

## 📌 Contexte et Objectifs

L'objectif principal n'est pas simplement d'afficher des statistiques passées, mais de démontrer mathématiquement la complexité inhérente au football pour justifier l'implémentation d'algorithmes de Machine Learning (XGBoost/Random Forest).

Nous cherchons à prouver que les règles heuristiques simples (ex: "Le favori gagne toujours", "Dominer c'est gagner") sont insuffisantes pour battre le marché, nécessitant ainsi une approche algorithmique non-linéaire.

## 🏗 Architecture Technique

Le projet repose sur une architecture moderne séparant le traitement de la donnée (ETL) de sa restitution (Web).

- **ETL & Data Science** : Python (pandas, numpy) pour le nettoyage, la normalisation des cotes et le Feature Engineering.

- **Base de Données** : Supabase (PostgreSQL) hébergeant deux tables distinctes :
  - `match_history` : Données factuelles post-match (Scores, Tirs, Cotes, Résultats).
  - `ai_training_data` : Données contextuelles pré-match calculées (Forme glissante, Moyennes Attaque/Défense).

- **Frontend / Dashboard** : Next.js 14 (App Router), TypeScript, Tailwind CSS.

- **Visualisation** : Shadcn UI & Recharts.

## 📊 Analyse Décisionnelle (Dashboard)

Le module Analytics accessible sur l'application a pour but de "raconter l'histoire" de nos données. Il met en exergue quatre phénomènes clés qui rendent la prédiction difficile pour un humain :

### 1. L'Illusion du Favori (ROI Betting)
Analyse de la rentabilité des paris sur les cotes les plus basses.

**Constat** : Parier systématiquement sur le favori engendre un ROI négatif.

### 2. L'Inertie du Match (Remontada)
Analyse des probabilités conditionnelles (Score à la mi-temps vs Fin du match).

**Constat** : Les retournements de situation sont rares (~15%) mais existent, créant du "bruit" statistique.

### 3. L'Efficacité vs Domination
Corrélation entre Tirs Cadrés et Buts marqués.

**Constat** : La relation n'est pas linéaire. Une domination stérile est un piège classique que l'IA doit apprendre à détecter.

### 4. L'Identité "Bipolaire" (Radar)
Comparaison des performances Domicile/Extérieur.

**Constat** : L'avantage du terrain n'est pas une constante fixe, il dépend de l'identité de l'équipe.

## ⚠️ Distinction Importante : Analytics vs Modèle IA

Il est crucial de noter que ces graphiques servent à l'analyse exploratoire et à la justification du projet.

Les variables utilisées pour l'entraînement de notre future IA ne se limitent pas à ces agrégats. Le modèle prédictif utilisera un vecteur de features dynamiques calculées spécifiquement pour chaque rencontre (disponibles dans la table `ai_training_data`), incluant :

- La dynamique de forme sur les 5 derniers matchs (Points glissants).
- La puissance offensive et défensive relative (Buts marqués/encaissés récents).
- La sagesse du marché (Analyse des écarts de cotes bookmakers).
- Les contextes spécifiques (Confrontations directes, enjeux).

L'IA n'apprendra pas "par cœur" les graphiques globaux, mais utilisera ces features pour pondérer chaque match individuellement.

## 🚀 Installation et Lancement

### Pré-requis
Node.js installé sur la machine.

### Installation des dépendances

```bash
npm install
```

### Configuration de l'environnement

Assurez-vous d'avoir le fichier `.env.local` à la racine contenant les clés d'accès Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### Lancement du serveur de développement

```bash
npm run dev
```

### Accès à la plateforme

Ouvrez votre navigateur et accédez à la page d'analyse : 👉 [http://localhost:3000/analytics](http://localhost:3000/analytics)



---

Projet réalisé dans le cadre du Master MIAGE - Année 2024/2025.
