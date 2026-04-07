/* ── GardeCoeur — Conditions Générales d'Utilisation ────────────────────── */

import React from 'react'
import { PageLayout } from '@/components/layout'
import styles from './Legal.module.css'

const CGUPage: React.FC = () => (
  <PageLayout>
    <div className={styles.container}>
      <h1 className={styles.title}>Conditions Générales d'Utilisation</h1>
      <p className={styles.updated}>Dernière mise à jour : avril 2026</p>

      <section className={styles.section}>
        <h2>1. Présentation de la plateforme</h2>
        <p>
          GardeCoeur est une plateforme de mise en relation entre des parents à la recherche
          d'une aide à la garde d'enfants et des retraités bénévoles souhaitant partager leur
          expérience et leur temps. La plateforme est éditée par GardeCoeur SAS, dont le siège
          social est situé en France.
        </p>
        <p>
          GardeCoeur agit en qualité d'intermédiaire technique. La plateforme ne fournit pas
          elle-même de service de garde d'enfants et n'est pas partie aux accords conclus entre
          les utilisateurs.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Acceptation des CGU</h2>
        <p>
          L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes
          CGU. En créant un compte, vous déclarez avoir lu, compris et accepté ces conditions.
          Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Inscription et compte utilisateur</h2>
        <p>
          L'accès aux fonctionnalités de mise en relation est réservé aux personnes majeures
          (18 ans ou plus) ayant créé un compte. Vous êtes responsable de la confidentialité de
          vos identifiants et de toute activité effectuée via votre compte.
        </p>
        <p>
          Vous vous engagez à fournir des informations exactes, complètes et à jour lors de
          votre inscription et dans votre profil. Tout profil comportant des informations
          manifestement fausses pourra être suspendu sans préavis.
        </p>
        <p>
          Les retraités s'engagent à soumettre une pièce d'identité valide dans les 30 jours
          suivant leur inscription pour obtenir le badge "Identité vérifiée". L'absence de
          vérification peut limiter leur visibilité sur la plateforme.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Utilisation de la plateforme</h2>
        <p>Il est strictement interdit :</p>
        <ul>
          <li>d'utiliser la plateforme à des fins commerciales sans autorisation écrite ;</li>
          <li>de publier des contenus illicites, offensants, diffamatoires ou trompeurs ;</li>
          <li>de harceler ou menacer d'autres utilisateurs ;</li>
          <li>de contourner les mesures de sécurité de la plateforme ;</li>
          <li>d'utiliser des outils automatisés (bots, scrapers) sans autorisation ;</li>
          <li>de collecter les données personnelles d'autres utilisateurs.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>5. Responsabilité de GardeCoeur</h2>
        <p>
          GardeCoeur met tout en œuvre pour assurer la disponibilité et la sécurité de la
          plateforme, mais ne peut garantir un fonctionnement ininterrompu. La plateforme
          décline toute responsabilité quant aux dommages résultant d'une indisponibilité
          temporaire du service.
        </p>
        <p>
          GardeCoeur n'est pas responsable du comportement des utilisateurs en dehors de la
          plateforme, ni des accords conclus entre parents et retraités. Nous recommandons
          vivement de rencontrer la personne dans un lieu public avant toute garde et de
          vérifier les références présentées.
        </p>
        <p>
          <strong>Avertissement concernant les mineurs :</strong> La garde d'enfants implique
          une responsabilité particulière. Les parents demeurent responsables du choix de la
          personne à qui ils confient leurs enfants. GardeCoeur n'effectue pas de vérification
          du casier judiciaire des retraités inscrits.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur GardeCoeur (textes, graphiques, logos, images)
          sont protégés par le droit de la propriété intellectuelle et sont la propriété
          exclusive de GardeCoeur SAS, sauf mention contraire.
        </p>
        <p>
          En publiant un contenu sur la plateforme (photo de profil, description), vous
          accordez à GardeCoeur une licence non exclusive et gratuite pour l'afficher dans
          le cadre du fonctionnement du service.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Suspension et résiliation</h2>
        <p>
          GardeCoeur se réserve le droit de suspendre ou supprimer tout compte qui ne respecte
          pas les présentes CGU, sans préavis ni indemnité. Vous pouvez supprimer votre compte
          à tout moment depuis la page "Mon profil" → "Supprimer mon compte".
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Droit applicable</h2>
        <p>
          Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la
          compétence des tribunaux français.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Contact</h2>
        <p>
          Pour toute question relative aux présentes CGU, vous pouvez nous contacter à :
          <a href="mailto:contact@gardecour.fr"> contact@gardecour.fr</a>
        </p>
      </section>
    </div>
  </PageLayout>
)

export default CGUPage
