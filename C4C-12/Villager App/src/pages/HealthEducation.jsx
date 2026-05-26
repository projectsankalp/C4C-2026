/**
 * src/pages/HealthEducation.jsx
 * Health Education articles list screen.
 * Displays articles categorised by health topic and supports filtering.
 */

import React, { useEffect, useState } from 'react';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { fetchEducationArticles } from '../firebase/patients';

export default function HealthEducation({ onReadArticle }) {
  const { t, lang } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Diabetes', 'Blood Pressure', 'Diet', 'Exercise', 'Medicines'];

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(art => art.category === selectedCategory));
    }
  }, [selectedCategory, articles]);

  const loadArticles = async () => {
    setLoading(true);
    const data = await fetchEducationArticles();
    setArticles(data);
    setFilteredArticles(data);
    setLoading(false);
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

  return (
    <div className="page-container education-page animate-fade-in">
      <header className="page-header">
        <div className="header-title-box">
          <h2 className="page-title">{t('education.title')}</h2>
          <p className="page-subtitle">{t('education.subtitle')}</p>
        </div>
      </header>

      {/* Category selector row */}
      <div className="category-scroll-nav scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-nav-btn ${isSelected ? 'selected' : ''}`}
            >
              {t(`education.categories.${cat}`) || cat}
            </button>
          );
        })}
      </div>

      <div className="education-content scrollbar-none">
        {loading ? (
          <div className="mini-loader-box">
            <div className="teal-spinner animate-spin-slow"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="empty-articles-card glass-panel">
            <BookOpen size={32} className="text-muted" style={{ margin: '0 auto 12px' }} />
            <p className="empty-text">No articles found in this category.</p>
          </div>
        ) : (
          <div className="articles-list-grid">
            {filteredArticles.map((art) => {
              const titleText = art.title[lang] || art.title.en || 'Untitled Article';
              const contentText = art.content[lang] || art.content.en || '';
              const truncatedText = contentText.length > 120 
                ? `${contentText.substring(0, 120)}...` 
                : contentText;

              return (
                <div key={art.id} className="article-preview-card glass-card">
                  <div className="article-card-header">
                    <span className={`badge ${getCategoryBadgeClass(art.category)}`}>
                      {t(`education.categories.${art.category}`) || art.category}
                    </span>
                  </div>
                  <h3 className="article-card-title">{titleText}</h3>
                  <p className="article-card-preview">{truncatedText}</p>
                  <button 
                    className="btn-text read-more-art-btn"
                    onClick={() => onReadArticle(art)}
                  >
                    <span>{t('education.readMore')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
