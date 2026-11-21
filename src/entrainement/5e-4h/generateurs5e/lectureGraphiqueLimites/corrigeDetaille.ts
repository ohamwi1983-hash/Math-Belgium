import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import { listeAsymptotes, listeComportements } from "../../moteur5e/typesLectureGraphiqueLimites";
import { formatReponseAttendueCompleterLimitesLatex, formatReponseAttendueNommerAsymptotesLatex } from "../../ui5e/formatLectureGraphiqueLimites";
import { COURS_LECTURE, cote, finaliser, infini, infiniT, lim, nbT, polyLatex, t, f } from "../../ui5e/corrigeLimites";
import { construireSvgCorrige } from "./figures";

/**
 * Corrigé détaillé « comme au tableau » de 5gen22 (limites et asymptotes, lecture graphique) — règle
 * `.claude/rules/feuilles-evaluations.md`, « Lectures graphiques et décisions » : une relation par
 * chose lue, la justification dit OÙ on la lit. a = les limites (une ligne par comportement, dans
 * l'ordre de l'écran : −∞, puis chaque valeur interdite à gauche et à droite, puis +∞) ; b = les
 * asymptotes (une ligne par asymptote, la pente d'une oblique calculée entre deux points de la
 * droite), graphique annoté en figure. « Résultat » = réponses de l'écran
 * (`formatReponseAttendue…Latex`). SANS `docx` : importé par l'adaptateur ET par `App5gen22.tsx`.
 */

export function lettrePhaseLectureGraphique(phase: "completerLimites" | "nommerAsymptotes"): string {
  return phase === "completerLimites" ? "a" : "b";
}

/** Formules séparées par des virgules, « et » avant la dernière. */
function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((l, i) => [...(i === 0 ? [] : [t(i === formules.length - 1 ? " et " : ", ")]), f(l)]);
}

function lignesLimites(e: ExerciceLectureGraphiqueLimites): LigneCalcul[] {
  const { infini: inf } = e;
  return listeComportements(e).map((slot) => {
    if (slot.id.kind === "infini") {
      const gauche = slot.id.cote === "gauche";
      const c = gauche ? "-\\infty" : "+\\infty";
      const ou = gauche ? "à gauche" : "à droite";
      if (slot.cible.kind === "fini") return ligne(`${lim(c)} f(x)=${slot.cible.valeur}`, `${ou}, la courbe s'approche de la droite horizontale y = ${nbT(slot.cible.valeur)}`);
      const monte = slot.cible.signe > 0;
      if (inf.type === "oblique") return ligne(`${lim(c)} f(x)=${infini(slot.cible.signe)}`, `${ou}, la courbe suit une droite oblique et ${monte ? "monte" : "descend"} sans fin`);
      return ligne(`${lim(c)} f(x)=${infini(slot.cible.signe)}`, `${ou}, la courbe ${monte ? "monte" : "descend"} sans fin, sans s'approcher d'une droite`);
    }
    const va = e.vas[slot.id.index];
    const sens = slot.id.cote === "gauche" ? "gauche" : "droite";
    const ou = `juste à ${sens} de x = ${nbT(va.position)}`;
    const cible = lim(cote(va.position, sens));
    if (slot.cible.kind === "fini") return ligne(`${cible} f(x)=${slot.cible.valeur}`, `${ou}, la courbe arrive sur le point plein (${nbT(va.position)} ; ${nbT(slot.cible.valeur)})`);
    return ligne(`${cible} f(x)=${infini(slot.cible.signe)}`, `${ou}, la branche ${slot.cible.signe > 0 ? "monte" : "descend"} le long de la droite x = ${nbT(va.position)}`);
  });
}

