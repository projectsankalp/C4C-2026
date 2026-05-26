/**
 * GraamSehat Admin Dashboard - Health Content Management Page
 * Location: /src/pages/HealthContent.jsx
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { getEducationArticles, saveEducationArticle, deleteEducationArticle } from '../firebase/users.admin';
import { formatDate } from '../utils/formatters';
import { ARTICLE_CATEGORIES } from '../utils/constants';
import AlertBanner from '../components/AlertBanner';
import { Plus, Edit, Trash2, Eye, FileText, Check, Globe, HelpCircle } from 'lucide-react';
import './HealthContent.css';

export default function HealthContent() {
  const { currentAdmin } = useAdmin();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  
  // Editor form state
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null); // null for create mode
  const [activeLangTab, setActiveLangTab] = useState('en'); // en, kn, hi, ta, te
  
  const [titleObj, setTitleObj] = useState({ en: '', kn: '', hi: '', ta: '', te: '' });
  const [contentObj, setContentObj] = useState({ en: '', kn: '', hi: '', ta: '', te: '' });
  const [category, setCategory] = useState('Diet');
  const [published, setPublished] = useState(true);

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getEducationArticles();
      setArticles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle Edit click
  const handleEditClick = (article) => {
    setEditingId(article.id);
    setTitleObj({
      en: article.title?.en || '',
      kn: article.title?.kn || '',
      hi: article.title?.hi || '',
      ta: article.title?.ta || '',
      te: article.title?.te || ''
    });
    setContentObj({
      en: article.content?.en || '',
      kn: article.content?.kn || '',
      hi: article.content?.hi || '',
      ta: article.content?.ta || '',
      te: article.content?.te || ''
    });
    setCategory(article.category || 'Diet');
    setPublished(article.published !== undefined ? article.published : true);
    setActiveLangTab('en');
    setShowEditor(true);
  };

  // Handle Create click
  const handleCreateClick = () => {
    setEditingId(null);
    setTitleObj({ en: '', kn: '', hi: '', ta: '', te: '' });
    setContentObj({ en: '', kn: '', hi: '', ta: '', te: '' });
    setCategory('Diet');
    setPublished(true);
    setActiveLangTab('en');
    setShowEditor(true);
  };

  // Handle Save
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!titleObj.en.trim() || !contentObj.en.trim()) {
      alert('English Title and Content are required as a baseline.');
      return;
    }

    const payload = {
      title: titleObj,
      content: contentObj,
      category,
      published,
      languagesAvailable: Object.keys(titleObj).filter(lang => titleObj[lang].trim() !== '')
    };

    try {
      setLoading(true);
      await saveEducationArticle(currentAdmin.uid, editingId, payload);
      setInfoMessage(editingId ? 'Article updated successfully.' : 'New article published.');
      setShowEditor(false);
      fetchArticles();
      setTimeout(() => setInfoMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save article.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteClick = async (articleId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        setLoading(true);
        await deleteEducationArticle(currentAdmin.uid, articleId);
        setInfoMessage('Article deleted successfully.');
        fetchArticles();
        setTimeout(() => setInfoMessage(''), 4000);
      } catch (err) {
        console.error(err);
        alert('Failed to delete article.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getLanguageLabel = (code) => {
    const labels = { en: 'English', kn: 'ಕನ್ನಡ (Kannada)', hi: 'हिन्दी (Hindi)', ta: 'தமிழ் (Tamil)', te: 'తెలుగు (Telugu)' };
    return labels[code] || code;
  };

  return (
    <div className="health-content-page">
      <div className="content-header no-print">
        <div>
          <h1>Health Education Content Manager</h1>
          <p className="subtitle">Publish and translate educational health articles shown directly to villagers in the mobile app.</p>
        </div>
        {!showEditor && (
          <button className="btn btn-primary" onClick={handleCreateClick}>
            <Plus size={16} />
            <span>Add Article</span>
          </button>
        )}
      </div>

      {infoMessage && (
        <div className="no-print">
          <AlertBanner message={infoMessage} type="success" onClose={() => setInfoMessage('')} />
        </div>
      )}

      {/* Editor Modal/Panel */}
      {showEditor && (
        <div className="glass-card editor-form-card no-print">
          <div className="editor-card-header">
            <h3>{editingId ? 'Edit Article Settings' : 'Create Education Article'}</h3>
          </div>
          
          <form onSubmit={handleSaveSubmit}>
            <div className="editor-meta-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Article Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                  {ARTICLE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group publish-toggle-cell">
                <label className="form-label">Publish Status</label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={published} 
                    onChange={(e) => setPublished(e.target.checked)} 
                  />
                  <span className="slider round"></span>
                  <span className="toggle-lbl">{published ? 'Visible to villagers' : 'Draft mode'}</span>
                </label>
              </div>
            </div>

            {/* Language Editor Tabs */}
            <div className="lang-tabs-wrapper">
              <span className="lang-tabs-title"><Globe size={14} /> Translations:</span>
              <div className="lang-tabs">
                {['en', 'kn', 'hi', 'ta', 'te'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`lang-tab-btn ${activeLangTab === lang ? 'active' : ''} ${titleObj[lang].trim() !== '' ? 'has-content' : ''}`}
                    onClick={() => setActiveLangTab(lang)}
                  >
                    <span>{lang.toUpperCase()}</span>
                    {titleObj[lang].trim() !== '' && <Check size={10} style={{ marginLeft: '4px' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Translation Input Fields */}
            <div className="lang-fields-panel">
              <span className="lang-indicator">Editing in: <strong>{getLanguageLabel(activeLangTab)}</strong></span>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Translated Title</label>
                <input
                  type="text"
                  value={titleObj[activeLangTab]}
                  onChange={(e) => setTitleObj({ ...titleObj, [activeLangTab]: e.target.value })}
                  placeholder={`Enter title in ${getLanguageLabel(activeLangTab)}...`}
                  className="form-input"
                  required={activeLangTab === 'en'} // Only English is required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Article Content</label>
                <textarea
                  value={contentObj[activeLangTab]}
                  onChange={(e) => setContentObj({ ...contentObj, [activeLangTab]: e.target.value })}
                  placeholder={`Write article contents in ${getLanguageLabel(activeLangTab)}...`}
                  className="form-input editor-textarea"
                  rows={6}
                  required={activeLangTab === 'en'}
                />
              </div>
            </div>

            <div className="editor-form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save & Publish'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditor(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles Directory List Table */}
      {!showEditor && (
        <div className="table-container">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Title (English)</th>
                <th>Category</th>
                <th>Languages Available</th>
                <th>Publish Status</th>
                <th>Last Updated</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && articles.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Fetching articles registry...</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No educational articles published yet. Click "Add Article" above to create one.</td></tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td><strong>{article.title?.en || 'Untitled'}</strong></td>
                    <td><span className="badge badge-blue">{article.category}</span></td>
                    <td>
                      <div className="lang-pill-row">
                        {article.languagesAvailable?.map(lang => (
                          <span key={lang} className="lang-pill">{lang.toUpperCase()}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {article.published ? (
                        <span className="badge badge-green">Published</span>
                      ) : (
                        <span className="badge badge-gray">Draft</span>
                      )}
                    </td>
                    <td>{formatDate(article.lastUpdated)}</td>
                    <td className="actions-column">
                      <div className="row-actions">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditClick(article)}
                          style={{ padding: '4px 8px' }}
                          title="Edit Article"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeleteClick(article.id, article.title?.en)}
                          style={{ padding: '4px 8px' }}
                          title="Delete Article"
                        >
                          <Trash2 size={12} style={{ color: 'var(--risk-red)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
