import { useState } from "react";
import type { ExerciceTangenteHorizontale } from "../core5e/tangentes.types";
import { consigneGenerale, formatTermesDonneesLatex, labelsChampsRacines, placeholdersChampsRacines, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelTangente } from "./EtatActuelTangente";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceTangenteHorizontale;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  /** Diagnostic PAR CHAMP — correct si la valeur saisie correspond à N'IMPORTE LAQUELLE des
   * racines attendues (ensemble, ordre indifférent — voir `verifierRacinesHorizontale`). */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran "resoudre" (variante B, "horizontale") — pattern ADD-AS-NEEDED (`useState<string[]>([""])`,
 * bouton "+Ajouter une solution"), jamais un nombre de champs figé à la génération — même patron
 * que `EtapeListeNombresEtudeComplete.tsx` (5gen24) — `prompt5gen28variantesabc.md`. Labels
 * dynamiques : 1 champ → "x=" ; 2+ champs → "x_1=","x_2=",... Vérifiée comme un ENSEMBLE, ordre
 * indifférent (`verifierRacinesHorizontale`, longueur mismatch déjà gérée génériquement). Calculatrice
 * PRÉSENTE (résolution/vérification numérique). */
export function EtapeRacinesTangente({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.length > 0 && valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? valeurs.map((v) => diagnostiquer(v)) : null;
  const aide2 = texteAideNiveau2("resoudre");
  const question = questionSpecifiqueEcran(exercice, "resoudre");
  const labels = labelsChampsRacines(valeurs.length);
  const placeholders = placeholdersChampsRacines(valeurs.length);

  function ajouter() {
    setValeurs((arr) => [...arr, ""]);
  }
  function retirer(i: number) {
    setValeurs((arr) => arr.filter((_, j) => j !== i));
  }
  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(valeurs.map((v) => diagnostiquer(v)).find((s) => s !== "correct") ?? "correct");
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelTangente exercice={exercice} phase="resoudre" />
      <p className="prompt-text">{question.texteAvant}</p>
      {valeurs.map((v, i) => (
        <div key={i} className="field-row">
          <label className="field-label field-label-minuscule">
            <Katex expression={labels[i]} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={v}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i]}
          />
          {valeurs.length > 1 && (
            <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouter}>
        + Ajouter une solution
      </button>
      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("resoudre")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
