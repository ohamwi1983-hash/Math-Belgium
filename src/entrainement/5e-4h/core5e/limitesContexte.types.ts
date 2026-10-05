/**
 * Couche core (5e) — contrat pour 5gen23 ("Limites et asymptotes en contexte"). 4 familles FIXES,
 * fidèles à 4 contextes sources distincts — jamais un système de dimensions combinables comme
 * 5gen22 : ces exercices sont trop spécifiques dans leur enchaînement narratif pour être fusionnés
 * en un modèle générique sans perdre le sens du contexte. Types purs, aucune logique.
 */

/**
 * Une option d'écran QCM "interprétation" — UNE seule `correcte: true` par exercice, ordre mélangé
 * à la génération et fixe pour l'instance (jamais retrié côté présentation). Motif repris tel quel
 * du précédent 4e (`optionsInterpretation`, ex. `AppOptimisation.tsx`) — c'est la SEULE façon
 * établie sur la plateforme de faire "interpréter un résultat en contexte" : jamais de saisie libre
 * en français (jamais gradée nulle part sur la plateforme), jamais un champ de justification
 * affiché-mais-non-vérifié — soit un QCM de phrases pré-écrites (dont les distracteurs encodent les
 * pièges classiques documentés par famille), soit un second champ structuré gradé en parallèle d'un
 * choix Oui/Non (famille D, écran 3).
 */
export interface OptionInterpretation {
  texte: string;
  correcte: boolean;
}

/**
 * Contextes narratifs — chaque famille tire UNIFORMÉMENT parmi 30 habillages (vocabulaire, noms de
 * variables, unités) à chaque génération, pour éviter la répétition et la reconnaissance de motif.
 * La structure mathématique/pédagogique (formules, pièges, écrans) ne varie JAMAIS avec le contexte
 * — seul l'habillage change. Champs pré-écrits (jamais de calcul d'accord grammatical à l'exécution)
 * pour garantir un français correct quel que soit le genre/nombre du nom choisi : voir
 * `contextesPrixRevient.ts`/`contextesEauSalee.ts`/`contextesClubLoisirs.ts`/`contextesPopulation.ts`
 * pour le détail des 30 entrées par famille.
 */
export interface ContextePrixRevient {
  id: string;
  /** Sujet complet, en début de phrase (ex. "Une imprimerie"). */
  sujetPhrase: string;
  /** Sujet en milieu de phrase, minuscule (ex. "l'imprimerie"). */
  sujetGenerique: string;
  /** Nom de l'activité à coût fixe, minuscule (ex. "la mise en page"). */
  activiteFixe: string;
  uniteSingulier: string;
  unitePluriel: string;
  /** Participe passé pluriel accordé avec `unitePluriel` (ex. "commandés"/"commandées"). */
  verbeParticipePluriel: string;
  /** Infinitif du verbe d'action (ex. "imprimer"). */
  verbeInfinitif: string;
}

export interface ContexteEauSalee {
  id: string;
  /** Sujet complet (le contenant), en début de phrase (ex. "Une citerne"). */
  sujetPhrase: string;
  /** Phrase complète AVEC préposition, ce que contient initialement le contenant (ex. "d'eau pure"). */
  contenuInitial: string;
  /** Phrase complète AVEC préposition/article, ce qu'on ajoute en continu (ex. "de l'eau salée"). */
  ajoutPhrase: string;
  /** Phrase complète AVEC préposition, la substance suivie (ex. "de sel"). */
  quantitePhrase: string;
  /** Accord de l'état de la substance suivie avec `quantitePhrase` (ex. "dissous"/"dissoute"/"présent"). */
  etatAccord: string;
}

export interface ContexteClubLoisirs {
  id: string;
  /** Description complète, en début de phrase (ex. "L'effectif d'un club de loisirs"). */
  entiteDescription: string;
  /** Phrase complète (élision gérée), suit "en" (ex. "centaines de membres"/"centaines d'euros"). */
  parentheseUnite: string;
  unitePluriel: string;
  /** Suit "depuis" (ex. "la création du club"). */
  origine: string;
  /** Nom court capitalisé SANS article, pour les libellés de champ (ex. "Effectif"). */
  grandeurLabel: string;
  /** Nom court minuscule AVEC article, pour le milieu de phrase (ex. "l'effectif") — toujours
   * masculin par construction (évite tout accord genré dans le texte généré). */
  grandeurArticle: string;
}

