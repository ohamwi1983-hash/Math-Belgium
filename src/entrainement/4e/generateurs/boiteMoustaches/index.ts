/**
 * Couche A — "Boîte à moustaches" (chapitre 5, septième et dernier générateur du chapitre). N'importe
 * que la banque de contextes déjà partagée pour "Inégalité de Bienaymé-Tchebychev"
 * (`generateurs/bienaymeTchebychev/contextes.ts`, import générateur→générateur, explicitement
 * autorisé — voir CLAUDE.md, `promptgen36modifications.md`) ; sinon totalement indépendant.
 */
import type {
  CinqNombres,
  ExerciceBoiteMoustaches,
  ExerciceBoiteMoustachesComparaison,
  ExerciceBoiteMoustachesConstruction,
  ExerciceBoiteMoustachesLecture,
  VarianteBoiteMoustaches,
} from "../../core/boiteMoustaches.types";
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { randomInt } from "./aleatoire";

const ECART_MIN = 1;
const ECART_MAX = 4;
const MARGE_AXE = 2;
const MAX_TENTATIVES = 500;

/**
 * Fenêtre (en unités de données) dans laquelle le minimum de la SECONDE série de la variante
 * "comparaison" est tiré autour du minimum de la première (`promptgen36fixmafsechelle.md`, point 2
 * du diagnostic empirique en navigateur) — jamais la plage `[basPlage,hautPlage]` entière comme
 * `construireCinqNombres` seule le ferait par défaut. Sans cette fenêtre, 2 séries tirées
 * INDÉPENDAMMENT dans un contexte à plage large ou moyenne (ex. `smartphones — €`, largeur 1000 —
 * l'un des 3 contextes représentatifs explicitement demandés) atterrissent quasi systématiquement
 * aux deux extrémités opposées de `bornePlage` (chacune une série de 4 à 16 unités de large, une
 * fraction dérisoire de l'écart pouvant les séparer) — confirmé empiriquement sur 5 tirages
 * consécutifs (générateur RÉEL, pas un exemple synthétique) avant tout correctif : les labels "A"/
 * "B" tombaient systématiquement à moins de 15px des deux bords du graphe, chaque boîte réduite à
 * un point. Une fenêtre bornée garantit que les deux séries restent voisines sur l'axe — donc que
 * `bornePlage` (déjà correctement ancrée sur les vraies données, voir `calculerBornePlage`
 * ci-dessous) reste elle aussi d'une largeur comparable à celle d'une boîte seule, jamais démesurée
 * par un simple écart entre 2 tirages indépendants.
 */
const FENETRE_MIN_COMPARAISON = 10;

/** Largeur minimale garantie de la plage de tirage de `min` — même principe et même étendue
 * historique que "Tableau de fréquences"/"Moyenne pondérée"/"Médiane" (dupliqué, pas importé) :
 * certains contextes de la banque ont un `plageXBar` trop étroit pour y loger les 4 écarts (jusqu'à
 * 16 au total) ET une variation réelle de `min`. 20 suffit toujours : `hautPlage - etendueTotale`
 * reste alors au moins `basPlage + 4`, jamais en dessous de `basPlage`. */
const LARGEUR_MIN_PLAGE = 20;

/** Élargit `[min,max]` symétriquement autour de son centre jusqu'à `largeurMin`, jamais en dessous
 * de 0 — dupliqué (pas importé) dans chaque générateur qui en a besoin. */
function elargirPlage(min: number, max: number, largeurMin: number): [number, number] {
  const largeur = max - min;
  if (largeur >= largeurMin) return [min, max];
  const centre = (min + max) / 2;
  const nouveauMin = Math.max(0, Math.round(centre - largeurMin / 2));
  return [nouveauMin, nouveauMin + largeurMin];
}

/**
 * `ancreMin?` (`promptgen36fixmafsechelle.md`) — borne le tirage de `min` à une fenêtre
 * `[ancreMin-FENETRE_MIN_COMPARAISON, ancreMin+FENETRE_MIN_COMPARAISON]` (elle-même toujours
 * reclipée à `[basPlage, hautPlage-etendueTotale]`) plutôt qu'à la plage entière — absent/`undefined`
 * pour `construction`/`lecture` et pour la PREMIÈRE série de `comparaison`, comportement
 * historique inchangé ; fourni uniquement pour la SECONDE série de `comparaison`, ancrée sur le
 * minimum déjà tiré de la première (voir `construireComparaison`).
 */
function construireCinqNombres(contexte: ContexteBienaymeTchebychev, ancreMin?: number): CinqNombres {
  const [basPlage, hautPlage] = elargirPlage(contexte.plageXBar[0], contexte.plageXBar[1], LARGEUR_MIN_PLAGE);
  const g1 = randomInt(ECART_MIN, ECART_MAX);
  const g2 = randomInt(ECART_MIN, ECART_MAX);
  const g3 = randomInt(ECART_MIN, ECART_MAX);
  const g4 = randomInt(ECART_MIN, ECART_MAX);
  const etendueTotale = g1 + g2 + g3 + g4;
  const minMaxAtteignable = Math.max(basPlage, hautPlage - etendueTotale);
  const minBorneBasse = ancreMin === undefined ? basPlage : Math.max(basPlage, ancreMin - FENETRE_MIN_COMPARAISON);
  const minBorneHaute = ancreMin === undefined ? minMaxAtteignable : Math.min(minMaxAtteignable, ancreMin + FENETRE_MIN_COMPARAISON);
  const min = randomInt(minBorneBasse, Math.max(minBorneBasse, minBorneHaute));
  const q1 = min + g1;
  const mediane = q1 + g2;
  const q3 = mediane + g3;
  const max = q3 + g4;
  return { min, q1, mediane, q3, max };
}

