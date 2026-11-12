import { useState } from "react";
import type { ExerciceTangenteDoubleTangence } from "../core5e/tangentes.types";
import type { ReponseTangenteEnP } from "../moteur5e/sessionTangentes";
import { consigneGenerale, formatTermesDonneesLatex, labelFPrimeP, labelTangenteEquiv, PLACEHOLDER_EQUATION_TANGENTE, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
import { retirerPrefixeTangente } from "../moteur5e/verificationTangentes";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceTangenteDoubleTangence;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTangenteEnP) => void;
  diagnostiquer?: (reponse: ReponseTangenteEnP) => { fPrimeP: StatutVerification; tangente: StatutVerification };
  /** Contrôle de FORME avant soumission (saisie illisible, valeur arrondie, valeur répétée,
   * solution manquante) : renvoie le message à afficher, et la tentative n'est PAS décomptée
   * (audit 5e ch. 5, points 6, 32, 33). `null` = soumission normale. */
  controlerSaisie?: (reponse: ReponseTangenteEnP) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "tangenteEnP" (variante C, "doubleTangence") — 2 champs : f'(p) (numérique, dérivée du
 * quartique DÉJÀ DÉVELOPPÉ, calculée par l'élève lui-même — contrairement aux variantes A/B, cette
 * variante ne fournit jamais f'(x)) et l'équation de la tangente (symbolique, "y="). UNE SEULE
 * tentative combinée (1 bouton Valider) — même patron 2-champs que `EtapeDevelopperDerivee.tsx`
 * (5gen26). Calculatrice PRÉSENTE (substitution numérique dans un polynôme de degré 4). */
export function EtapeTangenteEnP({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, controlerSaisie, validation }: Props) {
  const [fPrimeP, setFPrimeP] = useState("");
  const [tangente, setTangente] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const [avertissement, setAvertissement] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fPrimeP.trim() !== "" && tangente.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ fPrimeP, tangente }) : null;
  const aide2 = texteAideNiveau2("tangenteEnP");
  const question = questionSpecifiqueEcran(exercice, "tangenteEnP");

  function valider() {
    if (!complet) return;
    const reponse: ReponseTangenteEnP = { fPrimeP, tangente };
    const message = controlerSaisie ? controlerSaisie(reponse) : null;
    setAvertissement(message);
    if (message) return;
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.fPrimeP !== "correct" ? s.fPrimeP : s.tangente);
    }
    onValider(reponse);
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
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFPrimeP(exercice.p)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fPrimeP !== "correct" ? " is-erronee" : ""}`}
          value={fPrimeP}
          onChange={(e) => setFPrimeP(e.target.value)}
          placeholder="ex : 0,5"
        />
      </div>
      <ApercuExpressionLatex texte={retirerPrefixeTangente(tangente)} label="t ≡" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelTangenteEquiv(exercice.p)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.tangente !== "correct" ? " is-erronee" : ""}`}
          value={tangente}
          onChange={(e) => setTangente(e.target.value)}
          placeholder={PLACEHOLDER_EQUATION_TANGENTE}
        />
      </div>
      <CalculatriceScientifique />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {(() => {
            const aide1 = texteAideNiveau1("tangenteEnP", exercice);
            return (
              <>
                <p>{aide1.texte}</p>
                {aide1.latex && <Katex expression={aide1.latex} block />}
              </>
            );
          })()}
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
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
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
