import type { ValeurLigne2Tableau } from "../core5e/etudeLocale.types";
import { libelleLigne2Tableau } from "../ui5e/formatEtudeLocale";

/** Version COURTE d'un libellé de la ligne 2 du tableau (variations ou concavité), affichée à la
 * place du libellé complet dans un tableau DENSE sur téléphone (`.grille-signes--dense`, CSS
 * `theme.css`) : « maximum » ne tient pas dans une colonne de 30 px quand le tableau a 5 colonnes
 * de points. Le libellé complet reste lu par les lecteurs d'écran (`aria-label` du bouton parent ou
 * texte masqué visuellement). Rendu seulement : aucune valeur ni logique ne change. */
const COURT: Partial<Record<ValeurLigne2Tableau, string>> = {
  max: "max.",
  min: "min.",
  ni_lun_ni_lautre: "ni max. ni min.",
  pas_de_pi: "pas de PI",
};

export function EtiquetteLigne2Tableau({ valeur }: { valeur: ValeurLigne2Tableau | null }) {
  const long = libelleLigne2Tableau(valeur);
  const court = valeur !== null ? COURT[valeur] : undefined;
  if (!court) return <>{long}</>;
  return (
    <>
      <span className="etiquette-longue">{long}</span>
      <span className="etiquette-courte" aria-hidden="true">
        {court}
      </span>
    </>
  );
}

/** Tableau dense (au moins 2 colonnes de points, soit ≥ 5 colonnes) : classe ajoutée au tableau. */
export function classeDensite(nombreColonnes: number): string {
  return nombreColonnes >= 5 ? " grille-signes--dense" : "";
}
