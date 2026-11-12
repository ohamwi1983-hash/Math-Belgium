import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ReponseTableauFPrimeBorne } from "../moteur5e/verificationExtremaBornes";
import { tableauFPrimeBorneAttendu } from "../moteur5e/verificationExtremaBornes";
import { consigneEcranExtremaBornes, texteAideNiveau1ExtremaBornes, texteAideNiveau2ExtremaBornes } from "../ui5e/formatExtremaBornes";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { TableauEtudeLocaleBuilder } from "./TableauEtudeLocaleBuilder";
import { TexteRiche5e } from "./TexteRiche5e";
import { AideExtremaBornesBloc } from "./AideExtremaBornesBloc";

interface Props {
  exercice: ExerciceExtremaBornes;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauFPrimeBorne) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran "tableauFPrime" — RÉUTILISE `TableauEtudeLocaleBuilder` (5gen29), mode "fprime",
 * colonnes zone/racine UNIQUEMENT (jamais de colonne exclusion : le domaine [0;T] est fermé/borné,
 * sans CE). Bornes RÉELLES 0 et T en en-tête (prop `bornes`, audit 5c5d point 2 : les ±∞
 * contredisaient le piège central), variable « t ». Les racines viennent de l'écran « racines »
 * (déjà vérifié). Une seule tentative (choix fermé, `tentativesMax` = 1 côté moteur). */
export function EtapeTableauFPrimeExtremaBornes({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const attendu = tableauFPrimeBorneAttendu(exercice);
  const enteteColonnes = attendu.colonnes.map((col) => (col.type === "racine" ? `${exercice.racinesFPrime[col.index]}` : ""));

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranExtremaBornes("tableauFPrime", exercice)} />
      </p>
      <AideExtremaBornesBloc niveauAide={niveauAide} niveau1={texteAideNiveau1ExtremaBornes("tableauFPrime", exercice)} niveau2={texteAideNiveau2ExtremaBornes("tableauFPrime", exercice)} />
      <TableauEtudeLocaleBuilder
        colonnes={attendu.colonnes}
        enteteColonnes={enteteColonnes}
        mode="fprime"
        bornes={{ gauche: "0", droite: `${exercice.T}` }}
        variable="t"
        attendu={attendu}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        onValider={onValider}
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
        validation={validation}
      />
    </div>
  );
}
