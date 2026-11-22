import { useState } from "react";
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { NIVEAU_AIDE_MAX_CONSTRUCTION } from "../moteur/sessionRelationsDroites";
import { diagnostiquerConstruction } from "../moteur/verificationRelationsDroites";
import type { ReponseVecteur } from "../moteur/verificationRelationsDroites";
import { PLACEHOLDER_COMPOSANTE, consigneConstruction, formatAideConstructionNiveau2Latex, formatDonneesRechercheeLatex, formatEnonceLatex, segmentsAideConstructionNiveau1 } from "../ui/formatRelationsDroites";
import { ConsigneGeneraleRelationsDroites } from "./ConsigneGeneraleRelationsDroites";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, colineaires, l, nombreOuNaN, nombresLisibles, t } from "../ui/retoursAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/** Entier, décimal (virgule ou point) ou fraction « p/q » — NaN si illisible (`parse_error`). */
const lire = nombreOuNaN;

interface Props {
  exercice: ExerciceRelationsDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseVecteur) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 — construction d'un vecteur directeur de la droite CHERCHÉE, parallèle ou perpendiculaire
 * (selon `exercice.critere`) au vecteur de référence déjà confirmé à l'écran 1. Vérifiée par
 * `diagnostiquerConstruction` (colinéarité ou orthogonalité, jamais un couple exact imposé).
 */
export function EtapeConstructionRelationsDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): ReponseVecteur {
    return { x: lire(x), y: lire(y) };
  }

  /** Message ciblé (jamais la réponse) : parallèle et perpendiculaire confondus. */
  function cible(r: ReponseVecteur) {
    if (!(Math.abs(r.x) > 1e-12 || Math.abs(r.y) > 1e-12)) return [t("Le vecteur nul n'a pas de direction : il ne peut pas diriger une droite.")];
    const u = exercice.vecteurReference;
    if (exercice.critere === "perpendiculaire" && colineaires(r, u)) return [t("Ton vecteur est colinéaire à "), l("\\vec{u}"), t(" : il dirige une parallèle à d, pas une perpendiculaire.")];
    if (exercice.critere === "parallele" && colineaires(r, { x: -u.y, y: u.x })) return [t("Ton vecteur est perpendiculaire à "), l("\\vec{u}"), t(" (c'est un vecteur normal de d) : une parallèle garde la direction de "), l("\\vec{u}"), t(".")];
    if (exercice.critere === "perpendiculaire" && colineaires(r, { x: u.y, y: u.x })) return [t("Tu as échangé les composantes sans changer le signe de l'une d'elles : vérifie avec le critère d'orthogonalité.")];
    return null;
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerConstruction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleRelationsDroites exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} block />
            <Katex expression={formatDonneesRechercheeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneConstruction(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relations-droites-construction-x">
            <Katex expression="x_{\vec{v}}=" />
          </label>
          <input
            id="relations-droites-construction-x"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={x}
            onChange={(e) => setX(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relations-droites-construction-y">
            <Katex expression="y_{\vec{v}}=" />
          </label>
          <input
            id="relations-droites-construction-y"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={y}
            onChange={(e) => setY(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideConstructionNiveau1(exercice.critere)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideConstructionNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_CONSTRUCTION}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => construireReponse()}
          lisible={() => nombresLisibles(x, y)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.composante}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
