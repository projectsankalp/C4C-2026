// Base English Arrays
import { STATES as STATES_EN } from '../../components/data/states';
import { BUSINESS_CATEGORIES as CATS_EN } from '../../components/data/businessCategories';
import { BUSINESS_STAGES as STAGES_EN } from '../../components/data/businessStages';
import { REVENUE_RANGES as REVENUE_EN } from '../../components/data/revenueRanges';
import { NEED_CATEGORIES as NEEDS_EN } from '../../components/data/needCategories';
import { REGISTRATIONS as REGS_EN } from '../../components/data/registrations';

import STATES_HI from '../../locales/hi/states.json';
import CATS_HI from '../../locales/hi/categories.json';
import STAGES_HI from '../../locales/hi/businessStages.json';
import REVENUE_HI from '../../locales/hi/revenueRanges.json';
import NEEDS_HI from '../../locales/hi/needCategories.json';
import REGS_HI from '../../locales/hi/registrations.json';

import STATES_TA from '../../locales/ta/states.json';
import CATS_TA from '../../locales/ta/categories.json';
import STAGES_TA from '../../locales/ta/businessStages.json';
import REVENUE_TA from '../../locales/ta/revenueRanges.json';
import NEEDS_TA from '../../locales/ta/needCategories.json';
import REGS_TA from '../../locales/ta/registrations.json';

import STATES_TE from '../../locales/te/states.json';
import CATS_TE from '../../locales/te/categories.json';
import STAGES_TE from '../../locales/te/businessStages.json';
import REVENUE_TE from '../../locales/te/revenueRanges.json';
import NEEDS_TE from '../../locales/te/needCategories.json';
import REGS_TE from '../../locales/te/registrations.json';

import STATES_BN from '../../locales/bn/states.json';
import CATS_BN from '../../locales/bn/categories.json';
import STAGES_BN from '../../locales/bn/businessStages.json';
import REVENUE_BN from '../../locales/bn/revenueRanges.json';
import NEEDS_BN from '../../locales/bn/needCategories.json';
import REGS_BN from '../../locales/bn/registrations.json';

import STATES_KAN from '../../locales/kan/states.json';
import CATS_KAN from '../../locales/kan/categories.json';
import STAGES_KAN from '../../locales/kan/businessStages.json';
import REVENUE_KAN from '../../locales/kan/revenueRanges.json';
import NEEDS_KAN from '../../locales/kan/needCategories.json';
import REGS_KAN from '../../locales/kan/registrations.json';

export const getLocalizedData = (langCode: string) => {
  switch (langCode) {
    case 'hi':
      return { 
        states: STATES_HI, 
        categories: CATS_HI,
        stages: STAGES_HI,
        revenue: REVENUE_HI,
        needs: NEEDS_HI,
        registrations: REGS_HI
      };
        case 'ta':
        return { 
            states: STATES_TA, 
            categories: CATS_TA,
            stages: STAGES_TA,
            revenue: REVENUE_TA,
            needs: NEEDS_TA,
            registrations: REGS_TA
        };
    case 'te':
      return { 
        states: STATES_TE, 
        categories: CATS_TE,
        stages: STAGES_TE,
        revenue: REVENUE_TE,
        needs: NEEDS_TE,
        registrations: REGS_TE
      };
    case 'bn':
      return { 
        states: STATES_BN, 
        categories: CATS_BN,
        stages: STAGES_BN,
        revenue: REVENUE_BN,
        needs: NEEDS_BN,
        registrations: REGS_BN
      };
    case 'kan':
      return { 
        states: STATES_KAN, 
        categories: CATS_KAN,
        stages: STAGES_KAN,
        revenue: REVENUE_KAN,
        needs: NEEDS_KAN,
        registrations: REGS_KAN
      };
    default:
      return { 
        states: STATES_EN, 
        categories: CATS_EN,
        stages: STAGES_EN,
        revenue: REVENUE_EN,
        needs: NEEDS_EN,
        registrations: REGS_EN
      };
  }
};