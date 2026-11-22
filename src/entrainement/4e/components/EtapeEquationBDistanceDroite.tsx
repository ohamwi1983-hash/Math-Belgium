import { useState } from "react";
import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_EQUATION_B } from "../moteur/sessionDistanceDroite";
import { diagnostiquerEquationB } from "../moteur/verificationDistanceDroite";
import { COULEUR_B, COULEUR_D, COULEUR_P, LABEL_CHAMP_EQUATION_B, PLACEHOLDER_EQUATION, formatAideEquationBNiveau2Latex, nomDroiteCible, segmentsAideEquationBNiveau1, segmentsConsigneEquationB } from "../ui/formatDistanceDroite";
import type { LigneAffichee } from "../ui/distanceDroiteGraph";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, cibleEquationDroite, lireEquationDroite } from "../ui/retoursAnalytique";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDistanceDroite;
  point: Point;
  droiteCible: DroiteImplicite;
  bAttendue: DroiteImplicite;
  /** Pied de la perpendiculaire — jamais affiché ici, seulement pour fixer le cadre du graphe
   * (identique sur les 3 derniers écrans, il ne bouge plus quand l'aide fait apparaître b). */
  qAttendu: Point;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 — équation cartésienne de b, ⊥ à la droite cible, passant par le point (le point donné
 * pour la variante "point", ou choisi par l'élève à l'écran 0 pour "paralleles"). Réutilise
 * directement `diagnostiquerEquationDroiteLibre` (via `verificationDistanceDroite.ts`) — même
 * mécanisme que le champ libre cartésien de "Relations entre droites"/"Lecture graphique —
 * équation d'une droite". `b` n'apparaît sur le graphe illustratif QUE via l'aide niveau 1
 * (`promptgen47modifications.md`, point 7) — jamais avant, pour ne pas donner la réponse.
 */
export function EtapeEquationBDistanceDroite({ exercice, point, droiteCible, bAttendue, qAttendu, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
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
  const cadrage = { droites: lignes.map((l) => l.droite), points: [point, qAttendu] };
  // La droite b n'est tracée qu'à l'aide de niveau 2 (au niveau 1, elle donnait la réponse à lire).
  if (niveauAide >= 2) lignes.push({ droite: bAttendue, label: "b", couleur: COULEUR_B });

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleDistanceDroite exercice={exercice} />}
        blocDonnees={
          <>
            <DonneesDistanceDroite exercice={exercice} />
            <DistanceDroiteGraph lignes={lignes} points={[{ point, label: "P", couleur: COULEUR_P }]} cadrage={cadrage} />
          </>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneEquationB(exercice)} />
      </p>

      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="distance-droite-equation-b">
          {LABEL_CHAMP_EQUATION_B}
        </label>
        <input
          id="distance-droite-equation-b"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION}
          value={texte}
          onChange={(e) => setTexte(normaliserMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideEquationBNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideEquationBNiveau2Latex(droiteCible, nomDroiteCible(exercice).latex, point)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_EQUATION_B}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => texte}
          lisible={(r) => diagnostiquerEquationB(r, bAttendue) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.equationDroite}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => cibleEquationDroite(lireEquationDroite(r), bAttendue, point, "P")}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
