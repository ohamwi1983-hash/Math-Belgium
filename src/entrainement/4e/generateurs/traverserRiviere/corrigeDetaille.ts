import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTraverserRiviere } from "../../core/traverserRiviere.types";
import { arrondi, duree, estDecimalCourt, estExacte, normeVitesseReelle, valeurAffichee, vitesseReelle } from "../../moteur/modeleTraverserRiviere";
import { construireFigureTraverserRiviere } from "../../ui/figureTraverserRiviere";
import { VC, VP, VR, colonne, n, radicande, reponseAttendueFragments, resultatFragments, sujet } from "../../ui/formatTraverserRiviere";
import { COURS_NORME, COURS_PHYSIQUE, COURS_SOMME_REPERE, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen87 « Traverser une rivière : vitesses en composantes » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`moteur/modeleTraverserRiviere.ts::ecransDe`) ;
 * partagé par l'adaptateur papier et l'appli. Tout en composantes ; une valeur non décimale reste
 * EXACTE (fraction, racine) dans les calculs qui suivent, l'arrondi n'arrive qu'en dernière ligne
 * (« ≈ »), avec les mêmes valeurs affichées que l'écran (`valeurAffichee`, `membreDroit`).
 */

type E = ExerciceTraverserRiviere;

const XR = `x_{${VR}}`;
const YR = `y_{${VR}}`;
const XP = `x_{${VP}}`;
const YP = `y_{${VP}}`;

function np(v: number): string {
  return v < 0 ? `(${n(v)})` : n(v);
}

/** « = 12,5 » si la valeur est un décimal court, sinon « ≈ 12,5 » (valeur affichée par l'écran). */
function fin(exacte: boolean, affichee: number): string {
  return `${exacte ? "=" : "\\approx "}${n(affichee)}`;
}

function figure(e: E): string {
  return construireFigureTraverserRiviere(e, { theme: "papier", resolue: true });
}

