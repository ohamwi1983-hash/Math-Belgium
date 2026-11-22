import { useState } from "react";
import type { ExerciceLieuxGeometriques, Lieu } from "../core/lieuxGeometriques.types";
import { diagnostiquerEquationLieu } from "../moteur/verificationLieuxGeometriques";
import type { ReponseEquations } from "../moteur/verificationLieuxGeometriques";
import { CONSIGNE_GENERALE_EQUATIONS, LIBELLE_TYPE_LIEU, formatCaracteristiquesLieuLatex, latexGabaritGenerique, libelleChampEquation, placeholderEquation } from "../ui/formatLieuxGeometriques";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, cibleEquationCercle } from "../ui/retoursAnalytique";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceLieuxGeometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEquations) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

interface BlocEquationLieuProps {
  lieu: Lieu;
  id: string;
  texte: string;
  onChange: (valeur: string) => void;
  statut: StatutVerification | undefined;
}

/** Un champ de texte libre PAR LIEU, labellisé par le TYPE réel du lieu (les 2 lieux sont toujours
 * de types différents) — ses caractéristiques confirmées sont rappelées dans le récapitulatif "Ce
 * qu'on sait déjà" en haut de l'écran (`recapitulatifLieuxGeometriques.ts`), plus répétées ici.
 * Marquage rouge PAR CHAMP cohérent avec la vérification, elle aussi lieu par lieu
 * (`diagnostiquerEquations`). */
function BlocEquationLieu({ lieu, id, texte, onChange, statut }: BlocEquationLieuProps) {
  return (
    <div>
      <div className="field">
        <label className="field-label" htmlFor={id}>
          {libelleChampEquation(lieu)}
        </label>
        <input
          id={id}
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={placeholderEquation(lieu)}
          value={texte}
          onChange={(e) => onChange(normaliserMoins(e.target.value))}
        />
      </div>
    </div>
  );
}

/** Écran 2 — Équations. 2 blocs DISTINCTS, un par lieu, vérifiés par équivalence algébrique en
 * réutilisant les moteurs déjà en place pour chaque type de lieu. */
export function EtapeEquationsLieuxGeometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texteLieu1, setTexteLieu1] = useState("");
  const [texteLieu2, setTexteLieu2] = useState("");
  const apresEchec = tentativesUtilisees > 0;
  const complet = texteLieu1.trim() !== "" && texteLieu2.trim() !== "";

  const statutLieu1 = apresEchec ? diagnostiquerEquationLieu(exercice.lieu1, texteLieu1) : undefined;
  const statutLieu2 = apresEchec ? diagnostiquerEquationLieu(exercice.lieu2, texteLieu2) : undefined;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATIONS}</p>

      <BlocEquationLieu lieu={exercice.lieu1} id="lieux-geometriques-equation-lieu1" texte={texteLieu1} onChange={setTexteLieu1} statut={statutLieu1} />
      <BlocEquationLieu lieu={exercice.lieu2} id="lieux-geometriques-equation-lieu2" texte={texteLieu2} onChange={setTexteLieu2} statut={statutLieu2} />

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Formule générale — {LIBELLE_TYPE_LIEU[exercice.lieu1.type].toLowerCase()} :{" "}
            <Katex expression={latexGabaritGenerique(exercice.lieu1.type, exercice.lieu1.type === "parabole" ? exercice.lieu1.orientation : undefined)} /> ;{" "}
            {LIBELLE_TYPE_LIEU[exercice.lieu2.type].toLowerCase()} :{" "}
            <Katex expression={latexGabaritGenerique(exercice.lieu2.type, exercice.lieu2.type === "parabole" ? exercice.lieu2.orientation : undefined)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Caractéristiques confirmées à l'écran précédent, à placer dans ces formules — {LIBELLE_TYPE_LIEU[exercice.lieu1.type].toLowerCase()} :{" "}
              <Katex expression={formatCaracteristiquesLieuLatex(exercice.lieu1)} /> ; {LIBELLE_TYPE_LIEU[exercice.lieu2.type].toLowerCase()} :{" "}
              <Katex expression={formatCaracteristiquesLieuLatex(exercice.lieu2)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={2}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => ({ texteLieu1, texteLieu2 })}
          lisible={(r) => diagnostiquerEquationLieu(exercice.lieu1, r.texteLieu1) !== "parse_error" && diagnostiquerEquationLieu(exercice.lieu2, r.texteLieu2) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.equationsLieux}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => {
            for (const [lieu, texte] of [
              [exercice.lieu1, r.texteLieu1],
              [exercice.lieu2, r.texteLieu2],
            ] as const) {
              if (lieu.type === "cercle") {
                const m = cibleEquationCercle((x0, y0, r2) => diagnostiquerEquationLieu({ ...lieu, centre: { x: x0, y: y0 }, rayon: Math.sqrt(r2) }, texte) === "correct", lieu.centre.x, lieu.centre.y, lieu.rayon * lieu.rayon);
                if (m) return m;
              }
            }
            return null;
          }}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
