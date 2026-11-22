import { useState } from "react";
import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { diagnostiquerIntersection } from "../moteur/verificationDroite";
import { NIVEAU_AIDE_MAX_INTERSECTION_Q } from "../moteur/sessionDistanceDroite";
import type { ReponseIntersection } from "../moteur/verificationDistanceDroite";
import { COULEUR_B, COULEUR_D, COULEUR_P, COULEUR_Q, LABEL_X_Q, LABEL_Y_Q, PLACEHOLDER_COORDONNEE_FRACTION, TEXTE_AIDE_INTERSECTION_Q_NIVEAU1, consigneIntersectionQ, formatAideIntersectionQNiveau2Latex } from "../ui/formatDistanceDroite";
import type { LigneAffichee } from "../ui/distanceDroiteGraph";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, nombreOuNaN, nombresLisibles } from "../ui/retoursAnalytique";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDistanceDroite;
  point: Point;
  bAttendue: DroiteImplicite;
  droiteCible: DroiteImplicite;
  qAttendu: Point;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  /** `saisie` : les deux champs tels que tapés, pour la fiche de consultation (puces cliquables). */
  onValider: (reponse: ReponseIntersection, saisie: { x: string; y: string }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 — coordonnées de Q = b ∩ d. Aucun écran de diagnostic (b et d toujours sécantes par
 * construction, une perpendiculaire ne peut jamais être parallèle à d) — vérifie directement les 2
 * coordonnées via `diagnostiquerIntersection` (`verificationDroite.ts`, réutilisée telle quelle
 * pour "Intersection entre deux droites" — jamais une seconde logique de comparaison). `Q` peut
 * être une fraction non entière (le point choisi à l'écran 0 n'est pas forcément le pied canonique
 * de la perpendiculaire) : champs en texte libre, `parserNombreOuFraction` (fraction/décimal —
 * point 13, `promptgen47modifications.md`), jamais le filtrage numérique-strict qui bloquerait le
 * caractère "/". `Q` n'apparaît sur le graphe illustratif QUE via l'aide niveau 1 (point 10).
 */
export function EtapeIntersectionQDistanceDroite({ exercice, point, bAttendue, droiteCible, qAttendu, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): ReponseIntersection {
    return { x: nombreOuNaN(x), y: nombreOuNaN(y) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerIntersection(construireReponse(), qAttendu) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const lignes: LigneAffichee[] =
    exercice.variante === "paralleles"
      ? [
          { droite: exercice.d1, label: "d₁", couleur: COULEUR_D },
          { droite: exercice.d2, label: "d₂", couleur: COULEUR_D },
        ]
      : [{ droite: droiteCible, label: "d", couleur: COULEUR_D }];
  lignes.push({ droite: bAttendue, label: "b", couleur: COULEUR_B });
  const cadrage = { droites: lignes.map((l) => l.droite), points: [point, qAttendu] };
  const points = [{ point, label: "P", couleur: COULEUR_P }];
  // Q n'est marqué qu'à l'aide de niveau 2 (au niveau 1, il donnait la réponse à lire).
  if (niveauAide >= 2) points.push({ point: qAttendu, label: "Q", couleur: COULEUR_Q });

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleDistanceDroite exercice={exercice} />}
        blocDonnees={
          <>
            <DonneesDistanceDroite exercice={exercice} />
            <DistanceDroiteGraph lignes={lignes} points={points} cadrage={cadrage} />
          </>
        }
      />
      <p className="prompt-text">{consigneIntersectionQ(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="distance-droite-intersection-x">
            <Katex expression={LABEL_X_Q} />
          </label>
          <input
            id="distance-droite-intersection-x"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE_FRACTION}
            value={x}
            onChange={(e) => setX(normaliserMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="distance-droite-intersection-y">
            <Katex expression={LABEL_Y_Q} />
          </label>
          <input
            id="distance-droite-intersection-y"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE_FRACTION}
            value={y}
            onChange={(e) => setY(normaliserMoins(e.target.value))}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_INTERSECTION_Q_NIVEAU1}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideIntersectionQNiveau2Latex(bAttendue, droiteCible)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_INTERSECTION_Q}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => construireReponse()}
          lisible={() => nombresLisibles(x, y)}
          onValider={(r) => onValider(r, { x, y })}
          texteIllisible={ILLISIBLE_ANALYTIQUE.coordonnee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
