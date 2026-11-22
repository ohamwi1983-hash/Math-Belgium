import { useState } from "react";
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import { NIVEAU_AIDE_MAX } from "../moteur/sessionLectureGraphiqueDroite";
import { diagnostiquerParametriqueLecture } from "../moteur/verificationLectureGraphiqueDroite";
import type { ReponseParametriqueLecture } from "../moteur/verificationLectureGraphiqueDroite";
import { consigneGeneraleLecture, consigneLecture, texteAideNiveau1 } from "../ui/formatLectureGraphiqueDroite";
import { pointsAideExemple } from "../ui/lectureGraphiqueDroiteGraph";
import { ILLISIBLE_ANALYTIQUE, cibleParametriques, l, t } from "../ui/retoursAnalytique";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { RenduFragments } from "./RenduFragments";
import { Katex } from "./Katex";
import { LectureGraphiqueDroiteGraph } from "./LectureGraphiqueDroiteGraph";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";


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
  onValider: (reponse: ReponseParametriqueLecture) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Exemples hors de l'espace des tirages (vecteur (7 ; −9), composantes tirées ≤ 3) : un
 * placeholder ne doit jamais pouvoir être la réponse (audit chapitre 7, point 10). */
const PLACEHOLDER_TEXTE_X = "ex : x=1,5+t×7";
const PLACEHOLDER_TEXTE_Y = "ex : y=-0,5-t×9";

/**
 * Variante "parametrique" — 2 champs de texte libre (`promptgen43gen44etcorrectionschapitre6.md`,
 * partie A.1 — remplace les 4 champs numériques x0/y0/a/b), vérifiés par
 * `diagnostiquerParametriqueLecture` (extraction affine en t puis point sur la droite + vecteur
 * colinéaire à la référence, jamais un couple exact imposé — même mécanisme que "Équation d'une
 * droite", réutilisé tel quel).
 */
export function EtapeLectureParametrique({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");

  const complet = texteX.trim() !== "" && texteY.trim() !== "";

  function construireReponse(): ReponseParametriqueLecture {
    return { texteX, texteY };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerParametriqueLecture(exercice, construireReponse()) : undefined;
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

      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="lecture-droite-texte-x">
          Équation en <Katex expression="x" /> (<Katex expression="t" /> est le paramètre)
        </label>
        <input
          id="lecture-droite-texte-x"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_TEXTE_X}
          value={texteX}
          onChange={(e) => setTexteX(normaliserSigneMoins(e.target.value))}
        />
      </div>
      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor="lecture-droite-texte-y">
          Équation en <Katex expression="y" /> (<Katex expression="t" /> est le paramètre)
        </label>
        <input
          id="lecture-droite-texte-y"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_TEXTE_Y}
          value={texteY}
          onChange={(e) => setTexteY(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideNiveau1(exercice)}</p>
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
          complet={complet}
          reponse={construireReponse}
          lisible={(r) => diagnostiquerParametriqueLecture(exercice, r) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.parametriques}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => cibleParametriques(r.texteX, r.texteY, exercice.vecteur, exercice.referenceImplicite)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
