import type { AffirmationC, EvenementDe, EvenementSomme, ExerciceFrequenceA, ExerciceFrequenceB, ExerciceFrequenceC, ExerciceFrequenceProbabilite, ObjetC } from "../../core6e/frequenceProbabilite.types";
import { couplesDeSomme, ecartRelatif, frequenceObservee, probabiliteModele, probabiliteNaiveB, seuilRelatif } from "../../moteur6e/verificationFrequenceProbabilite";

/**
 * Couche A (6e) — générateur de `6gen75` « Fréquence et probabilité ». TOUT l'aléa passe par
 * `Math.random` (tirage des paramètres ET simulation des lancers) : sous la graine de `?code=`
 * (`export/codeExercice.ts::avecGraine`), l'appli et l'adaptateur papier retrouvent exactement les
 * mêmes effectifs.
 *
 * Verdict SENSÉ par construction : on fixe d'abord le verdict voulu (compatible / non compatible),
 * on simule, et on ne garde que des effectifs dont l'écart relatif est NETTEMENT d'un côté du seuil
 * de la règle (marge `MARGE_VERDICT`, qui absorbe aussi l'arrondi de f au centième). Un dé truqué
 * l'est d'autant plus que n est petit (`POIDS_TRUQUE`) : avec 60 lancers, seul un écart énorme
 * dépasse le seuil de 50 %.
 */

/** Distance minimale (en écart relatif) entre l'écart observé et le seuil de la règle. */
export const MARGE_VERDICT = 0.04;

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerFace(poids: number[]): number {
  let r = Math.random();
  for (let i = 0; i < poids.length - 1; i++) {
    r -= poids[i];
    if (r < 0) return i;
  }
  return poids.length - 1;
}

function simulerDe(n: number, poids: number[]): number[] {
  const effectifs = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) effectifs[tirerFace(poids)]++;
  return effectifs;
}

function simulerSommes(n: number, poids: number[]): number[] {
  const effectifs = new Array<number>(11).fill(0);
  for (let i = 0; i < n; i++) effectifs[tirerFace(poids) + tirerFace(poids)]++;
  return effectifs;
}

const UNIFORME = [1, 1, 1, 1, 1, 1].map((x) => x / 6);

function poidsCharge(face: number, w: number): number[] {
  return [1, 2, 3, 4, 5, 6].map((k) => (k === face ? w : (1 - w) / 5));
}

/** Nombre de nouveaux essais de l'écran 4 : un multiple de n (l'effectif attendu est alors entier,
 * avec le modèle comme avec la fréquence exacte), au plus `max`. */
function tirerNouveauxEssais(n: number, max: number): number {
  const multiples = [2, 3, 5, 10].filter((m) => m * n <= max);
  return tirerParmi(multiples.length > 0 ? multiples : [2]) * n;
}

/** Verdict NET d'un écart relatif par rapport au seuil (null : trop près du seuil). */
function cote(ecart: number, seuil: number): "sous" | "dessus" | null {
  if (ecart <= seuil - MARGE_VERDICT) return "sous";
  if (ecart >= seuil + MARGE_VERDICT) return "dessus";
  return null;
}

/** f exactement égale à p (alors « f ≠ p » serait faux) : écarté, pour que le piège de l'écran 3
 * (« f n'est pas exactement p, donc… ») reste une erreur de raisonnement et non une contre-vérité. */
function frequenceEgaleModele(ex: ExerciceFrequenceProbabilite): boolean {
  return Math.abs(frequenceObservee(ex) - probabiliteModele(ex)) < 1e-12;
}

// ---------------------------------------------------------------------------------------------
// Famille A — un dé.
// ---------------------------------------------------------------------------------------------

export const N_FAMILLE_A = [60, 300, 600, 1200] as const;

const POIDS_TRUQUE: Record<number, number> = { 60: 0.45, 300: 0.34, 600: 0.3, 1200: 0.27 };

function evenementsDe(): EvenementDe[] {
  return [
    ...[1, 2, 3, 4, 5, 6].map((k) => ({ faces: [k], libelle: `obtenir un ${k}` })),
    { faces: [2, 4, 6], libelle: "obtenir un nombre pair" },
    { faces: [1, 3, 5], libelle: "obtenir un nombre impair" },
    { faces: [3, 6], libelle: "obtenir un multiple de 3" },
    { faces: [5, 6], libelle: "obtenir au moins 5" },
    { faces: [1, 2], libelle: "obtenir au plus 2" },
  ];
}

