import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ReponseTableauFPrimeBorne } from "../moteur5e/verificationExtremaBornes";
import { tableauFPrimeBorneAttendu } from "../moteur5e/verificationExtremaBornes";
import { consigneEcranExtremaBornes, texteAideNiveau1ExtremaBornes, texteAideNiveau2ExtremaBornes } from "../ui5e/formatExtremaBornes";
import { BoutonAide } from "./BoutonAide";
import { EnonceExtremaBornes } from "./EnonceExtremaBornes";
import { TableauEtudeLocaleBuilder } from "./TableauEtudeLocaleBuilder";

interface Props {
  exercice: ExerciceExtremaBornes;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauFPrimeBorne) => void;
}

/** Écran "tableauFPrime" — RÉUTILISE `TableauEtudeLocaleBuilder` (5gen29) TEL QUEL, mode "fprime",
 * colonnes zone/racine UNIQUEMENT (jamais de colonne exclusion : le domaine [0;T] est fermé/borné,
 * sans CE). Écart documenté et pré-autorisé : le composant partagé affiche encore les bornes
 * `-∞`/`+∞` en en-tête (convention historique de 5gen29, domaine non borné) — ce générateur-ci a un
 * domaine RÉELLEMENT borné (0 et T), mais la réutilisation "telle quelle" du composant est
 * explicitement demandée plutôt qu'une fourche de comportement ; les vraies bornes t=0/t=T et
 * leurs valeurs sont traitées à l'écran suivant ("valeursBornes"), jamais confondues avec ces
 * marqueurs `±∞` génériques du tableau. Calculatrice ABSENTE (question structurelle/qualitative). */
export function EtapeTableauFPrimeExtremaBornes({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const attendu = tableauFPrimeBorneAttendu(exercice);
  const enteteColonnes = attendu.colonnes.map((col) => (col.type === "racine" ? `${exercice.racinesFPrime[col.index]}` : ""));

  return (
    <div>
      <EnonceExtremaBornes exercice={exercice} phase="tableauFPrime" />
      <p className="prompt-text">{consigneEcranExtremaBornes("tableauFPrime")}</p>
      <TableauEtudeLocaleBuilder
        colonnes={attendu.colonnes}
        enteteColonnes={enteteColonnes}
        mode="fprime"
        attendu={attendu}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        onValider={onValider}
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
      />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1ExtremaBornes("tableauFPrime")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2ExtremaBornes("tableauFPrime")}</p>}
        </div>
      )}
    </div>
  );
}
