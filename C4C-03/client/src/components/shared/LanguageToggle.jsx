import { useLanguage } from '../../context/LanguageContext';

const langs = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' }
];

export default function LanguageToggle() {
  const { language, changeLanguage } = useLanguage();
  return (
    <div className="flex gap-1">
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => changeLanguage(l.code)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            language === l.code ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
