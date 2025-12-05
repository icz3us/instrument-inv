import { useState } from 'react';
import Input from '../atoms/Input';
import Textarea from '../atoms/Textarea';
import Select from '../atoms/Select';
import Button from '../atoms/Button';
import styles from './InstrumentForm.module.css';

const InstrumentForm = ({ 
  instrument = null, 
  onSubmit, 
  onCancel, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    name: instrument?.name || '',
    description: instrument?.description || '',
    quantity: instrument?.quantity || 0,
    category: instrument?.category || '',
    status: instrument?.status || 'available'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Name"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter instrument name"
        required
      />
      
      <Textarea
        label="Description"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter instrument description"
      />
      
      <Input
        label="Quantity"
        id="quantity"
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        placeholder="Enter quantity"
        required
      />
      
      <Input
        label="Category"
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Enter category"
      />
      
      <Select
        label="Status"
        id="status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={statusOptions}
      />
      
      <div className={styles.actions}>
        <Button 
          type="button" 
          variant="secondary" 
          size="medium" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          size="medium" 
          disabled={loading}
        >
          {loading ? 'Saving...' : (instrument ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default InstrumentForm;