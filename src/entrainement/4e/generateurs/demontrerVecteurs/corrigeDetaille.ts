import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { Coefficients, ExerciceDemontrerVecteurs, PointDefini, Rationnel, VecteurNomme } from "../../core/demontrerVecteurs.types";
import { cFois, cMoins, coefficientColinearite, coefficientsVecteur, divise, egaux, estNul, fois, positions, q } from "../../moteur/modeleDemontrerVecteurs";
import { construireFigureDemontrerVecteurs } from "../../ui/figureDemontrerVecteurs";
import { baseAdapteeLatex, baseLatex, combinaisonLatex, conclusionFragments, expressionVecteurLatex, rationnelLatex, relationColineariteLatex, uLatex, vLatex, vecLatex } from "../../ui/formatDemontrerVecteurs";
import { COURS_CHASLES, COURS_COLINEARITE, COURS_DECOMPOSER, COURS_MULTIPLE, COURS_VECTEUR, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen85 « Démontrer avec des vecteurs » — règle
 * `.claude/rules/feuilles-evaluations.md`. Mécanique propre au générateur, quatre ÉCRANS : a) choix de
 * la base adaptée (les deux autres propositions écartées par un calcul), b) les deux vecteurs utiles
 * exprimés dans la base (Chasles, positions des points définis, réduction : une opération par ligne),
 * c) le coefficient k (même k pour les deux coefficients), d) la conclusion et la propriété citée.
 * Partagé par l'adaptateur papier et l'appli. Calcul exact (rationnels du modèle).
 */

type E = ExerciceDemontrerVecteurs;

function rp(r: Rationnel): string {
  return r.n < 0 ? `(${rationnelLatex(r)})` : rationnelLatex(r);
}

function dansBase(e: E, c: Coefficients): string {
  return combinaisonLatex(c, uLatex(), vLatex(e)).replace(/ /g, "");
}

/** Combinaison précédée d'un coefficient : « \dfrac{1}{2}(\vec{AB}+\vec{AD}) », « -\vec{AB} ». */
function kFois(k: Rationnel, c: Coefficients, e: E): string {
  const brut = dansBase(e, c);
  const deuxTermes = !estNul(c.x) && !estNul(c.y);
  if (egaux(k, q(1))) return brut;
  if (egaux(k, q(-1))) return deuxTermes || brut.startsWith("-") ? `-(${brut})` : `-${brut}`;
  return deuxTermes || brut.startsWith("-") ? `${rationnelLatex(k)}(${brut})` : `${rationnelLatex(k)}${brut}`;
}

/** Somme « A + B » de deux écritures déjà en LaTeX (B commence peut-être par « − »). */
function sommeL(a: string, b: string): string {
  return b.startsWith("-") ? `${a}${b}` : `${a}+${b}`;
}

/** Terme « k·\vec{XY} » d'une relation de l'énoncé. */
function terme(k: Rationnel, nom: string): string {
  if (egaux(k, q(1))) return nom;
  if (egaux(k, q(-1))) return `-${nom}`;
  return `${rationnelLatex(k)}${nom}`;
}

