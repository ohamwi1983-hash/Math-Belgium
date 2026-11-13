import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { Composantes, Point } from "../core/vecteur.types";
import type { Deplacement, Direction, ExerciceDeplacementsSuccessifs, SituationDeplacements } from "../core/deplacementsSuccessifs.types";
import {
  carreNorme,
  composantes,
  distanceArrondie,
  ecrans,
  estDiagonale,
  nomArrivee,
  nomCible,
  simplifierRacine,
  total,
  vecteurCible,
  vecteurDistance,
  vecteurRetour,
  vecteursDeplacements,
  type Ecran,
} from "../moteur/modeleDeplacementsSuccessifs";
import type { StatutComposantes, StatutDistance, StatutK, StatutVecteur } from "../moteur/verificationDeplacementsSuccessifs";

/**
 * Textes de gen86 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; signe moins typographique (KaTeX). Les aides se terminent par « : »
 * suivi de la formule, et laissent toujours un calcul à faire.
 */

// ---------------------------------------------------------------------------------------------
// Nombres, vecteurs
// ---------------------------------------------------------------------------------------------

/** Nombre en LaTeX : virgule décimale, milliers séparés au-delà de 9 999 (130 000). */
export function nombreLatex(n: number): string {
  const v = Math.round(n * 1e6) / 1e6;
  const s = String(v === 0 ? 0 : v);
  const [ent, dec] = s.split(".");
  const signe = ent!.startsWith("-") ? "-" : "";
  const chiffres = ent!.replace("-", "");
  const groupe = chiffres.length > 4 ? chiffres.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : chiffres;
  return `${signe}${groupe}${dec ? `{,}${dec}` : ""}`;
}

/** Nombre en texte brut : virgule décimale, « − » typographique, espace des milliers. */
export function nombreTexte(n: number): string {
  return nombreLatex(n).replace(/\\,/g, " ").replace("{,}", ",").replace("-", "−");
}

