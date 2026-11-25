import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCG } from "../../core6e/courbeGauss";
import { borneBasse, borneHaute, phiJuste, pourcentExact, pourcentRegle, REGLE, valeurAire } from "../../core6e/courbeGauss";
import { aireL, aireMots, CONTEXTES_REGLE, figureAire, lettreJuste, phiEcritureL, reponse } from "../../ui6e/formatCourbeGauss";
import { clocheSvg } from "../../ui6e/figureCloche";
import type { ZoneCloche } from "../../ui6e/figureCloche";
import { dL, nL, pctL } from "../../ui6e/textesLoisLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen117`, partagé par l'appli et le papier. Aires : a) la
 * lecture de la figure (où est la couleur) — pour la variante « figure », la bonne figure redessinée
 * (réponse GRAPHIQUE, `figureHtml`) ; b) l'écriture avec Φ, une propriété par ligne, et sa valeur
 * approchée en vérification. Règle empirique : a) k = écart / σ ; b) le pourcentage, avec la cloche
 * graduée en μ ± kσ et la zone demandée colorée (réponse graphique), et la valeur exacte en vérification.
 */

type E = ExerciceCG;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const bL = (x: number) => dL(x, 1);

function lignesPhi(e: E): LigneCalcul[] {
  const x = e.aire;
  const u = Math.abs(x.a);
  const juste = phiEcritureL(x, phiJuste(x));
  switch (x.type) {
    case "gauche":
      return x.a > 0 ? [ligne(`${aireL(x)}=${juste}`, "aire à gauche : lecture directe")] : [ligne(`${aireL(x)}=P(Z\\ge ${bL(u)})`, "symétrie de la courbe"), ligne(`=${juste}`, "contraire")];
    case "droite":
      return x.a > 0 ? [ligne(`${aireL(x)}=1-P(Z\\le ${bL(u)})`, "contraire"), ligne(`=${juste}`)] : [ligne(`${aireL(x)}=P(Z\\le ${bL(u)})`, "symétrie de la courbe"), ligne(`=${juste}`)];
    case "entre":
      return x.a >= 0
        ? [ligne(`${aireL(x)}=\\Phi(${bL(x.b)})-\\Phi(${bL(x.a)})`, "différence de deux aires à gauche")]
        : [ligne(`${aireL(x)}=\\Phi(${bL(x.b)})-\\Phi(${bL(x.a)})`, "différence"), ligne(`=\\Phi(${bL(x.b)})-(1-\\Phi(${bL(u)}))`, "symétrie"), ligne(`=${juste}`)];
    case "queues":
      return [ligne(`${aireL(x)}=\\Phi(${bL(x.a)})+(1-\\Phi(${bL(x.b)}))`, "aire à gauche + contraire"), ligne(`=(1-\\Phi(${bL(u)}))+1-\\Phi(${bL(x.b)})`, "symétrie"), ligne(`=${juste}`)];
  }
}

/** Cloche graduée en x = μ + zσ, zone de la question colorée, étiquette du pourcentage. */
function clocheRegle(e: E): string {
  const k = e.k;
  const zonesParQuestion: Record<string, ZoneCloche[]> = {
    entre: [{ de: -k, a: k }],
    hors: [{ de: -Infinity, a: -k }, { de: k, a: Infinity }],
    auDela: [{ de: k, a: Infinity }],
    enDeca: [{ de: -Infinity, a: -k }],
    moitieHaut: [{ de: 0, a: k }],
    moitieBas: [{ de: -k, a: 0 }],
    sous: [{ de: -Infinity, a: k }],
    dessus: [{ de: -k, a: Infinity }],
  };
  const etiq = (x: number) => nL(x).replace("{,}", ",").replace(/\\,/g, " ");
  return clocheSvg({
    zones: zonesParQuestion[e.question]!,
    reperes: [
      { z: -k, etiquette: etiq(borneBasse(e)), trait: true },
      { z: 0, etiquette: etiq(e.mu), trait: true },
      { z: k, etiquette: etiq(borneHaute(e)), trait: true },
    ],
    etiquetteZone: e.question === "hors" ? undefined : `${etiq(pourcentRegle(e))} %`,
    largeur: 320,
    titre: "Courbe de Gauss graduée en μ − kσ, μ, μ + kσ, zone demandée colorée",
  });
}

