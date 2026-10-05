import { useState } from "react";
import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";
import type { PhaseLimitesContexte } from "../moteur5e/typesLimitesContexte";
import { consigneGenerale, consignePhase, formatContexteTexte, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimitesContexte";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EtatActuelLimitesContexte } from "./EtatActuelLimitesContexte";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceLimitesContexte;
  phase: PhaseLimitesContexte;
  /** Labels en LaTeX (chacun déjà terminé par "="), rendus via `Katex` — jamais du texte brut. */
  labels: string[];
  placeholders: string[];
  /** Un champ attend-il seulement une valeur numérique courte (jamais une expression algébrique) ?
   * `true` par défaut pour chaque champ (immense majorité des cas de ce générateur — un seuil, un
   * nombre de mois, un coefficient...) — passer explicitement `false` pour les rares champs
   * attendant une expression complète (ex. "C(t)=", "y="), qui gardent la largeur historique. */
  champsEtroits?: boolean[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer?: (valeurs: string[]) => StatutVerification[];
}

/** Écran à N champs texte libres FIXES (1 ou 2 selon l'appelant), réutilisé par 8 des 11 phases de
 * 5gen23 — seuls "interpreter"/"vaSens" (QCM) et "evaluerSeuil" (valeur + comparaison pairée) ont
 * besoin d'un composant dédié. Calculatrice TOUJOURS présente (contextes réalistes, arithmétique non
 * triviale, demandé explicitement pour ce générateur). */
export function EtapeChampsLimitesContexte({
  exercice,
  phase,
  labels,
  placeholders,
  champsEtroits,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => Array(labels.length).fill(""));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer(valeurs) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) {
      const s = diagnostiquer(valeurs);
      setDernierStatut(s.find((v) => v !== "correct") ?? "correct");
    }
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <p className="prompt-text">{formatContexteTexte(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelLimitesContexte exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {labels.map((label, i) => (
        <div key={i} className={`field champ-reponse-latex${champsEtroits?.[i] ?? true ? " champ-reponse-latex-etroit" : ""}`}>
          <span className="field-label-latex">
            <Katex expression={label} block={label.includes("\\lim_{")} />
          </span>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i]}
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
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, phase)}</p>}
        </div>
      )}
    </div>
  );
}
