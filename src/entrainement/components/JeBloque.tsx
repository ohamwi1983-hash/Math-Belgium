import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { findChapter } from "../../content/chaptersIndex";
import { cibleJeBloque } from "../../lib/exempleJeBloque";
import { useStoreCadre } from "./cadreGenerateur";

/** Panneau (exemple résolu rendu avec les composants du cours) : chargé à la PREMIÈRE ouverture. */
const PanneauJeBloque = lazy(() => import("./PanneauJeBloque"));

/** Message d'un essai raté, partagé par les trois chantiers : « Incorrect — tentative 2/3, réessaie. » */
const TENTATIVE = /tentative\s*(\d+)\s*\/\s*(\d+)/i;
const HORS_ECRAN = ".validation-ecran, .gen-tiroir, .fiche-reponse-overlay, .calculatrice-overlay, dialog";
const SAISIE = 'input:not([type]), input[type="text"], textarea';

function visible(el: Element): boolean {
  return el.getClientRects().length > 0;
}

/**
 * « Je bloque » (côté élève, planche 10) — monté UNE fois par `EntrainementPage`, aucun générateur
 * réécrit. Après DEUX essais ratés sur un écran (le message partagé « Incorrect — tentative n/m » avec
 * n ≥ 2, encore à l'écran : l'écran n'est pas clos), un bouton « Je bloque » apparaît ; il ouvre, SANS
 * quitter l'exercice (calque `<dialog>`), l'exemple résolu de l'étape du cours où vit la carte du
 * générateur (`lib/exempleJeBloque.ts`), pas à pas, avec les composants du cours, et « Revoir l'étape »
 * (nouvel onglet : l'exercice en cours reste ouvert). Rien de la réponse de l'écran n'est montré.
 *
 * Le bouton reste jusqu'à la fin de l'écran (bloc de validation affiché, ou autre écran en cours dans
 * les puces publiées). Aucun chronomètre, aucun point. « Mon suivi » ne note PAS l'ouverture comme une
 * aide : le suivi recopie les puces du générateur (« juste avec aide » = bouton « Aide » de l'écran) et
 * un exemple du cours n'est pas l'aide de l'écran — l'élève qui revoit le cours n'est pas pénalisé.
 *
 * Place : téléphone et tablette, à gauche juste au-dessus du message de retour (lui-même au-dessus de la
 * barre fixe du bas ; la calculatrice flottante de la tablette est à droite) ; ordinateur, en bas de la
 * colonne des étapes. Repérage par le DOM, comme `CadreActions` (aucun nœud du générateur déplacé).
 */
export function JeBloque({ racineRef, generatorId, chantier, chapitreSlug }: { racineRef: RefObject<HTMLDivElement | null>; generatorId: string; chantier: string; chapitreSlug: string }) {
  const store = useStoreCadre();
  const cible = useMemo(() => {
    const chapitre = findChapter(chantier, chapitreSlug);
    const c = chapitre ? cibleJeBloque(chapitre, generatorId) : null;
    return chapitre && c ? { chapitre, ...c } : null;
  }, [chantier, chapitreSlug, generatorId]);
  const [actif, setActif] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const [charge, setCharge] = useState(false);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const actifRef = useRef(false);
  actifRef.current = actif;

  useEffect(() => {
    const racine = racineRef.current;
    if (!racine || !cible) return;
    let raf = 0;
    /** Écran sur lequel le bouton est apparu (indice de l'écran en cours dans les puces, et leur nombre). */
    let ecran: string | null = null;
    const cleEcran = () => {
      const segments = store?.lire().segments ?? null;
      return segments ? `${segments.length}:${segments.indexOf("courante")}` : "";
    };
    const analyser = () => {
      raf = 0;
      const carte = racine.querySelector("main.card") ?? racine.querySelector("main");
      if (!carte) return;
      const clos = [...carte.querySelectorAll(".validation-ecran")].some(visible);
      let bloque = false;
      if (!clos) {
        for (const message of carte.querySelectorAll<HTMLElement>(".alert-error")) {
          if (message.closest(HORS_ECRAN) || !visible(message)) continue;
          const m = TENTATIVE.exec(message.textContent ?? "");
          if (m && Number(m[1]) >= 2 && Number(m[1]) < Number(m[2])) bloque = true;
        }
      }
      if (bloque) ecran = cleEcran();
      else if (actifRef.current && (clos || ecran !== cleEcran())) ecran = null;
      setActif(ecran !== null);
    };
    const planifier = () => {
      if (!raf) raf = requestAnimationFrame(analyser);
    };
    const observateur = new MutationObserver(planifier);
    observateur.observe(racine, { subtree: true, childList: true, characterData: true });
    const desabonner = store?.abonner(planifier);
    planifier();
    return () => {
      observateur.disconnect();
      desabonner?.();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [racineRef, cible, store]);

  // Bouton visible : place réservée sous le contenu (CSS), et le champ actif n'est pas caché dessous.
  useEffect(() => {
    const racine = racineRef.current;
    if (!racine) return;
    if (!actif) {
      delete racine.dataset.jeBloque;
      return;
    }
    racine.dataset.jeBloque = "";
    requestAnimationFrame(() => {
      const bouton = boutonRef.current;
      const champ = document.activeElement as HTMLElement | null;
      if (!bouton || !champ?.matches?.(SAISIE) || !racine.contains(champ)) return;
      const depasse = champ.getBoundingClientRect().bottom + 8 - bouton.getBoundingClientRect().top;
      if (depasse > 0 && getComputedStyle(bouton).position === "fixed") window.scrollBy(0, depasse);
    });
    return () => {
      delete racine.dataset.jeBloque;
    };
  }, [actif, racineRef]);

  if (!cible) return null;
  return (
    <>
      {actif && (
        <button
          type="button"
          ref={boutonRef}
          className="je-bloque-bouton no-export"
          aria-haspopup="dialog"
          onClick={() => {
            setCharge(true);
            setOuvert(true);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
            <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
          </svg>
          Je bloque
        </button>
      )}
      <p className="sr-only" aria-live="polite">
        {actif ? "Deux essais sans réussir : le bouton « Je bloque » ouvre un exemple résolu du cours." : ""}
      </p>
      {charge && (
        <Suspense fallback={null}>
          <PanneauJeBloque
            ouvert={ouvert}
            fermer={() => {
              setOuvert(false);
              requestAnimationFrame(() => boutonRef.current?.focus({ preventScroll: true }));
            }}
            chapitre={cible.chapitre}
            section={cible.section}
            numero={cible.numero}
            bloc={cible.bloc}
            prerequis={cible.prerequis}
          />
        </Suspense>
      )}
    </>
  );
}
