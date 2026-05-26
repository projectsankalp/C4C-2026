/**
 * src/pages/ArticleDetail.jsx
 * Screen displaying the full content of an educational article
 * along with recommended related articles.
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { fetchEducationArticles } from '../firebase/patients';

export default function ArticleDetail({ article, onBack, onArticleSwitch }) {
  const { t, lang } = useLanguage();
  const [allArticles, setAllArticles] = useState([]);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    loadAllArticles();
  }, [article]);

  const loadAllArticles = async () => {
    const data = await fetchEducationArticles();
    setAllArticles(data);
    
    // Filter related articles (same category, excluding current article)
    const filtered = data.filter(
      (art) => art.category === article.category && art.id !== article.id
    );
    setRelated(filtered.slice(0, 3)); // Max 3 items
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Diabetes': return 'badge-primary';
      case 'Blood Pressure': return 'badge-error';
      case 'Diet': return 'badge-success';
      case 'Exercise': return 'badge-warning';
      case 'Medicines':
      default: return 'badge-primary';
    }
  };

  const titleText = article.title[lang] || article.title.en || 'Untitled Article';
  const contentText = article.content[lang] || article.content.en || '';
  const dateFormatted = new Date(article.createdAt || Date.now()).toLocaleDateString();

  return (
    <div className="page-container article-detail-page animate-slide-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="article-detail-body scrollbar-none">
        
        {/* Category & Date Header */}
        <div className="article-detail-meta">
          <span className={`badge ${getCategoryBadgeClass(article.category)}`}>
            {t(`education.categories.${article.category}`) || article.category}
          </span>
          <span className="article-date-row">
            <Clock size={12} style={{ marginRight: '4px' }} />
            <span>{dateFormatted}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="article-detail-title">{titleText}</h1>
        
        <div className="divider" />

        {/* Full Text Content */}
        <div className="article-detail-text-content glass-panel">
          <p className="article-body-p">{contentText}</p>
        </div>

        {/* Related Articles recommendation section */}
        {related.length > 0 && (
          <div className="related-articles-section">
            <h3 className="section-title">{t('education.relatedArticles')}</h3>
            <div className="related-articles-grid">
              {related.map((art) => {
                const artTitle = art.title[lang] || art.title.en || 'Untitled';
                return (
                  <div 
                    key={art.id} 
                    className="related-article-card glass-card"
                    onClick={() => onArticleSwitch(art)}
                  >
                    <BookOpen size={16} className="text-teal" />
                    <span className="related-title-txt">{artTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
