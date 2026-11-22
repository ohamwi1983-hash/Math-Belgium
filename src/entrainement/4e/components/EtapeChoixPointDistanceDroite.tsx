import { useState } from "react";
import type { ExerciceDistanceParalleles } from "../core/distanceDroite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_CHOIX_POINT } from "../moteur/sessionDistanceDroite";
import { diagnostiquerChoixPoint } from "../moteur/verificationDistanceDroite";
import { COULEUR_D, PLACEHOLDER_COORDONNEE, aideChoixPointNiveau1, aideChoixPointNiveau2, consigneChoixPoint } from "../ui/formatDistanceDroite";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { RenduFragments } from "./RenduFragments";
import { ILLISIBLE_ANALYTIQUE, l, nombreOuNaN, nombresLisibles, t } from "../ui/retoursAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceDistanceParalleles;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  /** `saisie` : les deux champs tels que tapés, pour la fiche de consultation (puces cliquables). */
  onValider: (reponse: Point, saisie: { x: string; y: string }) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 0 (variante "paralleles" uniquement) — choisir un point à coordonnées entières sur la
 * droite DÉSIGNÉE explicitement par l'énoncé (`exercice.droiteSource`). Vérification par
 * APPARTENANCE (`diagnostiquerChoixPoint`) — n'importe quel point valide accepté, même mécanisme
 * que "Construction graphique — tracer une droite depuis son équation" (écran "points"). Rien
 * n'est encore confirmé à ce stade (pas de bloc "état actuel").
 */
export function EtapeChoixPointDistanceDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): Point {
    return { x: nombreOuNaN(x), y: nombreOuNaN(y) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerChoixPoint(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleDistanceDroite exercice={exercice} />}
        blocDonnees={
          <>
            <DonneesDistanceDroite exercice={exercice} />
            <DistanceDroiteGraph
              lignes={[
                { droite: exercice.d1, label: "d₁", couleur: COULEUR_D },
                { droite: exercice.d2, label: "d₂", couleur: COULEUR_D },
              ]}
              cadrage={{ droites: [exercice.d1, exercice.d2], points: [] }}
            />
          </>
        }
      />
      <p className="prompt-text">{consigneChoixPoint(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="distance-droite-choix-point-x">
            x =
          </label>
          <input
            id="distance-droite-choix-point-x"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x}
            onChange={(e) => setX(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="distance-droite-choix-point-y">
            y =
          </label>
          <input
            id="distance-droite-choix-point-y"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y}
            onChange={(e) => setY(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aideChoixPointNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <RenduFragments fragments={aideChoixPointNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
          <PiedAnalytique
            niveauAide={niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX_CHOIX_POINT}
            onActiverAide={onActiverAide}
            complet={complet}
            reponse={construireReponse}
            lisible={() => nombresLisibles(x, y)}
            onValider={(r) => onValider(r, { x, y })}
            texteIllisible={ILLISIBLE_ANALYTIQUE.coordonnee}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={(r) => {
              const d = exercice.droiteSource === "d1" ? exercice.d1 : exercice.d2;
              const sur = Math.abs(d.a * r.x + d.b * r.y + d.c) < 1e-9;
              if (sur && (!Number.isInteger(r.x) || !Number.isInteger(r.y))) return [t("Ce point est bien sur la droite, mais ses coordonnées ne sont pas entières : essaie une autre valeur de "), l("x"), t(".")];
              if (!sur) return [t("Ce point n'est pas sur la droite demandée : remplace ses coordonnées dans son équation pour contrôler.")];
              return null;
            }}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
