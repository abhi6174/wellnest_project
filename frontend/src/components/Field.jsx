import React from 'react';

const Field = ({ label, type = 'text', value, onChange }) => (
  <div className="input-group">
    <label>{label}</label>
    <input type={type} value={value} onChange={onChange} />
  </div>
);

export default Field;
