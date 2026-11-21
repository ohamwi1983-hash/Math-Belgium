import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, decouperLigneCalcul, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveAnalytique } from "../../core/detectiveAnalytique.types";
import { descriptionFragments, indiceLigneFausse, scenario } from "../../moteur/modeleDetectiveAnalytique";
import { t } from "../../ui/outilsAnalytiqueLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen99 (partagé par l'adaptateur et l'appli ; une lettre par
 * écran). a) la ligne fausse refaite, « et non … comme dans la copie » ; b) la règle du cours et la
 * description de l'erreur, avec le piège ; c) la copie reprise sans l'erreur, ligne à ligne, le
 * résultat corrigé et une vérification.
 */

type E = ExerciceDetectiveAnalytique;

/** Dernière chaîne du calcul (depuis la dernière ligne qui a un membre de gauche) : jamais une ligne
 * « = … » isolée. */
function dernierBloc(lignes: LigneCalcul[]): LigneCalcul[] {
  let j = lignes.length - 1;
  while (j > 0 && decouperLigneCalcul(lignes[j]!.latex).gauche === "") j--;
  return lignes.slice(j);
}

export function correctionDetailleeDetectiveAnalytique(e: E): EtapeCorrection[] {
  const s = scenario(e);
  const k = indiceLigneFausse(e) + 1;
  const sortie: EtapeCorrection[] = [
    utilise("a", [t("On refait la copie ligne par ligne à partir des données : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")]),
    calcul("a", s.corrigeA, [t(`Ligne ${k} refaite :`)]),
    resultat("a", [t(`La ligne ${k} est fausse. `), ...s.constat]),
    utilise("b", s.regle),
    calcul("b", dernierBloc(s.corrigeA)),
    resultat("b", descriptionFragments(e.type)),
    piege("b", s.piege),
    utilise("c", [t("On reprend la copie sans l'erreur : les lignes qui suivent la ligne fausse changent aussi.")]),
    calcul("c", s.corrigeC),
    resultat("c", s.reponse),
  ];
  if (s.verification) sortie.push(verification("c", s.verification.texte, s.verification.lignes));
  return sortie;
}
