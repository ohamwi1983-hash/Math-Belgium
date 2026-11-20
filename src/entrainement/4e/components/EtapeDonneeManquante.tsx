import { useState } from "react";
import type { ExerciceTriangleQuelconque, UniteLongueur } from "../core/triangleQuelconque.types";
import { aide1DonneeManquanteTQ, messageDonneeManquanteTQ } from "../ui/aidesTriangles";
import { consigneDonneeManquante, estCote, labelChampDonneeManquante, NOMBRE_NIVEAUX_AIDE_DONNEE_MANQUANTE, OPTIONS_UNITE_LONGUEUR, optionsCroquisDonneeManquante, placeholderDonneeManquante, textesAideDonneeManquante, valeursTriangleSketchDonneeManquante, latexAide2DonneeManquante } from "../ui/formatTriangleQuelconque";
import { Katex } from "./Katex";
import { calculerTriangleQuelconqueSketch } from "../ui/triangleQuelconqueSketch";
import { TriangleQuelconqueSketch } from "./TriangleQuelconqueSketch";
import { MESSAGE_ANGLE_ILLISIBLE, MESSAGE_LONGUEUR_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { RenduFragments } from "./RenduFragments";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceTriangleQuelconque;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: number, unite: UniteLongueur | null) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 — retrouver la donnée manquante (côté ou angle, selon la configuration) via la loi
 * applicable. Toujours la première étape de l'exercice — aucun récapitulatif ici, rien à
 * récapituler avant elle (même convention que le reste du projet).
 *
 * **Menu déroulant d'unité** (`promptcorrectionsgenerateur19unitesnotation.md`, point 3) — affiché
 * uniquement quand la donnée manquante est un côté (`estCote`, jamais pour un angle en degrés, qui
 * n'a pas d'unité) ; aucune valeur présélectionnée (`""`, même convention "pas de biais par défaut"
 * que les crochets d'intervalle du reste du projet — l'élève doit choisir activement). */
export function EtapeDonneeManquante({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [unite, setUnite] = useState<UniteLongueur | "">("");

  const donneeEstCote = estCote(exercice.donneeManquante);
  const uniteChoisie: UniteLongueur | null = unite === "" ? null : unite;
  const complet = texte.trim() !== "" && (!donneeEstCote || uniteChoisie !== null);
  // Règles communes (audit 4e ch. 5, lot B) : saisie illisible jamais transmise (aucune tentative).
  const saisie = useTentativeLisible<{ valeur: number; unite: UniteLongueur | null }>();

  const croquis = calculerTriangleQuelconqueSketch(
    valeursTriangleSketchDonneeManquante(exercice),
    optionsCroquisDonneeManquante(exercice, niveauAide),
  );
  const textesAide = textesAideDonneeManquante(exercice, niveauAide);

  return (
    <div>
      <p className="prompt-text">{consigneDonneeManquante(exercice)}</p>
      <TriangleQuelconqueSketch croquis={croquis} />

      <div className="field">
        <label className="field-label" htmlFor="triangle-quelconque-donnee-manquante">
          {labelChampDonneeManquante(exercice)}
        </label>
        <div className="champ-avec-unite">
          <input
            id="triangle-quelconque-donnee-manquante"
            className={`text-input${tentativesUtilisees > 0 && !saisie.illisible ? " is-erronee" : ""}`}
            placeholder={placeholderDonneeManquante(exercice)}
            value={texte}
            onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
          />
          {donneeEstCote && (
            <span className="select-souligne-wrap">
              <select
                className="champ-avec-unite-select"
                aria-label="Unité"
                value={unite}
                onChange={(e) => setUnite(e.target.value as UniteLongueur | "")}
              >
                <option value="">Unité…</option>
                {OPTIONS_UNITE_LONGUEUR.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </span>
          )}
        </div>
      </div>

      {textesAide.length > 0 && (
        <div className="triangle-quelconque-aide">
          {/* Aide 2 : la formule substituée en KaTeX (jamais écrite au clavier). */}
          {textesAide.map((texteAide, i) =>
            i === 1 ? (
              <div key="formule">
                <p>Formule à appliquer :</p>
                {latexAide2DonneeManquante(exercice).map((ligne) => (
                  <Katex key={ligne} expression={ligne} block />
                ))}
              </div>
            ) : (
              <p key={texteAide}>
                <RenduFragments fragments={aide1DonneeManquanteTQ(exercice)} />
              </p>
            ),
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NOMBRE_NIVEAUX_AIDE_DONNEE_MANQUANTE} onActiverAide={onActiverAide} />

        <button
          type="button"
          className="btn btn-primary"
          disabled={!complet}
          onClick={() => {
            const v = lireNombreSaisi(texte);
            saisie.tenter({ valeur: v ?? 0, unite: uniteChoisie }, v !== null, (r) => onValider(r.valeur, r.unite));
          }}
        >
          Valider
        </button>
        <MessageRetour
          illisible={saisie.illisible}
          texteIllisible={donneeEstCote ? MESSAGE_LONGUEUR_ILLISIBLE : MESSAGE_ANGLE_ILLISIBLE}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={saisie.soumise !== null ? messageDonneeManquanteTQ(exercice, saisie.soumise.valeur, !donneeEstCote || saisie.soumise.unite === exercice.unite) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
