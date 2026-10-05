import { useState } from "react";
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { EcranOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { diagnostiquerEcran } from "../moteur5e/verificationOptimisationGeometrique";
import type { StatutVerification } from "../moteur/statutVerification";
import { champsEcran, consigneEcran, consigneGenerale, formatTermesDonneesLatex, LIBELLE_ECRAN, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatOptimisationGeometrique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelOptimisation } from "./EtatActuelOptimisation";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceOptimisation;
  phase: EcranOptimisation;
  dernieresReponsesParEcran: Partial<Record<EcranOptimisation, Record<string, string>>>;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: Record<string, string>) => void;
}

/**
 * Écran GÉNÉRIQUE, réutilisé par TOUS les écrans de 5gen32 (voir le commentaire d'architecture
 * dans `moteur5e/typesOptimisationGeometrique.ts`) — rend la liste de champs de
 * `ui5e/formatOptimisationGeometrique.ts::champsEcran` (texte libre OU choix à boutons), notée
 * comme UNE SEULE tentative combinée (même patron que `EtapeSubstituerTangente.tsx`, 5gen28).
 * Calculatrice affichée dès qu'AU MOINS un champ texte de l'écran la demande.
 */
export function EtapeGeneriqueOptimisation({ exercice, phase, dernieresReponsesParEcran, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const champs = champsEcran(exercice, phase);
  const [reponses, setReponses] = useState<Record<string, string>>(() => Object.fromEntries(champs.map((c) => [c.id, ""])));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);

  const montrerErreurs = tentativesUtilisees > 0;
  const complet = champs.every((c) => (reponses[c.id] ?? "").trim() !== "");
  const statuts = montrerErreurs && complet ? diagnostiquerEcran(exercice, phase, reponses) : null;
  const avecCalculatrice = champs.some((c) => c.kind === "texte" && c.avecCalculatrice);
  const aide2 = texteAideNiveau2(exercice, phase);

  function modifier(id: string, valeur: string) {
    setReponses((r) => ({ ...r, [id]: valeur }));
  }

  function valider() {
    if (!complet) return;
    const statutsFinaux = diagnostiquerEcran(exercice, phase, reponses);
    const premierEchec = Object.values(statutsFinaux).find((s) => s !== "correct") ?? "correct";
    setDernierStatut(premierEchec);
    onValider(reponses);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <p className="prompt-text">
        Objectif : <Katex expression={questionFinale(exercice)} />
      </p>
      <EtatActuelOptimisation exercice={exercice} phase={phase} dernieresReponsesParEcran={dernieresReponsesParEcran} />
      <p className="prompt-text">
        <strong>{LIBELLE_ECRAN[phase]}</strong> — {consigneEcran(exercice, phase)}
      </p>
      {champs.map((champ) => {
        const erronee = statuts !== null && statuts[champ.id] !== undefined && statuts[champ.id] !== "correct";
        if (champ.kind === "texte") {
          return (
            <div key={champ.id} className="field field-inline">
              <label className="field-label field-label-minuscule">
                <Katex expression={champ.label} />
              </label>
              <input
                type="text"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                value={reponses[champ.id] ?? ""}
                onChange={(e) => modifier(champ.id, e.target.value)}
                placeholder={champ.placeholder}
              />
            </div>
          );
        }
        return (
          <div key={champ.id} className="field">
            <p className="field-label">{champ.label}</p>
            <div className="options-grid">
              {champ.options.map((option) => {
                const actif = reponses[champ.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`btn${actif ? " toggle-active" : ""}${erronee && actif ? " is-erronee" : ""}`}
                    onClick={() => modifier(champ.id, option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {avecCalculatrice && <CalculatriceScientifique />}
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
          {niveauAide >= 2 && aide2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
