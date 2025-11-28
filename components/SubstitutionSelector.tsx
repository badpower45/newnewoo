import React from 'react';
import { SUBSTITUTION_OPTIONS } from '../src/config';

interface SubstitutionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  productName?: string;
}

const SubstitutionSelector: React.FC<SubstitutionSelectorProps> = ({ 
  value, 
  onChange, 
  productName 
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {productName ? `إذا لم يكن ${productName} متوفراً:` : 'في حالة عدم التوفر:'}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        {SUBSTITUTION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubstitutionSelector;
