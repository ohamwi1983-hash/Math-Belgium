import type { Arcfonction, PointCercleTrig, Trigfonction, ValeurExacte } from "../../core6e/cyclometrique.types";
import type { ExerciceFonctionsCyclometriques } from "../../core6e/fonctionsCyclometriques.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { BANQUES_ARC } from "../cyclometrique/banqueAngles";
import { formatExpressionLatex } from "../../ui6e/formatFonctionsCyclometriques";
import { COURS_CYCLO, DOMAINE_ARC, IMAGE_ARC, NOM_ARC, finaliser, justif, ligne } from "../../ui6e/corrigeReciproques";

/**
 * Corrigé détaillé « comme au tableau » de `6gen2` (valeurs cyclométriques : existence et calcul)
 * — règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : adaptateur papier ET appli
 * (`App6gen2.tsx`). Un seul ÉCRAN (lettre « a ») : condition d'existence testée, valeur
 * intermédiaire (valeur remarquable ou angle principal), résultat, vérification par une identité ;
 * piège rattaché (intervalle de restriction, arcsin(sin θ) ≠ θ, tangente non définie en π/2).
 */

type Fragments = FragmentConsigne[];
type E = ExerciceFonctionsCyclometriques;

const NOM_TRIG: Record<Trigfonction, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };
const ARC_DE_TRIG: Record<Trigfonction, Arcfonction> = { sin: "arcsin", cos: "arccos", tan: "arctan" };
const LETTRES_TRIG: Record<Trigfonction, string> = { sin: "sinus", cos: "cosinus", tan: "tangente" };
const SQ = "a";
const TOL = 1e-9;

/** « arcsin y est l'angle de [−π/2 ; π/2] dont le sinus vaut y » (définition, fragments). */
function definition(arc: Arcfonction): Fragments {
  // « la tangente » (féminin), « le sinus », « le cosinus ».
  const trig = arc === "arcsin" ? "le sinus" : arc === "arccos" ? "le cosinus" : "la tangente";
  return [latex(`${NOM_ARC[arc]}\\,y`), texte(` est l'angle de `), latex(IMAGE_ARC[arc]), texte(` dont ${trig} vaut `), latex("y"), texte(" ; il existe pour "), latex(`y\\in ${DOMAINE_ARC[arc]}`)];
}

/** Justification d'une valeur remarquable sur le cercle trigonométrique. */
function justifValeur(p: PointCercleTrig): Fragments {
  if (p.quadrant === 0 || p.angleReference === null) return justif("point sur un axe du cercle trigonométrique");
  if (p.quadrant === 1) return justif("valeur remarquable");
  return justif("angle de référence ", { l: p.angleReference.latex }, `, ${p.quadrant}e quadrant`);
}

/** Ligne d'appartenance au domaine de l'arcfonction (ou de non-appartenance). */
function ligneDomaine(arc: Arcfonction, v: ValeurExacte): LigneCalcul {
  if (arc === "arctan") return ligne(`${v.latex}\\in\\mathbb{R}`, "arctan est définie sur ℝ");
  if (Math.abs(v.numerique) <= 1 + TOL) return ligne(`-1\\leq ${v.latex}\\leq 1`, `dans le domaine de ${arc}`);
  return v.numerique > 0 ? ligne(`${v.latex}>1`, `hors du domaine [−1 ; 1] de ${arc}`) : ligne(`${v.latex}<-1`, `hors du domaine [−1 ; 1] de ${arc}`);
}

/** Ligne « arc(v) = α » justifiée par la définition. */
function ligneAngle(arc: Arcfonction, vL: string, alpha: string): LigneCalcul {
  const trig = arc === "arcsin" ? "\\sin" : arc === "arccos" ? "\\cos" : "\\tan";
  return ligne(`${NOM_ARC[arc]}\\left(${vL}\\right)=${alpha}`, justif("car ", { l: `${trig}\\left(${alpha}\\right)=${vL}` }, " et ", { l: `${alpha}\\in ${IMAGE_ARC[arc]}` }));
}