export function correctionDetailleeCG(e: E): EtapeCorrection[] {
  if (e.variante === "aire" || e.variante === "figure") {
    const x = e.aire;
    const v = valeurAire(x);
    const a: EtapeCorrection[] =
      e.variante === "aire"
        ? [
            utilise("a", [f("P(Z\\le t)"), t(" est l'aire à gauche de "), f("t"), t(", "), f("P(Z\\ge t)"), t(" l'aire à droite, "), f("P(a\\le Z\\le b)"), t(" l'aire entre "), f("a"), t(" et "), f("b"), t(" (cours, § 6).")]),
            { label: "Lecture", sousQuestion: "a", fragments: [t("Sur la figure, l'aire colorée est "), ...fr(aireMots(x)), t(".")] },
            resultat("a", fr(reponse(e, "aire"))),
          ]
        : [
            utilise("a", [f(aireL(x)), t(" est l'aire sous la courbe "), ...fr(aireMots(x)), t(" (cours, § 6).")]),
            { label: "Lecture", sousQuestion: "a", fragments: [t(`Seule la figure ${lettreJuste(e)} colore l'aire `), ...fr(aireMots(x)), t(" :")], figureHtml: figureAire(x, 300) },
            resultat("a", fr(reponse(e, "figure"))),
          ];
    return [
      ...a,
      utilise("b", [t("La table donne "), f("\\Phi(t)=P(Z\\le t)"), t(" pour "), f("t\\ge 0"), t(" ; aire totale 1 ; symétrie "), f("\\Phi(-t)=1-\\Phi(t)"), t(".")]),
      calcul("b", lignesPhi(e)),
      resultat("b", fr(reponse(e, "phi"))),
      verification("b", [t("Avec la table, on trouverait "), f(`${aireL(x)}\\approx ${nL(v, 4)}`), t(", cohérent avec la taille de l'aire colorée.")]),
      piege("b", x.a < 0 ? [t("Écrire "), f(`\\Phi(${bL(x.a)})=\\Phi(${bL(-x.a)})`), t(" : "), f("\\Phi"), t(" n'est pas paire.")] : [t("Confondre l'aire à gauche "), f("\\Phi(t)"), t(" et l'aire à droite "), f("1-\\Phi(t)"), t(".")]),
    ];
  }
  const c = CONTEXTES_REGLE[e.ctx]!;
  const borne = e.question === "enDeca" || e.question === "dessus" || e.question === "moitieBas" ? borneBasse(e) : borneHaute(e);
  const p0 = REGLE[e.k];
  const lignesB: Record<string, LigneCalcul[]> = {
    entre: [ligne(`P(${nL(borneBasse(e))}\\le X\\le ${nL(borneHaute(e))})\\approx ${pctL(p0)}`, `règle empirique, k = ${e.k}`)],
    hors: [ligne(`100\\,\\%-${pctL(p0)}=${pctL(100 - p0)}`, "contraire, deux côtés")],
    auDela: [ligne(`100\\,\\%-${pctL(p0)}=${pctL(100 - p0)}`, "hors de l'intervalle"), ligne(`\\dfrac{${pctL(100 - p0)}}{2}=${pctL(pourcentRegle(e), 3)}`, "un seul côté (symétrie)")],
    enDeca: [ligne(`100\\,\\%-${pctL(p0)}=${pctL(100 - p0)}`, "hors de l'intervalle"), ligne(`\\dfrac{${pctL(100 - p0)}}{2}=${pctL(pourcentRegle(e), 3)}`, "un seul côté (symétrie)")],
    moitieHaut: [ligne(`\\dfrac{${pctL(p0)}}{2}=${pctL(pourcentRegle(e), 3)}`, "la moitié de l'intervalle (symétrie)")],
    moitieBas: [ligne(`\\dfrac{${pctL(p0)}}{2}=${pctL(pourcentRegle(e), 3)}`, "la moitié de l'intervalle (symétrie)")],
    sous: [ligne(`50\\,\\%+\\dfrac{${pctL(p0)}}{2}=${pctL(pourcentRegle(e), 3)}`, "moitié gauche + moitié de l'intervalle")],
    dessus: [ligne(`50\\,\\%+\\dfrac{${pctL(p0)}}{2}=${pctL(pourcentRegle(e), 3)}`, "moitié droite + moitié de l'intervalle")],
  };
  const unCote = e.question !== "entre" && e.question !== "hors";
  return [
    utilise("a", [t("Règle empirique (cours, § 6) : les bornes s'écrivent "), f("\\mu\\pm k\\sigma"), t(".")]),
    calcul("a", [ligne(`k=\\dfrac{|${nL(borne)}-${nL(e.mu)}|}{${nL(e.sigma)}}`, `écart en ${c.unite} divisé par σ`), ligne(`=\\dfrac{${nL(e.k * e.sigma)}}{${nL(e.sigma)}}`), ligne(`=${e.k}`)]),
    resultat("a", fr(reponse(e, "k"))),
    utilise("b", [t("Environ "), f(pctL(p0)), t(" des valeurs sont dans "), f(`[\\mu-${e.k === 1 ? "" : e.k}\\sigma\\,;\\mu+${e.k === 1 ? "" : e.k}\\sigma]`), t(" ; la courbe est symétrique par rapport à "), f("\\mu"), t(" : le reste se partage également entre les deux côtés.")]),
    { ...calcul("b", lignesB[e.question]!), figureHtml: clocheRegle(e) },
    resultat("b", fr(reponse(e, "pourcent"))),
    verification("b", [t("Avec la table de "), f("\\Phi"), t(", la valeur exacte est "), f(`\\approx ${pctL(pourcentExact(e))}`), t(" : la règle empirique en donne un arrondi.")]),
    piege("b", unCote ? [t("Oublier le partage par symétrie (diviser par 2) ou la moitié située de l'autre côté de "), f("\\mu"), t(".")] : [t("Confondre le pourcentage dans l'intervalle et celui qui est en dehors.")]),
  ];
}
