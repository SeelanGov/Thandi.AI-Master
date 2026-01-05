'use client';

import React from 'react';
import HeaderCard from './cards/HeaderCard';
import ProgramCard from './cards/ProgramCard';
import BursaryCard from './cards/BursaryCard';
import ActionCard from './cards/ActionCard';
import AlternativeOptionsCard from './cards/AlternativeOptionsCard';
import styles from './ResultsCardLayout.module.css';

/**
 * Main layout component for the card-based results display
 * Replaces the text-heavy formatResponse() approach with structured cards
 */
export default function ResultsCardLayout({ parsedResults }) {
  if (!parsedResults) {
    return (
      <div className={styles.cardLayoutLoading}>
        <p>Processing your results...</p>
      </div>
    );
  }

  const {
    headerData,
    programs,
    bursaries,
    actionPlan,
    alternativeOptions,
    gradeContext
  } = parsedResults;

  return (
    <div className={styles.cardLayout} data-grade={gradeContext.grade}>
      {/* Academic Status Overview */}
      <HeaderCard {...headerData} />
      
      {/* University Programs Section */}
      {programs && programs.length > 0 && (
        <section className={styles.programsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {gradeContext.grade === 10 ? 'Career Exploration Options' : 'Recommended Programs'}
            </h2>
            <p className={styles.sectionSubtitle}>
              {gradeContext.grade === 10 
                ? 'Explore these fields to understand your options'
                : `Based on your Grade ${gradeContext.grade - 1} performance and interests`
              }
            </p>
          </div>
          
          <div className={styles.programsGrid}>
            {programs.map((program, index) => (
              <ProgramCard 
                key={`program-${index}`} 
                {...program}
                gradeLevel={gradeContext.grade}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Financial Aid Section */}
      {bursaries && bursaries.length > 0 && (
        <section className={styles.bursariesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Financial Aid Opportunities</h2>
            <p className={styles.sectionSubtitle}>
              {gradeContext.grade === 10 
                ? 'Learn about funding options for your future studies'
                : gradeContext.grade === 11
                ? 'Start preparing these applications for next year'
                : 'Critical deadlines approaching - apply now'
              }
            </p>
          </div>
          
          <div className={styles.bursariesGrid}>
            {bursaries.map((bursary, index) => (
              <BursaryCard 
                key={`bursary-${index}`} 
                {...bursary}
                gradeLevel={gradeContext.grade}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Action Plan Section */}
      {actionPlan && (
        <section className={styles.actionSection}>
          <ActionCard 
            {...actionPlan}
            gradeLevel={gradeContext.grade}
            gradeContext={gradeContext}
          />
        </section>
      )}
      
      {/* Alternative Options Section */}
      {alternativeOptions && alternativeOptions.length > 0 && (
        <section className={styles.alternativesSection}>
          <AlternativeOptionsCard 
            options={alternativeOptions}
            gradeLevel={gradeContext.grade}
          />
        </section>
      )}
    </div>
  );
}