import { useState } from "react";
import type { ExerciceMedianeClasses } from "../core/mediane.types";
import type { PointPolygone } from "../moteur/verificationMediane";
import { evaluerPolygone } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_POLYGONE } from "../moteur/sessionMediane";
import { CONSIGNE_POLYGONE, texteAidePolygoneNiveau1 } from "../ui/formatMediane";
import { formatMessageErreur } from "../ui/messageErreur";
import { PolygoneEffectifsGraph } from "./PolygoneEffectifsGraph";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { arrondirAuPas, pasCommun } from "../generateurs/bienaymeTchebychev/echelleContexte";

interface Props {
  exercice: ExerciceMedianeClasses;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (points: PointPolygone[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Positions de départ des points mobiles — répartis uniformément sur le domaine x, tous à y=0
 * (jamais déjà corrects, même principe que `positionsDepart` de "Boîte à moustaches" : les
 * coordonnées à trouver ne sont jamais pré-remplies). */
/** Cran du glissement horizontal : plus grand pas commun des bornes de classes. */
function cranBornes(exercice: ExerciceMedianeClasses): number {
  return pasCommun(exercice.classes.flatMap((c) => [c.borneInf, c.borneSup]));
}

function positionsDepart(exercice: ExerciceMedianeClasses): PointPolygone[] {
  const xMin = exercice.classes[0].borneInf;
  const xMax = exercice.classes[exercice.classes.length - 1].borneSup;
  const n = exercice.classes.length;
  const pas = (xMax - xMin) / (n + 1);
  const cran = cranBornes(exercice);
  return exercice.classes.map((_, i) => ({ x: arrondirAuPas(xMin + (i + 1) * pas, cran), y: 0 }));
}

/**
 * Écran "Polygone" (variante "classes" uniquement, remplace "Identifie la classe médiane" —
 * `promptgen33modifications.md`) — l'élève place un point par classe sur un graphe Mafs interactif
 * (`PolygoneEffectifsGraph`), aucune saisie libre. Marquage rouge en DIRECT (`evaluerPolygone`
 * recalculé à chaque rendu dès `apresEchec`, jamais figé à la dernière validation) : un point
 * redevient bleu dès que l'élève le déplace vers la bonne position, avant toute nouvelle
 * validation — même principe que l'écran "construction" de "Boîte à moustaches". Toujours actif
 * ("Valider" jamais désactivé, les points ont toujours une position par défaut). Le tableau
 * classes/effectifs (identique à l'écran "synthese") est centralisé dans `blocDonnees`
 * (`EnTeteExercice`, voir `AppMediane`/`AppExerciceSynthese`) — plus rendu ici.
 */
export function EtapePolygoneMediane({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [points, setPoints] = useState<PointPolygone[]>(() => positionsDepart(exercice));
  const pointFixe: PointPolygone = { x: exercice.classes[0].borneInf, y: 0 };

  function deplacerPoint(index: number, point: PointPolygone) {
    setPoints((precedent) => precedent.map((p, i) => (i === index ? point : p)));
  }

  const apresEchec = tentativesUtilisees > 0;
  // `evaluerPolygone` retourne un booléen par point qui vaut `true` si CORRECT (voir sa
  // documentation, `verificationMediane.ts`) — inversé ici avant transmission à
  // `PolygoneEffectifsGraph`, qui attend `erronees[i]=true` pour un point à marquer en ROUGE
  // (même principe que `EtapeConstruction.tsx`, "Boîte à moustaches", `erroneesInversees`).
  const erronees = apresEchec ? evaluerPolygone(exercice, points).map((correct) => !correct) : null;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_POLYGONE}</p>

      <PolygoneEffectifsGraph pointFixe={pointFixe} points={points} erronees={erronees} onDeplacerPoint={deplacerPoint} pasX={cranBornes(exercice)}
        fenetre={{ xMin: exercice.classes[0].borneInf, xMax: exercice.classes[exercice.classes.length - 1].borneSup, n: exercice.classes[exercice.classes.length - 1].effectifCumule }}
      />

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePolygoneNiveau1()}</p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_POLYGONE} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" onClick={() => onValider(points)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
