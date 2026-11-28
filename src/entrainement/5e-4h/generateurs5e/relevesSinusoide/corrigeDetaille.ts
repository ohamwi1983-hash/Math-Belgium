import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceRelevesSinusoide } from "../../core5e/relevesSinusoide";
import { exactA, nbL } from "../../ui5e/nombresTrigo";
import { modeleL, nomF, omegaExactL, pL, reponse, TL, vL } from "../../ui5e/formatRelevesSinusoide";

/**
 * Corrigé détaillé « comme au tableau » de `5gen57` (cours, § 8) : a) extrêmes et période lus ;
 * b) A, b, ω ; c) φ = π/2 − ω·t_max, modèle et contrôle au minimum ; d) prévision (argument écrit à
 * quatre décimales, valeur calculée sans arrondi intermédiaire) ; e) durée au-dessus du seuil
 * (inéquation, arc du haut, longueur divisée par ω). Valeurs approchées depuis les valeurs exactes.
 */

type E = ExerciceRelevesSinusoide;
const t = texte;
const f = latex;
const COURS = "(cours, point 8)";
const egal = (x: number, d: number) => (exactA(x, d) ? `=${nbL(x, d)}` : `\\approx ${nbL(x, d, true)}`);
const par = (s: string) => (s.startsWith("-") ? `(${s})` : s);

function etapeLecture(e: E): EtapeCorrection[] {
  const sq = "a";
  const rMax = e.releves.find((r) => r.valeur === e.max)!;
  const rMin = e.releves.find((r) => r.valeur === e.min)!;
  const lignes: LigneCalcul[] = [
    ligne(`\\max=${vL(e, e.max)}`, e.variante === "maree" ? `pleine mer (${rMax.heure})` : `plus grande valeur du tableau (${rMax.libelle})`),
    ligne(`\\min=${vL(e, e.min)}`, e.variante === "maree" ? `basse mer (${rMin.heure})` : `plus petite valeur du tableau (${rMin.libelle})`),
  ];
  if (e.variante === "maree") {
    const [p1, , p2] = e.releves;
    lignes.push(ligne(`T=${nbL(p2.t, 1)}-${nbL(p1.t, 1)}=${TL(e)}`, "entre deux pleines mers"));
  } else lignes.push(ligne(`T=${TL(e)}`, "un an"));
  return [
    utilise(sq, [t("Le maximum et le minimum se lisent dans le tableau ; la période est la durée d'un cycle complet, entre deux maximums "), t(COURS), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "lecture")),
    piege(sq, [t("Prendre pour période la durée entre un maximum et un minimum : ce n'est qu'une demi-période.")]),
  ];
}

function etapeParametres(e: E): EtapeCorrection[] {
  const sq = "b";
  const mn = par(vL(e, e.min));
  return [
    utilise(sq, [t("Amplitude et décalage vertical à partir des extrêmes, pulsation à partir de la période "), t(COURS), t(" : "), f("A=\\dfrac{\\max-\\min}{2}"), t(", "), f("b=\\dfrac{\\max+\\min}{2}"), t(", "), f("\\omega=\\dfrac{2\\pi}{T}"), t(".")]),
    calcul(sq, [
      ligne(`A=\\dfrac{${vL(e, e.max)}-${mn}}{2}=${pL(e.A)}`, "demi-écart des extrêmes"),
      ligne(`b=\\dfrac{${vL(e, e.max)}+${mn}}{2}=${pL(e.b)}`, "moyenne des extrêmes"),
      ligne(`\\omega=${omegaExactL(e)}\\approx ${nbL(e.omega, 4, true)}`, "en radians par unité de temps"),
    ]),
    resultat(sq, reponse(e, "parametres")),
    piege(sq, [t("Prendre "), f("A=\\max-\\min"), t(" ou "), f("\\omega=\\dfrac{T}{2\\pi}"), t(".")]),
  ];
}

