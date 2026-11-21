import type { AdaptateurFeuilleExercices, CriteresDifficulte, EtapeCorrection, FragmentConsigne } from "./genererFeuilleExercices";
import { decouperLigneCalcul, lignesDepuisChaine } from "./corrigeTableau";
import { membreAuHasard } from "./groupesVerdict";

/**
 * Niveau de difficulté 1–7 (affiché « numéro · catégorie », ex. « 4 · difficile ») et durée PAR EXERCICE — décision de
 * l'utilisateur, remplace les étoiles ★/★★/★★★ (voir `.claude/rules/feuilles-evaluations.md`,
 * section « Niveau de difficulté et durée »).
 *
 * Grille commune, appliquée à l'instance TIRÉE (un même générateur peut donner un niveau 3 et un
 * niveau 5 selon les nombres et la variante) :
 * - Étapes (0/1/2) : étapes « qui transforment » (calcul, raisonnement) de l'instance — jamais les
 *   écrans de pure lecture —, plus une CHARGE pour les étapes au calcul détaillé long (lignes de
 *   calcul du corrigé « comme au tableau », `chargeEtape`) ; 1–2 étapes équivalentes → 0, 3–5 → 1,
 *   6 et plus → 2.
 * - Méthode (0/1/2), Piège (0/1) : jugés par l'adaptateur (`criteresDifficulte`).
 * - Nombres (0/1) : calculatrice, valeur approchée, ln/e/π non remarquables → 1 ; donné par
 *   l'adaptateur, ou détecté sur le corrigé (`nombresDuCorrige`).
 * Niveau = score + 1 (1 à 7). Catégories (décision du 22/11/2026, calées sur la distribution réelle des
 * exercices — niveaux 6 et 7 presque inexistants) : 1 très facile, 2 facile, 3 moyen, 4 difficile,
 * 5 à 7 très difficile (`categorieDuNiveau`, SEULE source du mot affiché partout).
 * Durée (min) = 2 + 2 × étapes équivalentes + 1 × écran de lecture + 1 si Nombres + 2 si Méthode = 2.
 *
 * Adaptateur sans `criteresDifficulte` (chapitres pas encore notés) : conversion PROVISOIRE de ses
 * étoiles (★ → 2, ★★ → 3, ★★★ → 5) et durée = sa constante `dureeMinutes`.
 */

/** Catégorie affichée d'un niveau 1–7 (cinq pas, du plus facile au plus difficile). */
export type CategorieNiveau = "tres-facile" | "facile" | "moyen" | "difficile" | "tres-difficile";

/** Les cinq catégories, dans l'ordre de difficulté (indice 0 → 4 : pas de l'échelle de couleurs). */
export const CATEGORIES_NIVEAU: readonly CategorieNiveau[] = ["tres-facile", "facile", "moyen", "difficile", "tres-difficile"];

export const LIBELLE_CATEGORIE: Record<CategorieNiveau, string> = {
  "tres-facile": "très facile",
  facile: "facile",
  moyen: "moyen",
  difficile: "difficile",
  "tres-difficile": "très difficile",
};

/** Niveaux 1–7 de chaque catégorie (« 5 à 7 » pour très difficile). */
export const PLAGE_CATEGORIE: Record<CategorieNiveau, readonly [number, number]> = {
  "tres-facile": [1, 1],
  facile: [2, 2],
  moyen: [3, 3],
  difficile: [4, 4],
  "tres-difficile": [5, 7],
};

/** Charge d'une étape longue : une étape dont le calcul détaillé dépasse `SEUILS_CHARGE[0]` lignes
 * compte pour 2 étapes, au-delà de `SEUILS_CHARGE[1]` pour 3 (calibrage : voir les règles). */
export const SEUILS_CHARGE: readonly number[] = [9, 15];

export interface CriteresCalcules {
  etapesTransformation: number;
  etapesLecture: number;
  /** Étapes ajoutées par la charge (étapes longues). */
  charge: number;
  etapesEquivalentes: number;
  etapes: 0 | 1 | 2;
  methode: 0 | 1 | 2;
  piege: 0 | 1;
  nombres: 0 | 1;
}

