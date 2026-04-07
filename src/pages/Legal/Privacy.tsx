/* ── GardeCoeur — Politique de confidentialité ───────────────────────────── */

import React from 'react'
import { PageLayout } from '@/components/layout'
import styles from './Legal.module.css'

const PrivacyPage: React.FC = () => (
  <PageLayout>
    <div className={styles.container}>
      <h1 className={styles.title}>Politique de confidentialité</h1>
      <p className={styles.updated}>Dernière mise à jour : avril 2026</p>

      <section className={styles.section}>
        <h2>1. Responsable du traitement</h2>
        <p>
          GardeCoeur SAS est responsable du traitement de vos données personnelles.
          Contact DPO : <a href="mailto:dpo@gardecour.fr">dpo@gardecour.fr</a>
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>
        <ul>
          <li><strong>Compte :</strong> adresse email, mot de passe (chiffré), rôle (parent/retraité)</li>
          <li><strong>Profil :</strong> prénom, nom, âge, ville, photo, biographie</li>
          <li><strong>Enfants (parents uniquement) :</strong> prénom, âge, allergies, caractère</li>
          <li><strong>Localisation :</strong> coordonnées GPS approximatives (dérivées de la ville)</li>
          <li><strong>Messagerie :</strong> contenu des messages échangés entre utilisateurs</li>
          <li><strong>Pièce d'identité (retraités) :</strong> scan transmis pour vérification manuelle</li>
          <li><strong>Données d'usage :</strong> logs de connexion, interactions avec la plateforme</li>
          <li><strong>Appareils mobiles :</strong> token FCM pour les notifications push (optionnel)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>3. Finalités et bases légales</h2>
        <table className={styles.table}>
          <thead>
            <tr><th>Finalité</th><th>Base légale</th></tr>
          </thead>
          <tbody>
            <tr><td>Fonctionnement du service de mise en relation</td><td>Exécution du contrat</td></tr>
            <tr><td>Vérification d'identité des retraités</td><td>Intérêt légitime (sécurité des enfants)</td></tr>
            <tr><td>Envoi d'emails transactionnels</td><td>Exécution du contrat</td></tr>
            <tr><td>Notifications push</td><td>Consentement</td></tr>
            <tr><td>Modération et prévention des abus</td><td>Intérêt légitime</td></tr>
            <tr><td>Conformité légale et comptabilité</td><td>Obligation légale</td></tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>4. Données concernant les mineurs</h2>
        <p>
          GardeCoeur traite des données relatives à des enfants mineurs (prénom, âge, allergies)
          fournies par leurs parents. Ces données sont strictement limitées à ce qui est nécessaire
          au service et ne sont jamais partagées avec des tiers à des fins commerciales.
        </p>
        <p>
          Conformément au RGPD, le traitement de données de mineurs de moins de 15 ans requiert
          le consentement parental. En renseignant les informations de vos enfants, vous déclarez
          être leur représentant légal.
        </p>
        <p>
          <strong>Registre des traitements :</strong> Un registre des activités de traitement
          concernant les données de mineurs est tenu à jour et disponible sur demande adressée à
          notre DPO.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Destinataires des données</h2>
        <p>Vos données peuvent être transmises à :</p>
        <ul>
          <li><strong>Brevo (Sendinblue)</strong> — envoi d'emails transactionnels (hébergé en UE)</li>
          <li><strong>Cloudflare R2</strong> — stockage des photos de profil et pièces d'identité</li>
          <li><strong>Railway</strong> — hébergement de l'API et de la base de données</li>
          <li><strong>Firebase (Google)</strong> — notifications push (uniquement le token d'appareil)</li>
          <li><strong>Vercel</strong> — hébergement du frontend web</li>
        </ul>
        <p>
          Tous nos sous-traitants sont liés par des clauses contractuelles types conformes au RGPD.
          Aucune donnée n'est vendue à des tiers.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Durée de conservation</h2>
        <ul>
          <li><strong>Données de compte actif :</strong> durée de vie du compte</li>
          <li><strong>Messages :</strong> 3 ans après la dernière activité de la conversation</li>
          <li><strong>Pièces d'identité :</strong> supprimées dans les 30 jours après vérification</li>
          <li><strong>Données après suppression de compte :</strong> anonymisation immédiate, suppression physique sous 30 jours</li>
          <li><strong>Logs techniques :</strong> 12 mois</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>7. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
          <li><strong>Droit à l'effacement :</strong> supprimer votre compte via "Mon profil"</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
          <li><strong>Droit de limitation :</strong> restreindre le traitement de vos données</li>
        </ul>
        <p>
          Pour exercer vos droits : <a href="mailto:dpo@gardecour.fr">dpo@gardecour.fr</a>.
          Vous pouvez également introduire une réclamation auprès de la CNIL :&nbsp;
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Cookies</h2>
        <p>
          La plateforme web utilise uniquement des cookies strictement nécessaires au
          fonctionnement du service (token JWT, préférences). Aucun cookie publicitaire
          ou de traçage tiers n'est utilisé.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
          protéger vos données : chiffrement HTTPS, hachage des mots de passe (bcrypt),
          tokens JWT à durée limitée, rate limiting sur les endpoints d'authentification,
          accès restreint aux données sensibles.
        </p>
      </section>
    </div>
  </PageLayout>
)

export default PrivacyPage