function sansDoublonsConsecutifs(lignes: LigneCalcul[]): LigneCalcul[] {
  const out: LigneCalcul[] = [];
  for (const l of lignes) {
    const prec = out[out.length - 1];
    const brut = (s: string) => s.replace(/^[^=]*=/, "").replace(/\s/g, "");
    if (prec && brut(prec.latex) === brut(l.latex)) continue;
    out.push(l);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// a) Base adaptée
// ---------------------------------------------------------------------------------------------

function lignesSommetC(e: E): LigneCalcul[] {
  if (e.figure === "parallelogramme") return [ligne("\\vec{AC}=\\vec{AB}+\\vec{BC}", "relation de Chasles"), ligne("=\\vec{AB}+\\vec{AD}", "ABCD parallélogramme : BC = AD (vecteurs)")];
  if (e.figure === "trapeze") return [ligne("\\vec{AC}=\\vec{AD}+\\vec{DC}", "relation de Chasles"), ligne(`=\\vec{AD}+${terme(e.t ?? q(1, 2), "\\vec{AB}")}`, [texte("trapèze : "), latex(`\\vec{DC}=${terme(e.t ?? q(1, 2), "\\vec{AB}")}`)])];
  return [];
}

function etapesBase(e: E): EtapeCorrection[] {
  const col = e.bases.find((b) => b.id === "colineaire")!;
  const mal = e.bases.find((b) => b.id === "maladroite")!;
  const cu = coefficientsVecteur(e, col.u);
  const cv = coefficientsVecteur(e, col.v);
  const k = estNul(cu.x) ? divise(cv.y, cu.y) : divise(cv.x, cu.x);
  const lignes: LigneCalcul[] = [
    ligne(`${vecLatex(col.v)}=${terme(k, vecLatex(col.u))}`, [latex(baseLatex(col)), texte(" : vecteurs colinéaires, ce n'est pas une base")]),
  ];
  const sommets = lignesSommetC(e);
  if (sommets.length) lignes.push(...sommets.map((l, i) => (i === 0 ? { ...l, justification: [latex(baseAdapteeLatex(e)), texte(" : sommets exprimés directement (Chasles)")] } : l)));
  else lignes.push(ligne("\\vec{BC}=-\\vec{AB}+\\vec{AC}", [latex(baseAdapteeLatex(e)), texte(" : chaque vecteur de la figure s'y exprime directement (Chasles)")]));
  const mu = coefficientsVecteur(e, mal.u);
  const lMal = `${vecLatex(mal.u)}=${dansBase(e, mu)}`;
  if (!lignes.some((l) => l.latex === lMal)) lignes.push(ligne(lMal, [latex(baseLatex(mal)), texte(" : déjà une combinaison, les calculs s'allongent")]));
  return [
    utilise("a", [
      texte(`Une base est formée de deux vecteurs non colinéaires ${COURS_DECOMPOSER} ; la plus pratique part d'un même sommet, le long de deux côtés de la figure : les relations de l'énoncé s'y traduisent directement.`),
    ]),
    calcul("a", lignes),
    resultat("a", [texte("Base adaptée : "), latex(baseAdapteeLatex(e)), texte(" — deux vecteurs non colinéaires, de même origine A, portés par les côtés ; "), latex(baseLatex(mal)), texte(" est aussi une base, mais aucun sommet ne s'y exprime directement.")]),
    piege("a", [latex(baseLatex(col)), texte(" n'est pas une base : ses deux vecteurs sont colinéaires (portés par des droites parallèles).")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// b) Vecteurs utiles dans la base
// ---------------------------------------------------------------------------------------------

/** Position d'un point défini : Chasles, relation de l'énoncé, substitution, réduction. */
function lignesPoint(e: E, d: PointDefini): LigneCalcul[] {
  const p = positions(e);
  const dir = cMoins(p[d.vers]!, p[d.de]!);
  const kVec = terme(d.k, `\\vec{${d.de}${d.vers}}`);
  const lignes: LigneCalcul[] = [];
  const nomDir = `\\vec{${d.de}${d.vers}}`;
  const justifDir: string | FragmentConsigne[] =
    d.de === "A" ? "on remplace par la combinaison" : d.vers === "A" ? [texte("on remplace, avec "), latex(`{${nomDir}=-\\vec{A${d.de}}}`)] : [texte("on remplace, avec "), latex(`{${nomDir}=\\vec{A${d.vers}}-\\vec{A${d.de}}}`)];
  if (d.origine === "A") {
    lignes.push(ligne(`\\vec{A${d.nom}}=${kVec}`, "relation de l'énoncé"));
    lignes.push(ligne(`=${kFois(d.k, dir, e)}`, justifDir));
  } else {
    lignes.push(ligne(`\\vec{A${d.nom}}=\\vec{A${d.origine}}+\\vec{${d.origine}${d.nom}}`, "relation de Chasles"));
    lignes.push(ligne(`=${sommeL(`\\vec{A${d.origine}}`, kVec)}`, "relation de l'énoncé"));
    lignes.push(ligne(`=${sommeL(dansBase(e, p[d.origine]!), kFois(d.k, dir, e))}`, justifDir));
  }
  const kd = cFois(d.k, dir);
  if (!egaux(d.k, q(1)) && !egaux(d.k, q(-1)) && !estNul(dir.x) && !estNul(dir.y)) {
    lignes.push(ligne(`=${d.origine === "A" ? dansBase(e, kd) : sommeL(dansBase(e, p[d.origine]!), dansBase(e, kd))}`, "on distribue"));
  } else if (egaux(d.k, q(-1)) && !estNul(dir.x) && !estNul(dir.y)) {
    lignes.push(ligne(`=${d.origine === "A" ? dansBase(e, kd) : sommeL(dansBase(e, p[d.origine]!), dansBase(e, kd))}`, "on distribue le signe −"));
  }
  lignes.push(ligne(`=${dansBase(e, p[d.nom]!)}`, "on regroupe"));
  return sansDoublonsConsecutifs(lignes);
}

function lignesVecteur(e: E, vec: VecteurNomme): LigneCalcul[] {
  const p = positions(e);
  const res = dansBase(e, coefficientsVecteur(e, vec));
  if (vec.de === "A") return [ligne(`${vecLatex(vec)}=${dansBase(e, p[vec.vers]!)}`, "position déjà calculée")];
  const opp = (c: Coefficients) => dansBase(e, cFois(q(-1), c));
  if (vec.vers === "A") return sansDoublonsConsecutifs([ligne(`${vecLatex(vec)}=-\\vec{A${vec.de}}`, "vecteur opposé"), ligne(`=${opp(p[vec.de]!)}`, "on remplace et on change les signes"), ligne(`=${res}`)]);
  return sansDoublonsConsecutifs([
    ligne(`${vecLatex(vec)}=\\vec{${vec.de}A}+\\vec{A${vec.vers}}`, "relation de Chasles"),
    ligne(`=-\\vec{A${vec.de}}+\\vec{A${vec.vers}}`, [latex(`{\\vec{${vec.de}A}=-\\vec{A${vec.de}}}`)]),
    ligne(`=${sommeL(opp(p[vec.de]!), dansBase(e, p[vec.vers]!))}`, "on remplace (signes changés pour le premier)"),
    ligne(`=${res}`, "on regroupe"),
  ]);
}

function etapesExpressions(e: E): EtapeCorrection[] {
  const utiles = new Set([e.w.de, e.w.vers, e.v.de, e.v.vers]);
  const definisUtiles = e.definis.filter((d) => utiles.has(d.nom));
  const avecC = new Set(utiles);
  for (const d of definisUtiles) [d.origine, d.de, d.vers].forEach((n) => avecC.add(n));
  const etapes: EtapeCorrection[] = [
    utilise("b", [
      texte(`Relation de Chasles ${COURS_CHASLES} : `),
      latex("\\vec{XY}=\\vec{XA}+\\vec{AY}=-\\vec{AX}+\\vec{AY}"),
      texte(` ; on remplace chaque vecteur qui part de A par sa combinaison dans la base ${COURS_VECTEUR}.`),
    ]),
  ];
  if (e.figure !== "triangle" && avecC.has("C")) etapes.push(calcul("b", lignesSommetC(e), [], "Sommet C"));
  for (const d of definisUtiles) etapes.push(calcul("b", lignesPoint(e, d), [], `Point ${d.nom}`));
  etapes.push(calcul("b", lignesVecteur(e, e.w), [], "Premier vecteur"));
  etapes.push(calcul("b", lignesVecteur(e, e.v), [], "Second vecteur"));
  etapes.push({
    ...resultat("b", [latex(expressionVecteurLatex(e, e.w)), texte(" et "), latex(expressionVecteurLatex(e, e.v))]),
    figureHtml: construireFigureDemontrerVecteurs(e, { theme: "papier", vecteurs: true }),
  });
  return etapes;
}

// ---------------------------------------------------------------------------------------------
// c) Coefficient de colinéarité
// ---------------------------------------------------------------------------------------------

function etapesColinearite(e: E): EtapeCorrection[] {
  const w = coefficientsVecteur(e, e.w);
  const v = coefficientsVecteur(e, e.v);
  const k = coefficientColinearite(e);
  const surX = !estNul(w.x);
  const [cv, cw, nom, autreW, autreNom] = surX ? [v.x, w.x, uLatex(), w.y, vLatex(e)] : [v.y, w.y, vLatex(e), w.x, uLatex()];
  return [
    utilise("c", [
      texte(`Deux vecteurs sont colinéaires quand l'un est un multiple de l'autre ${COURS_MULTIPLE} : `),
      latex(`${vecLatex(e.v)}=k\\,${vecLatex(e.w)}`),
      texte(` exige le MÊME nombre k pour les deux coefficients ${COURS_COLINEARITE}.`),
    ]),
    calcul("c", [
      ligne(`${rationnelLatex(cv)}=k\\cdot ${rp(cw)}`, [texte("coefficients de "), latex(nom)]),
      ligne(`k=${rationnelLatex(divise(cv, cw))}`, `on divise par ${rationnelLatex(cw).replace("-", "−").replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`),
      ligne(`k\\cdot ${rp(autreW)}=${rationnelLatex(k)}\\cdot ${rp(autreW)}`, [texte("contrôle avec les coefficients de "), latex(autreNom)]),
      ligne(`=${rationnelLatex(fois(k, autreW))}`, "on retrouve le coefficient du second vecteur"),
    ]),
    resultat("c", [latex(relationColineariteLatex(e)), texte(` (k = `), latex(rationnelLatex(k)), texte(")")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// d) Conclusion
// ---------------------------------------------------------------------------------------------

function etapesConclusion(e: E): EtapeCorrection[] {
  const c = e.cible;
  const rel = relationColineariteLatex(e);
  let regle: FragmentConsigne[];
  const lignes: LigneCalcul[] = [ligne(rel, "étape c")];
  switch (c.type) {
    case "alignes": {
      const [X] = c.points;
      regle = [texte(`Deux vecteurs colinéaires qui ont un point commun sont portés par la même droite : les points sont alignés ${COURS_COLINEARITE}.`)];
      lignes.push(ligne(`${X}=\\text{origine de }${vecLatex(e.w)}=\\text{origine de }${vecLatex(e.v)}`, "point commun des deux vecteurs"));
      break;
    }
    case "paralleles":
      regle = [texte(`Deux vecteurs colinéaires sont portés par des droites parallèles ${COURS_COLINEARITE}.`)];
      lignes.push(ligne(`k=${rationnelLatex(coefficientColinearite(e))}\\neq 0`, "vecteurs colinéaires (non nuls)"));
      break;
    case "milieu":
      regle = [texte(`M est le milieu de [UV] si et seulement si `), latex("\\vec{UM}=\\vec{MV}"), texte(` : deux vecteurs égaux mis bout à bout ${COURS_VECTEUR}.`)];
      lignes.push(ligne("k=1", "vecteurs égaux, mis bout à bout"));
      break;
    case "parallelogramme":
      regle = [texte(`PQRS est un parallélogramme si et seulement si `), latex("\\vec{PQ}=\\vec{SR}"), texte(` : deux côtés opposés, parcourus dans le même sens ${COURS_VECTEUR}.`)];
      lignes.push(ligne("k=1", "vecteurs égaux : côtés opposés, même sens"));
      break;
  }
  return [utilise("d", regle), calcul("d", lignes), resultat("d", conclusionFragments(e, "juste"))];
}

function lignePiege(e: E): EtapeCorrection {
  const c = e.cible;
  switch (c.type) {
    case "alignes":
      return piege("d", [texte(`Des vecteurs colinéaires seuls donnent des droites parallèles ; c'est le point commun ${c.points[0]} des deux vecteurs qui donne l'alignement.`)]);
    case "paralleles":
      return piege("d", [texte(`Colinéaires ne veut pas dire alignés : les droites (${c.droite1.join("")}) et (${c.droite2.join("")}) n'ont aucun point commun, elles sont parallèles et distinctes.`)]);
    default: {
      const vec = [e.w, e.v].find((x) => x.de !== "A" && x.vers !== "A");
      if (!vec) return piege("d", [texte("L'ordre des points compte dans l'égalité de deux vecteurs.")]);
      return piege("b", [texte("Chasles mal enchaîné : "), latex(`\\vec{${vec.de}A} = -\\vec{A${vec.de}}`), texte(", et pas "), latex(`\\vec{A${vec.de}}`), texte(" — sinon le signe d'un coefficient est faux.")]);
    }
  }
}

function corrigeBrutDemontrerVecteurs(e: E): EtapeCorrection[] {
  const etapes = [...etapesBase(e), ...etapesExpressions(e), ...etapesColinearite(e), ...etapesConclusion(e)];
  const p = lignePiege(e);
  const fin = etapes.map((x) => x.sousQuestion).lastIndexOf(p.sousQuestion);
  etapes.splice(fin + 1, 0, p);
  return etapes;
}

export function correctionDetailleeDemontrerVecteurs(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutDemontrerVecteurs(e));
}
