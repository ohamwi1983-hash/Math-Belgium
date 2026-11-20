import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLectureCercle, ValeurExacteSignee } from "../../core/lectureCercle.types";
import { LATEX_GRANDEUR, angleLatex, angleReference, candidatsCosinus, cosExact, position, sinExact, tanExact, valeurLatex } from "../../moteur/modeleLectureCercle";
import { figureSvg, intervalleLatex, reponseAngle, reponseCoordonnees, reponseTangente } from "../../ui/formatLectureCercle";
import { souderPonctuation } from "../../ui/formatDetectiveVecteurs";

/**
 * Corrigé détaillé « comme au tableau » de gen122 — règle `.claude/rules/feuilles-evaluations.md`,
 * conventions « Lectures graphiques » (une ligne par chose lue, avec une relation ; la
 * justification dit où on lit). Une lettre par écran : a) cos θ et sin θ lus, vérifiés par
 * cos²θ + sin²θ = 1 ; b) θ : angle du premier quadrant, deux candidats de même cosinus, le signe de
 * sin θ tranche ; c) tan θ = ordonnée de T sur la tangente x = 1 (figure avec (OM) et T), contrôlée
 * par sin θ / cos θ — ou le verdict « n'est pas définie ». Importé par l'adaptateur ET par l'appli.
 */

type E = ExerciceLectureCercle;
type Fragments = FragmentConsigne[];

const CARRE: Record<string, string> = { "0": "0", "1/2": "\\dfrac{1}{4}", "r2/2": "\\dfrac{2}{4}", "r3/2": "\\dfrac{3}{4}", "1": "1" };

/** Justification d'une coordonnée lue. */
function lueSur(v: ValeurExacteSignee, abscisse: boolean): Fragments {
  const nom = abscisse ? "abscisse" : "ordonnée";
  if (v.grandeur === "0") return [texte(`${nom} de M : M est sur l'axe ${abscisse ? "vertical" : "horizontal"}`)];
  const cote = abscisse ? (v.signe > 0 ? "à droite de l'axe vertical" : "à gauche de l'axe vertical") : v.signe > 0 ? "au-dessus de l'axe horizontal" : "en dessous de l'axe horizontal";
  return [texte(`${nom} de M : graduation `), latex(LATEX_GRANDEUR[v.grandeur]), texte(`, ${cote}`)];
}

