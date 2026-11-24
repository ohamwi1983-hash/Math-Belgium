import { useState } from "react";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { EcranVitessePosition } from "../moteur5e/typesVitessePosition";
import { consigneEcranRiche } from "../ui5e/formatVitessePosition";
import { aidesVitessePosition, cibleVitessePosition } from "../ui5e/retoursVitessePosition";
import { saisieIllisibleVitessePosition } from "../moteur5e/sessionVitessePosition";
import { MESSAGES_ILLISIBLE_DERIVEES } from "../moteur5e/saisieDerivees";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { TexteRiche5e } from "./TexteRiche5e";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";

/** Libellé du champ (LaTeX) en texte simple pour l'aperçu de saisie : « t_2= » → « t₂= »,
 * « t_{\text{total}}= » → « t total= ». */
function libelleApercu(latex: string): string {
  return latex
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\ /g, " ")
    .replace(/_\{?(\d)\}?/g, (_m, d: string) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)])
    .replace(/_\{([^}]*)\}/g, " $1");
}

interface Props {
  exercice: ExerciceVitessePosition;
  ecran: EcranVitessePosition;
  /** Libellé du champ, en LaTeX (ex. « v(t)= »). */
  labelChamp: string;
  placeholder: string;
  /** Calculatrice affichée UNIQUEMENT sur les champs numériques — jamais sur "derivee" (champ
   * purement symbolique, v(t)=...). */
  avecCalculatrice: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran générique à UN SEUL champ texte libre — réutilisé par 6 des 8 écrans de 5gen35
 * ("derivee", "acceleration", "vitessePointe", "conversion", "segmentConstant", "tempsTotal") ; seuls
 * "resoudre" (2 racines) et "rejet" (QCM) ont besoin d'un composant dédié
 * (`EtapeResoudreVitessePosition.tsx`). `key` obligatoire côté appelant (React réutiliserait sinon
 * la même instance entre 2 écrans/exercices) — même patron que `EtapeChampUniqueTangente.tsx`
 * (5gen28). */
export function EtapeChampVitessePosition({
  exercice,
  ecran,
  labelChamp,
  placeholder,
  avecCalculatrice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation,
}: Props) {
  const [texte, setTexte] = useState("");
  const [soumis, setSoumis] = useState<string | null>(null);
  const [illisible, setIllisible] = useState(false);
  const apresEchec = tentativesUtilisees > 0 && soumis !== null;
  const texteErronee = apresEchec && !validation && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  // Lot B : saisie illisible refusée sans tentative (le moteur la refuse aussi).
  const symbolique = ecran === "derivee" || ecran === "acceleration";

  function valider() {
    if (texte.trim() === "") return;
    if (saisieIllisibleVitessePosition(exercice, ecran, [texte])) {
      setIllisible(true);
      return;
    }
    setSoumis(texte);
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, ecran)} />
      </p>
      <ApercuExpressionLatex texte={texte} label={libelleApercu(labelChamp)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelChamp} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => {
            setIllisible(false);
            setTexte(normaliserSigneMoins(e.target.value));
          }}
          placeholder={placeholder}
          disabled={!!validation}
          autoComplete="off"
        />
      </div>
      {avecCalculatrice && <CalculatriceScientifique />}
      <PiedEcranFonctions
        aides={aidesVitessePosition(exercice, ecran)}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={texte.trim() === ""}
        illisible={illisible}
        texteIllisible={symbolique ? MESSAGES_ILLISIBLE_DERIVEES.expressionT : MESSAGES_ILLISIBLE_DERIVEES.nombre}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={apresEchec && soumis ? cibleVitessePosition(exercice, ecran, [soumis]) : null}
        validation={validation}
      />
    </div>
  );
}
