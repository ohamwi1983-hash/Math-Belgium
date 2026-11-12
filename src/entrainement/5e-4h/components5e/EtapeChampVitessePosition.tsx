import { useState } from "react";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { EcranVitessePosition } from "../moteur5e/typesVitessePosition";
import { consigneEcranRiche, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatVitessePosition";
import { TexteRiche5e } from "./TexteRiche5e";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

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
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aides = niveauAide >= 2 ? [texteAideNiveau1(ecran), texteAideNiveau2(ecran)] : niveauAide >= 1 ? [texteAideNiveau1(ecran)] : [];

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, ecran)} />
      </p>
      <ApercuExpressionLatex texte={texte} label={labelChamp.replace(/_\{?(\d)\}?/g, (_m, d: string) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]).replace(/\\text\{([^}]*)\}/g, "$1")} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelChamp} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {avecCalculatrice && <CalculatriceScientifique />}
      {aides.length > 0 && (
        <div className="aide-5e">
          {aides.map((aide, i) => (
            <div key={i}>
              <p>
                <TexteRiche5e texte={aide.texte} />
              </p>
              {aide.latex && <Katex expression={aide.latex} block />}
            </div>
          ))}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