/** Identité trig(arc(n)) en fonction de n (null : même fonction, ou tan de arcsin/arccos non utile). */
function identite(trig: Trigfonction, arc: Arcfonction, n: string): { gauche: string; droite: string } | null {
  const N = `\\left(${n}\\right)^{2}`;
  const g = `${NOM_TRIG[trig]}\\left(${NOM_ARC[arc]}\\,y\\right)`;
  if (ARC_DE_TRIG[trig] === arc) return null;
  if ((trig === "cos" && arc === "arcsin") || (trig === "sin" && arc === "arccos")) return { gauche: `${g}=\\sqrt{1-y^{2}}`, droite: `\\sqrt{1-${N}}` };
  if (trig === "tan" && arc === "arcsin") return { gauche: `${g}=\\dfrac{y}{\\sqrt{1-y^{2}}}`, droite: `\\dfrac{${n}}{\\sqrt{1-${N}}}` };
  if (trig === "tan" && arc === "arccos") return { gauche: `${g}=\\dfrac{\\sqrt{1-y^{2}}}{y}`, droite: `\\dfrac{\\sqrt{1-${N}}}{${n}}` };
  if (trig === "sin" && arc === "arctan") return { gauche: `${g}=\\dfrac{y}{\\sqrt{1+y^{2}}}`, droite: `\\dfrac{${n}}{\\sqrt{1+${N}}}` };
  return { gauche: `${g}=\\dfrac{1}{\\sqrt{1+y^{2}}}`, droite: `\\dfrac{1}{\\sqrt{1+${N}}}` };
}

function angleDe(arc: Arcfonction, valeur: number): ValeurExacte {
  const entree = BANQUES_ARC[arc].find((x) => Math.abs(x.valeur.numerique - valeur) < TOL);
  if (!entree) throw new Error(`angleDe : aucune valeur remarquable pour ${arc}(${valeur})`);
  return entree.angle;
}

function expr(e: E): string {
  return formatExpressionLatex(e);
}

/** Résultat de l'écran (réponse attendue, aussi affichée par l'appli). */
export function resultatFonctionsCyclometriquesLatex(e: E): string | null {
  return e.existe ? `${expr(e)}=${e.valeurLatex}` : null;
}

function resultatEtape(e: E, raison: Fragments): EtapeCorrection {
  const r = resultatFonctionsCyclometriquesLatex(e);
  return resultat(SQ, r ? [latex(r)] : [texte("L'expression n'existe pas : "), ...raison]);
}

