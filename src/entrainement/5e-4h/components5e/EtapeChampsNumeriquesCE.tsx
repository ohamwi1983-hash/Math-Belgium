import { useEffect, useState } from "react";
import type { ExerciceContexteEconomique } from "../core5e/contexteEconomique.types";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelContexteEconomique } from "./EtatActuelContexteEconomique";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceContexteEconomique;
  ecran: EcranContexteEconomique;
  labels: string[];
  placeholders: string[];
  /** Ajoutée à la fin de la consigne d'écran si non nulle — voir CLAUDE.md, "Annonce de
   * précision = tolérance réellement vérifiée". Un seul texte pour TOUS les champs de l'écran
   * (jamais 2 champs avec 2 précisions différentes dans ce générateur). */
  precisionAnnoncee: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  /** Diagnostic PAR CHAMP, dans le même ordre que `labels`. */
  diagnostiquer: (reponses: string[]) => StatutVerification[];
}

/** Écran générique "N champs NUMÉRIQUES" — réutilisé par tous les écrans à réponse chiffrée de
 * 5gen33 (coût marginal discret, valeur de C'_T(q0), écart absolu+%, bénéfice maximum, racine
 * approchée du bonus). Même patron que `EtapeChampsNumeriquesEtudeLocale.tsx` (5gen29). */
export function EtapeChampsNumeriquesCE({
  exercice,
  ecran,
  labels,
  placeholders,
  precisionAnnoncee,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const nb = labels.length;
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(nb).fill(""));
  useEffect(() => {
    setValeurs(new Array(nb).fill(""));
  }, [nb]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && complet ? diagnostiquer(valeurs) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    const s = diagnostiquer(valeurs);
    setDernierStatut(s.find((x) => x !== "correct") ?? "correct");
    onValider(valeurs);
  }

  const consigne = precisionAnnoncee ? `${consigneEcran(exercice, ecran)} ${precisionAnnoncee}` : consigneEcran(exercice, ecran);

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelContexteEconomique exercice={exercice} ecran={ecran} />
      <p className="prompt-text">{consigne}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i] ?? ""}
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
          <p>{texteAideNiveau1(ecran)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, ecran)}</p>}
        </div>
      )}
    </div>
  );
}
