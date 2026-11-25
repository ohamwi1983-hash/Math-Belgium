import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceIdentificationConiques } from "../../core6e/identificationConiques.types";
import type { PhaseIdentificationConiques } from "../../moteur6e/typesIdentificationConiques";
import { phasesPourExercice } from "../../moteur6e/typesIdentificationConiques";
import { latexDroite, latexPoint, latexQ, latexRacine, qDiv, qMul, q } from "../../moteur6e/algebreLieux";
import { c2Conique, foyersConique, latexConique } from "../../moteur6e/algebreConiques";
import { polyEnonce } from "../../moteur6e/verificationIdentificationConiques";
import { FORMAT_6GEN58, equationC } from "../../ui6e/formatIdentificationConiques";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier } from "../../ui6e/corrigeLieux";
import { milliersDans } from "../../ui6e/corrigeConiques";
import { eqPoly } from "../../ui6e/textesConiques";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { NATURE_6GEN58, ORIENTATION_6GEN58, asymptotesLatex, correctionDetailleeIdentificationConiques } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, GROUPES_VERDICT_6GEN58, construireAvecVarianteId, genererExerciceIdentificationConiques } from "./index";

/**
 * Adaptateur papier de `6gen58` (identifier une conique et ses éléments, 6e ch. 10, § 1–2, processus 2
 * APPLIQUER) — refonte du lot E de l'audit, sur l'adaptateur commun du ch. 7. Énoncé papier = l'équation
 * (« On donne … ») + UNE consigne sans méthode ni verdict (plus de « complète le carré », de
 * « catégorie probable », de « cas dégénéré ou parabole ») : la MÊME consigne pour toutes les natures
 * d'une famille (elle énumère les éléments à donner selon le cas), sinon elle trahirait la nature ;
 * famille C : « précise la partie réellement décrite » (demi-conique). Les écrans deviennent les étapes
 * du corrigé, avec les coefficients réels, la forme réduite, le centre, a, b, c simplifiés, les foyers,
 * les asymptotes ou la directrice, les droites ou le point des cas dégénérés, et la FIGURE.
 *
 * Profil : `forme` = famille (A1, A2, B, C ; la nature est le verdict — groupes à verdict par famille,
 * critères FIXES par famille : niveau et durée ne trahissent pas la nature) ; cas particulier
 * `centreSurUnAxe` (B : h = 0 ou k = 0, une seule complétion du carré). Aucun `calcul` (décider une
 * nature, réduire une équation : la calculatrice ne le fait pas, règle du 24/11).
 */

type E = ExerciceIdentificationConiques;
type F = FragmentConsigne[];

const ELEMENTS_CENTRES = "le centre et le rayon d'un cercle ; le centre, $a$, $b$, $c$, les foyers (et les asymptotes) d'une ellipse ou d'une hyperbole ; le point ou les équations des droites d'un cas dégénéré";

export function situationPapier58(e: E): F {
  if (e.famille === "C") return fx(`On donne la courbe $\\Gamma$ d'équation $${equationC(e)}$.`);
  return fx(`On donne l'équation $${milliersDans(eqPoly(polyEnonce(e)))}$.`);
}

export function consignePapier58(e: E): string {
  switch (e.famille) {
    case "A1":
    case "B":
      return `Détermine la nature de l'ensemble des points dont les coordonnées vérifient cette équation, puis ses éléments : ${ELEMENTS_CENTRES}. Donne des valeurs exactes.`;
    case "A2":
      return "Détermine la nature de l'ensemble des points dont les coordonnées vérifient cette équation, puis ses éléments : le paramètre $p$, le foyer et la directrice d'une parabole ; les équations des droites d'un cas dégénéré.";
    case "C":
      return "Détermine la conique dont $\\Gamma$ fait partie (nature, centre, demi-axes $a$ et $b$), puis précise la partie de cette conique réellement décrite par $\\Gamma$. Donne des valeurs exactes.";
  }
}

function elementsTexte(e: E): string {
  const c = e.conique;
  const centre = c && c.type !== "parabole" ? `centre $\\Omega${latexPoint(c.centre)}$` : "";
  if (e.nature === "vide") return "L'ensemble est vide.";
  if (e.nature === "point") return `Un seul point : $${latexPoint(e.point!)}$.`;
  if (e.nature === "droitesSecantes" || e.nature === "droitesParalleles") return `${e.nature === "droitesSecantes" ? "Deux droites sécantes" : "Deux droites parallèles"} : $${latexDroite(e.droites[0])}$ et $${latexDroite(e.droites[1])}$.`;
  if (c?.type === "cercle") return `Cercle de ${centre} et de rayon $${latexRacine(c.r2)}$.`;
  if (c?.type === "parabole") {
    const F = foyersConique(c)[0];
    return `Parabole $${latexConique(c)}$ ouverte ${ORIENTATION_6GEN58[(e as Extract<E, { famille: "A2" }>).orientation!]} : $p=${latexQ(c.p)}$, foyer $F${F.latex}$, directrice $${c.axe}=${latexQ(qMul(q(-c.sens), qDiv(c.p, q(2))))}$.`;
  }
  if (c?.type === "ellipse" || c?.type === "hyperbole") {
    const F = foyersConique(c);
    return `${c.type === "ellipse" ? "Ellipse" : "Hyperbole"} $${latexConique(c)}$ : ${centre}, $a=${latexRacine(c.a2)}$, $b=${latexRacine(c.b2)}$, $c=${latexRacine(c2Conique(c))}$, foyers $${F[0].latex}$ et $${F[1].latex}$${c.type === "hyperbole" ? `, asymptotes $${asymptotesLatex(c)}$` : ""}.`;
  }
  return "";
}

