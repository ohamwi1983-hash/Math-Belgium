/**
 * Contextes de gen109 (« Retrouver une valeur manquante ») : UNE seule source pour les mots du récit
 * (écran ET papier) et les plages de nombres (générateur). Aucun contexte ne nomme une personne
 * réelle : prénoms courants seulement.
 */

export interface Prenom {
  prenom: string;
  /** Pronom sujet (« il » / « elle »). */
  pronom: "il" | "elle";
}

export const PRENOMS: Prenom[] = [
  { prenom: "Léa", pronom: "elle" },
  { prenom: "Yanis", pronom: "il" },
  { prenom: "Inès", pronom: "elle" },
  { prenom: "Noah", pronom: "il" },
  { prenom: "Emma", pronom: "elle" },
  { prenom: "Adam", pronom: "il" },
  { prenom: "Sarah", pronom: "elle" },
  { prenom: "Lucas", pronom: "il" },
  { prenom: "Nora", pronom: "elle" },
  { prenom: "Mehdi", pronom: "il" },
  { prenom: "Lina", pronom: "elle" },
  { prenom: "Arthur", pronom: "il" },
];

// ---------------------------------------------------------------------------------------------
// Note à obtenir
// ---------------------------------------------------------------------------------------------

export interface ContexteNoteSansCoef {
  id: string;
  matiere: string;
  /** Une épreuve (« interrogation »), son pluriel, et son genre (accord de « dernier »). */
  epreuve: string;
  pluriel: string;
  feminin: boolean;
}

export const CONTEXTES_NOTE_SANS_COEF: ContexteNoteSansCoef[] = [
  { id: "interros-maths", matiere: "mathématiques", epreuve: "interrogation", pluriel: "interrogations", feminin: true },
  { id: "tests-sciences", matiere: "sciences", epreuve: "test", pluriel: "tests", feminin: false },
  { id: "dictees", matiere: "français", epreuve: "dictée", pluriel: "dictées", feminin: true },
  { id: "controles-histoire", matiere: "histoire", epreuve: "contrôle", pluriel: "contrôles", feminin: false },
  { id: "tests-anglais", matiere: "anglais", epreuve: "test de vocabulaire", pluriel: "tests de vocabulaire", feminin: false },
];

export interface EpreuveCoef {
  /** Nom avec article défini (« l'examen de décembre »). */
  nom: string;
  /** Coefficients possibles. */
  coefs: number[];
}

export interface ContexteNoteAvecCoef {
  id: string;
  /** Première phrase du récit : « {prenom} … ». */
  intro: (prenom: string, dePrenom: string) => string;
  /** Épreuves déjà passées (2 ou 3) puis celle qui reste. */
  connues: EpreuveCoef[];
  derniere: EpreuveCoef;
}

export const CONTEXTES_NOTE_AVEC_COEF: ContexteNoteAvecCoef[] = [
  {
    id: "bulletin",
    intro: (_p, de) => `En mathématiques, la note finale ${de} est une moyenne pondérée de trois notes sur 20.`,
    connues: [
      { nom: "le travail journalier", coefs: [1, 2] },
      { nom: "l'examen de décembre", coefs: [2, 3] },
    ],
    derniere: { nom: "l'examen de juin", coefs: [3, 4, 5] },
  },
  {
    id: "concours",
    intro: (p) => `${p} participe à un concours de jeunes reporters, noté sur 20 avec des coefficients.`,
    connues: [
      { nom: "l'épreuve écrite", coefs: [3, 4] },
      { nom: "le dossier", coefs: [1, 2] },
    ],
    derniere: { nom: "l'épreuve orale", coefs: [2, 3] },
  },
  {
    id: "secourisme",
    intro: (p) => `${p} suit une formation de secouriste, évaluée sur 20 avec des coefficients.`,
    connues: [
      { nom: "le test de théorie", coefs: [1, 2] },
      { nom: "le test de pratique", coefs: [2, 3] },
    ],
    derniere: { nom: "la mise en situation", coefs: [3, 4] },
  },
  {
    id: "education-physique",
    intro: (_p, de) => `En éducation physique, la note ${de} est une moyenne pondérée de quatre épreuves sur 20.`,
    connues: [
      { nom: "l'endurance", coefs: [1, 2] },
      { nom: "la gymnastique", coefs: [1, 2] },
      { nom: "la natation", coefs: [1, 2] },
    ],
    derniere: { nom: "le sport collectif", coefs: [2, 3] },
  },
  {
    id: "periodes",
    intro: (_p, de) => `En sciences, la note annuelle ${de} combine trois périodes et un examen, sur 20.`,
    connues: [
      { nom: "la 1re période", coefs: [1] },
      { nom: "la 2e période", coefs: [1] },
      { nom: "la 3e période", coefs: [1] },
    ],
    derniere: { nom: "l'examen", coefs: [2, 3, 4] },
  },
];

