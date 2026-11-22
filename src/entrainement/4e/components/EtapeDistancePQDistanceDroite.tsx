import { useState } from "react";
import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_DISTANCE_PQ } from "../moteur/sessionDistanceDroite";
import { diagnostiquerDistance } from "../moteur/verificationDistanceDroite";
import { COULEUR_B, COULEUR_D, COULEUR_P, COULEUR_Q, CONSIGNE_DISTANCE_PQ, FORMULE_GENERALE_DISTANCE_PQ_LATEX, LABEL_DISTANCE_PQ, PLACEHOLDER_DISTANCE_PQ, formatAideDistancePQNiveau2Latex, nomDroiteCible, texteRaccourciDistanceAxiale } from "../ui/formatDistanceDroite";
import type { LigneAffichee } from "../ui/distanceDroiteGraph";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, l, lireNombreAnalytique, t } from "../ui/retoursAnalytique";
import { MESSAGE_VALEUR_APPROCHEE } from "./RetourSaisie";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDistanceDroite;
  point: Point;
  droiteCible: DroiteImplicite;
  bAttendue: DroiteImplicite;
  qAttendu: Point;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 3 (dernier) — distance PQ, une fois Q confirmé à l'écran précédent. Champ texte libre
 * (entier/fraction/`sqrt(...)`/décimal, `promptgen47modifications.md`, point 15) — jamais le
 * filtrage numérique-strict, qui bloquerait `/`. Notation P/Q cohérente (point 16), jamais la
 * formule générique A/B héritée de "Norme d'un vecteur et distance entre 2 points". Tous les
 * éléments (droite(s), P, b, Q) sont désormais CONFIRMÉS : toujours affichés sur le graphe, sans
 * conditionner à un niveau d'aide.
 */
export function EtapeDistancePQDistanceDroite({ exercice, point, droiteCible, bAttendue, qAttendu, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";

  /** Valeur approchée (décimale proche de la distance irrationnelle) : refusée sans tentative, la
   * consigne demande la valeur exacte. */
  const valeurLue = lireNombreAnalytique(texte);
  const approchee = valeurLue !== null && !/√|sqrt|rac/i.test(texte) && /[.,]/.test(texte) && Math.abs(valeurLue - exercice.distance) < 0.06 && Math.abs(valeurLue - exercice.distance) > 1e-9;

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerDistance(exercice, texte) : undefined;
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
  const raccourci = texteRaccourciDistanceAxiale(droiteCible, nomDroiteCible(exercice).texte);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleDistanceDroite exercice={exercice} />}
        blocDonnees={
          <>
            <DonneesDistanceDroite exercice={exercice} />
            <DistanceDroiteGraph
              lignes={lignes}
              points={[
                { point, label: "P", couleur: COULEUR_P },
                { point: qAttendu, label: "Q", couleur: COULEUR_Q },
              ]}
              cadrage={cadrage}
            />
          </>
        }
      />
      <p className="prompt-text">{CONSIGNE_DISTANCE_PQ}</p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="distance-droite-distance-pq">
          {LABEL_DISTANCE_PQ}
        </label>
        <input
          id="distance-droite-distance-pq"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_DISTANCE_PQ}
          value={texte}
          onChange={(e) => setTexte(normaliserMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel : <Katex expression={FORMULE_GENERALE_DISTANCE_PQ_LATEX} />
          </p>
          {raccourci && <p>{raccourci}</p>}
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formatAideDistancePQNiveau2Latex(point, qAttendu)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_DISTANCE_PQ}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => texte}
          lisible={(r) => diagnostiquerDistance(exercice, r) !== "parse_error" && !approchee}
          onValider={onValider}
          texteIllisible={approchee ? MESSAGE_VALEUR_APPROCHEE : ILLISIBLE_ANALYTIQUE.distance}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => (Math.abs((lireNombreAnalytique(r) ?? NaN) - exercice.distance ** 2) < 1e-9 && exercice.distance > 1 ? [t("Tu as donné "), l("PQ^2"), t(" : la distance est sa racine carrée.")] : null)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
