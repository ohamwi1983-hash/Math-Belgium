import { useEffect, useState } from "react";
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudeLocale } from "./EtatActuelEtudeLocale";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import { CONSIGNE_GENERALE_ETUDE_LOCALE, consigneEcranEtudeLocale, formatTermesDonneesLatex, questionFinaleEtudeLocale, texteAideNiveau1EtudeLocale, texteAideNiveau2EtudeLocale } from "../ui5e/formatEtudeLocale";

interface Props {
  exercice: ExerciceEtudeLocale;
  phase: "extremums" | "inflexions";
  labels: string[];
  placeholders: string[];
  /** Ajoutée à la fin de la consigne d'écran si non nulle — voir CLAUDE.md, "Annonce de précision =
   * tolérance réellement vérifiée". */
  precisionAnnoncee: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  /** Diagnostic PAR CHAMP — correct si la valeur saisie correspond à N'IMPORTE LAQUELLE des cibles
   * attendues (ensemble, ordre indifférent). */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran générique "N champs numériques FIGÉS, vérifiés comme un ENSEMBLE" — réutilisé par
 * "extremums"/"inflexions" (nombre de champs TOUJOURS connu à l'avance, dérivé des racines déjà
 * classifiées à l'écran précédent — jamais add-as-needed ici). Les écrans "resoudreFPrime"/
 * "resoudreFSeconde" utilisent désormais `EtapeZerosDeriveeEtudeLocale` (choix "Aucun zéro"/"Au
 * moins un zéro" + add-as-needed, `prompt5gen29corrections.md`) — forme réellement différente,
 * jamais forcée dans la même abstraction (CLAUDE.md, "ne pas forcer une abstraction commune").
 */
export function EtapeChampsNumeriquesEtudeLocale({
  exercice,
  phase,
  labels,
  placeholders,
  precisionAnnoncee,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const nb = labels.length;
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(nb).fill(""));
  useEffect(() => {
    setValeurs(new Array(nb).fill(""));
  }, [nb]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? valeurs.map((v) => diagnostiquer(v)) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(valeurs.map((v) => diagnostiquer(v)).find((s) => s !== "correct") ?? "correct");
    onValider(valeurs);
  }

  const consigne = precisionAnnoncee ? `${consigneEcranEtudeLocale(phase)} ${precisionAnnoncee}` : consigneEcranEtudeLocale(phase);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_LOCALE}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudeLocale(exercice)} />
      <EtatActuelEtudeLocale exercice={exercice} phase={phase} />
      <p className="prompt-text">{consigne}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i] ?? ""}
          />
        </div>
      ))}
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
          <p>{texteAideNiveau1EtudeLocale(phase)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2EtudeLocale(phase)}</p>}
        </div>
      )}
    </div>
  );
}
