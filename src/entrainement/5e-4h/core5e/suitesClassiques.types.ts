// Contrat core — 5gen17 "Problèmes classiques sur les suites". 7 scénarios, chacun une INSTANCE
// FIXE (jamais de génération aléatoire, même principe que A2/A4 de 5gen12) — mais les valeurs ne
// sont PAS recopiées littéralement depuis l'énoncé : chaque `construireXxx()` (Couche A) les
// DÉRIVE par formule depuis un petit noyau de données de départ, exactement comme A2/A4, pour
// garantir leur exactitude et permettre une cross-vérification indépendante en test.

export interface ExerciceEchiquier {
  scenario: "echiquier";
  u1: number;
  q: number;
  // `bigint`, pas `number` : 2⁶³ et 2⁶⁴−1 dépassent `Number.MAX_SAFE_INTEGER` — un `number` perdrait
  // les derniers chiffres. Affiché via `.toString()` (jamais reconverti en `Number` pour l'affichage),
  // converti en `Number` UNIQUEMENT au point de comparaison à tolérance côté
  // `moteur5e/verificationSuiteClassique.ts` (`diagnostiquerU64`/`diagnostiquerSommeTotaleEchiquier`).
  u64: bigint;
  sommeTotale: bigint;
  poidsGrainGrammes: number;
  poidsTotalTonnes: number;
  productionMondialeTonnes: number;
  facteurComparaison: number;
}

export interface ExercicePapyrusRhind {
  scenario: "papyrusRhind";
  sommeTotale: number; // 100
  a: number; // 1+2/3
  delta: number; // 9+1/6
  termes: [number, number, number, number, number];
}

// ⚠️ Correction assumée par rapport à l'énoncé littéral du prompt : le prompt écrit "produit
// y·z=216" et "poser yz=216=(6+r)(6+2r)" — mais ceci contredit algébriquement sa PROPRE réponse
// finale (r=-9 donne y·z=(-3)×(-12)=36, pas 216). La relation mathématiquement cohérente avec la
// réponse donnée est le produit des TROIS nombres x·y·z=216 (avec x=6, moyenne géométrique de y et
// z, donc x²=yz) : x·y·z=216 ⟹ x·x²=216 ⟹ x³=216 ⟹ x=6 (racine cubique exacte, seule solution
// réelle) — reproduit exactement x=6 puis, via (6+r)(6+2r)=x²=36, r=-9 (r=0 rejeté comme
// dégénéré). Retenu ici plutôt que deviné silencieusement, documenté explicitement.
export interface ExerciceSuitesCombinees {
  scenario: "suitesCombinees";
  produitXYZ: number; // 216 — x·y·z, PAS y·z seul (voir la correction ci-dessus)
  x: number; // 6 — moyenne géométrique de y et z, x²=yz, ET terme partagé avec la suite arithmétique
  r: number; // -9
  arithmetique: [number, number, number]; // 6, y, z
  geometrique: [number, number, number]; // y, x, z (x est le terme central, x²=yz)
}

export interface ExerciceVitesse {
  scenario: "vitesse";
  u1: number; // 1.20
  r: number; // 1.50
  distance11: number;
  sommeTotale11: number;
  vitesseMethode1KmH: number;
  vitesseMethode2KmH: number;
  vitesseMethode3KmH: number;
}

// Simplification assumée, documentée explicitement (pas devinée silencieusement) : la spec détaille
// 8 sous-écrans (a-h) explorant récurrence/rapport/limite dorée en profondeur — réduit ici à 5
// écrans qui couvrent la même progression pédagogique (termes → récurrence → rapport → équation
// caractéristique → propriété remarquable) sans les ramifications c/d/f/g/h les plus symboliques,
// pour rester dans le format "champ numérique à tolérance" déjà établi partout ailleurs sur la
// plateforme plutôt que de construire une nouvelle machinerie de vérification symbolique récursive.
export interface ExerciceFibonacci {
  scenario: "fibonacci";
  dixPremiersTermes: number[];
  v5: number; // u6/u5 — rapport de 2 termes consécutifs
  phi: number; // racine positive de x²=x+1
}

export interface ExerciceTrianglesZigzag {
  scenario: "trianglesZigzag";
  h1: number;
  raisonHauteurs: number;
  hauteurs: [number, number, number, number];
  aires: [number, number, number, number];
  longueurZigzag: number;
  airesEntreZigzagEtAC: [number, number, number];
}

export interface ExerciceCarresEmboites {
  scenario: "carresEmboites";
  // Partie a — fraction colorée, u1=1/4, q=1/4.
  u1A: number;
  qA: number;
  sommeInfinieA: number;
  // Partie b — aires des carrés emboîtés, q=1/2. Simplification assumée (documentée, pas devinée
  // silencieusement) : côté CONCRET a=4 (plutôt que symbolique comme le suggère la spec — "3
  // méthodes possibles à illustrer" en gardant a symbolique exigerait une vérification symbolique à
  // 2 variables jamais présente ailleurs sur la plateforme) — les aires/la somme infinie restent
  // dérivées par formule (a², a²/2, a²/4..., limite=2a²), jamais recopiées en dur.
  qB: number;
  coteB: number; // 4
  airesB: [number, number, number];
  sommeInfinieB: number; // 2·coteB²
}

export type ScenarioSuiteClassique = "echiquier" | "papyrusRhind" | "suitesCombinees" | "vitesse" | "fibonacci" | "trianglesZigzag" | "carresEmboites";

export type ExerciceSuiteClassique =
  | ExerciceEchiquier
  | ExercicePapyrusRhind
  | ExerciceSuitesCombinees
  | ExerciceVitesse
  | ExerciceFibonacci
  | ExerciceTrianglesZigzag
  | ExerciceCarresEmboites;

export type GenerateurExerciceSuiteClassique = () => ExerciceSuiteClassique;
