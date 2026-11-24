/**
 * 5gen30 (lecture graphique — dérivées et applications) — messages CIBLÉS (lot B, règles communes) : le
 * message nomme l'erreur du cours trahie par la dernière réponse fausse, jamais la réponse.
 * - tangentes horizontales : zéro de f lu au lieu d'un zéro de f′ (confusion f / f′), point d'inflexion
 *   pris pour un sommet, asymptote verticale, palier oublié, lecture entre deux lignes du quadrillage ;
 * - points d'inflexion : sommet pris pour un point d'inflexion, palier oublié, asymptote, lecture
 *   approximative ;
 * - valeurs des extremums : abscisse donnée au lieu de f, f′ (= 0) au lieu de f, signe, lecture entre
 *   deux lignes (échelle verticale) ;
 * - tableaux (choix fermés, message sous la réponse révélée) : signe de f recopié au lieu de celui de f′,
 *   signe de f′ recopié pour f″, sens et courbure inversés, maximum / minimum échangés, palier classé
 *   comme extremum ;
 * - asymptotes : messages de 5gen22 (`cibleAsymptotesNommees`, même contrat d'asymptotes).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import { deriveeCourbe, valeurCourbe } from "../generateurs5e/lectureGraphiqueDerivees/courbeNumerique";
import type { ReponseNommerAsymptotes } from "../moteur5e/typesLectureGraphiqueLimites";
import type { ReponseTableauEtudeLocale, TableauEtudeLocaleAttendu } from "../moteur5e/verificationEtudeLocale";
import {
  lireNombre,
  pointsTangenteHorizontale,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  TOLERANCE_POSITION_INFLEXION,
  TOLERANCE_POSITION_TANGENTE,
  TOLERANCE_VALEUR_EXTREMUM,
  type ReponseListeAbscisses,
} from "../moteur5e/verificationLectureGraphiqueDerivees";
import { cibleAsymptotesNommees } from "./retoursLectureGraphiqueLimites";
import { l, t } from "./retoursDerivees";

const proche = (v: number, c: number, tol: number) => Math.abs(v - c) <= tol + 1e-9;

/** Abscisses (dans la fenêtre, hors asymptotes) où la courbe coupe l'axe des x : zéros de f. */
function zerosDeF(e: ExerciceLectureGraphiqueDerivees): number[] {
  const [a, b] = e.bornesX;
  const avs = e.asymptotique.vas.map((v) => v.position);
  const out: number[] = [];
  const N = 800;
  let xp = a;
  let yp = valeurCourbe(e, a);
  for (let i = 1; i <= N; i++) {
    const x = a + ((b - a) * i) / N;
    const y = valeurCourbe(e, x);
    const traverseAV = avs.some((p) => (xp - p) * (x - p) <= 0);
    if (!traverseAV && Number.isFinite(y) && Number.isFinite(yp) && yp * y < 0) out.push((xp + x) / 2);
    xp = x;
    yp = y;
  }
  return out;
}

function valeursLues(r: ReponseListeAbscisses): number[] {
  return r.valeurs.map(lireNombre).filter((v): v is number => v !== null);
}

