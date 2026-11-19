import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCercleTrigonometrique, Signe, SigneTan } from "../../core/cercleTrigonometrique.types";
import { formatAngleLatex, libelleQuadrant } from "../../ui/formatCercleTrigonometrique";
import { estSurAxe, valeursAxeAttendues } from "../../moteur/verificationCercleTrigonometrique";
import { libelleValeurAxe } from "../../ui/cycleSigneCercleTrigonometrique";
import {
  COURS_CERCLE,
  finaliserCorrige,
  ligneQuadrant,
  ligneRetourDepuisReference,
  lignesAnglePremierQuadrant,
  lignesReduction,
  lignesSignes,
  lignesValeursAxe,
  utiliseAxe,
} from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen14 (placement et lecture sur le cercle) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN, dans l'ordre de l'appli :
 * a) réduction, b) quadrant, c) angle du premier quadrant, d) signes — ou, sur un axe, a) réduction,
 * b) axe, c) valeurs exactes. Partagé par l'adaptateur et l'appli (`AppCercleTrigonometrique`).
 * Écrans de pure lecture (niveau) : b (placer le point), d (lire les signes), c sur un axe (lire
 * les coordonnées de M).
 */

type E = ExerciceCercleTrigonometrique;

/** Lettres des écrans de pure lecture. */
export function lettresLectureCercleTrigonometrique(e: E): string[] {
  return estSurAxe(e) ? ["b", "c"] : ["b", "d"];
}

/** Lettre de l'écran d'une phase de l'appli (« reduction » toujours présente dans ce générateur). */
export function lettreEcranCercleTrigonometrique(phase: string): string {
  return phase === "reduction" ? "a" : phase === "quadrant" ? "b" : phase === "signes" ? "d" : "c";
}

function signeTexte(s: Signe | SigneTan): string {
  return s === "-" ? "−" : s === "indefini" ? "∄" : s;
}

/** Résultat de l'écran « Signes » : mêmes symboles que la réponse attendue de l'appli. */
function resultatSignes(e: E): FragmentConsigne[] {
  return [latex("\\sin\\theta"), texte(` : ${signeTexte(e.signeSin)} ; `), latex("\\cos\\theta"), texte(` : ${signeTexte(e.signeCos)} ; `), latex("\\tan\\theta"), texte(` : ${signeTexte(e.signeTan)}`)];
}

/** Résultat de l'écran « Valeurs exactes » (axe) : valeurs de `valeursAxeAttendues`, comme l'écran. */
function resultatAxe(e: E): FragmentConsigne[] {
  const v = valeursAxeAttendues(e);
  const l = (x: string) => libelleValeurAxe(x as never).replace("−", "-");
  return [
    latex(`\\sin\\theta=${l(v.sin)}`),
    texte(" ; "),
    latex(`\\cos\\theta=${l(v.cos)}`),
    texte(" ; "),
    ...(v.tan === "indefini" ? [latex("\\tan\\theta"), texte(" n'existe pas")] : [latex(`\\tan\\theta=${l(v.tan)}`)]),
  ];
}

export function correctionDetailleeCercleTrigonometrique(e: E): EtapeCorrection[] {
  const r = e.angleReduit;
  const etapes: EtapeCorrection[] = [];

  // a) Réduction dans [0° ; 360°[.
  etapes.push(
    utilise("a", [texte(`Ajouter ou retirer un nombre entier de tours de 360° ne change pas le point du cercle ${COURS_CERCLE}.`)]),
    calcul("a", lignesReduction(e.angleDepart)),
    resultat("a", [texte("Angle entre 0° et 360° : "), latex(formatAngleLatex(r))]),
  );
  if (r === 0) etapes.push(piege("a", [texte("On obtient 0°, et non 360° : l'intervalle [0° ; 360°[ exclut 360°.")]));
  else if (e.angleDepart < 0) etapes.push(piege("a", [texte("Pour un angle négatif, on AJOUTE des tours de 360° jusqu'à retomber entre 0° et 360°.")]));

  // b) Quadrant ou axe.
  etapes.push(
    utilise("b", [texte(`Quadrants : I entre 0° et 90°, II entre 90° et 180°, III entre 180° et 270°, IV entre 270° et 360° ; 0°, 90°, 180° et 270° sont sur les axes et n'appartiennent à aucun quadrant ${COURS_CERCLE}.`)]),
    calcul("b", [ligneQuadrant(r)]),
    resultat("b", [texte(libelleQuadrant(e.quadrant))]),
  );

  if (estSurAxe(e)) {
    etapes.push(utilise("c", utiliseAxe()), calcul("c", lignesValeursAxe(r)), resultat("c", resultatAxe(e)));
    etapes.push(
      piege("c", [
        e.quadrant === "axeOy"
          ? texte("Sur l'axe Oy, cos θ = 0 : tan θ n'existe pas (division par 0), elle ne vaut ni 0 ni 1.")
          : texte("Sur l'axe Ox, sin θ = 0 donc tan θ = 0 ; cos θ vaut 1 ou −1 selon le côté, pas toujours 1."),
      ]),
    );
    return finaliserCorrige(etapes);
  }

  // c) Angle du premier quadrant.
  etapes.push(
    utilise("c", [texte(`Angle du premier quadrant (angle de référence) : quadrant I, θ lui-même ; II, 180° − θ ; III, θ − 180° ; IV, 360° − θ ${COURS_CERCLE}.`)]),
    calcul("c", lignesAnglePremierQuadrant(r)),
    resultat("c", [texte("Angle du premier quadrant : "), latex(formatAngleLatex(e.anglePremierQuadrant))]),
  );
  const retour = ligneRetourDepuisReference(r);
  if (retour) {
    etapes.push(verification("c", [texte("On retrouve l'angle de départ à partir de l'angle du premier quadrant :")], [retour]));
    etapes.push(piege("c", [texte(`Dans le quadrant ${e.quadrant}, l'angle du premier quadrant n'est pas l'angle réduit lui-même : il faut passer par la symétrie (180° ou 360°).`)]));
  }

  // d) Signes.
  etapes.push(
    utilise("d", [texte("Le signe se lit sur les coordonnées de M(θ) : cos θ est son abscisse, sin θ son ordonnée, et "), latex("\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}"), texte(` a le signe du quotient ${COURS_CERCLE}.`)]),
    calcul("d", lignesSignes(r)),
    resultat("d", resultatSignes(e)),
  );
  if (e.quadrant === "I" && e.angleDepart < 0) etapes.push(piege("d", [texte("Le signe se lit sur l'angle réduit, pas sur l'angle de départ : un angle négatif peut très bien avoir tous ses rapports positifs.")]));
  else etapes.push(piege("d", [texte("Seul le quadrant de l'angle réduit compte : "), latex("\\sin\\theta"), texte(" suit la hauteur de M, "), latex("\\cos\\theta"), texte(" sa position à gauche ou à droite.")]));
  return finaliserCorrige(etapes);
}