export interface NiveauDifficulte {
  niveau: number;
  categorie: CategorieNiveau;
  score: number;
  /** Absent pour une conversion provisoire d'étoiles. */
  criteres?: CriteresCalcules;
  /** Durée de CET exercice ; absente si l'adaptateur n'en donne aucune. */
  dureeMinutes?: number;
  /** `true` : niveau converti des anciennes étoiles (chapitre pas encore noté). */
  provisoire: boolean;
}

/** Catégorie d'un niveau 1–7 : 1 très facile, 2 facile, 3 moyen, 4 difficile, 5–7 très difficile. Le
 * calcul du niveau (`niveauEtDuree`) n'en dépend pas : seule la catégorie AFFICHÉE en découle. */
export function categorieDuNiveau(niveau: number): CategorieNiveau {
  return niveau <= 1 ? "tres-facile" : niveau === 2 ? "facile" : niveau === 3 ? "moyen" : niveau === 4 ? "difficile" : "tres-difficile";
}

/** Rang 1–5 de la catégorie (pas de l'échelle de couleurs graduée). */
export function rangCategorie(categorie: CategorieNiveau): number {
  return CATEGORIES_NIVEAU.indexOf(categorie) + 1;
}

/** Libellé « numéro · mot » d'un niveau : « 4 · difficile », « 6 · très difficile ». */
export function libelleNiveau(niveau: number): string {
  return `${niveau} · ${LIBELLE_CATEGORIE[categorieDuNiveau(niveau)]}`;
}

/** Libellé d'une plage de niveaux : « 3 · moyen » (une valeur), « 2–4 · facile à difficile », « 5–6 ·
 * très difficile » (même catégorie). */
export function libellePlageNiveaux(min: number, max: number): string {
  if (min === max) return libelleNiveau(min);
  const a = LIBELLE_CATEGORIE[categorieDuNiveau(min)];
  const b = LIBELLE_CATEGORIE[categorieDuNiveau(max)];
  return `${min}–${max} · ${a === b ? a : `${a} à ${b}`}`;
}

/** Morceaux de la légende de l'échelle : « 1 » « très facile », …, « 5 à 7 » « très difficile ». */
export function morceauxLegende(): { categorie: CategorieNiveau; niveaux: string; mot: string }[] {
  return CATEGORIES_NIVEAU.map((c) => {
    const [a, b] = PLAGE_CATEGORIE[c];
    return { categorie: c, niveaux: a === b ? String(a) : `${a} à ${b}`, mot: LIBELLE_CATEGORIE[c] };
  });
}

export function scoreEtapes(etapesEquivalentes: number): 0 | 1 | 2 {
  return etapesEquivalentes <= 2 ? 0 : etapesEquivalentes <= 5 ? 1 : 2;
}

/** Étapes équivalentes d'une étape de `lignes` lignes de calcul (1, 2 ou 3). */
export function chargeEtape(lignes: number, seuils: readonly number[] = SEUILS_CHARGE): number {
  return 1 + seuils.filter((s) => lignes > s).length;
}

const ETIQUETTES_HORS_CALCUL = /m[ée]thode|pi[eè]ge|rappel|remarque|conclusion|condition|v[ée]rification|ce qu.on utilise|r[ée]sultat/i;

/** Lignes de calcul de chaque étape (lettre `sousQuestion`) du corrigé détaillé. Corrigé « comme au
 * tableau » : lignes des blocs `calcul`. Corrigé historique (non typé) : chaque chaîne d'égalités des
 * paragraphes de calcul est éclatée comme au tableau (`lignesDepuisChaine`, une ligne par égalité). */