// ---------------------------------------------------------------------------------------------
// Tableaux (effectif manquant, médiane)
// ---------------------------------------------------------------------------------------------

function pluriel(v: number, singulier: string, plur: string): string {
  return `${v} ${v >= 2 ? plur : singulier}`;
}

export interface ContexteTableau {
  id: string;
  /** Valeurs possibles (on en tire 4 à 6 consécutives). */
  min: number;
  max: number;
  intro: string;
  /** En-têtes du tableau (texte brut). */
  enTeteValeur: string;
  enTeteEffectif: string;
  /** Individus : « familles » / « famille ». */
  population: string;
  singulier: string;
  /** « 3 enfants », « 7/10 », « 39 » — une valeur du caractère, dans une phrase. */
  valeurTexte: (v: number) => string;
  /** « familles de 4 enfants » — les individus qui ont cette valeur. */
  groupe: (v: number) => string;
  /** « enfants par famille » — unité de la moyenne. */
  uniteMoyenne: string;
}

export const CONTEXTES_TABLEAU: ContexteTableau[] = [
  {
    id: "enfants",
    min: 0,
    max: 5,
    intro: "Une enquête porte sur le nombre d'enfants des familles d'un quartier.",
    enTeteValeur: "Nombre d'enfants",
    enTeteEffectif: "Nombre de familles",
    population: "familles",
    singulier: "famille",
    valeurTexte: (v) => pluriel(v, "enfant", "enfants"),
    groupe: (v) => (v === 0 ? "familles sans enfant" : `familles de ${pluriel(v, "enfant", "enfants")}`),
    uniteMoyenne: "enfants par famille",
  },
  {
    id: "buts",
    min: 0,
    max: 5,
    intro: "Un club de football relève le nombre de buts marqués par son équipe à chaque match de la saison.",
    enTeteValeur: "Buts marqués",
    enTeteEffectif: "Nombre de matchs",
    population: "matchs",
    singulier: "match",
    valeurTexte: (v) => pluriel(v, "but", "buts"),
    groupe: (v) => (v === 0 ? "matchs sans but" : `matchs à ${pluriel(v, "but", "buts")}`),
    uniteMoyenne: "buts par match",
  },
  {
    id: "livres",
    min: 0,
    max: 5,
    intro: "On a demandé aux élèves de 4e combien de livres ils ont lus pendant les vacances.",
    enTeteValeur: "Livres lus",
    enTeteEffectif: "Nombre d'élèves",
    population: "élèves",
    singulier: "élève",
    valeurTexte: (v) => pluriel(v, "livre", "livres"),
    groupe: (v) => (v === 0 ? "élèves n'ayant lu aucun livre" : `élèves ayant lu ${pluriel(v, "livre", "livres")}`),
    uniteMoyenne: "livres par élève",
  },
  {
    id: "notes10",
    min: 3,
    max: 10,
    intro: "Voici les notes (sur 10) obtenues par des élèves de 4e à une même interrogation.",
    enTeteValeur: "Note sur 10",
    enTeteEffectif: "Nombre d'élèves",
    population: "élèves",
    singulier: "élève",
    valeurTexte: (v) => `${v}/10`,
    groupe: (v) => `élèves ayant obtenu ${v}/10`,
    uniteMoyenne: "sur 10",
  },
  {
    id: "passagers",
    min: 1,
    max: 5,
    intro: "À l'entrée d'un parking, on compte les personnes à bord de chaque voiture.",
    enTeteValeur: "Personnes à bord",
    enTeteEffectif: "Nombre de voitures",
    population: "voitures",
    singulier: "voiture",
    valeurTexte: (v) => pluriel(v, "personne", "personnes"),
    groupe: (v) => `voitures transportant ${pluriel(v, "personne", "personnes")}`,
    uniteMoyenne: "personnes par voiture",
  },
  {
    id: "pointures",
    min: 35,
    max: 43,
    intro: "Le professeur d'éducation physique relève la pointure de ses élèves de 4e.",
    enTeteValeur: "Pointure",
    enTeteEffectif: "Nombre d'élèves",
    population: "élèves",
    singulier: "élève",
    valeurTexte: (v) => `${v}`,
    groupe: (v) => `élèves qui chaussent du ${v}`,
    uniteMoyenne: "",
  },
  {
    id: "freres",
    min: 0,
    max: 4,
    intro: "Dans une école, on a demandé aux élèves combien ils ont de frères et sœurs.",
    enTeteValeur: "Frères et sœurs",
    enTeteEffectif: "Nombre d'élèves",
    population: "élèves",
    singulier: "élève",
    valeurTexte: (v) => (v === 0 ? "0 frère et sœur" : v === 1 ? "1 frère ou sœur" : `${v} frères et sœurs`),
    groupe: (v) => (v === 0 ? "élèves sans frère ni sœur" : v === 1 ? "élèves ayant 1 frère ou sœur" : `élèves ayant ${v} frères et sœurs`),
    uniteMoyenne: "frères et sœurs par élève",
  },
];

