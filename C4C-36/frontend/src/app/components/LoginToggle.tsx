import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginToggleProps {
  selected: 'artisan' | 'validator';
  onToggle: (type: 'artisan' | 'validator') => void;
}

export function LoginToggle({ selected, onToggle }: LoginToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="relative bg-zinc-100 rounded-full p-1 flex mb-8 border border-zinc-200">
      <motion.div
        className="absolute inset-y-1 w-1/2 bg-white rounded-full shadow-sm border border-zinc-200"
        initial={false}
        animate={{ x: selected === 'artisan' ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      <button
        onClick={() => onToggle('artisan')}
        className={`relative z-10 flex-1 py-2.5 px-6 rounded-full transition-colors ${
          selected === 'artisan' ? 'text-zinc-900' : 'text-zinc-500'
        }`}
        style={{ fontSize: '14px' }}
      >
        {t('artisan')}
      </button>

      <button
        onClick={() => onToggle('validator')}
        className={`relative z-10 flex-1 py-2.5 px-6 rounded-full transition-colors ${
          selected === 'validator' ? 'text-zinc-900' : 'text-zinc-500'
        }`}
        style={{ fontSize: '14px' }}
      >
        {t('nss_validator')}
      </button>
    </div>
  );
}