function lignesAngle(e: E): LigneCalcul[] {
  const p = position(e);
  const cos = cosExact(e);
  const sin = sinExact(e);
  const cands = candidatsCosinus(e);
  if (p === "axe-horizontal") {
    return [
      ligne(`\\cos\\theta=${valeurLatex(cos)}`, [texte("un seul angle de "), latex(intervalleLatex(e)), texte(` a ce cosinus : le point du cercle le plus à ${cos.signe > 0 ? "droite" : "gauche"}`)]),
      ligne(`\\theta=${angleLatex(e)}`, "angle sur l'axe horizontal"),
    ];
  }
  if (p === "axe-vertical") {
    return [
      ligne("\\cos\\theta=0", [texte("deux candidats, les points de l'axe vertical : "), latex(angleLatex(e, cands[0]!)), texte(" et "), latex(angleLatex(e, cands[1]!))]),
      ligne(`\\sin\\theta=${valeurLatex(sin)}`, sin.signe > 0 ? "positif : M est en haut" : "négatif : M est en bas"),
      ligne(`\\theta=${angleLatex(e)}`, "angle sur l'axe vertical"),
    ];
  }
  const ref = angleReference(e);
  const alpha = angleLatex(e, ref);
  const quadrantDe = (d: number) => (d < 90 ? "I" : d < 180 ? "II" : d < 270 ? "III" : "IV");
  const lignes: LigneCalcul[] = [
    ligne(`|\\cos\\theta|=${LATEX_GRANDEUR[cos.grandeur]}`, "valeur lue, sans le signe"),
    ligne(`\\alpha=${alpha}`, [texte("angle du premier quadrant : l'angle aigu de cosinus "), latex(LATEX_GRANDEUR[cos.grandeur]), texte(" (§ 3)")]),
    ligne(`\\cos\\theta=${valeurLatex(cos)}`, [texte("deux candidats de même cosinus : "), latex(angleLatex(e, cands[0]!)), texte(` (quadrant ${quadrantDe(cands[0]!)}) et `), latex(angleLatex(e, cands[1]!)), texte(` (quadrant ${quadrantDe(cands[1]!)})`)]),
    ligne(`\\sin\\theta=${valeurLatex(sin)}`, sin.signe > 0 ? `positif : M au-dessus de l'axe horizontal, quadrant ${p}` : `négatif : M en dessous de l'axe horizontal, quadrant ${p}`),
  ];
  const [tour, demi] = ["360^\\circ", "180^\\circ"];
  if (p === "I") {
    lignes.push(ligne("\\theta=\\alpha", "formule du quadrant I (§ 1)"), ligne(`=${angleLatex(e)}`));
    return lignes;
  }
  const formule = p === "II" ? `${demi}-\\alpha` : p === "III" ? `${demi}+\\alpha` : `${tour}-\\alpha`;
  const substituee = p === "II" ? `${demi}-${alpha}` : p === "III" ? `${demi}+${alpha}` : `${tour}-${alpha}`;
  lignes.push(ligne(`\\theta=${formule}`, `formule du quadrant ${p} (§ 1)`), ligne(`=${substituee}`), ligne(`=${angleLatex(e)}`));
  return lignes;
}

function quotientLatex(sin: ValeurExacteSignee, cos: ValeurExacteSignee): string {
  const f = (v: ValeurExacteSignee) => valeurLatex(v).replace(/\\dfrac/g, "\\frac");
  return `\\dfrac{${f(sin)}}{${f(cos)}}`;
}

function lignesTangente(e: E): LigneCalcul[] {
  const t = tanExact(e);
  const p = position(e);
  if (t === null) return [ligne("\\cos\\theta=0", [texte("M est sur l'axe vertical : "), latex("(OM)"), texte(" est l'axe vertical, parallèle à la tangente "), latex("x=1"), texte(", aucun point T")])];
  let ou: Fragments;
  if (t.grandeur === "0") ou = [latex("(OM)"), texte(" est l'axe horizontal : T est le point "), latex("(1\\,;\\,0)")];
  else {
    const cote = t.signe > 0 ? "au-dessus de l'axe horizontal" : "en dessous de l'axe horizontal";
    ou = [texte("graduation "), latex(LATEX_GRANDEUR[t.grandeur]), texte(`, ${cote}`), texte(p === "II" || p === "III" ? " : (OM) prolongée au-delà de O" : " : du même côté que M")];
  }
  return [ligne("x_T=1", "T est sur la tangente"), ligne(`y_T=${valeurLatex(t)}`, ou), ligne("\\tan\\theta=y_T", "tan θ est l'ordonnée de T"), ligne(`=${valeurLatex(t)}`)];
}

