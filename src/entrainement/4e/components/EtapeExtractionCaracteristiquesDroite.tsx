import { useState } from "react";
import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { NIVEAU_AIDE_MAX_EXTRACTION } from "../moteur/sessionCaracteristiquesDroite";
import { diagnostiquerExtraction } from "../moteur/verificationCaracteristiquesDroite";
import type { ReponseExtraction } from "../moteur/verificationCaracteristiquesDroite";
import { PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE, formatAideExtractionNiveau2Latex, segmentsAideExtractionNiveau1 } from "../ui/formatCaracteristiquesDroite";
import { ILLISIBLE_ANALYTIQUE, cibleVecteurDirecteur, l, nombreOuNaN, nombresLisibles, surDroite, t } from "../ui/retoursAnalytique";
import { ConsigneExtractionCaracteristiquesDroite } from "./ConsigneExtractionCaracteristiquesDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceCaracteristiquesDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseExtraction) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 — extraction d'un POINT et d'un VECTEUR DIRECTEUR de la droite de départ, 4 champs
 * numériques. Vérifiée par appartenance/proportionnalité (`diagnostiquerExtraction`), jamais par
 * égalité à un couple pré-déterminé — n'importe quel point de la droite avec n'importe quel
 * multiple non nul du vecteur directeur canonique est accepté.
 */
export function EtapeExtractionCaracteristiquesDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [px, setPx] = useState("");
  const [py, setPy] = useState("");
  const [vx, setVx] = useState("");
  const [vy, setVy] = useState("");

  const complet = [px, py, vx, vy].every((v) => v.trim() !== "");

  /** Fraction « p/q » acceptée (pente/ordonnée rationnelles : y = −1/3·x + 5/3 donne le point
   * (0 ; 5/3) et le vecteur (1 ; −1/3)) — une saisie illisible devient NaN (`parse_error`). */
  const lire = nombreOuNaN;

  /** Message ciblé (jamais la réponse) : vecteur normal pris pour directeur (lu sur a et b de
   * ax + by + c = 0), composantes échangées, point hors de la droite. */
  function cible(r: ReponseExtraction) {
    const vecteur = cibleVecteurDirecteur(r.vecteur, exercice.vecteur);
    if (vecteur) return vecteur;
    if (!surDroite(r.point, exercice.referenceImplicite)) return [t("Ton point n'est pas sur la droite : ses coordonnées doivent vérifier l'équation (remplace "), l("x"), t(" et "), l("y"), t(" pour contrôler).")];
    return null;
  }

  function construireReponse(): ReponseExtraction {
    return {
      point: { x: lire(px), y: lire(py) },
      vecteur: { x: lire(vx), y: lire(vy) },
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerExtraction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const champsPoint: { id: string; labelLatex: string; valeur: string; setter: (v: string) => void; placeholder: string }[] = [
    { id: "px", labelLatex: "x_A=", valeur: px, setter: setPx, placeholder: PLACEHOLDER_COORDONNEE },
    { id: "py", labelLatex: "y_A=", valeur: py, setter: setPy, placeholder: PLACEHOLDER_COORDONNEE },
  ];
  const champsVecteur: { id: string; labelLatex: string; valeur: string; setter: (v: string) => void; placeholder: string }[] = [
    { id: "vx", labelLatex: "x_{\\vec{u}}=", valeur: vx, setter: setVx, placeholder: PLACEHOLDER_COMPOSANTE },
    { id: "vy", labelLatex: "y_{\\vec{u}}=", valeur: vy, setter: setVy, placeholder: PLACEHOLDER_COMPOSANTE },
  ];

  return (
    <div>
      <ConsigneExtractionCaracteristiquesDroite exercice={exercice} />

      {[champsPoint, champsVecteur].map((paire) => (
        <div key={paire[0]!.id} className="field-row">
          {paire.map((champ) => (
            <div key={champ.id} className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`caracteristiques-droite-extraction-${champ.id}`}>
                <Katex expression={champ.labelLatex} />
              </label>
              <input
                id={`caracteristiques-droite-extraction-${champ.id}`}
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={champ.placeholder}
                value={champ.valeur}
                onChange={(e) => champ.setter(normaliserSigneMoins(e.target.value))}
              />
            </div>
          ))}
        </div>
      ))}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideExtractionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideExtractionNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_EXTRACTION}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={construireReponse}
          lisible={() => nombresLisibles(px, py, vx, vy)}
          onValider={onValider}
          texteIllisible={() => (nombresLisibles(px, py) ? ILLISIBLE_ANALYTIQUE.composante : ILLISIBLE_ANALYTIQUE.coordonnee)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
