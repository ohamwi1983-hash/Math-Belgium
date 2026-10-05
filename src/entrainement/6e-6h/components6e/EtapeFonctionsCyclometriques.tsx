import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";
import { diagnostiquerValeurFonctionsCyclometriques } from "../moteur6e/verificationFonctionsCyclometriques";
import type { ReponseFonctionsCyclometriques } from "../moteur6e/verificationFonctionsCyclometriques";
import { CONSIGNE_GENERALE, aideNiveau1, aideNiveau2, formatExpressionLatex } from "../ui6e/formatFonctionsCyclometriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceFonctionsCyclometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFonctionsCyclometriques) => void;
}

/**
 * Écran UNIQUE de `6gen2` (REFONTE TOTALE) — mécanique identique quelle que soit la variante
 * réellement tirée (le détail du calcul composite n'est jamais montré, seul le résultat final
 * compte) : choix binaire Existe/N'existe pas (`.options-grid-compact`+`.btn.toggle-active`, JAMAIS
 * `.btn-primary`, réservé à "Valider" — le clic sur une option ne fait QUE sélectionner, jamais
 * valider) puis, seulement si "Existe" est sélectionné, un champ libre pour la valeur exacte
 * (`.contenu-conditionnel` — jamais collé directement sous le bouton qui l'a révélé). Bouton
 * "Valider" présent y compris pour la partie à choix. Pas de bloc "état actuel" : écran UNIQUE, rien
 * à dériver d'un écran précédent (voir `moteur6e/typesFonctionsCyclometriques.ts`).
 */
export function EtapeFonctionsCyclometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [existe, setExiste] = useState<boolean | null>(null);
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = existe === true ? texte.trim() !== "" : existe === false;

  function valider() {
    if (!complet) return;
    onValider({ existe: existe as boolean, texte: existe ? texte : null });
  }

  const dernierStatut = montrerErreurs && existe === true ? diagnostiquerValeurFonctionsCyclometriques(exercice, texte) : null;
  const a1 = aideNiveau1(exercice);
  const a2 = aideNiveau2(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatExpressionLatex(exercice)} />
      </div>

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${existe === true ? " toggle-active" : ""}${montrerErreurs && existe === true ? " is-erronee" : ""}`}
          onClick={() => setExiste(true)}
        >
          Existe
        </button>
        <button
          type="button"
          className={`btn${existe === false ? " toggle-active" : ""}${montrerErreurs && existe === false ? " is-erronee" : ""}`}
          onClick={() => setExiste(false)}
        >
          N'existe pas
        </button>
      </div>

      {existe === true && (
        <>
          <ApercuExpressionLatex texte={texte} />
          <div className="field contenu-conditionnel">
            <input
              type="text"
              className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
              value={texte}
              placeholder="ex : pi/3, sqrt(3)/3..."
              onChange={(e) => setTexte(e.target.value)}
            />
          </div>
        </>
      )}

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
          <p>{a1.texte}</p>
          {a1.latex && <Katex expression={a1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{a2.texte}</p>
              {a2.latex && <Katex expression={a2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