export function correctionDetailleeLectureCercle(e: E): EtapeCorrection[] {
  const cos = cosExact(e);
  const sin = sinExact(e);
  const t = tanExact(e);
  const p = position(e);
  const ref = angleReference(e);
  const etapes: EtapeCorrection[] = [
    utilise("a", [
      texte("Le point M(θ) a pour coordonnées "),
      latex("(\\cos\\theta\\,;\\,\\sin\\theta)"),
      texte(" (cours, § 1). Les lignes du quadrillage sont les valeurs remarquables (cours, § 3), graduées sur les demi-axes positifs : on lit la graduation de la ligne symétrique, le côté de l'axe donne le signe."),
    ]),
    calcul("a", [ligne(`\\cos\\theta=${valeurLatex(cos)}`, lueSur(cos, true)), ligne(`\\sin\\theta=${valeurLatex(sin)}`, lueSur(sin, false))]),
    resultat("a", souderPonctuation(reponseCoordonnees(e))),
    verification("a", [texte("M est bien sur le cercle :")], [ligne(`\\cos^2\\theta+\\sin^2\\theta=${CARRE[cos.grandeur]}+${CARRE[sin.grandeur]}`), ligne("=1")]),
    piege("a", [latex("\\cos\\theta"), texte(" se lit sur l'axe horizontal (abscisse), "), latex("\\sin\\theta"), texte(" sur l'axe vertical (ordonnée) ; la graduation donne la valeur sans le signe.")]),
    utilise("b", [
      texte("Deux angles de "),
      latex(intervalleLatex(e)),
      texte(" ont le même cosinus ; le signe de "),
      latex("\\sin\\theta"),
      texte(" (M au-dessus ou en dessous de l'axe horizontal) tranche. Hors des axes, on part de l'angle du premier quadrant "),
      latex("\\alpha"),
      texte(" et de la formule du quadrant (cours, § 1)."),
    ]),
    calcul("b", lignesAngle(e)),
    resultat("b", reponseAngle(e)),
    verification("b", [texte("Les valeurs du tableau redonnent la lecture :")], [
      ligne(`\\cos ${angleLatex(e)}=${valeurLatex(cos)}`),
      ligne(`\\sin ${angleLatex(e)}=${valeurLatex(sin)}`),
    ]),
    piege(
      "b",
      p.startsWith("axe")
        ? [texte("Sur un axe, pas d'angle du premier quadrant : "), latex("\\theta"), texte(" vaut "), latex("0^\\circ,\\ 90^\\circ,\\ 180^\\circ"), texte(" ou "), latex("270^\\circ"), texte(".")]
        : [
            latex(angleLatex(e, candidatsCosinus(e)[0]!)),
            texte(" et "),
            latex(angleLatex(e, candidatsCosinus(e)[1]!)),
            texte(" ont le même cosinus : c'est le signe de "),
            latex("\\sin\\theta"),
            texte(" qui tranche. "),
            ...(p === "I" ? [] : [texte("Ne pas donner l'angle du premier quadrant "), latex(angleLatex(e, ref)), texte(".")]),
          ],
    ),
    utilise("c", [
      latex("\\tan\\theta"),
      texte(" est l'ordonnée du point T où la droite "),
      latex("(OM)"),
      texte(" coupe la tangente au cercle en "),
      latex("(1\\,;\\,0)"),
      texte(", la droite "),
      latex("x=1"),
      texte(" (cours, § 1). Si "),
      latex("(OM)"),
      texte(" est parallèle à cette tangente, "),
      latex("\\tan\\theta"),
      texte(" n'est pas définie."),
    ]),
    calcul("c", lignesTangente(e)),
    { ...resultat("c", souderPonctuation(reponseTangente(e))), figureHtml: `<div style="max-width:8cm;margin:0 auto">${figureSvg(e, { tangente: true, droiteOM: true })}</div>` },
  ];
  if (t !== null) etapes.push(verification("c", [texte("Par le quotient :")], [ligne(`\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}`), ligne(`=${quotientLatex(sin, cos)}`), ligne(`=${valeurLatex(t)}`)]));
  etapes.push(
    piege(
      "c",
      t === null
        ? [latex("\\cos\\theta=0"), texte(" : le quotient "), latex("\\dfrac{\\sin\\theta}{\\cos\\theta}"), texte(" n'existe pas, et "), latex("(OM)"), texte(" ne coupe jamais la tangente.")]
        : [latex("\\tan\\theta"), texte(" se lit sur la tangente "), latex("x=1"), texte(", pas sur l'axe vertical (ce serait "), latex("\\sin\\theta"), texte(p === "II" || p === "III" ? ") ; M est à gauche de l'axe vertical : on prolonge (OM) au-delà de O." : ").")],
    ),
  );
  return etapes;
}