function ecartInterquartile(valeurs: CinqNombres): number {
  return valeurs.q3 - valeurs.q1;
}

/**
 * `promptgen36fixmafsechelle.md` — corrige la cause du viewport cassé pour des plages de valeurs
 * grandes ou décalées de zéro (ex. `salariés — €` [2200,4800], `véhicules — km` [30000,180000]) :
 * `bornePlage.min` était auparavant FIGÉ à 0 quelle que soit la magnitude réelle des données —
 * pour une série tirée loin de zéro, la boîte (dont l'étendue reste toujours bornée, `etendueTotale
 * ∈ [ECART_MIN*4, ECART_MAX*4] = [4,16]`, indépendamment du contexte) n'occupait alors qu'une
 * infime fraction du viewport `[0, max+MARGE_AXE]`, apparaissant écrasée en un point collé à une
 * seule graduation — et le grand écart entre 0 et les vraies valeurs forçait `calculerPasGrille` à
 * choisir un pas grossier, faisant chevaucher les labels de graduation entre eux. `minReel` est
 * désormais utilisé au même titre que `maxReel` — même marge `MARGE_AXE` de chaque côté — pour que
 * la plage affichée reste toujours ancrée sur les vraies données, quelle que soit leur magnitude ;
 * `Math.max(0, ...)` reste nécessaire car aucun contexte de la banque n'a de grandeur négative
 * (temps/tailles/prix/distances), mais rien n'empêche mathématiquement `minReel-MARGE_AXE` de
 * descendre sous 0 pour une série dont le minimum est déjà proche de 0.
 */
function calculerBornePlage(minReel: number, maxReel: number): { min: number; max: number } {
  return { min: Math.max(0, minReel - MARGE_AXE), max: maxReel + MARGE_AXE };
}

function tirerContexte(): ContexteBienaymeTchebychev {
  return CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
}

function construireConstruction(contexte: ContexteBienaymeTchebychev): ExerciceBoiteMoustachesConstruction {
  const valeurs = construireCinqNombres(contexte);
  return { variante: "construction", contexte, valeurs, bornePlage: calculerBornePlage(valeurs.min, valeurs.max) };
}

function construireLecture(contexte: ContexteBienaymeTchebychev): ExerciceBoiteMoustachesLecture {
  const valeurs = construireCinqNombres(contexte);
  return { variante: "lecture", contexte, valeurs, bornePlage: calculerBornePlage(valeurs.min, valeurs.max) };
}

/**
 * Boucle de secours — garantit médiane ET écart interquartile distincts entre les 2 séries, sans
 * quoi les 2 questions catégorielles de l'écran "comparaison" n'auraient parfois aucune réponse
 * univoque. Les 2 séries partagent TOUJOURS le même `contexte` (`promptgen36modifications.md`,
 * section 1) — jamais deux contextes tirés indépendamment.
 *
 * **`serieB` ancrée sur `serieA.min`** (`promptgen36fixmafsechelle.md`) — sans cet ancrage, 2
 * tirages INDÉPENDANTS de `construireCinqNombres` sur un contexte à plage moyenne/large (ex.
 * `smartphones — €`, largeur 1000) atterrissent presque systématiquement chacun à une extrémité
 * opposée de la plage élargie, rendant `bornePlage` démesurée par rapport à l'étendue propre de
 * chaque série (toujours 4 à 16 unités) — chaque boîte s'écrase alors en un point quasi invisible
 * collé à un bord du graphe, confirmé empiriquement en navigateur (5 tirages consécutifs du **vrai**
 * générateur, jamais un exemple synthétique) avant ce correctif.
 */
function construireComparaison(contexte: ContexteBienaymeTchebychev): ExerciceBoiteMoustachesComparaison {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const serieA = construireCinqNombres(contexte);
    const serieB = construireCinqNombres(contexte, serieA.min);
    if (serieA.mediane === serieB.mediane) continue;
    if (ecartInterquartile(serieA) === ecartInterquartile(serieB)) continue;
    return {
      variante: "comparaison",
      contexte,
      serieA,
      serieB,
      bornePlage: calculerBornePlage(Math.min(serieA.min, serieB.min), Math.max(serieA.max, serieB.max)),
      medianePlusGrande: serieA.mediane > serieB.mediane ? "A" : "B",
      ecartInterquartilePlusGrand: ecartInterquartile(serieA) > ecartInterquartile(serieB) ? "A" : "B",
    };
  }
  throw new Error(`construireComparaison : aucune paire de séries distinctes trouvée après ${MAX_TENTATIVES} tentatives`);
}

export const CATALOGUE_VARIANTES: { id: VarianteBoiteMoustaches; label: string }[] = [
  { id: "construction", label: "Construction (glisser les 5 marqueurs)" },
  { id: "lecture", label: "Lecture (relever les 5 valeurs)" },
  { id: "comparaison", label: "Comparaison de deux séries" },
];

/** Construit un exercice pour une variante forcée (convention CLAUDE.md, "Catalogue de
 * variantes..."). `overrides?.contexte` permet de forcer aussi le contexte narratif — sans lui, un
 * contexte est tiré aléatoirement dans la banque partagée, comme le générateur brut. */
export function construireAvecVarianteId(
  varianteId: VarianteBoiteMoustaches,
  overrides?: { contexte?: ContexteBienaymeTchebychev },
): ExerciceBoiteMoustaches {
  const contexte = overrides?.contexte ?? tirerContexte();
  if (varianteId === "construction") return construireConstruction(contexte);
  if (varianteId === "lecture") return construireLecture(contexte);
  return construireComparaison(contexte);
}

export function genererExerciceBoiteMoustaches(): ExerciceBoiteMoustaches {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
