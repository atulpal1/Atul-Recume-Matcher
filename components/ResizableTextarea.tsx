
import React from 'react';

interface ResizableTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  Icon: React.ElementType;
}

const ResizableTextarea: React.FC<ResizableTextareaProps> = ({ id, label, value, onChange, placeholder, Icon }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-lg font-semibold text-slate-300 flex items-center">
        <Icon className="h-5 w-5 mr-2" />
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-80 min-h-[20rem] p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-y"
      />
    </div>
  );
};

export default ResizableTextarea;