export function lignesCalculParEtape(etapes: EtapeCorrection[]): Map<string, number> {
  const res = new Map<string, number>();
  for (const e of etapes) {
    if (!e.sousQuestion) continue;
    let n = 0;
    if (e.type) {
      if (e.type === "calcul") n = e.calcul?.length ?? 0;
    } else if (e.calcul) {
      n = e.calcul.length;
    } else if (!ETIQUETTES_HORS_CALCUL.test(e.label ?? "")) {
      for (const f of e.fragments) {
        if (f.type === "latex" && decouperLigneCalcul(f.valeur).droite !== null) n += lignesDepuisChaine(f.valeur).length;
      }
    }
    res.set(e.sousQuestion, (res.get(e.sousQuestion) ?? 0) + n);
  }
  return res;
}

/** Étapes d'une instance lues sur son corrigé détaillé : une étape = une lettre `sousQuestion` (un
 * écran du générateur). `lecture` : lettres des écrans de pure lecture (lire une valeur, un point,
 * une caractéristique sur un graphique ou un tableau ; placer un point). */
export function etapesDuCorrige(etapes: EtapeCorrection[], lecture: readonly string[] = []): Pick<CriteresDifficulte, "etapesTransformation" | "etapesLecture" | "lettresSansCharge"> {
  const lettres = [...new Set(etapes.map((e) => e.sousQuestion).filter((l): l is string => !!l))];
  const lues = lettres.filter((l) => lecture.includes(l));
  // Corrigé sans lettres d'étapes (un seul écran, ex. 6gen19) : une étape.
  return { etapesTransformation: lettres.length ? lettres.length - lues.length : 1, etapesLecture: lues.length, lettresSansCharge: lues };
}

/* ----------------------------------------------------------------------------------------------
 * Nombres : détection sur le corrigé (même règle que l'analyse des cinq chapitres)
 * -------------------------------------------------------------------------------------------- */

function accolade(s: string, i: number): string | null {
  if (s[i] !== "{") return null;
  let n = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") n++;
    else if (s[j] === "}") {
      n--;
      if (n === 0) return s.slice(i + 1, j);
    }
  }
  return null;
}

const sansCommandes = (s: string) => s.replace(/\\(mathrm|text|operatorname)\{[^}]*\}/g, "").replace(/\\[a-zA-Z]+/g, "").replace(/[{}\s]/g, "");

/** Une formule a-t-elle un nombre « non exact » : ≈, ln/log d'un nombre ≠ 1 et ≠ 10, e^(nombre),
 * e seul, et — avec `anglesEnPi` — un angle kπ/n non remarquable (n ∉ {1, 2, 3, 4, 6}). Fractions,
 * radicaux, décimaux exacts et π facteur d'un résultat exact ne comptent pas. */