// ---------------------------------------------------------------------------------------------
// Deux groupes
// ---------------------------------------------------------------------------------------------

export interface ContexteGroupes {
  id: string;
  intro: string;
  /** Noms des deux groupes, avec article (« la 4e A »), et leur forme capitalisée en tableau. */
  groupe1: string;
  groupe2: string;
  /** Individus (« élèves »). */
  individus: string;
  /** La grandeur moyennée (« la moyenne à l'interrogation »), pour les phrases. */
  grandeur: string;
  /** Unité affichée après une valeur (« /20 » collé, « cm » espacé). */
  unite: string;
  uniteCollee: boolean;
  /** Plages : effectifs [min, max] ; moyennes [min, max, pas]. */
  effectifs: [number, number];
  moyennes: [number, number, number];
}

export const CONTEXTES_GROUPES: ContexteGroupes[] = [
  {
    id: "classes",
    intro: "Deux classes de 4e ont passé la même interrogation, notée sur 20.",
    groupe1: "la 4e A",
    groupe2: "la 4e B",
    individus: "élèves",
    grandeur: "la moyenne",
    unite: "/20",
    uniteCollee: true,
    effectifs: [14, 26],
    moyennes: [9, 15.5, 0.5],
  },
  {
    id: "tailles",
    intro: "Dans un club d'athlétisme, on a mesuré la taille des filles et des garçons d'une catégorie.",
    groupe1: "les filles",
    groupe2: "les garçons",
    individus: "jeunes",
    grandeur: "la taille moyenne",
    unite: "cm",
    uniteCollee: false,
    effectifs: [8, 30],
    moyennes: [152, 172, 1],
  },
  {
    id: "ages",
    intro: "Un stage de natation accueille deux groupes d'enfants.",
    groupe1: "le groupe des débutants",
    groupe2: "le groupe des confirmés",
    individus: "enfants",
    grandeur: "l'âge moyen",
    unite: "ans",
    uniteCollee: false,
    effectifs: [8, 24],
    moyennes: [9, 14, 0.5],
  },
  {
    id: "salaires",
    intro: "Une petite entreprise compare les salaires mensuels nets de ses deux services.",
    groupe1: "l'atelier",
    groupe2: "les bureaux",
    individus: "employés",
    grandeur: "le salaire moyen",
    unite: "€",
    uniteCollee: false,
    effectifs: [5, 30],
    moyennes: [1800, 2900, 50],
  },
  {
    id: "attente",
    intro: "Un supermarché mesure le temps d'attente des clients à deux caisses pendant une matinée.",
    groupe1: "la caisse 1",
    groupe2: "la caisse 2",
    individus: "clients",
    grandeur: "le temps d'attente moyen",
    unite: "min",
    uniteCollee: false,
    effectifs: [10, 40],
    moyennes: [2, 9, 0.5],
  },
];

export function contexteNoteSansCoef(id: string): ContexteNoteSansCoef {
  return CONTEXTES_NOTE_SANS_COEF.find((c) => c.id === id) ?? CONTEXTES_NOTE_SANS_COEF[0]!;
}
export function contexteNoteAvecCoef(id: string): ContexteNoteAvecCoef {
  return CONTEXTES_NOTE_AVEC_COEF.find((c) => c.id === id) ?? CONTEXTES_NOTE_AVEC_COEF[0]!;
}
export function contexteTableau(id: string): ContexteTableau {
  return CONTEXTES_TABLEAU.find((c) => c.id === id) ?? CONTEXTES_TABLEAU[0]!;
}
export function contexteGroupes(id: string): ContexteGroupes {
  return CONTEXTES_GROUPES.find((c) => c.id === id) ?? CONTEXTES_GROUPES[0]!;
}