/** Message ciblé, écrans « tangentes horizontales » (zéros de f′) et « points d'inflexion ». */
export function cibleListeAbscisses(e: ExerciceLectureGraphiqueDerivees, ecran: "zerosFPrime" | "inflexions", r: ReponseListeAbscisses): FragmentConsigne[] | null {
  if (r.aucun) return null; // verdict fermé faux : message sous la réponse révélée (explication générale)
  const vs = valeursLues(r);
  const points = pointsTangenteHorizontale(e);
  const sommets = e.extrema.map((x) => x.position);
  const paliers = e.paliers.map((p) => p.position);
  const inflexionsSeules = e.inflexions.map((p) => p.position).filter((x) => !paliers.some((p) => proche(p, x, 1e-6)));
  const avs = e.asymptotique.vas.map((v) => v.position);
  const cibles = ecran === "zerosFPrime" ? points.map((p) => p.position) : e.inflexions.map((p) => p.position);
  const tol = ecran === "zerosFPrime" ? TOLERANCE_POSITION_TANGENTE : TOLERANCE_POSITION_INFLEXION;
  const justes = vs.filter((v) => cibles.some((c) => proche(v, c, tol)));
  const fausses = vs.filter((v) => !cibles.some((c) => proche(v, c, tol)));

  if (fausses.some((v) => avs.some((p) => proche(v, p, 0.3))))
    return [t("En une asymptote verticale, f n'est pas définie : il n'y a là ni tangente ni point de la courbe.")];
  if (ecran === "zerosFPrime") {
    if (fausses.some((v) => inflexionsSeules.some((x) => proche(v, x, 0.3))))
      return [t("Un point d'inflexion n'a pas de tangente horizontale (sauf un palier) : la courbe y change de courbure, pas de sens. Cherche les sommets et les paliers.")];
    const zf = zerosDeF(e);
    if (fausses.length > 0 && fausses.every((v) => zf.some((z) => proche(v, z, 0.3))))
      return [t("Tu as lu où la courbe coupe l'axe des x, là où "), l("f(x)=0"), t(". On cherche où "), l("f'(x)=0"), t(" : là où la tangente est horizontale (sommets et paliers).")];
  } else {
    if (fausses.some((v) => sommets.some((x) => proche(v, x, 0.3))))
      return [t("Un sommet (maximum ou minimum) n'est pas un point d'inflexion : la courbe y change de sens, pas de courbure. Un point d'inflexion sépare une partie en ∪ d'une partie en ∩.")];
  }
  if (fausses.length > 0 && fausses.every((v) => cibles.some((c) => proche(v, c, 1))))
    return [
      t(
        ecran === "zerosFPrime"
          ? "Lecture approximative : chaque sommet et chaque palier tombe sur une ligne verticale du quadrillage. Suis la ligne qui passe par le point jusqu'à l'axe des x."
          : "Lecture approximative : chaque point d'inflexion est placé sur une ligne verticale du quadrillage. Repère où la courbure change et lis l'abscisse de cette ligne.",
      ),
    ];
  if (fausses.length === 0 && justes.length < cibles.length) {
    const paliersOublies = paliers.filter((p) => !justes.some((v) => proche(v, p, tol)));
    if (paliersOublies.length > 0)
      return [
        t(
          ecran === "zerosFPrime"
            ? "Il en manque : un palier (la courbe s'aplatit sans changer de sens) a aussi une tangente horizontale."
            : "Il en manque : un palier (tangente horizontale sans changement de sens) est aussi un point d'inflexion.",
        ),
      ];
    return [t(ecran === "zerosFPrime" ? "Il en manque : regarde chaque bosse et chaque creux de la courbe, sur chaque branche." : "Il en manque : regarde chaque endroit où la courbe passe de ∪ à ∩, sur chaque branche.")];
  }
  if (vs.length > cibles.length && justes.length === cibles.length) return [t("Un point de trop : chaque point ne compte qu'une fois.")];
  return null;
}

/** Message ciblé, écran « valeurs des extremums » (une ligne par extremum, dans l'ordre). */
export function cibleExtremums(e: ExerciceLectureGraphiqueDerivees, reponses: string[]): FragmentConsigne[] | null {
  for (let i = 0; i < e.extrema.length; i++) {
    const v = lireNombre(reponses[i] ?? "");
    if (v === null) continue;
    const { position, valeur } = e.extrema[i];
    if (proche(v, valeur, TOLERANCE_VALEUR_EXTREMUM)) continue;
    if (proche(v, position, 1e-6) && !proche(position, valeur, 0.5)) return [t("Tu as donné l'abscisse du sommet : on demande la valeur de f, c'est-à-dire sa hauteur (son ordonnée).")];
    if (proche(v, 0, 1e-6) && !proche(valeur, 0, 0.5)) return [t("C'est "), l("f'"), t(" qui vaut 0 au sommet ; on demande "), l("f"), t(", la hauteur du sommet.")];
    if (proche(v, -valeur, TOLERANCE_VALEUR_EXTREMUM) && Math.abs(valeur) > 0.5) return [t("Attention au signe : regarde si le sommet est au-dessus ou en dessous de l'axe des x.")];
    if (Math.abs(v - valeur) <= Math.max(1.5, Math.abs(valeur) * 0.5))
      return [t("Lecture approximative : le sommet tombe sur une ligne horizontale du quadrillage. Suis-la jusqu'à l'axe des y et tiens compte de l'échelle verticale (légende sous le graphique).")];
  }
  return null;
}

/** Signe d'une grandeur (f ou f′) au milieu de chaque zone du tableau (colonnes non-zones : `null`). */
function signesParZone(e: ExerciceLectureGraphiqueDerivees, ecran: "tableauFPrime" | "tableauFSeconde", attendu: TableauEtudeLocaleAttendu, mesure: (x: number) => number): (string | null)[] {
  const racines = ecran === "tableauFPrime" ? pointsTangenteHorizontale(e).map((p) => p.position) : e.inflexions.map((p) => p.position);
  const positions = attendu.colonnes.map((c) => (c.type === "racine" ? racines[c.index] ?? null : c.type === "exclusion" ? e.asymptotique.vas[c.index]?.position ?? null : null));
  return attendu.colonnes.map((c, i) => {
    if (c.type !== "zone") return null;
    const gauche = positions.slice(0, i).filter((p): p is number => p !== null).pop() ?? e.bornesX[0];
    const droite = positions.slice(i + 1).find((p): p is number => p !== null) ?? e.bornesX[1];
    const y = mesure((gauche + droite) / 2);
    return Math.abs(y) < 1e-9 ? null : y > 0 ? "+" : "-";
  });
}