function formuleNonExacte(latex: string, anglesEnPi: boolean): boolean {
  let s = latex.replace(/\{,\}/g, ",").replace(/\\left|\\right|\\big|\\Big|\\bigg|\\Bigg/g, "").replace(/\\[dt]frac/g, "\\frac");
  s = s.replace(/\\text\{[^}]*\}/g, " ").replace(/\\mathrm\{([^e}][^}]*)\}/g, " ");
  if (anglesEnPi) {
    if (/\\pi/.test(s.replace(/\\frac\{-?\d*\\pi\}\{(2|3|4|6)\}/g, "").replace(/(?<![{\d])-?\d*\\pi(?![}])/g, ""))) return true;
    s = s.replace(/\\frac\{-?\d*\\pi\}\{(2|3|4|6)\}/g, "ANG").replace(/-?\d*\\pi/g, "ANG");
  }
  if (/\\approx|≈/.test(s)) return true;
  const reL = /\\(ln|log)(_\{?\d+\}?)?\s*\(?\s*(\d+(,\d+)?|\\frac\{\d)/g;
  let m: RegExpExecArray | null;
  while ((m = reL.exec(s))) if (m[3] !== "1" && m[3] !== "10") return true;
  if (/\\(ln|log)\s*\(?\s*\\frac\{\d+\}\{\d+\}/.test(s)) return true;
  const reE = /(\\mathrm\{e\}|(?<![a-zA-Z\\])e)\^/g;
  while ((m = reE.exec(s))) {
    const i = m.index + m[0].length;
    const exp = s[i] === "{" ? (accolade(s, i) ?? "") : s[i];
    if (/[a-zA-Z]/.test(sansCommandes(exp ?? ""))) continue;
    if ((exp ?? "").trim() === "0") continue;
    return true;
  }
  return /\\mathrm\{e\}(?!\^)/.test(s);
}

const TYPES_NOMBRES = new Set(["calcul", "resultat"]);

/** Nombres = 1 si la réponse brève ou les lignes Calcul / Résultat du corrigé ont un nombre non
 * exact (`formuleNonExacte`), un « ≈ » / « environ » / « arrondi » écrit, ou si le profil de
 * l'instance exige la calculatrice. */
export function nombresDuCorrige<T>(adaptateur: AdaptateurFeuilleExercices<T>, instance: T, etapes: EtapeCorrection[], anglesEnPi = false): 0 | 1 {
  try {
    if (adaptateur.profilInstance?.(instance).calcul === "calculatrice") return 1;
  } catch {
    /* profil indisponible */
  }
  const latexs: string[] = [];
  const textes: string[] = [];
  const ranger = (f: FragmentConsigne) => (f.type === "latex" ? latexs : textes).push(f.valeur ?? "");
  (adaptateur.reponseBreve?.(instance) ?? []).forEach(ranger);
  const types = etapes.some((e) => e.type);
  for (const e of etapes) {
    if (types ? !TYPES_NOMBRES.has(e.type ?? "") : /m[ée]thode|rappel|formule|pi[eè]ge|utilise/i.test(e.label ?? "")) continue;
    e.fragments.forEach(ranger);
    for (const l of e.calcul ?? []) latexs.push(l.latex ?? "");
  }
  if (latexs.some((l) => formuleNonExacte(l, anglesEnPi))) return 1;
  return textes.some((t) => /≈|environ|arrondi/.test(t)) ? 1 : 0;
}

/* ----------------------------------------------------------------------------------------------
 * Niveau et durée d'une instance
 * -------------------------------------------------------------------------------------------- */

const CONVERSION_ETOILES: Record<1 | 2 | 3, number> = { 1: 2, 2: 3, 3: 5 };

/** Calcul complet à partir des critères (exposé pour les tests et les collecteurs). */
export function niveauDepuisCriteres(c: CriteresDifficulte, lignes: Map<string, number>, nombres: 0 | 1, seuils: readonly number[] = SEUILS_CHARGE): Omit<NiveauDifficulte, "provisoire"> {
  const sansCharge = new Set(c.sansCharge ? [...lignes.keys()] : (c.lettresSansCharge ?? []));
  const parEtape = new Map(lignes);
  for (const [lettre, n] of Object.entries(c.lignesMinimales ?? {})) parEtape.set(lettre, Math.max(n, parEtape.get(lettre) ?? 0));
  let charge = 0;
  for (const [lettre, n] of parEtape) if (!sansCharge.has(lettre)) charge += chargeEtape(n, seuils) - 1;
  const etapesEquivalentes = c.etapesTransformation + charge;
  const criteres: CriteresCalcules = {
    etapesTransformation: c.etapesTransformation,
    etapesLecture: c.etapesLecture,
    charge,
    etapesEquivalentes,
    etapes: scoreEtapes(etapesEquivalentes),
    methode: c.methode,
    piege: c.piege,
    nombres,
  };
  const score = criteres.etapes + criteres.methode + criteres.piege + criteres.nombres;
  const niveau = score + 1;
  const dureeMinutes = 2 + 2 * etapesEquivalentes + c.etapesLecture + nombres + (c.methode === 2 ? 2 : 0);
  return { niveau, categorie: categorieDuNiveau(niveau), score, criteres, dureeMinutes };
}

/** Niveau, catégorie, critères et durée de l'instance tirée — `undefined` si l'adaptateur n'a ni
 * critères ni étoiles (rien n'est alors affiché). */
export function niveauEtDuree<T>(adaptateur: AdaptateurFeuilleExercices<T>, instance: T): NiveauDifficulte | undefined {
  if (adaptateur.criteresDifficulte) {
    const c = adaptateur.criteresDifficulte(instance);
    const etapes = adaptateur.correctionDetaillee?.(instance) ?? [];
    const nombres = c.nombres ?? nombresDuCorrige(adaptateur, instance, etapes, c.anglesEnPi);
    return { ...niveauDepuisCriteres(c, lignesCalculParEtape(etapes), nombres), provisoire: false };
  }
  const etoiles = adaptateur.difficulte?.(instance);
  if (!etoiles) return undefined;
  // Conversion PROVISOIRE (chapitre pas encore noté).
  const niveau = CONVERSION_ETOILES[etoiles];
  return { niveau, categorie: categorieDuNiveau(niveau), score: niveau - 1, dureeMinutes: adaptateur.dureeMinutes, provisoire: true };
}

/** Durée d'une instance : celle de la grille si l'adaptateur est noté, sinon sa constante. */
export function dureeInstance<T>(adaptateur: AdaptateurFeuilleExercices<T>, instance: T): number | undefined {
  return adaptateur.criteresDifficulte ? niveauEtDuree(adaptateur, instance)?.dureeMinutes : adaptateur.dureeMinutes;
}

/* ----------------------------------------------------------------------------------------------
 * Estimation par variante, avant tout tirage réel (panneau de conception)
 * -------------------------------------------------------------------------------------------- */

/** Niveau (plage) et durée d'un exercice d'une variante, estimés sur quelques tirages. */
export interface EstimationVariante {
  /** Durée moyenne d'UN exercice (min) ; chapitre pas encore noté : constante `dureeMinutes`. */
  dureeMinutes?: number;
  /** Plus petit et plus grand niveau des tirages (absents si l'adaptateur n'a ni critères ni étoiles). */
  niveauMin?: number;
  niveauMax?: number;
  /** `true` : niveau converti des anciennes étoiles (chapitre pas encore noté). */
  provisoire: boolean;
  /** Nombre de tirages retenus. */
  tirages: number;
  /** `false` : aucun tirage ne respectait le filtre (réglages de la rangée) dans le budget — estimation
   * faite sur des tirages libres de la variante. */
  filtreRespecte: boolean;
}

/** Réglages de la rangée : `filtre` garde les instances que le moteur pourrait tirer (évaluation :
 * exercice complet, paramètres décochés absents, calculatrice), `cleFiltre` l'identifie dans le cache. */
export interface OptionsEstimation<T> {
  filtre?: (instance: T) => boolean;
  cleFiltre?: string;
}

const cacheEstimations = new WeakMap<object, Map<string, EstimationVariante | undefined>>();
const TIRAGES_ESTIMATION = 6;
/** Recherche d'instances qui respectent le filtre : au plus ce nombre d'essais et ce budget (ms). */
const ESSAIS_FILTRE = 4000;
const BUDGET_FILTRE_MS = 80;

function cleEstimation(varianteId: string | null | undefined, cleFiltre: string | undefined): string {
  return `${varianteId ?? ""}|${cleFiltre ?? ""}`;
}

function tirerPourEstimation<T>(adaptateur: AdaptateurFeuilleExercices<T>, varianteId: string | null | undefined): T {
  // Rangée d'un groupe « à verdict » (panneau d'évaluation) : un membre au hasard à chaque tirage.
  const id = varianteId ? membreAuHasard(adaptateur, varianteId) : varianteId;
  return id && adaptateur.genererInstanceAvecVariante ? adaptateur.genererInstanceAvecVariante(id) : adaptateur.genererInstance();
}

/** Estimation déjà calculée (`null` si elle ne l'est pas encore) — lecture seule, ne tire rien : le
 * panneau l'affiche tout de suite et ne calcule que les rangées visibles, plus tard (`estimationVariante`). */
export function estimationEnCache<T>(adaptateur: AdaptateurFeuilleExercices<T>, varianteId: string | null | undefined, cleFiltre?: string): EstimationVariante | undefined | null {
  const cache = cacheEstimations.get(adaptateur);
  const cle = cleEstimation(varianteId, cleFiltre);
  return cache?.has(cle) ? cache.get(cle) : null;
}

/** Niveau (plus petit et plus grand) et durée moyenne d'un exercice d'une variante (tirage libre si
 * `varianteId` est vide) : `niveauEtDuree` sur `TIRAGES_ESTIMATION` tirages — les mêmes fonctions que
 * la feuille imprimée —, mis en cache par adaptateur, variante et réglages. Avec `options.filtre`,
 * seules les instances qui le respectent comptent (recherche bornée : `ESSAIS_FILTRE` essais,
 * `BUDGET_FILTRE_MS` ms) ; si aucune ne le respecte, tirages libres (`filtreRespecte: false`).
 * `undefined` : ni critères, ni étoiles, ni durée (rien à afficher). */
export function estimationVariante<T>(adaptateur: AdaptateurFeuilleExercices<T>, varianteId?: string | null, options?: OptionsEstimation<T>): EstimationVariante | undefined {
  let cache = cacheEstimations.get(adaptateur);
  if (!cache) cacheEstimations.set(adaptateur, (cache = new Map()));
  const cle = cleEstimation(varianteId, options?.filtre ? options.cleFiltre : undefined);
  if (cache.has(cle)) return cache.get(cle);

  const retenues: T[] = [];
  let filtreRespecte = true;
  if (options?.filtre) {
    const fin = Date.now() + BUDGET_FILTRE_MS;
    for (let essai = 0; essai < ESSAIS_FILTRE && retenues.length < TIRAGES_ESTIMATION && (essai < TIRAGES_ESTIMATION || Date.now() < fin); essai++) {
      try {
        const instance = tirerPourEstimation(adaptateur, varianteId);
        if (options.filtre(instance)) retenues.push(instance);
      } catch {
        break;
      }
    }
    filtreRespecte = retenues.length > 0;
  }
  if (retenues.length === 0) {
    for (let i = 0; i < TIRAGES_ESTIMATION; i++) {
      try {
        retenues.push(tirerPourEstimation(adaptateur, varianteId));
      } catch {
        /* tirage impossible : ignoré */
      }
    }
  }

  let total = 0;
  let nDurees = 0;
  let niveauMin: number | undefined;
  let niveauMax: number | undefined;
  let provisoire = false;
  for (const instance of retenues) {
    let n: NiveauDifficulte | undefined;
    try {
      n = niveauEtDuree(adaptateur, instance);
    } catch {
      continue;
    }
    if (!n) continue;
    provisoire ||= n.provisoire;
    niveauMin = niveauMin === undefined ? n.niveau : Math.min(niveauMin, n.niveau);
    niveauMax = niveauMax === undefined ? n.niveau : Math.max(niveauMax, n.niveau);
    // Même règle que `dureeInstance` : durée de la grille si noté, sinon la constante.
    const d = adaptateur.criteresDifficulte ? n.dureeMinutes : adaptateur.dureeMinutes;
    if (d !== undefined) {
      total += d;
      nDurees++;
    }
  }
  const dureeMinutes = nDurees ? total / nDurees : adaptateur.dureeMinutes;
  const valeur: EstimationVariante | undefined =
    dureeMinutes === undefined && niveauMin === undefined
      ? undefined
      : { dureeMinutes, niveauMin, niveauMax, provisoire: provisoire || !adaptateur.criteresDifficulte, tirages: retenues.length, filtreRespecte };
  cache.set(cle, valeur);
  return valeur;
}

/** Durée ESTIMÉE d'un exercice d'une variante (ou d'un tirage libre si `varianteId` est vide), avant
 * tout tirage réel — panneau de conception : moyenne de quelques tirages, en cache, partagée avec le
 * repère « niv. · ≈ min » de la rangée (`estimationVariante`, mêmes réglages). Chapitre pas encore
 * noté : constante `dureeMinutes` (sans tirage). */
export function dureeEstimeeVariante<T>(adaptateur: AdaptateurFeuilleExercices<T>, varianteId?: string | null, options?: OptionsEstimation<T>): number | undefined {
  if (!adaptateur.criteresDifficulte) return adaptateur.dureeMinutes;
  return estimationVariante(adaptateur, varianteId, options)?.dureeMinutes;
}