function correctionAccostage(e: E): EtapeCorrection[] {
  const c = e.courant;
  const vR = vitesseReelle(e);
  const t = duree(e);
  const tExact = estDecimalCourt(t);
  const xExact = vR.x * t;
  const s = sujet(e);
  const etapes: EtapeCorrection[] = [];
  // a) vitesse réelle
  const lignesA: LigneCalcul[] = [ligne(`${VC}=${colonne(n(c), "0")}`, "courant parallèle aux rives, dans le sens de l'axe x")];
  if (e.perpendiculaire) lignesA.push(ligne(`${VP}=${colonne("0", n(e.py))}`, "vitesse propre perpendiculaire aux rives : composante x nulle"));
  lignesA.push(ligne(`${VR}=${VP}+${VC}`, "les vitesses s'additionnent comme des vecteurs"), ligne(`=${colonne(`${n(e.px)}+${n(c)}`, `${n(e.py)}+0`)}`, "composante par composante"), ligne(`=${colonne(n(vR.x), n(vR.y))}`));
  etapes.push(
    utilise("a", [texte(`Deux vitesses s'additionnent comme des vecteurs ${COURS_PHYSIQUE} ; dans un repère, on additionne composante par composante ${COURS_SOMME_REPERE}.`)]),
    calcul("a", lignesA),
    resultat("a", reponseAttendueFragments(e, 0)),
  );
  // b) durée
  etapes.push(
    utilise("b", [texte("Seule la composante y de la vitesse réelle rapproche de l'autre rive ; la composante x fait glisser le long de la rive. Il faut parcourir la largeur L selon y : "), latex(`t=\\dfrac{L}{${YR}}`), texte(".")]),
    calcul("b", [ligne(`t=\\dfrac{L}{${YR}}`, "durée = distance ÷ vitesse, selon y"), ligne(`=\\dfrac{${n(e.largeur)}}{${n(vR.y)}}`, `L = ${n(e.largeur)} m`), ligne(fin(tExact, valeurAffichee(e, "duree")), tExact ? "en secondes" : "en secondes, arrondi au dixième")]),
    resultat("b", resultatFragments(e, "duree")),
    piege("b", [
      texte("Le courant ne change pas la durée de la traversée : il ne fait que déporter le long de la rive. Diviser L par la vitesse réelle donnerait "),
      latex(`\\dfrac{${n(e.largeur)}}{${estExacte(e, "vitesse") ? n(valeurAffichee(e, "vitesse")) : `\\sqrt{${n(radicande(e, "vitesse"))}}`}} ${estDecimalCourt(e.largeur / normeVitesseReelle(e)) ? "=" : "\\approx"} ${n(arrondi(e.largeur / normeVitesseReelle(e), 10))}`),
      texte(" s, ce qui est faux."),
    ]),
  );
  // c) point d'accostage
  const lignesC: LigneCalcul[] = [ligne(`x_A=${XR}\\cdot t`, "pendant la traversée, glissement selon x")];
  if (tExact) lignesC.push(ligne(`=${n(vR.x)}\\cdot ${n(t)}`, "durée de l'étape b"));
  else lignesC.push(ligne(`=${n(vR.x)}\\cdot\\dfrac{${n(e.largeur)}}{${n(vR.y)}}`, "durée exacte de l'étape b, non arrondie"));
  lignesC.push(ligne(fin(estDecimalCourt(xExact), valeurAffichee(e, "accostage")), estDecimalCourt(xExact) ? "en mètres" : "en mètres, arrondi au dixième"));
  etapes.push(
    utilise("c", [texte("Pendant la durée t, la composante x de la vitesse réelle fait glisser vers l'aval : distance = vitesse × durée, selon x ; A a pour ordonnée la largeur L.")]),
    calcul("c", lignesC),
    resultat("c", [...resultatFragments(e, "accostage"), texte(` : ${s} accoste au point `), latex(`A(${n(valeurAffichee(e, "accostage"))}\\,;\\,${n(e.largeur)})`), texte(", en aval du point F.")]),
  );
  // d) vitesse réelle ou distance parcourue
  if (e.quatrieme === "vitesse") {
    const R = radicande(e, "vitesse");
    etapes.push(
      utilise("d", [texte("La vitesse réelle est la norme du vecteur vitesse réelle : "), latex(`\\|${VR}\\|=\\sqrt{${XR}^2+${YR}^2}`), texte(` ${COURS_NORME}.`)]),
      calcul("d", [
        ligne(`\\|${VR}\\|=\\sqrt{${XR}^2+${YR}^2}`, "norme"),
        ligne(`=\\sqrt{${np(vR.x)}^2+${np(vR.y)}^2}`, "composantes de l'étape a"),
        ligne(`=\\sqrt{${n(arrondi(vR.x * vR.x, 1e6))}+${n(arrondi(vR.y * vR.y, 1e6))}}`),
        ligne(`=\\sqrt{${n(R)}}`),
        ligne(fin(estExacte(e, "vitesse"), valeurAffichee(e, "vitesse")), estExacte(e, "vitesse") ? "en m/s" : "en m/s, arrondi au centième"),
      ]),
      { ...resultat("d", [texte("Vitesse réelle : "), ...resultatFragments(e, "vitesse"), texte(". Figure : triangle des vitesses et trajectoire réelle [DA].")]), figureHtml: figure(e) },
    );
  } else {
    const R = radicande(e, "distance");
    const xA = valeurAffichee(e, "accostage");
    etapes.push(
      utilise("d", [texte("Le trajet réel est le segment [DA], avec "), latex("D(0\\,;\\,0)"), texte(" et "), latex(`A(x_A\\,;\\,L)`), texte(` : sa longueur est la norme de `), latex("\\vec{DA}"), texte(` ${COURS_NORME}.`)]),
      calcul("d", [
        ligne("DA=\\sqrt{x_A^2+L^2}", "norme de DA (Pythagore dans le repère)"),
        ligne(`=\\sqrt{${np(xA)}^2+${n(e.largeur)}^2}`, "valeurs des étapes c et de l'énoncé"),
        ligne(`=\\sqrt{${n(arrondi(xA * xA, 1e6))}+${n(e.largeur * e.largeur)}}`),
        ligne(`=\\sqrt{${n(R)}}`),
        ligne(fin(estExacte(e, "distance"), valeurAffichee(e, "distance")), estExacte(e, "distance") ? "en mètres" : "en mètres, arrondi au dixième"),
      ]),
      { ...resultat("d", [texte("Distance réellement parcourue : "), ...resultatFragments(e, "distance"), texte(". Figure : triangle des vitesses et trajectoire réelle [DA].")]), figureHtml: figure(e) },
    );
    if (tExact && estExacte(e, "vitesse")) {
      etapes.push(
        verification("d", [texte("Même résultat avec la vitesse réelle, parcourue pendant t : ")], [
          ligne(`DA=\\|${VR}\\|\\cdot t`, "distance = vitesse × durée"),
          ligne(`=${n(valeurAffichee(e, "vitesse"))}\\cdot ${n(t)}`),
          ligne(fin(estDecimalCourt(normeVitesseReelle(e) * t), valeurAffichee(e, "distance"))),
        ]),
      );
    }
  }
  return etapes;
}

