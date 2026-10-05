import { useState } from "react";
import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_EQUATION_B } from "../moteur/sessionDistanceDroite";
import { diagnostiquerEquationB } from "../moteur/verificationDistanceDroite";
import {
  COULEUR_B,
  COULEUR_D,
  COULEUR_P,
  LABEL_CHAMP_EQUATION_B,
  PLACEHOLDER_EQUATION,
  calculerEtatActuelDistanceDroite,
  formatAideEquationBNiveau2Latex,
  libelleBoutonAide,
  segmentsAideEquationBNiveau1,
  segmentsConsigneEquationB,
} from "../ui/formatDistanceDroite";
import type { LigneAffichee } from "../ui/distanceDroiteGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceDistanceDroite;
  point: Point;
  droiteCible: DroiteImplicite;
  bAttendue: DroiteImplicite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
}

/**
 * Écran 1 — équation cartésienne de b, ⊥ à la droite cible, passant par le point (le point donné
 * pour la variante "point", ou choisi par l'élève à l'écran 0 pour "paralleles"). Réutilise
 * directement `diagnostiquerEquationDroiteLibre` (via `verificationDistanceDroite.ts`) — même
 * mécanisme que le champ libre cartésien de "Relations entre droites"/"Lecture graphique —
 * équation d'une droite". `b` n'apparaît sur le graphe illustratif QUE via l'aide niveau 1
 * (`promptgen47modifications.md`, point 7) — jamais avant, pour ne pas donner la réponse.
 */
export function EtapeEquationBDistanceDroite({ exercice, point, droiteCible, bAttendue, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerEquationB(texte, bAttendue) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const lignes: LigneAffichee[] =
    exercice.variante === "paralleles"
      ? [
          { droite: exercice.d1, label: "d₁", couleur: COULEUR_D },
          { droite: exercice.d2, label: "d₂", couleur: COULEUR_D },
        ]
      : [{ droite: droiteCible, label: "d", couleur: COULEUR_D }];
  if (niveauAide >= 1) lignes.push({ droite: bAttendue, label: "b", couleur: COULEUR_B });

  const etatActuel = calculerEtatActuelDistanceDroite({ variante: exercice.variante, point, droiteCible: null, bAttendue: null, qAttendu: null });

  return (
    <div>
      <ConsigneGeneraleDistanceDroite exercice={exercice} />
      <DonneesDistanceDroite exercice={exercice} />
      <DistanceDroiteGraph lignes={lignes} points={[{ point, label: "P", couleur: COULEUR_P }]} />
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneEquationB()} />
      </p>

      <div className="field">
        <label className="field-label" htmlFor="distance-droite-equation-b">
          {LABEL_CHAMP_EQUATION_B}
        </label>
        <input
          id="distance-droite-equation-b"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideEquationBNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideEquationBNiveau2Latex(droiteCible)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_EQUATION_B} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_EQUATION_B)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
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