function reponseBreve(e: E): F {
  if (e.famille === "C") {
    const c = e.conique!;
    if (c.type !== "ellipse" && c.type !== "hyperbole") return [];
    const sens = e.signeRacine > 0 ? "\\geq" : "\\leq";
    return fx(`${e.nature === "ellipse" ? "Ellipse" : "Hyperbole"} $${latexConique(c)}$ : centre $\\Omega${latexPoint(c.centre)}$, $a=${latexRacine(c.a2)}$, $b=${latexRacine(c.b2)}$ ; $\\Gamma$ en est ${e.nature === "ellipse" ? "la moitié" : "la partie"} où $${e.variableIsolee}${sens}${e.k}$.`);
  }
  return fx(elementsTexte(e));
}

const DECIMALES = fx("Si la calculatrice est autorisée, les valeurs décimales arrondies au centième sont acceptées pour les racines.");

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  const nature = `Nature justifiée (constante isolée, signes comparés) : ${NATURE_6GEN58[e.nature] ?? "une parabole"}`;
  const acceptees = [fx("Forme réduite ou développée équivalente ; racines simplifiées ou non ($\\sqrt{50}=5\\sqrt{2}$) ; points et droites dans un ordre quelconque, équations de droites sous toute forme équivalente"), DECIMALES];
  const erreurs = [
    { description: fx("Division par un second membre nul (cas « point » ou « deux droites » pris pour une ellipse ou une hyperbole)"), cout: "0 pt sur la nature" },
    { description: fx("$a$ pris sous $x^2$ au lieu du plus grand dénominateur (ellipse), ou $c^2=a^2-b^2$ pour une hyperbole"), cout: "moitié des points de l'étape concernée" },
  ];
  const elements = elementsTexte(e);
  let criteres;
  switch (e.famille) {
    case "A1":
      switch (e.nature) {
        case "vide":
          criteres = [c(0, "Constante isolée et signes comparés", 2), c(0, "Conclusion : l'ensemble est vide", 2)];
          break;
        case "ellipse":
        case "hyperbole":
          criteres = [c(0, `${nature} et forme réduite`, 1.5), c(1, "$a$, $b$ et $c$ exacts", 1.25), c(2, e.nature === "hyperbole" ? "Foyers et asymptotes" : "Foyers", 1.25)];
          break;
        default:
          criteres = [c(0, nature, 2), c(1, elements, 2)];
      }
      break;
    case "A2":
      criteres = e.nature === "parabole" ? [c(0, `Nature et sens d'ouverture : parabole ouverte ${ORIENTATION_6GEN58[e.orientation!]}`, 1.5), c(1, `$p=${latexQ((e.conique as Extract<NonNullable<E["conique"]>, { type: "parabole" }>).p)}$`, 1), c(2, "Foyer et directrice", 1.5)] : [c(0, "Factorisation et nature : deux droites parallèles", 2), c(1, elements, 2)];
      break;
    case "B":
      switch (e.nature) {
        case "vide":
          criteres = [c(0, "Carrés complétés (coefficients corrects)", 1.5), c(1, "Signes comparés : l'ensemble est vide", 2.5)];
          break;
        case "ellipse":
        case "hyperbole":
          criteres = [c(0, "Carrés complétés (coefficients corrects)", 1.5), c(1, `${nature} et forme réduite`, 0.75), c(2, "Centre, $a$, $b$ et $c$", 1), c(3, e.nature === "hyperbole" ? "Foyers et asymptotes" : "Foyers", 0.75)];
          break;
        default:
          criteres = [c(0, "Carrés complétés (coefficients corrects)", 1.5), c(1, nature, 1), c(2, elements, 1.5)];
      }
      break;
    case "C":
      criteres = [c(0, "Équation élevée au carré, condition notée", 0.5), c(1, "Carré complété, deux carrés regroupés", 1.5), c(2, "Nature et partie décrite (moitié de la conique)", 1), c(3, "Centre, $a$ et $b$", 1)];
      erreurs.push({ description: fx("La conique entière donnée pour $\\Gamma$ (condition de signe oubliée)"), cout: "0,5 pt sur la nature" });
      break;
  }
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

function criteres(e: E): CriteresDifficulte {
  // La nature est le verdict : son nombre d'écrans ne doit pas changer le niveau ni la durée (critères
  // FIXES par famille, sans charge ; piège 1 : la famille contient des ensembles qui ne sont pas des
  // coniques, ou une moitié de conique).
  const etapes = e.famille === "B" || e.famille === "C" ? 4 : 3;
  return { etapesTransformation: etapes, etapesLecture: 0, methode: 1, piege: e.famille === "B" || e.famille === "C" ? 1 : 0, nombres: 0, sansCharge: true };
}

export function profilIdentificationConiques(e: E): ProfilInstance {
  if (e.famille === "B" && (e.centre.x.n === 0n || e.centre.y.n === 0n)) return { casParticulier: "centreSurUnAxe", forme: "B" };
  return { casParticulier: null, forme: e.famille };
}

export const adaptateurEvaluationIdentificationConiques: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseIdentificationConiques>({
  titreDocument: "Identifier une conique — Évaluation",
  nomFichierBase: "identification-coniques",
  genererInstance: genererExerciceIdentificationConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN58),
  phases: phasesPourExercice,
  situation: situationPapier58,
  questions: (e) => [{ consigne: fx(consignePapier58(e)), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeIdentificationConiques,
  bareme,
  criteres,
  profil: profilIdentificationConiques,
  libelleCasParticulier: "Inclure un cas particulier (centre sur un axe : une seule complétion du carré)",
  groupesVerdict: GROUPES_VERDICT_6GEN58,
});