function correctionEnFace(e: E): EtapeCorrection[] {
  const c = e.courant;
  const v = e.normePropre;
  const R = radicande(e, "pythagore");
  const yExact = estExacte(e, "pythagore");
  const y = valeurAffichee(e, "pythagore");
  const t = duree(e);
  const s = sujet(e);
  return [
    utilise("a", [
      texte("Pour arriver en F, juste en face, la vitesse réelle "),
      latex(`${VR}=${VP}+${VC}`),
      texte(` est dirigée selon l'axe y : sa composante x est nulle ${COURS_PHYSIQUE} ; les composantes s'additionnent ${COURS_SOMME_REPERE}.`),
    ]),
    calcul("a", [
      ligne(`${XR}=${XP}+x_{${VC}}`, "composantes en x de la somme"),
      ligne(`0=${XP}+${n(c)}`, [texte("arriver en F : "), latex(`${XR}=0`), texte(" ; courant "), latex(`${VC}${colonne(n(c), "0")}`)]),
      ligne(`${XP}=${n(-c)}`, `on retire ${n(c).replace("{,}", ",")} aux deux membres`),
    ]),
    resultat("a", [...reponseAttendueFragments(e, 0), texte(` : ${s} doit viser vers l'amont, contre le courant.`)]),
    utilise("b", [texte("La norme de la vitesse propre est connue ; dans le repère orthonormé, Pythagore donne "), latex(`${XP}^2+${YP}^2=\\|${VP}\\|^2`), texte(` ${COURS_NORME}.`)]),
    calcul("b", [
      ligne(`${XP}^2+${YP}^2=\\|${VP}\\|^2`, "norme de la vitesse propre"),
      ligne(`(${n(-c)})^2+${YP}^2=${n(v)}^2`, "composante x de l'étape a, norme donnée"),
      ligne(`${YP}^2=${n(arrondi(v * v, 1e6))}-${n(arrondi(c * c, 1e6))}`, "on isole le carré"),
      ligne(`=${n(R)}`),
      ligne(`${YP}=\\sqrt{${n(R)}}`, "positive : vers l'autre rive"),
      ...(yExact ? [ligne(`=${n(y)}`)] : [ligne(`\\approx ${n(y)}`, "en m/s, arrondi au centième")]),
    ]),
    resultat("b", [texte("Vitesse propre à adopter : "), latex(`${VP}${colonne(n(-c), yExact ? n(y) : `\\approx ${n(y)}`)}`), texte(" (en m/s).")]),
    piege("b", [
      texte("La composante y n'est pas "),
      latex(`${n(v)} - ${n(c)} = ${n(arrondi(v - c, 1e6))}`),
      texte(" : on ne soustrait pas les normes, les composantes se combinent par Pythagore. Et viser juste en face (vitesse propre selon y) ne suffit pas : le courant ferait accoster en aval."),
    ]),
    utilise("c", [texte("La vitesse réelle est "), latex(`${VR}${colonne("0", YP)}`), texte(" : toute la vitesse sert à traverser, "), latex(`t=\\dfrac{L}{${YP}}`), texte(".")]),
    calcul("c", [
      ligne(`t=\\dfrac{L}{${YP}}`, "durée = distance ÷ vitesse, selon y"),
      ligne(`=\\dfrac{${n(e.largeur)}}{${yExact ? n(y) : `\\sqrt{${n(R)}}`}}`, yExact ? "étape b" : "valeur exacte de l'étape b, non arrondie"),
      ligne(fin(estDecimalCourt(t), valeurAffichee(e, "dureeEnFace")), estDecimalCourt(t) ? "en secondes" : "en secondes, arrondi au dixième"),
    ]),
    { ...resultat("c", [texte("Durée de la traversée : "), ...resultatFragments(e, "dureeEnFace"), texte(". Figure : triangle des vitesses.")]), figureHtml: figure(e) },
  ];
}

function corrigeBrutTraverserRiviere(e: E): EtapeCorrection[] {
  return e.variante === "enFace" ? correctionEnFace(e) : correctionAccostage(e);
}

export function correctionDetailleeTraverserRiviere(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutTraverserRiviere(e));
}
