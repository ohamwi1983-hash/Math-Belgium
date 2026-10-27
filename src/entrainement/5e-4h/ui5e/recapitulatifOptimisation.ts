import type { EtatSessionOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { ordreEcransOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { champsEcran, LIBELLE_ECRAN } from "./formatOptimisationGeometrique";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours (5gen32). Icône (✓/✗)
 * pilotée par `etat.revelesPartiels[ecran]`, peuplé depuis `etapeCourante.revelee` à la clôture
 * de chaque écran (`sessionOptimisationGeometrique.ts::soumettreReponseEcran`).
 * `ordreEcransOptimisation(exercice)`
 * donne la séquence RÉELLE (4 écrans pour "cubique", 6-7 pour les autres familles, fixée dès le
 * tirage, voir `typesOptimisationGeometrique.ts`) ; on s'arrête à l'écran courant (pas encore clos).
 *
 * Contrairement aux autres générateurs 5e (qui affichent la réponse CONFIRMÉE, recalculée depuis
 * l'exercice), ici on reprend les DERNIÈRES RÉPONSES SOUMISES par l'élève pour cet écran
 * (`etat.dernieresReponsesParEcran`) — EXACTEMENT le même choix que l'ancien bloc "état actuel"
 * (`EtatActuelOptimisation.tsx`/`formatTermesEtatActuelLatex`) : pour la plupart des écrans ici, la
 * réponse n'a pas de forme canonique unique calculable (vérifiée par équivalence symbolique), donc
 * `formatReponseAttendueEcranLatex` ne donne qu'un texte vague ("voir la formule isolée...") plutôt
 * qu'une vraie valeur — recopier la propre réponse (acceptée) de l'élève est donc la SEULE source
 * fiable, déjà établie par ce bloc.
 */
export function calculerRecapitulatifOptimisation(etat: EtatSessionOptimisation): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const ecran of ordreEcransOptimisation(exercice)) {
    if (ecran === etat.phase) break;
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) continue;
    const reponses = etat.dernieresReponsesParEcran[ecran];
    if (!reponses) continue;

    const valeurs: string[] = [];
    for (const champ of champsEcran(exercice, ecran)) {
      const valeur = reponses[champ.id];
      if (valeur === undefined || valeur === "") continue;
      const labelPropre = champ.label.replace(/=$/, "");
      const valeurAffichee = champ.kind === "choix" ? (champ.options.find((o) => o.id === valeur)?.label ?? valeur) : valeur;
      valeurs.push(`${labelPropre}=${champ.kind === "choix" ? `\\text{${valeurAffichee}}` : valeurAffichee}`);
    }
    if (valeurs.length === 0) continue;

    entrees.push({
      libelle: LIBELLE_ECRAN[ecran],
      estLatex: true,
      valeur: valeurs.join("\\quad"),
      ...(valeurs.length > 1 ? { valeurs } : {}),
      revele: etat.revelesPartiels[ecran] ?? false,
    });
  }

  return entrees;
}
