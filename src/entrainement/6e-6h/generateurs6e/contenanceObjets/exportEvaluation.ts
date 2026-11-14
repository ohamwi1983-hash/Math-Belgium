import type { ExerciceContenanceObjets } from "../../core6e/contenanceObjets.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { contenanceUnite, frac, rayonProfil, uniteContenance, valeur, volumeCm3, volumeSecond } from "../../core6e/contenanceObjetsCalcul";
import { PHASES_CONTENANCE } from "../../moteur6e/typesContenanceObjets";
import type { PhaseContenance } from "../../moteur6e/typesContenanceObjets";
import {
  carreLatex,
  consigneEcran,
  consigneGenerale,
  contenanceLatex,
  fLatex,
  fracLatex,
  formatReponseAttenduePhaseLatex,
  hauteurLatex,
  multiplePiLatex,
  nombreLatex,
  paroiEpaisse,
  primitiveLatex,
  texteTransfert,
  verdictComparaison,
  volumeLatex,
  volumeSecondLatex,
} from "../../ui6e/formatContenanceObjets";
import { figureCorrigeSvg, figureEnonceHtml } from "../../ui6e/figureContenanceObjets";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceContenanceObjets } from "./index";
import type { IdVarianteContenanceObjets } from "./index";
import { profilContenanceObjets } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceContenanceObjets>` de `6gen83` (« Contenance
 * d'objets de révolution ») — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN (titres « Étape n — … » du corrigé) ;
 * - `enoncePapier` : énoncé (objet, cotes, profil, convention du repère) + figure (silhouette cotée
 *   et profil, `enteteHtml`) et DEUX vraies questions : a) la contenance (en cm³ puis en L ou cL),
 *   b) la question de transfert. Modèle, bornes, carré, calcul et conversion sont les étapes de a)
 *   dans le corrigé ;
 * - résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli) ; figure du solide (disques,
 *   liquide jusqu'à t) sous la dernière étape.
 */

const LETTRES = "abcde";
const f = (v: string): FragmentConsigne => latex(v);
const t = (v: string): FragmentConsigne => texte(v);

/** Consigne d'étape (corrigé papier) : celle de l'écran, sauf le modèle (pas de choix sur papier). */
function consigneEtape(e: ExerciceContenanceObjets, phase: PhaseContenance): FragmentConsigne[] {
  if (phase === "modele") return [t("Identifie le modèle (disques ou rondelles, quel profil) qui donne la contenance, et écris la formule du volume.")];
  return consigneEcran(e, phase);
}

/** Énoncé : la consigne générale contient déjà le profil (pas de répétition des données). */
function entete(e: ExerciceContenanceObjets): FragmentConsigne[] {
  return consigneGenerale(e);
}

function construireEnonce(e: ExerciceContenanceObjets): SectionExercice {
  // Sans `enteteHtml` : l'énoncé imprimé vient d'`enoncePapier` (qui porte la figure) ; la figure
  // contient des identifiants uniques par appel et rendrait l'empreinte anti-doublon du pipeline
  // (`evaluationLocal.ts::empreinteSection`) différente à chaque tirage.
  return { enteteFragments: entete(e), questions: PHASES_CONTENANCE.map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function reponse(e: ExerciceContenanceObjets, phase: PhaseContenance): FragmentConsigne[] {
  const formules = [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
  if (phase === "transfert" && e.transfert === "comparer") return [...formules, t(" — "), ...verdictComparaison(e)];
  if (phase === "transfert" && e.transfert === "nombre") return [f(`n=${e.nombre}`)];
  return formules;
}

function construireCorrection(e: ExerciceContenanceObjets): BlocCorrection[] {
  return PHASES_CONTENANCE.map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function questionContenance(e: ExerciceContenanceObjets): FragmentConsigne[] {
  const u = uniteContenance(e);
  const unite = u === "cL" ? "en centilitres (arrondie au dixième)" : "en litres (arrondie au centième)";
  return [t(`Calcule la contenance de l'objet en cm³ (valeur exacte, puis arrondie à l'unité), puis exprime-la ${unite}.`)];
}

function enoncePapier(e: ExerciceContenanceObjets): EnoncePapier {
  return {
    section: { enteteFragments: entete(e), enteteHtml: figureEnonceHtml(e), questions: [{ consigne: questionContenance(e) }, { consigne: texteTransfert(e) }] },
    etapesParQuestion: [["a", "b", "c", "d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

interface ContenuEtape {
  methode: FragmentConsigne[];
  calcul?: string;
  piege?: string;
}

function contenuPoser(e: ExerciceContenanceObjets): ContenuEtape {
  const T = nombreLatex(e.hauteurTotale, 1);
  const hc = nombreLatex(e.horsCavite, 1);
  const p = e.profil;
  let bornes: string;
  let methode: FragmentConsigne[];
  if (e.objet === "tonneau") {
    methode = [t("x part du milieu du tonneau, qui s'étend d'une demi-hauteur de chaque côté.")];
    bornes = `a=-\\dfrac{${T}}{2}=${e.a},\\quad b=${e.b}`;
  } else if (e.objet === "flacon") {
    methode = [t("x part du centre du réservoir ; le réservoir mesure la hauteur totale moins le bouchon et s'étend de part et d'autre de l'origine.")];
    bornes = `${T}-${hc}=${e.b - e.a},\\quad a=${e.a},\\quad b=${e.b}`;
  } else {
    const quoi = e.objet === "verre" ? "le pied" : "le fond";
    methode = [t(`x part du fond intérieur ; la partie qui contient le liquide mesure la hauteur totale moins ${quoi}.`)];
    bornes = `a=0,\\quad b=${T}-${hc}=${e.b}`;
  }
  if (e.objet === "pot" && p.type === "droite") {
    return {
      methode: [...methode, t(" Les cotes Ø sont des diamètres : on en prend la moitié ; le rayon varie de façon affine de r à R sur la profondeur h.")],
      calcul: `r=\\dfrac{${2 * p.r}}{2}=${p.r},\\quad R=\\dfrac{${2 * p.R}}{2}=${p.R},\\quad f(x)=${p.r}+\\dfrac{${p.R}-${p.r}}{${p.h}}\\,x=${fLatex(e)},\\quad ${bornes}`,
      piege: "Prendre les diamètres pour des rayons (le volume serait multiplié par 4).",
    };
  }
  return {
    methode: [...methode, t(" Puis on élève le profil au carré.")],
    calcul: `${bornes},\\quad [f(x)]^2=\\left(${fLatex(e)}\\right)^2=${carreLatex(e)}`,
    piege: e.a === 0 ? "Prendre la hauteur totale de l'objet comme borne supérieure." : "Intégrer à partir de 0 alors que x est mesuré depuis le milieu : les bornes sont symétriques.",
  };
}

function contenuTransfert(e: ExerciceContenanceObjets): ContenuEtape {
  if (e.transfert === "hauteur") {
    const h = e.b - e.a;
    if (e.fraction && e.profil.type === "racine") {
      const a = e.profil.a;
      return {
        methode: [t("Le vin occupe le solide de 0 à t : son volume vaut "), f(`\\pi\\displaystyle\\int_0^{t}${a}x\\,dx=\\dfrac{${a}\\pi t^2}{2}`), t(", proportionnel à t².")],
        calcul: `\\dfrac{${a}\\pi t^2}{2}=${fracLatex(e.fraction)}\\cdot\\dfrac{${a}\\pi\\cdot ${h}^2}{2}\\iff t^2=${fracLatex(e.fraction)}\\cdot ${h}^2`,
        piege: "Croire la hauteur proportionnelle au volume (la coupe s'élargit vers le haut).",
      };
    }
    const cm3 = e.objet === "pot" ? e.quantite * 1000 : e.quantite * 10;
    const conv = e.objet === "pot" ? `${nombreLatex(e.quantite, 1)}\\text{ L}=${nombreLatex(cm3, 0)}\\text{ cm}^3` : `${nombreLatex(e.quantite, 0)}\\text{ cL}=${nombreLatex(cm3, 0)}\\text{ cm}^3`;
    return {
      methode: [t("Le contenu occupe le solide de 0 à t : on résout "), f("\\pi\\displaystyle\\int_0^{t}[f(x)]^2\\,dx=V_{\\text{versé}}"), t(e.objet === "pot" ? ", équation du troisième degré en t (calculatrice)." : ".")],
      calcul: `${conv},\\quad \\pi\\left(${primitiveLatex(e, "t")}\\right)=${nombreLatex(cm3, 0)}`,
      piege: "Oublier de convertir la quantité versée en cm³ avant de résoudre.",
    };
  }
  if (e.transfert === "nombre") {
    const V = volumeCm3(e);
    const s = e.source?.cm3 ?? 1;
    const rapport = e.objet === "vase" || e.objet === "tonneau" ? `\\dfrac{${nombreLatex(V, 1)}}{${nombreLatex(s, 0)}}\\approx ${nombreLatex(V / s, 2)}` : `\\dfrac{${nombreLatex(s, 0)}}{${nombreLatex(V, 1)}}\\approx ${nombreLatex(s / V, 2)}`;
    return e.arrondi === "ceil"
      ? { methode: [t("On divise la contenance du vase par celle d'un récipient (en cm³) ; le dernier, même incomplet, est nécessaire : on arrondit à l'entier supérieur.")], calcul: rapport, piege: "Arrondir à l'entier inférieur : le vase ne serait pas plein." }
      : { methode: [t("On divise la quantité disponible par la contenance d'un récipient (en cm³) ; seuls les récipients pleins comptent : on garde la partie entière.")], calcul: rapport, piege: "Arrondir à l'entier le plus proche : le dernier récipient ne serait pas plein." };
  }
  const d = e.second;
  if (!d) return { methode: [] };
  const rho = fracLatex(frac(d.diametre, 2));
  const V2 = d.forme === "cone" ? `V_2=\\dfrac{1}{3}\\pi\\left(${rho}\\right)^2\\cdot ${d.hauteur}` : `V_2=\\pi\\left(${rho}\\right)^2\\cdot ${d.hauteur}`;
  return {
    methode: [t(`Volume du second récipient (${d.forme === "cone" ? "cône" : "cylindre"} de rayon égal à la moitié du diamètre), puis comparaison des deux volumes : π se simplifie.`)],
    calcul: `${V2}=${multiplePiLatex(e.secondSurPi ?? frac(0))}\\quad\\text{contre}\\quad V=${multiplePiLatex(e.volumeSurPi)}`,
    piege: "Prendre le diamètre pour le rayon : le volume du second récipient serait multiplié par 4.",
  };
}

function contenuEtape(e: ExerciceContenanceObjets, phase: PhaseContenance): ContenuEtape {
  switch (phase) {
    case "modele":
      return {
        methode: [t("La contenance est le volume de l'intérieur : chaque tranche perpendiculaire à l'axe est un disque de rayon f(x), d'aire "), f("\\pi[f(x)]^2"), t(" (méthode des disques).")],
        piege: paroiEpaisse(e) ? "Prendre des rondelles entre le profil extérieur et f : on obtiendrait le volume de la paroi, pas la contenance." : "Oublier π ou le carré : l'aire d'une tranche est π[f(x)]².",
      };
    case "poser":
      return contenuPoser(e);
    case "calculer":
      return {
        methode: [t("On primitive terme à terme, on évalue entre les bornes et on multiplie par π.")],
        calcul: `V=\\pi\\displaystyle\\int_{${e.a}}^{${e.b}}\\left(${carreLatex(e)}\\right)dx=\\pi\\left[${primitiveLatex(e)}\\right]_{${e.a}}^{${e.b}}`,
        piege: "Oublier le facteur π devant l'intégrale.",
      };
    case "convertir": {
      const u = uniteContenance(e);
      return {
        methode: [t(u === "cL" ? "1 L = 1 dm³ = 1 000 cm³ et 1 L = 100 cL, donc 1 cL = 10 cm³." : "1 L = 1 dm³ = 1 000 cm³.")],
        calcul: `${nombreLatex(volumeCm3(e), 1)}\\text{ cm}^3=\\dfrac{${nombreLatex(volumeCm3(e), 1)}}{${u === "cL" ? "10" : "1\\,000"}}\\text{ ${u}}`,
        piege: "Diviser par 100 au lieu de 1 000 : 1 dm³ = 1 000 cm³.",
      };
    }
    case "transfert":
      return contenuTransfert(e);
  }
}

function correctionDetaillee(e: ExerciceContenanceObjets): EtapeCorrection[] {
  return PHASES_CONTENANCE.flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const c = contenuEtape(e, phase);
    const etapes: EtapeCorrection[] = [];
    if (c.methode.length > 0) etapes.push({ label: "Méthode", sousQuestion, fragments: c.methode });
    if (c.calcul) etapes.push({ label: "Calcul", sousQuestion, fragments: [f(c.calcul)] });
    if (c.piege) etapes.push({ label: "Piège", sousQuestion, fragments: [t(c.piege)] });
    const figure = i === PHASES_CONTENANCE.length - 1 ? { figureHtml: figureCorrigeSvg(e) } : {};
    etapes.push({ label: "Conclusion", sousQuestion, fragments: reponse(e, phase), ...figure });
    return etapes;
  });
}

// ============================================================================
// Difficulté, réponse brève, barème.
// ============================================================================

function difficulte(e: ExerciceContenanceObjets): 1 | 2 | 3 {
  return e.transfert === "hauteur" || e.objet === "pot" ? 3 : 2;
}

function reponseTransfertBreve(e: ExerciceContenanceObjets): FragmentConsigne[] {
  if (e.transfert === "hauteur") return [f(hauteurLatex(e))];
  if (e.transfert === "nombre") return [f(`n=${e.nombre}`)];
  return [f(volumeSecondLatex(e)), t(" — "), ...verdictComparaison(e)];
}

function reponseBreve(e: ExerciceContenanceObjets): FragmentConsigne[] {
  return [t("a) "), f(volumeLatex(e)), t(" ; "), f(contenanceLatex(e)), t(" ; b) "), ...reponseTransfertBreve(e)];
}

const POIDS: Record<PhaseContenance, number> = { modele: 0.5, poser: 1, calculer: 1, convertir: 0.5, transfert: 1 };

function bareme(e: ExerciceContenanceObjets): BaremeExercice {
  const erreurs = PHASES_CONTENANCE.map((phase) => contenuEtape(e, phase).piege)
    .filter((p): p is string => !!p)
    .map((p) => ({ description: [t(p)], cout: "−0,5" }));
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_CONTENANCE.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(e, phase), points: POIDS[phase] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Volume exact (multiple de π) ou arrondi ; contenance exacte ou arrondie ; hauteur exacte ou arrondie au millimètre ; un carré non développé mais juste est accepté")]],
  };
}

/** Vérifications de cohérence pour les scripts (jamais affiché). */
export function valeursControle(e: ExerciceContenanceObjets) {
  return { V: volumeCm3(e), C: contenanceUnite(e), V2: volumeSecond(e), t: e.hauteurLiquide, n: e.nombre, rBas: rayonProfil(e.profil, e.a), surPi: valeur(e.volumeSurPi) };
}

export const adaptateurEvaluationContenanceObjets: AdaptateurFeuilleExercices<ExerciceContenanceObjets> = {
  titreDocument: "Contenance d'objets de révolution — Évaluation",
  nomFichierBase: "contenance-objets-revolution",
  genererInstance: genererExerciceContenanceObjets,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteContenanceObjets),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 15,
  // Tonneau et pot : aucune instance à valeur exacte → exclus d'une évaluation sans calculatrice.
  calculatriceIndispensable: ["tonneau", "pot"],
  profilInstance: profilContenanceObjets,
};
