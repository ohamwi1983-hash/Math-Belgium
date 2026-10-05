import { useState } from "react";
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudeLocale } from "./EtatActuelEtudeLocale";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import {
  CONSIGNE_GENERALE_ETUDE_LOCALE,
  consigneEcranEtudeLocale,
  formatTermesDonneesLatex,
  labelsChampsRacines,
  placeholdersChampsRacines,
  questionFinaleEtudeLocale,
  texteAideNiveau1EtudeLocale,
  texteAideNiveau2EtudeLocale,
} from "../ui5e/formatEtudeLocale";

interface Props {
  exercice: ExerciceEtudeLocale;
  phase: "resoudreFPrime" | "resoudreFSeconde";
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

/** Écrans "resoudreFPrime"/"resoudreFSeconde" — choix initial "Aucun zéro"/"Au moins un zéro"
 * (`.options-grid` + `.btn.toggle-active`), puis pattern ADD-AS-NEEDED (`useState<string[]>([""])`,
 * bouton "+Ajouter un zéro") si "Au moins un zéro" — jamais un nombre de champs figé à la
 * génération, même patron que `EtapeRacinesTangente.tsx` (5gen28). Contrairement aux écrans
 * "extremums"/"inflexions" (nombre de champs TOUJOURS connu à l'avance, dérivé de racines déjà
 * classifiées) — ce générateur ne produit jamais 0 zéro réel pour f'/f'', mais le choix reste posé
 * explicitement à l'élève (jamais déduit implicitement du nombre de champs affichés). Liste révélée
 * portant `.contenu-conditionnel` (espacement bouton → contenu conditionnel, CLAUDE.md). */
export function EtapeZerosDeriveeEtudeLocale({
  exercice,
  phase,
  precisionAnnoncee,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const [choix, setChoix] = useState<"aucun" | "au_moins_un" | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const complet = choix === "aucun" || (choix === "au_moins_un" && valeurs.length > 0 && valeurs.every((v) => v.trim() !== ""));
  const statuts = apresEchec && diagnostiquer && choix === "au_moins_un" && complet ? valeurs.map((v) => diagnostiquer(v)) : null;
  const labels = labelsChampsRacines(valeurs.length);
  const placeholders = placeholdersChampsRacines(valeurs.length);

  function choisir(nouveauChoix: "aucun" | "au_moins_un") {
    setChoix(nouveauChoix);
    if (nouveauChoix === "au_moins_un") setValeurs([""]);
  }
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
    const reponses = choix === "aucun" ? [] : valeurs;
    setDernierStatut(choix === "au_moins_un" && diagnostiquer ? (valeurs.map((v) => diagnostiquer(v)).find((s) => s !== "correct") ?? "correct") : null);
    onValider(reponses);
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
      <div className="options-grid">
        <button type="button" className={choix === "aucun" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucun")}>
          Aucun zéro
        </button>
        <button type="button" className={choix === "au_moins_un" ? "btn toggle-active" : "btn"} onClick={() => choisir("au_moins_un")}>
          Au moins un zéro
        </button>
      </div>
      {choix === "au_moins_un" && (
        <div className="contenu-conditionnel">
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
            + Ajouter un zéro
          </button>
        </div>
      )}
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
