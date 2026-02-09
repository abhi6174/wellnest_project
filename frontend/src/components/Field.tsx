import React from 'react';

interface FieldProps {
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field: React.FC<FieldProps> = ({ label, type = 'text', value, onChange }) => (
    <div className="input-group">
        <label>{label}</label>
        <input type={type} value={value} onChange={onChange} />
    </div>
);

export default Field;