export function construireFamilleA(truque: boolean, nForce?: number): ExerciceFrequenceA {
  for (let essai = 0; ; essai++) {
    const n = nForce ?? tirerParmi(N_FAMILLE_A);
    const tous = evenementsDe();
    let evenement: EvenementDe;
    let poids: number[];
    if (truque) {
      // Le dé est chargé sur une face de l'événement (au plus deux faces : avec trois faces, la
      // surcharge se dilue sous le seuil). Après 30 essais infructueux : charge plus forte.
      const face = 1 + Math.floor(Math.random() * 6);
      evenement = tirerParmi(tous.filter((e) => e.faces.length <= 2 && e.faces.includes(face)));
      poids = poidsCharge(face, essai < 30 ? POIDS_TRUQUE[n] ?? 0.3 : 0.5);
    } else {
      const taille = tirerParmi([1, 2, 3]);
      evenement = tirerParmi(tous.filter((e) => e.faces.length === taille));
      poids = UNIFORME;
    }
    for (let sim = 0; sim < 40; sim++) {
      const ex: ExerciceFrequenceA = { famille: "A", n, evenement, effectifs: simulerDe(n, poids), truque, nouveauxEssais: tirerNouveauxEssais(n, 6000) };
      if (frequenceEgaleModele(ex)) continue;
      if (cote(ecartRelatif(frequenceObservee(ex), probabiliteModele(ex)), seuilRelatif(n)) === (truque ? "dessus" : "sous")) return ex;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Famille B — somme de deux dés.
// ---------------------------------------------------------------------------------------------

export const N_FAMILLE_B = [720, 1800, 3600] as const;

/** Événements dont la probabilité (5/36 ou 6/36) est assez grande pour que la règle soit fiable, et
 * assez éloignée de celle du modèle naïf (11 sommes équiprobables) pour que les deux modèles se
 * départagent. */
const EVENEMENTS_SOMME: EvenementSomme[] = [
  { sommes: [6], libelle: "la somme vaut 6" },
  { sommes: [7], libelle: "la somme vaut 7" },
  { sommes: [8], libelle: "la somme vaut 8" },
  { sommes: [10, 11, 12], libelle: "la somme vaut au moins 10" },
  { sommes: [2, 3, 4], libelle: "la somme vaut au plus 4" },
];

/** Dés truqués : les DEUX dés chargés sur 6 (« au plus 4 » devient rare) ou sur 1 (« au moins 10 »
 * devient rare) — les seuls couples (événement, charge) où la fréquence s'éloigne nettement des DEUX
 * modèles (grille et sommes équiprobables). */
const TRUCAGES_B: { evenement: EvenementSomme; face: number }[] = [
  { evenement: EVENEMENTS_SOMME[4], face: 6 },
  { evenement: EVENEMENTS_SOMME[3], face: 1 },
];

export function construireFamilleB(truque: boolean, nForce?: number): ExerciceFrequenceB {
  for (;;) {
    const n = nForce ?? tirerParmi(N_FAMILLE_B);
    const trucage = truque ? tirerParmi(TRUCAGES_B) : null;
    const evenement = trucage ? trucage.evenement : tirerParmi(EVENEMENTS_SOMME);
    const poids = trucage ? poidsCharge(trucage.face, 0.3) : UNIFORME;
    for (let sim = 0; sim < 40; sim++) {
      const ex: ExerciceFrequenceB = { famille: "B", n, evenement, effectifs: simulerSommes(n, poids), truque, nouveauxEssais: tirerNouveauxEssais(n, 7200) };
      if (frequenceEgaleModele(ex)) continue;
      const f = frequenceObservee(ex);
      const s = seuilRelatif(n);
      const grille = cote(ecartRelatif(f, probabiliteModele(ex)), s);
      const naive = cote(ecartRelatif(f, probabiliteNaiveB(ex) as number), s);
      if (naive === "dessus" && grille === (truque ? "dessus" : "sous")) return ex;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Famille C — objet sans modèle a priori.
// ---------------------------------------------------------------------------------------------

export const N_FAMILLE_C = [60, 300, 600, 1200] as const;

const OBJETS_C: { objet: ObjetC; pMin: number; pMax: number }[] = [
  { objet: { id: "punaise", nom: "une punaise", sujet: "la punaise", issue: "pointe en l'air", autreIssue: "sur le côté" }, pMin: 0.55, pMax: 0.7 },
  { objet: { id: "capsule", nom: "une capsule de bouteille", sujet: "la capsule", issue: "face creuse vers le haut", autreIssue: "face creuse vers le bas" }, pMin: 0.35, pMax: 0.45 },
  { objet: { id: "gobelet", nom: "un gobelet en plastique", sujet: "le gobelet", issue: "couché sur le côté", autreIssue: "debout ou à l'envers" }, pMin: 0.7, pMax: 0.82 },
  { objet: { id: "bouchon", nom: "un bouchon de liège", sujet: "le bouchon", issue: "debout", autreIssue: "couché" }, pMin: 0.12, pMax: 0.2 },
];

export const AFFIRMATIONS_C: AffirmationC[] = [
  { num: 1, den: 2, texte: "une fois sur deux" },
  { num: 1, den: 3, texte: "une fois sur trois" },
  { num: 2, den: 3, texte: "deux fois sur trois" },
  { num: 1, den: 4, texte: "une fois sur quatre" },
  { num: 3, den: 4, texte: "trois fois sur quatre" },
  { num: 1, den: 5, texte: "une fois sur cinq" },
  { num: 2, den: 5, texte: "deux fois sur cinq" },
  { num: 3, den: 5, texte: "trois fois sur cinq" },
  { num: 1, den: 10, texte: "une fois sur dix" },
];

export function construireFamilleC(compatible: boolean, nForce?: number, objetForce?: ObjetC["id"]): ExerciceFrequenceC {
  for (;;) {
    const n = nForce ?? tirerParmi(N_FAMILLE_C);
    const choix = objetForce ? OBJETS_C.find((o) => o.objet.id === objetForce) ?? OBJETS_C[0] : tirerParmi(OBJETS_C);
    const p = Math.round((choix.pMin + Math.random() * (choix.pMax - choix.pMin)) * 100) / 100;
    let effectif = 0;
    for (let i = 0; i < n; i++) if (Math.random() < p) effectif++;
    const f = effectif / n;
    const s = seuilRelatif(n);
    // Affirmations NETTEMENT du bon côté du seuil, des plus proches aux plus lointaines : on garde les
    // plus vraisemblables (une affirmation absurde n'apprend rien), avec « une fois sur deux » — le
    // réflexe « deux issues, donc 1/2 » — mise en avant quand elle convient.
    const candidates = AFFIRMATIONS_C.filter((a) => effectif * a.den !== a.num * n && cote(ecartRelatif(f, a.num / a.den), s) === (compatible ? "sous" : "dessus")).sort(
      (a, b) => ecartRelatif(f, a.num / a.den) - ecartRelatif(f, b.num / b.den),
    );
    if (candidates.length === 0) continue;
    const moitie = candidates.find((a) => a.den === 2);
    const affirmation = moitie && Math.random() < 0.5 ? moitie : tirerParmi(candidates.slice(0, compatible ? 3 : 2));
    return { famille: "C", n, objet: choix.objet, effectif, affirmation, nouveauxEssais: tirerNouveauxEssais(n, 6000) };
  }
}

// ---------------------------------------------------------------------------------------------
// Point d'entrée, catalogue (sélecteur de variante ET adaptateur papier).
// ---------------------------------------------------------------------------------------------

export function genererExerciceFrequenceProbabilite(): ExerciceFrequenceProbabilite {
  const famille = tirerParmi(["A", "B", "C"] as const);
  if (famille === "A") return construireFamilleA(Math.random() < 0.5);
  if (famille === "B") return construireFamilleB(Math.random() < 1 / 3);
  return construireFamilleC(Math.random() < 0.5);
}

export type IdVarianteFrequenceProbabilite = "A-equilibre" | "A-truque" | "B-grille" | "B-truque" | "C-compatible" | "C-incompatible";

export const CATALOGUE_VARIANTES: { id: IdVarianteFrequenceProbabilite; label: string }[] = [
  { id: "A-equilibre", label: "A — dé, résultats compatibles avec un dé équilibré" },
  { id: "A-truque", label: "A — dé truqué (écart au-delà du seuil)" },
  { id: "B-grille", label: "B — somme de deux dés, modèle de la grille confirmé" },
  { id: "B-truque", label: "B — somme de deux dés truqués (aucun modèle)" },
  { id: "C-compatible", label: "C — objet sans modèle, affirmation compatible" },
  { id: "C-incompatible", label: "C — objet sans modèle, affirmation contredite" },
];

export function construireAvecVarianteId(id: IdVarianteFrequenceProbabilite): ExerciceFrequenceProbabilite {
  switch (id) {
    case "A-equilibre":
      return construireFamilleA(false);
    case "A-truque":
      return construireFamilleA(true);
    case "B-grille":
      return construireFamilleB(false);
    case "B-truque":
      return construireFamilleB(true);
    case "C-compatible":
      return construireFamilleC(true);
    case "C-incompatible":
      return construireFamilleC(false);
  }
}

/** Réexport pratique pour l'interface (cases de la grille). */
export { couplesDeSomme };
