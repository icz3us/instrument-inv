import styles from './Textarea.module.css';

const Textarea = ({ 
  label, 
  id, 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.textareaGroup} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`${styles.textarea} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Textarea;