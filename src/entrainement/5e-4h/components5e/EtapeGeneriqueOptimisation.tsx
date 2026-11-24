import { useState } from "react";
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { EcranOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { CHAMPS_CHOIX_FERME, conclusionReelle, diagnostiquerEcran, justificationCorrecteId, refusSaisieOptimisation } from "../moteur5e/verificationOptimisationGeometrique";
import { champsEcran, consigneEcranRiche, consigneGeneraleRiche, formatTermesDonneesLatex, LIBELLE_ECRAN, questionFinale } from "../ui5e/formatOptimisationGeometrique";
import { aidesOptimisation, cibleOptimisation } from "../ui5e/retoursOptimisation";
import { TexteRiche5e } from "./TexteRiche5e";
import { Katex } from "../components/Katex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../../4e/ui/choixFige";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnTeteExercice } from "./EnTeteExercice";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
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
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran GÉNÉRIQUE, réutilisé par TOUS les écrans de 5gen32 (voir le commentaire d'architecture
 * dans `moteur5e/typesOptimisationGeometrique.ts`) — rend la liste de champs de
 * `ui5e/formatOptimisationGeometrique.ts::champsEcran` (texte libre OU choix à boutons), notée
 * comme UNE SEULE tentative combinée.
 *
 * Lot B (5e ch. 5) : pied commun du 5e (`PiedEcranFonctions`) — une saisie illisible est refusée
 * SANS tentative (le moteur la refuse aussi, `refusSaisieOptimisation`), aides à deux niveaux (niveau 2
 * posé pour l'instance), message ciblé (`cibleOptimisation`) ; un choix fermé n'a qu'un essai : gelé
 * après la première validation, puis JUGÉ une fois l'écran clos (✗ rouge sur le choix faux, ✓ vert sur
 * la bonne option, `4e/ui/choixFige.ts`). Frappe jamais bloquée (`normaliserSigneMoins` seul).
 */
export function EtapeGeneriqueOptimisation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const champs = champsEcran(exercice, phase);
  const [reponses, setReponses] = useState<Record<string, string>>(() => Object.fromEntries(champs.map((c) => [c.id, ""])));
  const [soumises, setSoumises] = useState<Record<string, string> | null>(null);
  const [illisible, setIllisible] = useState(false);

  const montrerErreurs = tentativesUtilisees > 0 && soumises !== null;
  const choixGeles = tentativesUtilisees > 0;
  const complet = champs.every((c) => (reponses[c.id] ?? "").trim() !== "");
  const statuts = montrerErreurs && complet && !validation ? diagnostiquerEcran(exercice, phase, reponses) : null;
  const avecCalculatrice = champs.some((c) => c.kind === "texte" && c.avecCalculatrice);
  const refus = complet ? refusSaisieOptimisation(exercice, phase, reponses) : null;

  function modifier(id: string, valeur: string) {
    setIllisible(false);
    setReponses((r) => ({ ...r, [id]: valeur }));
  }

  function valider() {
    if (!complet) return;
    if (refus !== null) {
      setIllisible(true);
      return;
    }
    setSoumises(reponses);
    onValider(reponses);
  }

  function bonneOption(id: string): string | null {
    if (id === "justification") return justificationCorrecteId(exercice);
    if (id === "conclusion") return conclusionReelle(exercice);
    return null;
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
                className={`text-input${erronee || (illisible && refus !== null) ? " is-erronee" : ""}`}
                value={reponses[champ.id] ?? ""}
                onChange={(e) => modifier(champ.id, normaliserSigneMoins(e.target.value))}
                placeholder={champ.placeholder}
                disabled={Boolean(validation)}
                autoComplete="off"
              />
            </div>
          );
        }
        const ferme = CHAMPS_CHOIX_FERME.includes(champ.id);
        const gele = choixGeles && ferme;
        const bonne = bonneOption(champ.id);
        const etat = { selection: reponses[champ.id] || null, choisie: validation && ferme && bonne !== null ? reponses[champ.id] || null : null, bonne: bonne ?? "" };
        return (
          <div key={champ.id} className="field">
            <p className="field-label">{champ.label}</p>
            <div className="options-grid" role="group" aria-label={champ.label}>
              {champ.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={classeOptionChoixFerme<string | null>(option.id, etat)}
                  aria-pressed={reponses[champ.id] === option.id}
                  aria-label={[option.label, ariaOptionChoixFerme<string | null>(option.id, etat)].filter(Boolean).join(", ")}
                  onClick={() => modifier(champ.id, option.id)}
                  disabled={gele || Boolean(validation)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {avecCalculatrice && <CalculatriceScientifique />}
      <PiedEcranFonctions
        aides={aidesOptimisation(exercice, phase)}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible && refus !== null}
        texteIllisible={refus ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={montrerErreurs && soumises ? cibleOptimisation(exercice, phase, soumises) : null}
        validation={validation}
      />
    </div>
  );
}
