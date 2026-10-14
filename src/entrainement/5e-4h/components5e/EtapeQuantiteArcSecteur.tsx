import { useState } from "react";
import type { ExerciceModeDeuxVersTrois, QuantiteArcSecteur } from "../core5e/arcsSecteurs.types";
import { consigneQuantite, latexAideNiveau2ArcSecteur, quantitesConnuesJusqua, segmentsDonneesConnues, texteAideNiveau1ArcSecteur } from "../ui5e/formatArcsSecteurs";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceModeDeuxVersTrois;
  phase: QuantiteArcSecteur;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs calculé côté présentation (promptcorrectionsregroupees.md, A.1), jamais
   * consommé par le score — optionnel, comportement générique inchangé sans lui. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran UNIQUE, paramétré par la quantité manquante courante — les 3 écrans du mode "deuxVersTrois"
 * (jamais plus de 3 pour un même exercice) réutilisent tous ce composant, seul `phase` change.
 * Bloc de données FIXE (les 2 données de départ, `exercice.connues`, jamais recalculé selon
 * l'écran). Les quantités déjà résolues aux écrans précédents sont désormais présentées par
 * `RecapitulatifPanel` (`App5gen6.tsx`, `ui5e/recapitulatifArcSecteur.ts`), plus l'ancien bloc
 * "état actuel" local (`segmentsEtatActuelArcSecteur`, retiré ici — doublon visuel). `connues`
 * (`quantitesConnuesJusqua`, données + déjà résolues) reste utilisée telle quelle pour les aides,
 * qui doivent connaître tout ce qui est déjà disponible côté élève, pas seulement les données de
 * départ.
 */
export function EtapeQuantiteArcSecteur({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const connues = quantitesConnuesJusqua(exercice, phase);
  const segmentsDonnees = segmentsDonneesConnues(exercice, exercice.connues);

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <div className="equation-box equation-box-donnees">
        {segmentsDonnees.map((s, i) => (
          <Katex key={i} expression={s} />
        ))}
      </div>
      <p className="prompt-text">{consigneQuantite(phase)}</p>
      <ApercuExpressionLatex texte={texte} />
      <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 5*pi/6 ou 2.62" />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>Formule(s) disponible(s) :</p>
          {texteAideNiveau1ArcSecteur(phase, connues).map((latex, i) => (
            <Katex key={i} expression={latex} block />
          ))}
          {niveauAide >= 2 && <Katex expression={latexAideNiveau2ArcSecteur(exercice, phase, connues)} block />}
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
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
