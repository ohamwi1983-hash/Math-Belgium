-- =================================================================================================
-- Math-Belgium — carnet : devoirs, évaluations et texte en rubriques pour l'agenda scolaire
-- =================================================================================================
--
-- À coller APRÈS 0006_agenda.sql (il suppose 0001 à 0006 déjà exécutés : séances, réglages du
-- carnet, événements de l'agenda), dans l'éditeur SQL du projet Supabase (SQL Editor → New query →
-- coller TOUT ce fichier → Run). Idempotent : le relancer ne casse rien et ne perd aucune donnée
-- (colonnes `add column if not exists`, contraintes ajoutées seulement si absentes, fonctions
-- `create or replace`). Aucune clé secrète, aucun jeton, aucun mot de passe : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /carnet : dans « Noter la séance », les
-- blocs « Devoir » (pour le …, exercices en ligne joints) et « Évaluation » s'activent, et le texte
-- pour l'agenda scolaire mémorise ses rubriques et ta liste de compétences transversales (Supabase
-- peut mettre quelques secondes à voir les nouvelles colonnes). Tant que ce fichier n'est pas
-- exécuté, le carnet marche comme avant et ces blocs affichent « Pas encore activé ».
--
-- Contenu (AUCUNE donnée d'élève : des dates, des identifiants d'exercices, des intitulés) :
--   seances          + devoir_pour (date de remise du devoir, après la séance, un an au plus),
--                    + devoir_generateurs (exercices en ligne joints : identifiants 5gen48, gen7…),
--                    + objectif (phrase « Je suis capable de … », 300 caractères au plus),
--                    + competences (compétences transversales cochées pour la séance),
--                    + evaluation_type (« annonce », « faite » aujourd'hui ou « bilan »),
--                    + evaluation_parties (sections évaluées), evaluation_evenement (l'événement
--                      « Interrogation » de l'agenda créé par « Annoncer » / « Contrôle-bilan »).
--   carnet_reglages  + rubriques (rubriques du texte activées : objet de booléens, NULL = défaut du
--                      site), competences_transversales (ta liste, renommable : NULL = liste proposée
--                      par défaut, qui n'est PAS une liste officielle).
--   RLS              inchangé : les politiques de 0002 couvrent déjà toutes les colonnes de ces deux
--                    tables (proprietaire = auth.uid() et compte actif, pour TOUTES les opérations ;
--                    `anon` n'a aucun droit). Rien n'est ouvert à l'administrateur.
--   cohérence        l'événement lié doit appartenir au MÊME professeur : clé étrangère COMPOSÉE
--                    (evaluation_evenement, proprietaire) → evenements (id, proprietaire) ; supprimer
--                    l'événement dans l'agenda remet seulement le lien à NULL (la séance reste).
--
-- Pourquoi des colonnes plutôt qu'une table « devoirs » : un devoir et une évaluation sont notés AVEC
-- une séance (une par séance), lus et écrits en même temps qu'elle. Des colonnes évitent une jointure,
-- une seconde écriture qui pourrait échouer à moitié et une politique RLS de plus : celles de 0002
-- s'appliquent telles quelles. L'interro annoncée, elle, reste un événement de l'agenda (0006) — une
-- seule source pour sa date et son heure, modifiable depuis l'agenda —, la séance n'en garde que le lien.
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- Fonction d'aide : rubriques du texte (objet dont chaque clé connue vaut vrai / faux)
-- -------------------------------------------------------------------------------------------------

create or replace function public.rubriques_texte_valides(j jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select j is null or (
    jsonb_typeof(j) = 'object'
    and not exists (
      select 1 from jsonb_each(j) e
       where e.key not in ('objectif', 'processus', 'transversales', 'liens', 'emojis')
          or jsonb_typeof(e.value) <> 'boolean'
    )
  );
$$;

revoke all on function public.rubriques_texte_valides(jsonb) from public, anon;
grant execute on function public.rubriques_texte_valides(jsonb) to authenticated;

-- -------------------------------------------------------------------------------------------------
-- Clé (id, proprietaire) sur evenements : cible de la clé étrangère composée des séances
-- -------------------------------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'evenements_id_proprietaire_uniq' and conrelid = 'public.evenements'::regclass) then
    alter table public.evenements add constraint evenements_id_proprietaire_uniq unique (id, proprietaire);
  end if;
end;
$$;

-- -------------------------------------------------------------------------------------------------
-- Séances : devoir, objectif, compétences transversales, évaluation
-- -------------------------------------------------------------------------------------------------

alter table public.seances add column if not exists devoir_pour date;
alter table public.seances add column if not exists devoir_generateurs jsonb not null default '[]'::jsonb;
alter table public.seances add column if not exists objectif text not null default '';
alter table public.seances add column if not exists competences jsonb not null default '[]'::jsonb;
alter table public.seances add column if not exists evaluation_type text;
alter table public.seances add column if not exists evaluation_parties jsonb not null default '[]'::jsonb;
alter table public.seances add column if not exists evaluation_evenement uuid;

do $$
begin
  -- Devoir à rendre le jour de la séance au plus tôt, un an après au plus.
  if not exists (select 1 from pg_constraint where conname = 'seances_devoir_pour_valide' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_devoir_pour_valide
      check (devoir_pour is null or (devoir_pour >= date_seance and devoir_pour <= date_seance + 366));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seances_devoir_generateurs_valides' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_devoir_generateurs_valides
      check (public.tableau_de_textes(devoir_generateurs, 100, 40));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seances_objectif_valide' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_objectif_valide check (char_length(objectif) <= 300);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seances_competences_valides' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_competences_valides
      check (public.tableau_de_textes(competences, 12, 80));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seances_evaluation_type_valide' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_evaluation_type_valide
      check (evaluation_type is null or evaluation_type in ('annonce', 'faite', 'bilan'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seances_evaluation_parties_valides' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_evaluation_parties_valides
      check (public.tableau_de_textes(evaluation_parties, 100, 80));
  end if;
  -- Sans évaluation : ni parties ni événement ; une interro faite aujourd'hui n'a pas d'événement.
  if not exists (select 1 from pg_constraint where conname = 'seances_evaluation_coherente' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_evaluation_coherente check (
      case
        when evaluation_type is null then evaluation_parties = '[]'::jsonb and evaluation_evenement is null
        when evaluation_type = 'faite' then evaluation_evenement is null
        else true
      end
    );
  end if;
  -- L'événement doit appartenir au MÊME professeur (clé composée) ; le supprimer dans l'agenda remet
  -- seulement le lien à NULL (Postgres 15 et plus : liste de colonnes de SET NULL).
  if not exists (select 1 from pg_constraint where conname = 'seances_evaluation_evenement_du_proprietaire' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_evaluation_evenement_du_proprietaire
      foreign key (evaluation_evenement, proprietaire) references public.evenements (id, proprietaire)
      on delete set null (evaluation_evenement);
  end if;
end;
$$;

create index if not exists seances_devoir_pour_idx on public.seances (proprietaire, devoir_pour) where devoir_pour is not null;
create index if not exists seances_evaluation_evenement_idx on public.seances (evaluation_evenement, proprietaire) where evaluation_evenement is not null;

comment on column public.seances.devoir_pour is 'Date de remise du devoir (agenda : « À rendre »).';
comment on column public.seances.devoir_generateurs is 'Exercices en ligne joints au devoir (identifiants de générateurs du chapitre).';
comment on column public.seances.objectif is 'Phrase « Je suis capable de … » du texte pour l''agenda scolaire (vide : rubrique omise).';
comment on column public.seances.competences is 'Compétences transversales cochées pour la séance (intitulés de la liste du professeur).';
comment on column public.seances.evaluation_type is 'Évaluation notée avec la séance : annonce, faite (aujourd''hui) ou bilan.';
comment on column public.seances.evaluation_parties is 'Sections du chapitre évaluées.';
comment on column public.seances.evaluation_evenement is 'Événement « Interrogation » de l''agenda créé par « Annoncer » ou « Contrôle-bilan ».';

-- -------------------------------------------------------------------------------------------------
-- Réglages : rubriques du texte, liste des compétences transversales
-- -------------------------------------------------------------------------------------------------

alter table public.carnet_reglages add column if not exists rubriques jsonb;
alter table public.carnet_reglages add column if not exists competences_transversales jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'carnet_reglages_rubriques_valides' and conrelid = 'public.carnet_reglages'::regclass) then
    alter table public.carnet_reglages add constraint carnet_reglages_rubriques_valides check (public.rubriques_texte_valides(rubriques));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'carnet_reglages_competences_valides' and conrelid = 'public.carnet_reglages'::regclass) then
    alter table public.carnet_reglages add constraint carnet_reglages_competences_valides
      check (competences_transversales is null or public.tableau_de_textes(competences_transversales, 12, 80));
  end if;
end;
$$;

comment on column public.carnet_reglages.rubriques is 'Rubriques du texte pour l''agenda scolaire (objectif, processus, transversales, liens, emojis : vrai / faux) ; NULL = défaut.';
comment on column public.carnet_reglages.competences_transversales is 'Liste des compétences transversales du professeur ; NULL = liste proposée par défaut (non officielle).';

-- Droits et RLS : ceux de 0002 (aucun changement ; rappelés pour qu'une base où ils auraient été
-- modifiés à la main retrouve l'état attendu).
revoke all on public.seances, public.carnet_reglages from anon;
grant select, insert, update, delete on public.seances, public.carnet_reglages to authenticated;
alter table public.seances enable row level security;
alter table public.carnet_reglages enable row level security;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