export function correctionDetailleeFonctionsCyclometriques(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  switch (e.variante) {
    case "directe": {
      const v: ValeurExacte = { latex: e.nombreLatex, numerique: e.nombreNumerique };
      etapes.push(
        utilise(SQ, [...definition(e.arcfonction), texte(` ${COURS_CYCLO}.`)]),
        calcul(SQ, [ligneDomaine(e.arcfonction, v), ligneAngle(e.arcfonction, e.nombreLatex, e.valeurLatex)]),
        resultatEtape(e, []),
      );
      if (e.arcfonction === "arccos" && e.nombreNumerique < 0) etapes.push(piege(SQ, [texte("arccos d'un nombre négatif est un angle de "), latex("\\left]\\dfrac{\\pi}{2}\\,;\\,\\pi\\right]"), texte(", jamais un angle négatif.")]));
      else if (e.nombreNumerique < 0) etapes.push(piege(SQ, [texte("L'angle est négatif, dans l'intervalle de restriction : "), latex(`${NOM_ARC[e.arcfonction]}(-y)=-${NOM_ARC[e.arcfonction]}\\,y`), texte(".")]));
      break;
    }
    case "arcTrig": {
      const v = e.theta[e.trigfonction] as ValeurExacte;
      const lignes: LigneCalcul[] = [ligne(`${NOM_TRIG[e.trigfonction]}\\left(${e.theta.angle.latex}\\right)=${v.latex}`, justifValeur(e.theta)), ligneDomaine(e.arcfonction, v)];
      if (e.existe) lignes.push(ligneAngle(e.arcfonction, v.latex, e.valeurLatex as string));
      etapes.push(
        utilise(SQ, [texte(`On calcule d'abord ${LETTRES_TRIG[e.trigfonction] === "tangente" ? "la tangente" : `le ${LETTRES_TRIG[e.trigfonction]}`} de l'angle donné, puis on applique la définition : `), ...definition(e.arcfonction), texte(` ${COURS_CYCLO}.`)]),
        calcul(SQ, lignes),
        resultatEtape(e, [latex(`${NOM_ARC[e.arcfonction]}\\left(${v.latex}\\right)`), texte(` n'est pas défini, car ${v.latex.startsWith("-") ? "la valeur est inférieure à −1" : "la valeur dépasse 1"}.`)]),
      );
      if (e.existe && Math.abs((e.valeurNumerique as number) - e.theta.angle.numerique) > TOL) {
        etapes.push(
          piege(SQ, [
            latex(`${NOM_ARC[e.arcfonction]}\\left(${NOM_TRIG[e.trigfonction]}\\,\\theta\\right)\\neq\\theta`),
            texte(" ici : "),
            latex(e.theta.angle.latex),
            texte(" n'est pas dans "),
            latex(IMAGE_ARC[e.arcfonction]),
            texte(", on prend l'angle de cet intervalle qui a la même valeur."),
          ]),
        );
      } else if (!e.existe) {
        etapes.push(piege(SQ, [texte("Une tangente peut dépasser 1 : avant d'appliquer arcsin ou arccos, on vérifie que la valeur est dans [−1 ; 1].")]));
      } else if (e.arcfonction !== ARC_DE_TRIG[e.trigfonction]) {
        etapes.push(piege(SQ, [texte("Les deux fonctions ne sont pas réciproques l'une de l'autre : on calcule la valeur intermédiaire, on ne simplifie pas.")]));
      }
      break;
    }
    case "trigArc": {
      const n: ValeurExacte = { latex: e.nombreLatex, numerique: e.nombreNumerique };
      const lignes: LigneCalcul[] = [ligneDomaine(e.arcfonction, n)];
      let raison: Fragments = [];
      if (e.causeInexistence === "horsDomaine") {
        raison = [latex(`${NOM_ARC[e.arcfonction]}\\left(${n.latex}\\right)`), texte(" n'est pas défini.")];
      } else {
        const alpha = angleDe(e.arcfonction, n.numerique);
        lignes.push(ligneAngle(e.arcfonction, n.latex, alpha.latex));
        if (e.causeInexistence === "anglePiSur2") {
          lignes.push(ligne(`\\cos\\left(${alpha.latex}\\right)=0`, "la tangente, quotient du sinus par le cosinus, n'est pas définie"));
          raison = [texte("la tangente n'est pas définie en "), latex(alpha.latex), texte(".")];
        } else {
          lignes.push(ligne(`${expr(e)}=${NOM_TRIG[e.trigfonction]}\\left(${alpha.latex}\\right)`, "on remplace l'angle"));
          lignes.push(ligne(`=${e.valeurLatex}`, "valeur remarquable"));
        }
      }
      etapes.push(
        utilise(SQ, [texte("On applique d'abord la définition : "), ...definition(e.arcfonction), texte(", puis on calcule "), texte(`${LETTRES_TRIG[e.trigfonction] === "tangente" ? "la tangente" : `le ${LETTRES_TRIG[e.trigfonction]}`} de cet angle ${COURS_CYCLO}.`)]),
        calcul(SQ, lignes),
        resultatEtape(e, raison),
      );
      const id = e.existe ? identite(e.trigfonction, e.arcfonction, n.latex) : null;
      if (id) etapes.push(verification(SQ, [texte("Par l'identité "), latex(id.gauche), texte(" :")], [ligne(`${id.droite}=${e.valeurLatex}`)]));
      if (e.causeInexistence === "horsDomaine") etapes.push(piege(SQ, [texte("La fonction extérieure ne sauve rien : si "), latex(`${NOM_ARC[e.arcfonction]}\\left(${n.latex}\\right)`), texte(" n'existe pas, l'expression entière n'existe pas.")]));
      else if (e.causeInexistence === "anglePiSur2") etapes.push(piege(SQ, [texte("Le nombre est bien dans le domaine, mais l'angle obtenu vaut "), latex(angleDe(e.arcfonction, n.numerique).latex), texte(" : la tangente n'y est pas définie.")]));
      else if (e.arcfonction === "arccos" && n.numerique < 0) etapes.push(piege(SQ, [texte("arccos d'un nombre négatif est un angle de "), latex("\\left]\\dfrac{\\pi}{2}\\,;\\,\\pi\\right]"), texte(" : son sinus est positif.")]));
      break;
    }
  }
  return finaliser(etapes);
}
