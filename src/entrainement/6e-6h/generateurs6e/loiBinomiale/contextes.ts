import type { ConditionEchouee } from "../../core6e/loiBinomiale.types";

/**
 * Contextes de `6gen50` (audit, lots B et C). Chaque texte DÉFINIT X ; p s'écrit comme dans le cours
 * (décimal, pourcentage ou fraction « une chance sur quatre »).
 */

export function virgule(x: number): string {
  return String(Number(x.toFixed(6))).replace(".", ",");
}

export interface ContexteBinomialA {
  texte: (n: number, pTexte: string) => string;
  /** Écritures possibles de p : décimale, pourcentage, ou p imposée (fraction du contexte). */
  p: { num: number; den: number }[];
  ecriture: "decimal" | "pourcent" | "fraction";
}

const P_DIXIEMES = [1, 2, 3, 4, 6, 7, 8, 9].map((k) => ({ num: k, den: 10 }));
const P_POURCENTS = [5, 8, 12, 15, 20, 25].map((k) => ({ num: k, den: 100 }));

export const CONTEXTES_A_BINOMIAUX: ContexteBinomialA[] = [
  {
    texte: (n, p) => `Une pièce truquée tombe sur pile avec une probabilité de ${p}. On la lance ${n} fois de suite ; $X$ est le nombre de piles obtenus.`,
    p: P_DIXIEMES,
    ecriture: "decimal",
  },
  {
    texte: (n, p) => `Dans un très grand fichier, ${p} des factures restent impayées. On prend ${n} factures au hasard, indépendamment les unes des autres ; $X$ est le nombre de factures impayées.`,
    p: P_POURCENTS,
    ecriture: "pourcent",
  },
  {
    texte: (n) => `Un élève répond au hasard aux ${n} questions d'un QCM ; chaque question propose 4 réponses, dont une seule est juste. $X$ est le nombre de bonnes réponses.`,
    p: [{ num: 1, den: 4 }],
    ecriture: "fraction",
  },
  {
    texte: (n, p) => `Un archer atteint la cible avec une probabilité de ${p} à chaque tir, quels que soient ses tirs précédents. Il tire ${n} flèches ; $X$ est le nombre de flèches dans la cible.`,
    p: P_DIXIEMES,
    ecriture: "decimal",
  },
  {
    texte: (n) => `On lance ${n} fois un dé équilibré à six faces ; $X$ est le nombre de « 6 » obtenus.`,
    p: [{ num: 1, den: 6 }],
    ecriture: "fraction",
  },
];

/** Contextes non binomiaux : UNE condition échoue, sans ambiguïté. */
export const CONTEXTES_A_NON_BINOMIAUX: { condition: ConditionEchouee; texte: (n: number) => string }[] = [
  { condition: "nombre", texte: () => "On lance un dé équilibré jusqu'à obtenir un « 6 » ; $X$ est le nombre de lancers effectués." },
  { condition: "nombre", texte: () => "Une basketteuse réussit chaque lancer franc avec une probabilité de 0,7. Elle tire jusqu'à son premier échec ; $X$ est le nombre de paniers réussis." },
  { condition: "nombre", texte: () => "Un joueur achète des billets de tombola, un par un, jusqu'à obtenir un billet gagnant ; $X$ est le nombre de billets achetés." },
  { condition: "independance", texte: (n) => `Un sac contient 5 jetons rouges et 3 bleus. On tire ${n} jetons l'un après l'autre, sans remettre le jeton tiré ; $X$ est le nombre de jetons rouges.` },
  { condition: "independance", texte: (n) => `Un archer fatigue : il atteint la cible avec une probabilité de 0,9 au premier tir, puis cette probabilité baisse de 0,1 à chaque tir. Il tire ${n} flèches ; $X$ est le nombre de flèches dans la cible.` },
  { condition: "independance", texte: (n) => `Quand il pleut un jour, il pleut le lendemain avec une probabilité de 0,7 ; sinon, avec une probabilité de 0,2. On observe ${n} jours ; $X$ est le nombre de jours de pluie.` },
  { condition: "issues", texte: (n) => `On lance ${n} fois un dé équilibré ; $X$ est la somme des faces obtenues.` },
  { condition: "issues", texte: (n) => `Un match se termine par une victoire (3 points), un nul (1 point) ou une défaite (0 point). Une équipe joue ${n} matchs ; $X$ est le nombre total de points obtenus.` },
  { condition: "issues", texte: (n) => `On tire ${n} fois une carte, avec remise, dans un paquet de 52 cartes ; $X$ est la somme des valeurs des cartes tirées (as = 1, figures = 10).` },
];

export const LIBELLES_CONDITION: Record<ConditionEchouee, string> = {
  nombre: "Le nombre d'épreuves n'est pas fixé à l'avance.",
  independance: "Les épreuves ne sont pas indépendantes, ou la probabilité de succès change d'une épreuve à l'autre.",
  issues: "X ne compte pas les succès d'une épreuve à deux issues.",
};

export interface ContexteBinomialB {
  texte: (n: number, p: string) => string;
  succes: string;
  /** Valeurs de p cohérentes avec le contexte (en dixièmes, jamais 0,5). */
  p: number[];
}

export const CONTEXTES_B: ContexteBinomialB[] = [
  { texte: (n, p) => `On sème ${n} graines ; chacune germe avec une probabilité de ${p}, indépendamment des autres. $X$ est le nombre de graines qui germent.`, succes: "de graines qui germent", p: [0.6, 0.7, 0.8, 0.9] },
  { texte: (n, p) => `Un joueur tire ${n} penaltys ; il marque à chaque tir avec une probabilité de ${p}, quels que soient les tirs précédents. $X$ est le nombre de penaltys réussis.`, succes: "de penaltys réussis", p: [0.6, 0.7, 0.8, 0.9] },
  { texte: (n, p) => `Un serveur tente ${n} connexions indépendantes ; chacune réussit avec une probabilité de ${p}. $X$ est le nombre de connexions réussies.`, succes: "de connexions réussies", p: [0.6, 0.7, 0.8, 0.9] },
  { texte: (n, p) => `On contrôle ${n} ampoules prises au hasard dans une grande production ; chacune est défectueuse avec une probabilité de ${p}. $X$ est le nombre d'ampoules défectueuses.`, succes: "d'ampoules défectueuses", p: [0.1, 0.2, 0.3] },
  { texte: (n, p) => `On choisit ${n} élèves au hasard dans une grande école ; chacun est absent ce jour-là avec une probabilité de ${p}, indépendamment des autres. $X$ est le nombre d'élèves absents.`, succes: "d'élèves absents", p: [0.1, 0.2, 0.3, 0.4] },
];

export interface ContexteBinomialC {
  texte: (p: string) => string;
  evenement: string;
  unite: string;
}

export const CONTEXTES_C: ContexteBinomialC[] = [
  { texte: (p) => `Chaque graine semée germe avec une probabilité de ${p}, indépendamment des autres.`, evenement: "au moins une graine germe", unite: "graines" },
  { texte: (p) => `Un test de dépistage, répété de manière indépendante, revient positif avec une probabilité de ${p} à chaque essai.`, evenement: "au moins un test revienne positif", unite: "tests" },
  { texte: (p) => `Un serveur tente des connexions indépendantes ; chacune réussit avec une probabilité de ${p}.`, evenement: "au moins une connexion réussisse", unite: "tentatives" },
  { texte: (p) => `Un joueur achète des billets de loterie ; chaque billet est gagnant avec une probabilité de ${p}, indépendamment des autres.`, evenement: "au moins un billet soit gagnant", unite: "billets" },
];