function etapePhase(e: E): EtapeCorrection[] {
  const sq = "c";
  const tm = nbL(e.tMax, 1);
  const fmin = e.A * Math.sin(e.omega * e.tMin + e.phi) + e.b;
  return [
    utilise(sq, [t("Au maximum, le sinus vaut 1 : l'argument vaut "), f("\\dfrac{\\pi}{2}"), t(", d'où "), f("\\varphi=\\dfrac{\\pi}{2}-\\omega\\, t_{\\max}"), t(" "), t(COURS), t(".")]),
    calcul(sq, [ligne(`\\varphi=\\dfrac{\\pi}{2}-${omegaExactL(e)}\\cdot ${tm}\\approx ${nbL(e.phi, 4, true)}`, `maximum en t = ${tm.replace("{,}", ",")}`)]),
    resultat(sq, [f(`\\varphi\\approx ${nbL(e.phi, 2, true)}`), t(", d'où "), f(modeleL(e))]),
    verification(sq, [t("Au minimum, une demi-période plus tard, le modèle redonne le minimum du tableau :")], [ligne(`${nomF(e)}(${nbL(e.tMin, 2)})=${pL(e.A)}\\sin\\left(\\dfrac{3\\pi}{2}\\right)+${pL(e.b)}${egal(fmin, 4)}`, "argument π/2 + π")]),
    piege(sq, [t("Écrire "), f("\\varphi=\\omega\\, t_{\\max}-\\dfrac{\\pi}{2}"), t(" (signe inversé) ou oublier "), f("\\dfrac{\\pi}{2}"), t(".")]),
  ];
}

function etapePrevision(e: E): EtapeCorrection[] {
  const sq = "d";
  const nom = nomF(e);
  const arg = e.omega * e.tPrev + e.phi;
  const d = e.variante === "temperature" ? 1 : 2;
  return [
    utilise(sq, [t("On remplace "), f("t"), t(` par ${e.tPrev} dans le modèle (calculatrice en mode radian, sans arrondir φ ni ω).`)]),
    calcul(sq, [
      ligne(`${nom}(${e.tPrev})=${pL(e.A)}\\sin\\left(${omegaExactL(e)}\\cdot ${e.tPrev}+\\varphi\\right)+${pL(e.b)}`, "le modèle"),
      ligne(`\\approx ${pL(e.A)}\\sin(${nbL(arg, 5, true)})+${pL(e.b)}`, "argument en radians"),
      ligne(`\\approx ${nbL(e.prevision, d, true)}`),
    ]),
    resultat(sq, reponse(e, "prevision")),
    verification(sq, [t("La valeur est bien entre le minimum et le maximum, et proche des relevés voisins du tableau.")]),
    piege(sq, [t("Calculer le sinus en mode degré.")]),
  ];
}

function etapeDuree(e: E): EtapeCorrection[] {
  const sq = "e";
  const s = nbL(e.seuil, 2);
  const unite = e.variante === "maree" ? "h" : e.uniteTemps;
  const dec = e.decimalesDuree;
  const res: LigneCalcul[] = [
    ligne(`${pL(e.A)}\\sin u+${pL(e.b)}\\geq ${s}`, [t("avec "), f("u=\\omega t+\\varphi")]),
    ligne(`\\sin u\\geq m`, [t("on isole le sinus")]),
    ligne(`m=\\dfrac{${s}-${pL(e.b)}}{${pL(e.A)}}\\approx ${nbL(e.mSeuil, 4, true)}`, "seuil ramené au cercle"),
    ligne(`D=\\pi-2\\arcsin m\\approx ${nbL(Math.PI - 2 * Math.asin(e.mSeuil), 4, true)}`, "longueur de l'arc du haut, de arcsin m à π − arcsin m"),
    ligne(`\\dfrac{D}{\\omega}=\\dfrac{${TL(e)}}{2\\pi}\\cdot D\\approx ${nbL(e.duree, Math.max(dec, 2), true)}`, "on divise par ω : longueur en temps"),
  ];
  return [
    utilise(sq, [t("La grandeur dépasse le seuil quand "), f("\\sin u\\geq m"), t(" : l'arc du haut, de longueur "), f("\\pi-2\\arcsin m"), t(" en "), f("u"), t(" ; divisée par "), f("\\omega"), t(", cette longueur donne la durée "), t(COURS), t(".")]),
    calcul(sq, res),
    resultat(sq, [...reponse(e, "duree")]),
    verification(sq, [t(`La durée est bien comprise entre 0 et une période (${nbL(e.T, 2).replace("{,}", ",")} ${unite}) ; elle dépasse la moitié de la période si et seulement si le seuil est sous la valeur moyenne `), f(`b=${pL(e.b)}`), t(".")]),
    piege(sq, [t("Calculer la durée sous le seuil (le complément à une période), ou oublier de diviser par "), f("\\omega"), t(".")]),
  ];
}

export function correctionDetailleeRelevesSinusoide(e: E): EtapeCorrection[] {
  return [...etapeLecture(e), ...etapeParametres(e), ...etapePhase(e), ...etapePrevision(e), ...etapeDuree(e)];
}
