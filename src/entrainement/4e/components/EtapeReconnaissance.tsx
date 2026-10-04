import { useState } from "react";
import type { Categorie, Exercice } from "../core/generateur.types";
import { Katex } from "./Katex";
import { formatEnonceAffichage } from "../ui/formatEquation";
import { OPTIONS_CATEGORIE } from "../ui/categorieLabels";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Remplace l'expression affichée par défaut (ax²+bx+c=0) — ex: "D(x) = ..." pour "Simplifier". */
  expressionAffichee?: string;
  /** Version "bloc fitter" de `expressionAffichee` (`promptblocfittertousgenerateurs.md`) —
   * prioritaire sur `expressionAffichee` quand fourni ; absent par défaut, comportement historique
   * inchangé pour tous les autres appelants. Voir `EtapeChamp1.tsx` pour le même patron. */
  expressionAfficheeTermes?: string[];
  /** Remplace la question par défaut ("...résoudre cette équation ?"). */
  question?: string;
  /** Bloc "état actuel" (prompt-corrections-moteur-partage.md, point 1) — absent/null par défaut : rien de rendu. */
  etatActuel?: string | null;
  /** Remplace le libellé par défaut ("État actuel") du bloc ci-dessus — voir EtatActuelPanel. */
  etatActuelLabel?: string;
  /**
   * Bloc "Énoncé" fixe (générateur 6, restructuration en 3 blocs) — absent par défaut :
   * comportement historique inchangé. Fourni : 3 blocs empilés (enonceFixe → EtatActuelPanel →
   * expressionAffichee, ce dernier omis s'il duplique enonceFixe) — voir EtapeIsolement.tsx.
   */
  enonceFixe?: string;
  /**
   * Remplace la liste des 4 catégories par défaut — utilisé par "Analyse d'une fonction du second
   * degré" (chapitre 1), qui restreint la reconnaissance aux 3 techniques sans Δ et ne doit jamais
   * proposer "cas_general" (l'exercice ne génère jamais cette catégorie). Absent par défaut :
   * comportement inchangé (4 catégories) pour tous les autres appelants.
   */
  options?: { valeur: Categorie; libelle: string }[];
  onChoisir: (choix: Categorie) => void;
}

export function EtapeReconnaissance({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  expressionAfficheeTermes,
  question,
  etatActuel,
  etatActuelLabel,
  enonceFixe,
  options,
  onChoisir,
}: Props) {
  const [choix, setChoix] = useState<Categorie | null>(null);
  const erronee = tentativesUtilisees > 0;
  const expressionParDefaut =
    expressionAffichee ??
    formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {enonceFixe !== undefined ? (
        <>
          <div className="equation-box">
            <Katex expression={enonceFixe} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : expressionAfficheeTermes !== undefined ? (
        <>
          <div className="equation-box equation-box-termes">
            {expressionAfficheeTermes.map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
        </>
      ) : (
        <>
          <div className="equation-box">
            <Katex expression={expressionParDefaut} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
        </>
      )}
      <p className="prompt-text">{question ?? "Quelle est la méthode la plus rapide pour résoudre cette équation ?"}</p>
      <div className="options-grid">
        {(options ?? OPTIONS_CATEGORIE).map((option) => (
          <button
            key={option.valeur}
            type="button"
            className={`btn${choix === option.valeur ? " toggle-active" : ""}${erronee && choix === option.valeur ? " is-erronee" : ""}`}
            onClick={() => setChoix(option.valeur)}
          >
            {option.libelle}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onChoisir(choix)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
