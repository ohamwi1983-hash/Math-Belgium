import { useState } from "react";
import type { ExerciceConvergenceSuite } from "../core5e/convergenceSuites.types";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, lignesAideNiveau1, lignesAideNiveau2 } from "../ui5e/formatConvergenceSuites";
import { LignesAideConvergence } from "./LignesAideConvergence";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceConvergenceSuite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs (A.1) calculé côté PRÉSENTATION uniquement — optionnel. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Message ciblé d'une erreur de MÉTHODE (expression équivalente mais pas la division demandée :
   * pas une fraction, rien divisé, puissance trop élevée) — `null` sinon (décision J). */
  messageMethode?: (texte: string) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "diviserQuelconque" (variante "quelconque" uniquement) — un seul champ texte libre où
 * l'élève réécrit un=P(n)/Q(n) après avoir divisé numérateur et dénominateur par la plus haute
 * puissance de n au dénominateur ; vérifié par équivalence algébrique EXACTE (pas de solveur
 * dédié — voir `moteur5e/verificationConvergenceSuites.ts`). */
export function EtapeDiviserQuelconque({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, messageMethode, validation }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const [dernierMessageMethode, setDernierMessageMethode] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide2 = lignesAideNiveau2(exercice, "diviserQuelconque");

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    setDernierMessageMethode(messageMethode ? messageMethode(texte) : null);
    onValider(texte);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{consignePhase(exercice, "diviserQuelconque")}</p>
      <ApercuExpressionLatex texte={texte} label="uₙ =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="u_n =" />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : (12 + 15/n)/(11 − 13/n)"
        />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <LignesAideConvergence lignes={lignesAideNiveau1(exercice, "diviserQuelconque")} />
          {niveauAide >= 2 && aide2.length > 0 && <LignesAideConvergence lignes={aide2} />}
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
            {dernierMessageMethode !== null
              ? `${dernierMessageMethode} (tentative ${tentativesUtilisees}/${tentativesMax})`
              : formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
