import { useState } from "react";
import type { ExerciceTangentePointDonne } from "../core5e/tangentes.types";
import type { ReponseSubstituer } from "../moteur5e/sessionTangentes";
import { consigneGenerale, formatTermesDonneesLatex, labelFAPointDonne, labelFPrimeAPointDonne, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceTangentePointDonne;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSubstituer) => void;
  diagnostiquer?: (reponse: ReponseSubstituer) => { fA: StatutVerification; fPrimeA: StatutVerification };
  /** Contrôle de FORME avant soumission (saisie illisible, valeur arrondie, valeur répétée,
   * solution manquante) : renvoie le message à afficher, et la tentative n'est PAS décomptée
   * (audit 5e ch. 5, points 6, 32, 33). `null` = soumission normale. */
  controlerSaisie?: (reponse: ReponseSubstituer) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "substituer" (variante A, "pointDonne") — 2 champs numériques (f(a), f'(a) — cette
 * dernière substituée dans f'(x), DONNÉE sur l'écran, jamais dérivée par l'élève), vérifiés
 * INDÉPENDAMMENT pour l'affichage mais notés comme UNE SEULE tentative combinée — même patron que
 * `EtapeDevelopperDerivee.tsx` (5gen26). Calculatrice PRÉSENTE : substitution numérique, valeur
 * potentiellement irrationnelle (sous-famille radicale). */
export function EtapeSubstituerTangente({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, controlerSaisie, validation }: Props) {
  const [fA, setFA] = useState("");
  const [fPrimeA, setFPrimeA] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const [avertissement, setAvertissement] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fA.trim() !== "" && fPrimeA.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ fA, fPrimeA }) : null;
  const aide2 = texteAideNiveau2("substituer");
  const question = questionSpecifiqueEcran(exercice, "substituer");

  function valider() {
    if (!complet) return;
    const reponse: ReponseSubstituer = { fA, fPrimeA };
    const message = controlerSaisie ? controlerSaisie(reponse) : null;
    setAvertissement(message);
    if (message) return;
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.fA !== "correct" ? s.fA : s.fPrimeA);
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
          <Katex expression={labelFAPointDonne(exercice.a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fA !== "correct" ? " is-erronee" : ""}`}
          value={fA}
          onChange={(e) => setFA(e.target.value)}
          placeholder="ex : 1,5"
        />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFPrimeAPointDonne(exercice.a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fPrimeA !== "correct" ? " is-erronee" : ""}`}
          value={fPrimeA}
          onChange={(e) => setFPrimeA(e.target.value)}
          placeholder="ex : −0,5"
        />
      </div>
      <CalculatriceScientifique />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {(() => {
            const aide1 = texteAideNiveau1("substituer", exercice);
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
