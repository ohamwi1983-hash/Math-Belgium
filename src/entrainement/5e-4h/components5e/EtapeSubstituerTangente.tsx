import { useState } from "react";
import type { ExerciceTangentePointDonne } from "../core5e/tangentes.types";
import type { ReponseSubstituer } from "../moteur5e/sessionTangentes";
import { consigneGenerale, formatTermesDonneesLatex, labelFAPointDonne, labelFPrimeAPointDonne, questionSpecifiqueEcran, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelTangente } from "./EtatActuelTangente";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceTangentePointDonne;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSubstituer) => void;
  diagnostiquer?: (reponse: ReponseSubstituer) => { fA: StatutVerification; fPrimeA: StatutVerification };
}

/** Écran "substituer" (variante A, "pointDonne") — 2 champs numériques (f(a), f'(a) — cette
 * dernière substituée dans f'(x), DONNÉE sur l'écran, jamais dérivée par l'élève), vérifiés
 * INDÉPENDAMMENT pour l'affichage mais notés comme UNE SEULE tentative combinée — même patron que
 * `EtapeDevelopperDerivee.tsx` (5gen26). Calculatrice PRÉSENTE : substitution numérique, valeur
 * potentiellement irrationnelle (sous-famille radicale). */
export function EtapeSubstituerTangente({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [fA, setFA] = useState("");
  const [fPrimeA, setFPrimeA] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = fA.trim() !== "" && fPrimeA.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ fA, fPrimeA }) : null;
  const aide2 = texteAideNiveau2("substituer");
  const question = questionSpecifiqueEcran(exercice, "substituer");

  function valider() {
    if (!complet) return;
    const reponse: ReponseSubstituer = { fA, fPrimeA };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.fA !== "correct" ? s.fA : s.fPrimeA);
    }
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelTangente exercice={exercice} phase="substituer" />
      <p className="prompt-text">{question.texteAvant}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelFAPointDonne(exercice.a)} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.fA !== "correct" ? " is-erronee" : ""}`}
          value={fA}
          onChange={(e) => setFA(e.target.value)}
          placeholder="ex : 5"
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
          placeholder="ex : 4"
        />
      </div>
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
          <p>{texteAideNiveau1("substituer")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
