import styles from './Select.module.css';

const Select = ({ 
  label, 
  id, 
  value, 
  onChange, 
  options = [], 
  error, 
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.selectGroup} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`${styles.select} ${error ? styles.error : ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Select;