function entreParentheses(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

export function colonneLatex(v: Composantes): string {
  return `\\begin{pmatrix} ${nombreLatex(v.x)} \\\\ ${nombreLatex(v.y)} \\end{pmatrix}`;
}

export function pointLatex(nom: string, p: Point): string {
  return `${nom}(${nombreLatex(p.x)}\\,;\\,${nombreLatex(p.y)})`;
}

export function vecteurU(i: number): string {
  return `\\vec{u}_{${i}}`;
}

export function vecteurNom(nom: string): string {
  return `\\vec{${nom}}`;
}

export function uniteTexte(situation: SituationDeplacements): string {
  return situation === "tresor" ? "pas" : situation === "randonnee" ? "km" : "m";
}

// ---------------------------------------------------------------------------------------------
// Instructions
// ---------------------------------------------------------------------------------------------

const DIRECTIONS: Record<Direction, string> = {
  E: "vers l'est",
  O: "vers l'ouest",
  N: "vers le nord",
  S: "vers le sud",
  NE: "en diagonale vers le nord-est",
  NO: "en diagonale vers le nord-ouest",
  SE: "en diagonale vers le sud-est",
  SO: "en diagonale vers le sud-ouest",
};

export function instructionTexte(situation: SituationDeplacements, d: Deplacement): string {
  return `${nombreTexte(d.longueur)} ${uniteTexte(situation)} ${DIRECTIONS[d.direction]}`;
}

/** Une ligne par instruction (« 1. 4 pas vers l'est ; », « Étape 1 : 5 km vers le nord ; »). */
export function listeInstructions(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[][] {
  const n = e.deplacements.length;
  return e.deplacements.map((d, i) => {
    const debut = e.situation === "randonnee" ? `Étape ${i + 1} : ` : `${i + 1}. `;
    return [texte(`${debut}${instructionTexte(e.situation, d)}${i === n - 1 ? "." : " ;"}`)];
  });
}

/** Description du grand pas w en mots (« 2 pas vers l'est puis 1 pas vers le sud »). */
export function descriptionGrandPas(w: Composantes): string {
  const x = `${Math.abs(w.x)} pas ${w.x > 0 ? "vers l'est" : "vers l'ouest"}`;
  const y = `${Math.abs(w.y)} pas ${w.y > 0 ? "vers le nord" : "vers le sud"}`;
  return `${x} puis ${y}`;
}

function aUneDiagonale(e: ExerciceDeplacementsSuccessifs): boolean {
  return e.deplacements.some((d) => estDiagonale(d.direction));
}

/** Phrase d'introduction (avant la liste). */
export function introFragments(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  if (e.situation === "tresor") {
    if (e.question === "repetition") {
      return [texte("Sur une vieille carte, un pirate a noté le chemin vers son trésor. Depuis le grand chêne D (le départ), il faut d'abord suivre ces instructions jusqu'au rocher R :")];
    }
    return [texte("Sur une vieille carte, un pirate a noté le chemin à suivre depuis le grand chêne D, son point de départ :")];
  }
  if (e.situation === "randonnee") return [texte(`Une randonneuse part du parking D. Son parcours comporte ${e.deplacements.length} étapes :`)];
  return [texte("Un drone de livraison décolle de l'entrepôt D. Il survole les rues d'un quartier quadrillé, toutes orientées est-ouest ou nord-sud :")];
}

/** Ce qui suit la liste : point d'arrivée, cible, grand pas. */
export function suiteFragments(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  const cible = e.cible;
  if (e.situation === "tresor") {
    if (e.question === "repetition" && e.pas && cible) {
      return [
        texte("Ensuite, depuis le rocher, il faut répéter le même grand pas "),
        latex("\\vec{w}"),
        texte(` (${descriptionGrandPas(e.pas)}) jusqu'au trésor, marqué d'une croix sur la carte en `),
        latex(pointLatex("T", cible)),
        texte("."),
      ];
    }
    return [texte("Il arrive alors au point A. Pour rentrer, il veut revenir au chêne en ligne droite.")];
  }
  if (e.situation === "randonnee") {
    if (e.question === "dernier" && cible) {
      return [texte("Elle arrive alors au point P. Le refuge où elle veut passer la nuit se trouve en "), latex(pointLatex("C", cible)), texte(" ; elle le rejoint en ligne droite depuis P.")];
    }
    return [texte("À la fin de la dernière étape, elle est au point A. Pour rentrer, elle coupe à travers champs, en ligne droite, jusqu'au parking.")];
  }
  if (e.question === "dernier" && cible) {
    return [texte("Il est alors au point P. Le client habite en "), latex(pointLatex("C", cible)), texte(" : depuis P, le drone vole en ligne droite jusqu'à lui.")];
  }
  return [texte("Il est alors au point A. Pour rentrer, il vole en ligne droite jusqu'à l'entrepôt.")];
}

/** Repère, unité, notation des déplacements (et sens d'un pas en diagonale). */
export function repereFragments(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  const unite =
    e.situation === "tresor" ? "1 pas (un côté de case)" : e.situation === "randonnee" ? "1 km (un côté de case)" : "1 m (un côté de case mesure 100 m)";
  const noms = e.deplacements.map((_, i) => vecteurU(i + 1)).join(", ");
  const diag = aUneDiagonale(e)
    ? [texte(" Un pas en diagonale traverse une case d'un coin à l'autre : vers le nord-est, par exemple, il avance d'une case vers l'est et d'une case vers le nord en même temps.")]
    : [];
  return [texte(`Repère : origine en D, axe x vers l'est, axe y vers le nord, unité : ${unite}. On note `), latex(noms), texte(" les déplacements successifs."), ...diag];
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans (une par écran ; les mêmes servent de titres « Étape n » au corrigé)
// ---------------------------------------------------------------------------------------------

export function nomDistance(e: ExerciceDeplacementsSuccessifs): string {
  return e.question === "retour" ? "DA" : `${nomArrivee(e)}${nomCible(e)}`;
}

export function vecteurDistanceLatex(e: ExerciceDeplacementsSuccessifs): string {
  return vecteurNom(nomDistance(e));
}

export function vecteurTotalLatex(e: ExerciceDeplacementsSuccessifs): string {
  return vecteurNom(`D${nomArrivee(e)}`);
}

export function vecteurCibleLatex(e: ExerciceDeplacementsSuccessifs): string {
  return vecteurNom(`${nomArrivee(e)}${nomCible(e) ?? ""}`);
}

function precisionPhrase(e: ExerciceDeplacementsSuccessifs): string {
  if (e.precision === "exacte") return "Donne la valeur exacte.";
  return e.situation === "tresor" ? "Arrondis au dixième de pas." : e.situation === "randonnee" ? "Arrondis au dixième de kilomètre." : "Arrondis au mètre.";
}

export function consigneEcran(e: ExerciceDeplacementsSuccessifs, ecran: Ecran): FragmentConsigne[] {
  const A = nomArrivee(e);
  switch (ecran) {
    case "traduire":
      return [texte("Traduis chaque déplacement en vecteur : donne ses composantes dans le repère.")];
    case "total": {
      const lieu = e.question === "repetition" ? "le rocher R" : `le point ${A}`;
      return [texte("Calcule les composantes du déplacement total "), latex(vecteurTotalLatex(e)), texte(` : où se trouve ${lieu} par rapport au départ ?`)];
    }
    case "distance": {
      if (e.question === "retour") return [texte("À vol d'oiseau, à quelle distance du départ le point A se trouve-t-il ? " + precisionPhrase(e))];
      if (e.question === "repetition") return [texte("À vol d'oiseau, quelle distance sépare le rocher R du trésor T ? " + precisionPhrase(e))];
      const qui = e.situation === "randonnee" ? "Quelle distance la randonneuse parcourt-elle en ligne droite de P jusqu'au refuge C ? " : "Quelle distance le drone parcourt-il en ligne droite de P jusqu'au client C ? ";
      return [texte(qui + precisionPhrase(e))];
    }
    case "retour":
      return [texte("Quel déplacement "), latex("\\vec{AD}"), texte(" ramène directement au départ ? Donne ses composantes.")];
    case "cible":
      if (e.question === "repetition") return [texte("Calcule les composantes de "), latex("\\vec{RT}"), texte(", du rocher au trésor.")];
      return [texte("Quel dernier déplacement "), latex("\\vec{PC}"), texte(e.situation === "randonnee" ? " mène de P au refuge C ? Donne ses composantes." : " mène de P au client C ? Donne ses composantes.")];
    case "k":
      return [texte("Combien de fois faut-il répéter le grand pas "), latex("\\vec{w}"), texte(" pour aller du rocher au trésor ?")];
  }
}

export function consignesEcrans(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[][] {
  return ecrans(e).map((ecran) => consigneEcran(e, ecran));
}

const TITRES: Record<Ecran, string> = {
  traduire: "Chaque déplacement en vecteur",
  total: "Le déplacement total",
  distance: "La distance à vol d'oiseau",
  retour: "Le vecteur de retour",
  cible: "Le dernier déplacement",
  k: "Combien de grands pas ?",
};

export function titresEcrans(e: ExerciceDeplacementsSuccessifs): string[] {
  return ecrans(e).map((ecran) => (ecran === "cible" && e.question === "repetition" ? "Du rocher au trésor" : TITRES[ecran]));
}

/** Questions papier : les VRAIES questions distinctes (position, puis question propre, puis distance
 * ou retour) ; la traduction des instructions est une étape du corrigé. */
export function questionsPapier(e: ExerciceDeplacementsSuccessifs): { consignes: FragmentConsigne[][]; etapes: string[][] } {
  if (e.question === "retour") {
    return { consignes: [consigneEcran(e, "total"), consigneEcran(e, "distance"), consigneEcran(e, "retour")], etapes: [["a", "b"], ["c"], ["d"]] };
  }
  if (e.question === "dernier") {
    return { consignes: [consigneEcran(e, "total"), consigneEcran(e, "cible"), consigneEcran(e, "distance")], etapes: [["a", "b"], ["c"], ["d"]] };
  }
  return { consignes: [consigneEcran(e, "total"), consigneEcran(e, "k"), consigneEcran(e, "distance")], etapes: [["a", "b"], ["c", "d"], ["e"]] };
}

// ---------------------------------------------------------------------------------------------
// Libellés de saisie
// ---------------------------------------------------------------------------------------------

export function libelleVecteurEcran(e: ExerciceDeplacementsSuccessifs, ecran: "total" | "retour" | "cible"): string {
  if (ecran === "total") return `${vecteurTotalLatex(e)} =`;
  if (ecran === "retour") return "\\vec{AD} =";
  return `${vecteurCibleLatex(e)} =`;
}

export const PLACEHOLDER_EXACTE = "ex : 2√11 ou rac(44)";
export const PLACEHOLDER_ARRONDI = "ex : 7,3";

// ---------------------------------------------------------------------------------------------
// Distance : valeur exacte, arrondie
// ---------------------------------------------------------------------------------------------

/** Valeur exacte de la norme, simplifiée si possible : « \sqrt{41} », « \sqrt{45} = 3\sqrt{5} », « 5 ». */
export function distanceExacteLatex(e: ExerciceDeplacementsSuccessifs): string {
  const n = carreNorme(vecteurDistance(e));
  const finale = distanceFinaleLatex(e);
  const racine = `\\sqrt{${nombreLatex(n)}}`;
  return racine === finale ? racine : `${racine} = ${finale}`;
}

/** Forme finale seule (« 3\sqrt{5} », « 5 »), sans l'égalité intermédiaire. */
export function distanceFinaleLatex(e: ExerciceDeplacementsSuccessifs): string {
  const { a, b } = simplifierRacine(carreNorme(vecteurDistance(e)));
  if (b === 1) return nombreLatex(a);
  return a === 1 ? `\\sqrt{${nombreLatex(b)}}` : `${nombreLatex(a)}\\sqrt{${nombreLatex(b)}}`;
}

/** « DA = √41 ≈ 6,4 pas » / « DA = 3√5 pas » (selon la précision demandée). */
export function reponseDistanceFragments(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  const nom = nomDistance(e);
  const entiere = simplifierRacine(carreNorme(vecteurDistance(e))).b === 1;
  if (entiere) return [latex(`${nom} = ${distanceFinaleLatex(e)}`), texte(` ${uniteTexte(e.situation)}`)];
  if (e.precision === "exacte") return [latex(`${nom} = ${distanceFinaleLatex(e)}`), texte(` ${uniteTexte(e.situation)}`)];
  return [latex(`${nom} = ${distanceFinaleLatex(e)} \\approx ${nombreLatex(distanceArrondie(e))}`), texte(` ${uniteTexte(e.situation)}`)];
}

export function formuleNormeLatex(e: ExerciceDeplacementsSuccessifs): string {
  const v = vecteurDistanceLatex(e);
  return `${nomDistance(e)} = \\|${v}\\| = \\sqrt{x_{${v}}^2 + y_{${v}}^2}`;
}

export function normeSubstitueeLatex(e: ExerciceDeplacementsSuccessifs): string {
  const v = vecteurDistance(e);
  return `${nomDistance(e)} = \\sqrt{${entreParentheses(v.x)}^2 + ${entreParentheses(v.y)}^2}`;
}

// ---------------------------------------------------------------------------------------------
// Sommes de Chasles (aides, corrigé)
// ---------------------------------------------------------------------------------------------

export function chaslesLatex(e: ExerciceDeplacementsSuccessifs): string {
  return `${vecteurTotalLatex(e)} = ${e.deplacements.map((_, i) => vecteurU(i + 1)).join(" + ")}`;
}

export function sommeComposantesLatex(e: ExerciceDeplacementsSuccessifs, axe: "x" | "y"): string {
  return vecteursDeplacements(e)
    .map((v, i) => (i === 0 ? nombreLatex(v[axe]) : entreParentheses(v[axe])))
    .join(" + ");
}

/** Colonne non calculée : « (4 + (−3) + 0 ; 0 + 3 + (−6)) ». */
export function sommeColonneLatex(e: ExerciceDeplacementsSuccessifs): string {
  return `\\begin{pmatrix} ${sommeComposantesLatex(e, "x")} \\\\ ${sommeComposantesLatex(e, "y")} \\end{pmatrix}`;
}

/** Différence non calculée « C − P » en colonne. */
export function differenceColonneLatex(e: ExerciceDeplacementsSuccessifs): string {
  const c = e.cible ?? { x: 0, y: 0 };
  const p = total(e);
  return `\\begin{pmatrix} ${nombreLatex(c.x)} - ${entreParentheses(p.x)} \\\\ ${nombreLatex(c.y)} - ${entreParentheses(p.y)} \\end{pmatrix}`;
}

/** Position en mots : « 1 pas à l'est et 3 pas au sud du départ ». */
export function positionEnMots(e: ExerciceDeplacementsSuccessifs, v: Composantes): string {
  const u = uniteTexte(e.situation);
  const morceaux: string[] = [];
  if (v.x !== 0) morceaux.push(`${nombreTexte(Math.abs(v.x))} ${u} ${v.x > 0 ? "à l'est" : "à l'ouest"}`);
  if (v.y !== 0) morceaux.push(`${nombreTexte(Math.abs(v.y))} ${u} ${v.y > 0 ? "au nord" : "au sud"}`);
  return morceaux.join(" et ");
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours un calcul à faire)
// ---------------------------------------------------------------------------------------------

function signeTexte(c: number, axe: string): string {
  if (c === 0) return `${axe} nulle`;
  return `${axe} ${c > 0 ? "positive" : "négative"}`;
}

export function aidesEcran(e: ExerciceDeplacementsSuccessifs, ecran: Ecran): FragmentConsigne[][] {
  const A = nomArrivee(e);
  switch (ecran) {
    case "traduire": {
      const diag = aUneDiagonale(e) ? " En diagonale, les deux composantes changent, d'autant de cases chacune." : "";
      const parLigne = e.deplacements
        .map((d, i) => {
          const v = composantes(d);
          return `${i + 1}. ${signeTexte(v.x, "x")}, ${signeTexte(v.y, "y")}`;
        })
        .join(" ; ");
      return [
        [
          texte(
            "Dans ce repère, un déplacement vers l'est ou vers le nord donne une composante positive, vers l'ouest ou vers le sud une composante négative ; le long d'un seul axe, l'autre composante est nulle." +
              diag,
          ),
        ],
        [texte(`Signes attendus — ${parLigne}. Il reste à écrire les valeurs.`)],
      ];
    }
    case "total":
      return [
        [texte("Relation de Chasles : le déplacement total est la somme des déplacements successifs :"), latex(chaslesLatex(e))],
        [texte("Additionne les composantes une à une (les vecteurs corrects de l'étape précédente) :"), latex(`${vecteurTotalLatex(e)} = ${sommeColonneLatex(e)}`)],
      ];
    case "distance": {
      const pasSomme = e.question === "retour" ? "et non la somme des longueurs des étapes" : "et non le chemin case par case";
      const fin = e.precision === "exacte" ? " Calcule, puis simplifie la racine si c'est possible." : " Calcule, puis arrondis comme demandé.";
      return [
        [texte(`La distance à vol d'oiseau est la norme du vecteur qui relie les deux points (${pasSomme}) :`), latex(formuleNormeLatex(e))],
        [texte("Avec les composantes de "), latex(vecteurDistanceLatex(e)), texte(" :"), latex(normeSubstitueeLatex(e)), texte(fin)],
      ];
    }
    case "retour":
      return [
        [texte("Revenir au départ, c'est faire le déplacement opposé au déplacement total :"), latex(`\\vec{AD} = -${vecteurTotalLatex(e)}`)],
        [texte("Change le signe de chacune des deux composantes de "), latex(`${vecteurTotalLatex(e)} = ${colonneLatex(total(e))}`), texte(".")],
      ];
    case "cible": {
      const C = nomCible(e) ?? "C";
      return [
        [texte("Relation de Chasles, en passant par le départ D :"), latex(`\\vec{${A}${C}} = \\vec{${A}D} + \\vec{D${C}} = \\vec{D${C}} - \\vec{D${A}}`)],
        [texte(`Composantes : celles de ${C} moins celles de ${A} :`), latex(`\\vec{${A}${C}} = ${differenceColonneLatex(e)}`)],
      ];
    }
    case "k": {
      const w = e.pas ?? { x: 1, y: 1 };
      const rt = vecteurCible(e);
      return [
        [texte("Le trésor est atteint quand le déplacement du rocher au trésor vaut k fois le grand pas, avec k entier positif :"), latex("\\vec{RT} = k \\cdot \\vec{w}")],
        [
          texte("Le grand pas se traduit par "),
          latex(`\\vec{w} = ${colonneLatex(w)}`),
          texte(" ; compare les premières composantes :"),
          latex(`k = \\dfrac{${nombreLatex(rt.x)}}{${nombreLatex(w.x)}}`),
          texte(" puis vérifie avec les deuxièmes."),
        ],
      ];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (après validation) et messages d'erreur ciblés
// ---------------------------------------------------------------------------------------------

export function reponseAttendueFragments(e: ExerciceDeplacementsSuccessifs, ecran: Ecran): FragmentConsigne[] {
  switch (ecran) {
    case "traduire":
      return vecteursDeplacements(e).flatMap((v, i) => [...(i > 0 ? [texte(" ; ")] : []), latex(`${vecteurU(i + 1)} = ${colonneLatex(v)}`)]);
    case "total":
      return [latex(`${vecteurTotalLatex(e)} = ${colonneLatex(total(e))}`)];
    case "distance":
      return reponseDistanceFragments(e);
    case "retour":
      return [latex(`\\vec{AD} = ${colonneLatex(vecteurRetour(e))}`)];
    case "cible":
      return [latex(`${vecteurCibleLatex(e)} = ${colonneLatex(vecteurCible(e))}`)];
    case "k":
      return [latex(`k = ${e.k ?? 0}`), texte(" (répéter le grand pas "), latex(`${e.k ?? 0}`), texte(" fois)")];
  }
}

export function messageComposantes(statut: StatutComposantes): string {
  if (statut === "signe") return "un signe à revoir (ouest et sud : composantes négatives)";
  if (statut === "echange") return "x et y inversés (x : est-ouest, y : nord-sud)";
  return "composantes à revoir";
}

export function messageVecteur(e: ExerciceDeplacementsSuccessifs, ecran: "total" | "retour" | "cible", statut: StatutVecteur): string | null {
  switch (statut) {
    case "oppose":
      if (ecran === "retour") return `C'est le déplacement de D vers A : pour revenir, il faut le vecteur opposé.`;
      return `Ce vecteur va dans le mauvais sens (de ${nomCible(e)} vers ${nomArrivee(e)}).`;
    case "sans_signes":
      return "Tu as additionné les longueurs sans tenir compte des signes : l'ouest et le sud comptent négativement.";
    case "cible_directe":
      return `Ce sont les coordonnées de ${nomCible(e)}, vues depuis le départ ; or ce déplacement part de ${nomArrivee(e)}.`;
    case "une_composante":
      return "Une des deux composantes est juste, l'autre est à revoir.";
    default:
      return null;
  }
}

export function messageK(statut: StatutK): string | null {
  return statut === "faux" ? "Le même nombre k doit convenir pour les deux composantes à la fois." : null;
}

export function messageDistance(e: ExerciceDeplacementsSuccessifs, statut: StatutDistance): string | null {
  switch (statut) {
    case "approchee":
      return "La valeur exacte est demandée : garde la racine (√ ou rac).";
    case "parcourue":
      return e.question === "retour"
        ? "C'est la distance parcourue en suivant le trajet, pas la distance à vol d'oiseau."
        : "C'est la longueur du chemin en suivant le quadrillage ; à vol d'oiseau, on va en ligne droite.";
    case "racine_oubliee":
      return "Tu as donné le carré de la distance : il manque la racine carrée.";
    case "arrondi_faux":
      return "Presque : vérifie l'arrondi demandé.";
    default:
      return null;
  }
}