function lignesAsymptotes(e: ExerciceLectureGraphiqueLimites): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  const { infini: inf } = e;
  for (const slot of listeAsymptotes(e)) {
    if (slot.cible.kind === "verticale") {
      const va = e.vas[(slot.id as { index: number }).index];
      const cotes = [va.pointIsoleGauche === undefined ? `à gauche (${infiniT(va.signeGauche)})` : null, va.pointIsoleDroit === undefined ? `à droite (${infiniT(va.signeDroit)})` : null].filter(Boolean);
      lignes.push(ligne(`x=${slot.cible.x}`, `AV : limite infinie ${cotes.join(" et ")} de x = ${nbT(slot.cible.x)} (étape 1)`));
    } else if (slot.cible.kind === "horizontale") {
      const cote = slot.id.kind === "horizontale" ? slot.id.cote : undefined;
      lignes.push(ligne(`y=${slot.cible.y}`, cote ? `AH en ${cote === "gauche" ? "−∞" : "+∞"} : limite finie ${nbT(slot.cible.y)} (étape 1)` : `AH : limite finie ${nbT(slot.cible.y)} en −∞ et en +∞ (étape 1)`));
    } else {
      const { pente, ordonnee } = slot.cible;
      lignes.push(ligne(`b=${ordonnee}`, `la droite coupe l'axe vertical en (0 ; ${nbT(ordonnee)})`));
      lignes.push(ligne(`a=\\dfrac{${pente + ordonnee}-${ordonnee < 0 ? `(${ordonnee})` : ordonnee}}{1-0}`, `pente entre les points (0 ; ${nbT(ordonnee)}) et (1 ; ${nbT(pente + ordonnee)}) de la droite`));
      lignes.push(ligne(`=${pente}`));
      lignes.push(ligne(`y=${polyLatex([ordonnee, pente])}`, "AO : y = ax + b"));
    }
  }
  if (inf.type === "aucune") {
    lignes.push(ligne(`${lim("-\\infty")} f(x)=${infini(inf.signeMoinsInfini)}`, "limite infinie, aucune droite suivie : ni AH ni AO à gauche"));
    lignes.push(ligne(`${lim("+\\infty")} f(x)=${infini(inf.signePlusInfini)}`, "limite infinie, aucune droite suivie : ni AH ni AO à droite"));
  }
  return lignes;
}

export function correctionDetailleeLectureGraphiqueLimites(e: ExerciceLectureGraphiqueLimites): EtapeCorrection[] {
  const avecVA = e.vas.length > 0;
  const pointIsole = e.vas.some((va) => va.pointIsoleGauche !== undefined || va.pointIsoleDroit !== undefined);
  const identiques = e.vas.some((va) => va.pointIsoleGauche === undefined && va.pointIsoleDroit === undefined && va.signeGauche === va.signeDroit);
  const ahDistinctes = e.infini.type === "horizontale" && e.infini.limitePlusInfini !== e.infini.limiteMoinsInfini;
  const aucune = listeAsymptotes(e).length === 0;
  const etapes: EtapeCorrection[] = [
    utilise("a", [
      t("En "),
      f("-\\infty"),
      t(" et en "),
      f("+\\infty"),
      t(", on regarde les extrémités du graphique : une valeur finie si la courbe s'approche d'une droite horizontale, ±∞ sinon. "),
      t(avecVA ? "De part et d'autre d'une valeur où f n'est pas définie, on lit chaque côté séparément : la branche monte (+∞), descend (−∞) ou arrive sur un point plein (limite finie) " : "Ici, la courbe est définie partout : seules les limites en −∞ et en +∞ sont à lire "),
      t(`${COURS_LECTURE}.`),
    ]),
    calcul("a", lignesLimites(e)),
    resultat("a", liste(formatReponseAttendueCompleterLimitesLatex(e))),
  ];
  if (pointIsole) etapes.push(piege("a", [t("D'un côté de l'asymptote verticale, la courbe arrive sur un point plein : la limite de ce côté est l'ordonnée de ce point, pas ±∞.")]));
  else if (identiques) etapes.push(piege("a", [t("Les deux branches partent vers le même infini : les limites à gauche et à droite d'une asymptote verticale n'ont pas forcément des signes opposés.")]));
  else if (e.infini.type === "oblique") etapes.push(piege("a", [t("En −∞ et en +∞, la courbe suit une droite oblique : la limite est infinie, pas finie.")]));
  else if (ahDistinctes) etapes.push(piege("a", [t("Les limites en −∞ et en +∞ sont différentes : on lit chacune à son extrémité du graphique.")]));

  etapes.push(
    utilise("b", [
      t("Asymptote verticale "),
      f("x=a"),
      t(" quand f(x) tend vers ±∞ d'un côté de a ; asymptote horizontale "),
      f("y=L"),
      t(" pour une limite finie L en −∞ ou en +∞ ; asymptote oblique "),
      f("y=ax+b"),
      t(` quand la courbe s'approche d'une droite oblique ${COURS_LECTURE}.`),
    ]),
    calcul("b", lignesAsymptotes(e)),
    { ...resultat("b", aucune ? [t("Aucune asymptote.")] : liste(formatReponseAttendueNommerAsymptotesLatex(e))), figureHtml: construireSvgCorrige(e) },
  );
  if (aucune) etapes.push(piege("b", [t("La courbe part vers ±∞ sans s'approcher d'aucune droite : il n'y a aucune asymptote.")]));
  else if (ahDistinctes) etapes.push(piege("b", [t("Deux limites finies différentes en −∞ et en +∞ donnent deux asymptotes horizontales.")]));
  else if (avecVA) etapes.push(piege("b", [t("Une asymptote verticale a une équation de la forme « x = … » (et non « y = … »).")]));
  return finaliser(etapes);
}
