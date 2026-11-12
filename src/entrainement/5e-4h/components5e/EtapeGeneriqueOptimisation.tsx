import { useState } from "react";
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { EcranOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { CHAMPS_CHOIX_FERME, diagnostiquerEcran } from "../moteur5e/verificationOptimisationGeometrique";
import type { StatutVerification } from "../moteur/statutVerification";
import { champsEcran, consigneEcranRiche, consigneGeneraleRiche, formatTermesDonneesLatex, LIBELLE_ECRAN, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatOptimisationGeometrique";
import { TexteRiche5e } from "./TexteRiche5e";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnTeteExercice } from "./EnTeteExercice";
import { SchemaOptimisation } from "./SchemaOptimisation";

interface Props {
  exercice: ExerciceOptimisation;
  phase: EcranOptimisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: Record<string, string>) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran GÉNÉRIQUE, réutilisé par TOUS les écrans de 5gen32 (voir le commentaire d'architecture
 * dans `moteur5e/typesOptimisationGeometrique.ts`) — rend la liste de champs de
 * `ui5e/formatOptimisationGeometrique.ts::champsEcran` (texte libre OU choix à boutons), notée
 * comme UNE SEULE tentative combinée. Calculatrice affichée dès qu'AU MOINS un champ texte de
 * l'écran la demande.
 *
 * Audit 5e ch. 5 : une saisie illisible (parse_error) est signalée sans consommer de tentative ;
 * un choix fermé (boutons) n'a qu'un essai — il est gelé après la première validation (un choix
 * faux clôt l'écran, voir `sessionOptimisationGeometrique.ts`).
 */
export function EtapeGeneriqueOptimisation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const champs = champsEcran(exercice, phase);
  const [reponses, setReponses] = useState<Record<string, string>>(() => Object.fromEntries(champs.map((c) => [c.id, ""])));
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const [ecritureIllisible, setEcritureIllisible] = useState(false);

  const montrerErreurs = tentativesUtilisees > 0;
  const choixGeles = tentativesUtilisees > 0;
  const complet = champs.every((c) => (reponses[c.id] ?? "").trim() !== "");
  const statuts = montrerErreurs && complet ? diagnostiquerEcran(exercice, phase, reponses) : null;
  const avecCalculatrice = champs.some((c) => c.kind === "texte" && c.avecCalculatrice);
  const aide1 = texteAideNiveau1(exercice, phase);
  const aide2 = texteAideNiveau2(exercice, phase);

  function modifier(id: string, valeur: string) {
    setReponses((r) => ({ ...r, [id]: valeur }));
  }

  function valider() {
    if (!complet) return;
    const statutsFinaux = diagnostiquerEcran(exercice, phase, reponses);
    const illisible = champs.some((c) => c.kind === "texte" && statutsFinaux[c.id] === "parse_error");
    if (illisible) {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    const premierEchec = Object.values(statutsFinaux).find((s) => s !== "correct") ?? "correct";
    setDernierStatut(premierEchec);
    onValider(reponses);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<TexteRiche5e texte={consigneGeneraleRiche(exercice)} />}
        blocDonnees={
          <>
            <div className="equation-box equation-box-donnees">
              {formatTermesDonneesLatex(exercice).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </div>
            <SchemaOptimisation exercice={exercice} />
          </>
        }
      />
      <p className="prompt-text">
        Objectif : <TexteRiche5e texte={questionFinale(exercice)} />
      </p>
      <p className="prompt-text">
        <strong>{LIBELLE_ECRAN[phase]}</strong> — <TexteRiche5e texte={consigneEcranRiche(exercice, phase)} />
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
                disabled={Boolean(validation)}
              />
            </div>
          );
        }
        const gele = choixGeles && CHAMPS_CHOIX_FERME.includes(champ.id);
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
                    disabled={gele || Boolean(validation)}
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
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {aide1.texte && (
            <p>
              <TexteRiche5e texte={aide1.texte} />
            </p>
          )}
          {aide1.latex && <Katex expression={aide1.latex} block />}
          {niveauAide >= 2 && aide2 && (
            <>
              <p>
                <TexteRiche5e texte={aide2.texte} />
              </p>
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
          {ecritureIllisible && (
            <p className="alert-error" role="alert">
              Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).
            </p>
          )}
          {!ecritureIllisible && montrerErreurs && (
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
