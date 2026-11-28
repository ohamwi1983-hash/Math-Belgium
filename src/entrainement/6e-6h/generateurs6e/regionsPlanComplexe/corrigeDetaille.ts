import type { ExerciceRegions } from "../../core6e/regionsPlanComplexe.types";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { PHASES_REGIONS } from "../../moteur6e/typesRegionsPlanComplexe";
import { calculEtape, conclusionTest, methodeFragments, piegeEtape, reponseFragments } from "../../ui6e/formatRegionsPlanComplexe";
import { figureCorrigeSvg } from "../../ui6e/figureRegionsPlanComplexe";

/**
 * Corrigé détaillé « comme au tableau » de `6gen98` (régions du plan complexe) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Par écran
 * (nature, éléments, bord, région) : la méthode de l'écran, ses calculs (`calculEtape`) une
 * transformation par ligne, le résultat, le test d'un point pour la région (vérification), le piège.
 */

const COURS = "(cours, point 9)";
const LETTRES = ["a", "b", "c", "d"];

export function correctionDetailleeRegions(e: ExerciceRegions): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  PHASES_REGIONS.forEach((phase, i) => {
    const sq = LETTRES[i];
    L.push(utilise(sq, [...methodeFragments(e, phase), ...(i === 0 ? [texte(` ${COURS}`)] : [])]));
    const lignes = calculEtape(e, phase).flatMap((c) => c.split(/\\qquad|,\\quad |\\ \\Rightarrow\\ /).flatMap((m) => (m.trim() ? lignesDepuisChaine(m.trim()) : [])));
    if (lignes.length) L.push(phase === "region" ? { ...calcul(sq, lignes, [], "Test d'un point"), type: "calcul" } : calcul(sq, lignes));
    L.push({ ...resultat(sq, reponseFragments(e, phase)), ...(phase === "region" ? { figureHtml: figureCorrigeSvg(e) } : {}) });
    if (phase === "region") L.push(verification(sq, conclusionTest(e)));
    L.push(piege(sq, piegeEtape(e, phase)));
  });
  return L;
}