/** Message sous la réponse révélée d'un tableau (choix fermé, une tentative). */
export function cibleTableau(e: ExerciceLectureGraphiqueDerivees, ecran: "tableauFPrime" | "tableauFSeconde", r: ReponseTableauEtudeLocale): FragmentConsigne[] | null {
  const attendu = ecran === "tableauFPrime" ? tableauFPrimeAttendu(e) : tableauFSecondeAttendu(e);
  const zones = attendu.colonnes.map((c, i) => (c.type === "zone" ? i : -1)).filter((i) => i >= 0);
  const signesFaux = zones.some((i) => r.signes[i] !== attendu.signes[i]);
  if (signesFaux) {
    if (zones.every((i) => r.signes[i] !== null && r.signes[i] !== attendu.signes[i]))
      return [t(ecran === "tableauFPrime" ? "Tous les signes sont inversés : f′ est positive là où la courbe MONTE (↗), négative là où elle descend." : "Tous les signes sont inversés : f″ est positive là où la courbe est tournée vers le haut (∪), négative en ∩.")];
    if (ecran === "tableauFPrime") {
      const signesF = signesParZone(e, ecran, attendu, (x) => valeurCourbe(e, x));
      if (zones.every((i) => r.signes[i] === signesF[i]))
        return [t("Tu as donné le signe de f (courbe au-dessus ou en dessous de l'axe des x). Le signe de f′ se lit sur le SENS de la courbe : + là où elle monte, − là où elle descend.")];
    } else {
      const signesFp = signesParZone(e, ecran, attendu, (x) => deriveeCourbe(e, x));
      if (zones.every((i) => r.signes[i] === signesFp[i]))
        return [t("Tu as recopié le signe de f′ (le sens de la courbe). Le signe de f″ se lit sur sa COURBURE : + en ∪ (tournée vers le haut), − en ∩.")];
    }
    return [t(ecran === "tableauFPrime" ? "Relis le sens de la courbe zone par zone : + là où elle monte, − là où elle descend, ∄ sur une asymptote verticale." : "Relis la courbure zone par zone : + en ∪, − en ∩, ∄ sur une asymptote verticale.")];
  }
  if (ecran === "tableauFPrime") {
    const racines = attendu.colonnes.map((c, i) => (c.type === "racine" ? i : -1)).filter((i) => i >= 0);
    for (const i of racines) {
      const att = attendu.ligne2[i];
      const rep = r.ligne2[i];
      if (att === "ni_lun_ni_lautre" && (rep === "max" || rep === "min")) return [t("Au palier, f′ s'annule sans changer de signe (la courbe garde le même sens) : ni maximum ni minimum.")];
      if ((att === "max" && rep === "min") || (att === "min" && rep === "max")) return [t("Maximum : f′ passe de + à − (la courbe monte puis descend) ; minimum : de − à +.")];
      if ((att === "max" || att === "min") && rep === "ni_lun_ni_lautre") return [t("f′ change de signe en ce point (la courbe change de sens) : c'est un extremum.")];
    }
  }
  return null;
}

/** Message ciblé, écran « asymptotes » : celui de 5gen22 (même contrat). */
export function cibleAsymptotesDerivees(e: ExerciceLectureGraphiqueDerivees, r: ReponseNommerAsymptotes): FragmentConsigne[] | null {
  return cibleAsymptotesNommees(e.asymptotique, r);
}

/** Explication d'un verdict « aucun point » faux (l'écran se clôt). */
export function messageAucunFaux(ecran: "zerosFPrime" | "inflexions", aucunCoche: boolean): string {
  if (ecran === "zerosFPrime")
    return aucunCoche
      ? "Ce n'était pas le bon choix : la courbe a au moins un point à tangente horizontale (un sommet ou un palier)."
      : "Ce n'était pas le bon choix : la courbe n'a aucun sommet ni palier — elle monte (ou descend) sans jamais s'aplatir.";
  return aucunCoche
    ? "Ce n'était pas le bon choix : la courbe change au moins une fois de courbure (de ∪ à ∩ ou l'inverse)."
    : "Ce n'était pas le bon choix : la courbe ne change jamais de courbure sur une même branche.";
}

