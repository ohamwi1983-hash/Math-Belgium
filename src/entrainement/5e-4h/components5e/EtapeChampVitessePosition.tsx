import { useState } from "react";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { EcranVitessePosition } from "../moteur5e/typesVitessePosition";
import { consigneEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatVitessePosition";
import { EnonceVitessePosition } from "./EnonceVitessePosition";
import { EtatActuelVitessePosition } from "./EtatActuelVitessePosition";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceVitessePosition;
  ecran: EcranVitessePosition;
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
}

/** Écran générique à UN SEUL champ texte libre — réutilisé par 6 des 7 écrans de 5gen35
 * ("derivee", "evaluerV0", "vitessePointe", "conversion", "segmentConstant", "tempsTotal") ; seul
 * "resoudre" (2 racines + QCM justification) a besoin d'un composant dédié
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
}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide2 = texteAideNiveau2(ecran);

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <EnonceVitessePosition exercice={exercice} />
      <EtatActuelVitessePosition exercice={exercice} ecran={ecran} />
      <p className="prompt-text">{consigneEcran(exercice, ecran)}</p>
      <ApercuExpressionLatex texte={texte} label={labelChamp} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelChamp}</label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {avecCalculatrice && <CalculatriceScientifique />}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(ecran)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
