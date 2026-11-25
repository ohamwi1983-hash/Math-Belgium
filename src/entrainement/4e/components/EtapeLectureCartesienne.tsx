import { useState } from "react";
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import { NIVEAU_AIDE_MAX } from "../moteur/sessionLectureGraphiqueDroite";
import { diagnostiquerCartesienne } from "../moteur/verificationLectureGraphiqueDroite";
import { consigneGeneraleLecture, consigneLecture, texteAideNiveau1 } from "../ui/formatLectureGraphiqueDroite";
import { pointsAideExemple } from "../ui/lectureGraphiqueDroiteGraph";
import { ILLISIBLE_ANALYTIQUE, cibleEquationDroite, l, lireEquationDroite, t } from "../ui/retoursAnalytique";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { RenduFragments } from "./RenduFragments";
import { LectureGraphiqueDroiteGraph } from "./LectureGraphiqueDroiteGraph";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteInsistance } from "../../components/TexteInsistance";


/** Aide de niveau 2 (avec les deux points surlignés sur le graphe) : la règle posée, jamais la réponse. */
const AIDE_NIVEAU_2 = [
  t("Deux points de la droite sont maintenant surlignés en orange : lis leurs coordonnées "),
  l("A(x_A\\,;\\,y_A)"),
  t(" et "),
  l("B(x_B\\,;\\,y_B)"),
  t(", puis "),
  l("\\vec{u}=\\begin{pmatrix}x_B-x_A\\\\ y_B-y_A\\end{pmatrix}"),
  t("."),
];

interface Props {
  exercice: ExerciceLectureGraphiqueDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Variante "cartesienne" — champ de texte LIBRE (jamais de blocage clavier numérique, les lettres
 * x/y sont requises) : n'importe quelle forme valide (implicite, explicite en x ou en y) est
 * acceptée, vérifiée par `diagnostiquerCartesienne` (normalisation implicite + proportionnalité,
 * jamais une comparaison de chaîne).
 */
export function EtapeLectureCartesienne({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCartesienne(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleLecture(exercice)}
        blocDonnees={
          <LectureGraphiqueDroiteGraph exercice={exercice} pointsSurlignes={niveauAide >= 2 ? pointsAideExemple(exercice) : []} />
        }
      />
      <p className="prompt-text">{consigneLecture(exercice)}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="lecture-droite-cartesienne">
          Équation :
        </label>
        <input
          id="lecture-droite-cartesienne"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="ex : y=0,4x+1,7"
          value={texte}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p><TexteInsistance texte={texteAideNiveau1(exercice)} /></p>
          {niveauAide >= 2 && (
            <p>
              <RenduFragments fragments={AIDE_NIVEAU_2} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
          onActiverAide={onActiverAide}
          complet={texte.trim() !== ""}
          reponse={() => texte}
          lisible={(r) => diagnostiquerCartesienne(exercice, r) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.equationDroite}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => cibleEquationDroite(lireEquationDroite(r), exercice.referenceImplicite, exercice.point, "A")}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
