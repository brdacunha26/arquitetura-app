'use client';

import { forwardRef, useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  mask?: string;
}

const MaskedInput = forwardRef<HTMLInputElement, CustomProps & TextFieldProps>(
  function MaskedInput(props, ref) {
    const { onChange, mask, value, ...other } = props;
    const [inputValue, setInputValue] = useState(value || '');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = event.target.value;

      // Remove todos os caracteres não numéricos
      newValue = newValue.replace(/\D/g, '');

      // Aplica a máscara de CPF
      if (mask === 'cpf' && newValue.length <= 11) {
        newValue = newValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      // Aplica a máscara de telefone
      else if (mask === 'phone' && newValue.length <= 11) {
        if (newValue.length === 11) {
          newValue = newValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
          newValue = newValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
      }
      // Aplica a máscara de CEP
      else if (mask === 'cep' && newValue.length <= 8) {
        newValue = newValue.replace(/(\d{5})(\d{3})/, '$1-$2');
      }

      setInputValue(newValue);
      onChange({ target: { name: props.name, value: newValue } });
    };

    return (
      <TextField
        {...other}
        value={inputValue}
        onChange={handleChange}
        inputRef={ref}
      />
    );
  }
);

export default MaskedInput; 