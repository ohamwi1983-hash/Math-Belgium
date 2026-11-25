import { useEffect } from "react";
import type { RefObject } from "react";
import { arreter, estPrerendu, lire, voixDisponible, abonnerLecture, etatLecture } from "../../lib/voixLecture";
import { phrasesDe } from "../../lib/phrasesPage";

/**
 * « Écouter l'aide » dans les aides des générateurs (lecture à voix haute, planche 08), SANS réécrire
 * aucun générateur : les ~280 écrans rendent leurs aides dans `.aide-5e` / `.triangle-quelconque-aide`
 * (même convention que le tiroir d'aide de `CadreActions`). Monté une fois par `EntrainementPage`, ce
 * composant REPÈRE ces blocs (MutationObserver, comme `CadreActions`) et leur ajoute en dernier enfant un
 * petit bouton (`data-voix-ajout`, retiré des copies du tiroir) — un nœud qui n'appartient pas à React :
 * React ne fait qu'ajouter / retirer ses propres enfants ; si le bloc est reconstruit, le bouton revient.
 * Rien au pré-rendu ni sans synthèse vocale.
 */

const BLOCS_AIDE = ".triangle-quelconque-aide, .aide-5e";
const ICONE =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>';

let numero = 0;

export function EcouterAides({ racineRef }: { racineRef: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const racine = racineRef.current;
    if (!racine || !voixDisponible() || estPrerendu()) return;
    const boutons = new Set<HTMLButtonElement>();

    const majEtat = () => {
      const e = etatLecture();
      boutons.forEach((b) => {
        const actif = !!e && e.source === b.dataset.source;
        b.classList.toggle("est-actif", actif);
        b.setAttribute("aria-label", actif ? "Arrêter la lecture" : "Écouter l’aide");
        const t = b.querySelector("span");
        if (t) t.textContent = actif ? "Arrêter" : "Écouter l’aide";
      });
    };

    const equiper = () => {
      racine.querySelectorAll<HTMLElement>(BLOCS_AIDE).forEach((aide) => {
        if (aide.closest(".gen-tiroir")) return;
        let b = aide.querySelector<HTMLButtonElement>(":scope > [data-voix-ajout]");
        if (!b) {
          b = document.createElement("button");
          b.type = "button";
          b.className = "ecouter-bouton ecouter-gen ecouter-aide no-export";
          b.setAttribute("data-voix-ajout", "");
          b.dataset.source = `aide-${++numero}`;
          b.innerHTML = `${ICONE}<span aria-hidden="true">Écouter l’aide</span>`;
          b.setAttribute("aria-label", "Écouter l’aide");
          const bouton = b;
          bouton.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const e = etatLecture();
            if (e && e.source === bouton.dataset.source) return arreter();
            lire(phrasesDe(aide), { source: bouton.dataset.source, titre: "Aide", zone: aide });
          });
          boutons.add(b);
          aide.appendChild(b);
        } else if (b !== aide.lastElementChild) {
          // Une aide de niveau 2 ajoutée après le bouton : il revient en dernier.
          aide.appendChild(b);
        }
      });
      boutons.forEach((b) => {
        if (!b.isConnected) boutons.delete(b);
      });
      majEtat();
    };

    let attente = 0;
    const planifier = () => {
      if (attente) return;
      attente = requestAnimationFrame(() => {
        attente = 0;
        equiper();
      });
    };
    equiper();
    const obs = new MutationObserver(planifier);
    obs.observe(racine, { childList: true, subtree: true });
    const desabonner = abonnerLecture(majEtat);
    return () => {
      obs.disconnect();
      desabonner();
      if (attente) cancelAnimationFrame(attente);
      boutons.forEach((b) => b.remove());
    };
  }, [racineRef]);
  return null;
}
