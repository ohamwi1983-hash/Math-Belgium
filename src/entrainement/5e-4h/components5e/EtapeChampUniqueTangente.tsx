import { useState } from "react";
import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { EcranTangente } from "../moteur5e/typesTangentes";
import { consigneGenerale, formatTermesDonneesLatex, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";
import { retirerPrefixeTangente } from "../moteur5e/verificationTangentes";

interface Props {
  exercice: ExerciceTangente;
  phase: EcranTangente;
  labelChamp: string;
  placeholder: string;
  /** Calculatrice affichée UNIQUEMENT sur les champs numériques (substitution) — jamais sur un
   * champ purement symbolique ("y=..."). */
  avecCalculatrice: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Vrai si la saisie est une valeur ARRONDIE alors qu'une valeur exacte est demandée — signalée
   * sans consommer de tentative (audit 5e ch. 5, décision I). */
  estApprochee?: (texte: string) => boolean;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran à UN SEUL champ texte libre — réutilisé par "tangente" (variante A, symbolique, sans
 * calculatrice), "trouverQ" et "verifierPente" (variante C, numériques, avec calculatrice). `key`
 * obligatoire côté appelant (React réutiliserait sinon la même instance entre 2 écrans/exercices,
 * gardant la réponse précédente) — même patron que `EtapeChampLibreDerivee.tsx` (5gen26). */
export function EtapeChampUniqueTangente({
  exercice,
  phase,
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
  estApprochee,
  validation,
}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  /** Saisie illisible ou arrondie : signalée sans consommer de tentative (audit 5e ch. 5, point 6). */
  const [avertissement, setAvertissement] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide1 = texteAideNiveau1(phase, exercice);
  const aide2 = texteAideNiveau2(phase);
  const question = questionSpecifiqueEcran(exercice, phase);

  function valider() {
    if (texte.trim() === "") return;
    const statut = diagnostiquer ? diagnostiquer(texte) : null;
    if (statut === "parse_error") {
      setAvertissement("Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).");
      return;
    }
    if (statut !== "correct" && estApprochee && estApprochee(texte)) {
      setAvertissement("Valeur arrondie : donne la valeur exacte (racines carrées et fractions acceptées). Cette tentative n'est pas décomptée.");
      return;
    }
    setAvertissement(null);
    if (statut !== null) setDernierStatut(statut);
    onValider(texte);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">
        {question.texteAvant} {question.latex && <Katex expression={question.latex} />} {question.texteApres}
      </p>
      <ApercuExpressionLatex
        texte={labelChamp.includes("\\equiv") ? retirerPrefixeTangente(texte) : texte}
        label={labelChamp.includes("\\equiv") ? "t ≡" : labelChamp.replace(/[{}]/g, "")}
      />
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
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aide1.texte}</p>
          {aide1.latex && <Katex expression={aide1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              {aide2.latex && <Katex expression={aide2.latex} block />}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        {avertissement && (
          <p className="alert-error" role="alert">
            {avertissement}
          </p>
        )}
        {montrerErreurs && !avertissement && (
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
