// components/MonitoringFormField.tsx
'use client';


interface MonitoringFormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  required?: boolean;
  className?: string;
}

// Renommé en MonitoringFormField pour éviter les confusions
const MonitoringFormField: React.FC<MonitoringFormFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  min,
  required = false,
  className = '',
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...(type === 'number' && min ? { min } : {})} // Ajoute `min` uniquement si `type` est `number`
        className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        required={required}
      />
    </div>
  );
}

export default MonitoringFormField;