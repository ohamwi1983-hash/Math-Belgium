import { useState } from "react";
import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { diagnostiquerIntersection } from "../moteur/verificationDroite";
import { NIVEAU_AIDE_MAX_INTERSECTION_Q } from "../moteur/sessionDistanceDroite";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import type { ReponseIntersection } from "../moteur/verificationDistanceDroite";
import { COULEUR_B, COULEUR_D, COULEUR_P, COULEUR_Q, CONSIGNE_INTERSECTION_Q, LABEL_X_Q, LABEL_Y_Q, PLACEHOLDER_COORDONNEE_FRACTION, TEXTE_AIDE_INTERSECTION_Q_NIVEAU1, calculerEtatActuelDistanceDroite, formatAideIntersectionQNiveau2Latex } from "../ui/formatDistanceDroite";
import type { LigneAffichee } from "../ui/distanceDroiteGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

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
  onValider: (reponse: ReponseIntersection) => void;
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
export function EtapeIntersectionQDistanceDroite({ exercice, point, bAttendue, droiteCible, qAttendu, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): ReponseIntersection {
    return { x: parserNombreOuFraction(x) ?? NaN, y: parserNombreOuFraction(y) ?? NaN };
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
  const points = [{ point, label: "P", couleur: COULEUR_P }];
  if (niveauAide >= 1) points.push({ point: qAttendu, label: "Q", couleur: COULEUR_Q });

  const etatActuel = calculerEtatActuelDistanceDroite({ variante: exercice.variante, point, droiteCible, bAttendue, qAttendu: null });

  return (
    <div>
      <ConsigneGeneraleDistanceDroite exercice={exercice} />
      <DonneesDistanceDroite exercice={exercice} />
      <DistanceDroiteGraph lignes={lignes} points={points} />
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">{CONSIGNE_INTERSECTION_Q}</p>

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
            onChange={(e) => setX(e.target.value)}
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
            onChange={(e) => setY(e.target.value)}
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
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_INTERSECTION_Q} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
