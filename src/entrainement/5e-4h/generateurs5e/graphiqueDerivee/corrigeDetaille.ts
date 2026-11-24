import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceGraphiqueDerivee } from "../../core5e/graphiqueDerivee";
import { ensembleConcave, ensembleConvexe, extremums, fp, fpp, morceaux } from "../../core5e/graphiqueDerivee";
import { intervalleL } from "../../moteur5e/ensemblesReels";
import { COURS_LECTURE, COURS_SIGNE } from "../../ui5e/corrigeDerivees1";
import { figureExtremumsFp, figureZeros, reponse, tableauSignesL } from "../../ui5e/formatGraphiqueDerivee";

/**
 * Corrigé détaillé « comme au tableau » de `5gen74`, une lettre par écran : a) zéros lus puis signe
 * de f′ intervalle par intervalle (au-dessus / en dessous de l'axe), tableau de signes, figure des
 * zéros ; b) changement de signe en chaque zéro (max, min, palier) et variations de f ; c) sens de
 * variation de f′ de part et d'autre de ses sommets (f′ croît ⟺ f″ > 0 ⟺ f convexe), figure des
 * sommets ; d) points d'inflexion = extremums de f′.
 */

type E = ExerciceGraphiqueDerivee;
const t = texte;
const f = latex;
const ouvert = (g: number, d: number) => intervalleL({ g, gF: false, d, dF: false });

function etapeA(e: E): EtapeCorrection[] {
  const bornes = e.zeros.map((z) => z.x);
  const L: LigneCalcul[] = [];
  if (e.zeros.length === 0) L.push(ligne("f'(x)\\neq 0", "la courbe de f′ ne touche jamais l'axe des abscisses"));
  else L.push(ligne(`f'(x)=0\\iff x\\in\\{${bornes.join("\\,;")}\\}`, e.zeros.some((z) => z.double) ? "points où la courbe touche l'axe (sans le traverser en x = " + e.zeros.filter((z) => z.double).map((z) => `${z.x}`).join(", ").replace(/-/g, "−") + ")" : "points où la courbe coupe l'axe des abscisses"));
  for (const m of morceaux(bornes)) {
    const s = fp(e, m.test) > 0;
    L.push(ligne(`f'(x)${s ? ">" : "<"}0\\text{ sur }${ouvert(m.g, m.d)}`, s ? "courbe au-dessus de l'axe" : "courbe en dessous de l'axe"));
  }
  L.push(ligne(tableauSignesL(e)));
  return [
    utilise("a", [t("Le signe de f′ se lit sur la position de sa courbe : au-dessus de l'axe des abscisses, "), f("f'(x)>0"), t(" ; en dessous, "), f("f'(x)<0"), t(` ${COURS_LECTURE}.`)]),
    { ...calcul("a", L), figureHtml: figureZeros(e) },
    resultat("a", reponse(e, "signe")),
    piege("a", [t("Lire ce graphique comme celui de f (« la courbe monte ») : ici on regarde seulement de quel côté de l'axe elle se trouve.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = [];
  if (e.zeros.length === 0) L.push(ligne(`f'(x)${fp(e, 0) > 0 ? ">" : "<"}0\\text{ sur }\\mathbb{R}`, `f ${fp(e, 0) > 0 ? "croissante" : "décroissante"} sur ℝ : aucun extremum`));
  for (const z of e.zeros) {
    const avant = fp(e, z.x - 0.5) > 0 ? "+" : "-";
    const apres = fp(e, z.x + 0.5) > 0 ? "+" : "-";
    const nature = avant === apres ? "pas de changement de signe : palier, pas d'extremum" : avant === "+" ? "f′ passe de + à − : maximum local" : "f′ passe de − à + : minimum local";
    L.push(ligne(`x=${z.x}\\;:\\;${avant}\\;0\\;${apres}`, nature));
  }
  for (const m of morceaux(e.zeros.map((z) => z.x))) {
    if (e.zeros.length === 0) break;
    L.push(ligne(`f\\text{ ${fp(e, m.test) > 0 ? "croissante" : "décroissante"} sur }${intervalleL({ g: m.g, gF: Number.isFinite(m.g), d: m.d, dF: Number.isFinite(m.d) })}`, fp(e, m.test) > 0 ? "f′ > 0" : "f′ < 0"));
  }
  const { maxima, minima } = extremums(e);
  return [
    utilise("b", [t("f a un extremum local en a quand f′ s'annule en a EN CHANGEANT DE SIGNE : de + à −, maximum ; de − à +, minimum. Sans changement de signe : palier "), t(`${COURS_SIGNE}.`)]),
    calcul("b", L),
    resultat("b", reponse(e, "extremums")),
    ...(e.zeros.some((z) => z.double) ? [verification("b", [t("Un zéro de f′ ne suffit pas : en "), f(`x=${e.zeros.find((z) => z.double)!.x}`), t(", la tangente à la courbe de f est horizontale, mais f garde le même sens de variation.")])] : []),
    piege("b", [t(maxima.length + minima.length > 0 ? "Prendre le sommet de la courbe de f′ pour un extremum de f, ou compter un zéro sans changement de signe." : "Voir un extremum de f au sommet de la courbe de f′ : f′ ne change pas de signe, f est monotone.")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = [];
  for (const m of morceaux(e.inflexions)) {
    const croit = fpp(e, m.test) > 0;
    L.push(ligne(`f'\\text{ ${croit ? "croissante" : "décroissante"} sur }${ouvert(m.g, m.d)}`, croit ? "f″ > 0 : f convexe" : "f″ < 0 : f concave"));
  }
  return [
    utilise("c", [t("f″ est la dérivée de f′ : là où f′ croît, "), f("f''>0"), t(" et f est convexe ; là où f′ décroît, "), f("f''<0"), t(` et f est concave ${COURS_SIGNE}.`)]),
    { ...calcul("c", L), figureHtml: figureExtremumsFp(e) },
    resultat("c", [t("f convexe sur "), f(ensembleConvexeL(e)), t(" ; f concave sur "), f(ensembleConcaveL(e))]),
    piege("c", [t("Lire la concavité sur le signe de f′ : le signe de f′ donne les variations de f, ses variations donnent la concavité de f.")]),
  ];
}

const ensembleConvexeL = (e: E): string => reponseLatex(ensembleConvexe(e));
const ensembleConcaveL = (e: E): string => reponseLatex(ensembleConcave(e));
function reponseLatex(ens: { g: number; d: number; gF: boolean; dF: boolean }[]): string {
  return ens.length === 0 ? "\\varnothing" : ens.map(intervalleL).join("\\cup ");
}

function etapeD(e: E): EtapeCorrection[] {
  const L = e.inflexions.map((x) => ligne(`x=${x}`, `sommet de la courbe de f′ (y = ${fp(e, x)}) : f″ change de signe`.replace(/-/g, "−")));
  return [
    utilise("d", [t("Un point d'inflexion de f est un point où f″ change de signe, donc où f′ passe de croissante à décroissante (ou l'inverse) : un extremum de f′ "), t(`${COURS_LECTURE}.`)]),
    calcul("d", L),
    resultat("d", reponse(e, "inflexion")),
    verification("d", [t("Ce sont les bornes des intervalles de concavité trouvés à l'étape précédente.")]),
    piege("d", [t("Donner les zéros de f′ : un ZÉRO de f′ donne un extremum (ou un palier) de f, un EXTREMUM de f′ donne un point d'inflexion de f.")]),
  ];
}

export function correctionDetailleeGraphiqueDerivee(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e)];
}