export interface ContextePopulation {
  id: string;
  /** Description complète, en début de phrase (ex. "La population d'une ville"). */
  entiteDescription: string;
  /** Nom court capitalisé SANS article, pour les libellés de champ (ex. "Population"). */
  grandeurLabel: string;
  /** Nom court minuscule AVEC article, pour le milieu de phrase (ex. "la population"). */
  grandeurArticle: string;
  /** Suit "en" (ex. "en millions d'habitants"/"en %"). */
  uniteParenthese: string;
  /** Sans "en", suit un nombre (ex. "millions d'habitants"/"%"). */
  unitePourValeur: string;
}

/** Famille A — "Prix de revient" : coût unitaire Cᵤ(x)=b+a/x, x≥seuil (commande minimale réaliste). */
export interface ExercicePrixRevient {
  famille: "prixRevient";
  /** Coût fixe (mise en page, machine...). */
  a: number;
  /** Coût marginal par unité — c'est aussi la limite/asymptote horizontale. */
  b: number;
  /** Commande minimale réaliste (x≥seuil) — jamais x=0, sinon l'AV math (x=0) resterait pertinente. */
  seuil: number;
  optionsInterpretation: OptionInterpretation[];
  /** Écran 3 : l'AV (x=0) a-t-elle un sens dans le contexte ? Oui/Non fondu dans la justification. */
  optionsVASens: OptionInterpretation[];
  contexte: ContextePrixRevient;
}

/** Famille B — "Eau salée" : V(t)=v0+rt (volume), Q(t)=c·r·t (quantité de soluté ajoutée en continu
 * à la concentration c), C(t)=Q(t)/V(t) → c à l'infini. */
export interface ExerciceEauSalee {
  famille: "eauSalee";
  v0: number;
  r: number;
  c: number;
  optionsInterpretation: OptionInterpretation[];
  contexte: ContexteEauSalee;
}

/** Famille C — "Club de loisirs" : f(x)=ax+b−c/(x+d), a>0 IMPOSÉ (garantit f strictement croissante
 * sur x≥0 — f'(x)=a+c/(x+d)²>0 toujours — donc une inéquation f(x)≥k0 bien posée, solution unique
 * x≥x_critique, jamais d'ambiguïté). f(0)≥1 GARANTI À LA GÉNÉRATION (b dérivé d'un plancher calculé
 * depuis c/d, jamais un tirage suivi d'un rejet) — f étant strictement croissante, f(0) est le
 * minimum de f sur tout le domaine réaliste x≥0, donc f(x)≥1 partout. Résultat exprimé en
 * "centaines", `facteur` convertit vers l'effectif réel. */
export interface ExerciceClubLoisirs {
  famille: "clubLoisirs";
  a: number;
  b: number;
  c: number;
  d: number;
  facteur: number;
  /** Point d'évaluation "après X mois" (écran 1, second point après x=0). */
  xEval: number;
  /** Seuil natif (échelle "centaines", AVANT conversion) de l'inéquation f(x)≥k0 (écran 2). */
  k0: number;
  /** ⌈x_critique⌉ — réponse attendue exacte de l'écran 2, dérivée de la racine réelle du polynôme
   * obtenu en réduisant f(x)≥k0 au même dénominateur (jamais une valeur choisie a priori puis
   * approchée : la valeur EXACTE de x_critique est calculée à la génération). */
  moisAttendu: number;
  contexte: ContexteClubLoisirs;
}

/** Famille D — "Population" : f(x)=(bx+(a+bp))/(x+p) affiché déjà développé au numérateur — l'élève
 * retrouve a/b par coefficients indéterminés (a/(x+p)+b, 2 inconnues, système à 2 équations —
 * version simplifiée de la méthode à 3 inconnues de 5gen21). b = asymptote horizontale = limite de
 * population ; le signe de a détermine croissance/régression via f(0)−b = a/p. */
export interface ExercicePopulation {
  famille: "population";
  a: number;
  b: number;
  p: number;
  anneeRef: number;
  anneeEval: number;
  /** Seuil de population (millions) comparé à f(anneeEval−anneeRef) à l'écran 3. */
  seuil: number;
  optionsInterpretation: OptionInterpretation[];
  contexte: ContextePopulation;
}

export type ExerciceLimitesContexte = ExercicePrixRevient | ExerciceEauSalee | ExerciceClubLoisirs | ExercicePopulation;

export type GenerateurExerciceLimitesContexte = () => ExerciceLimitesContexte;
