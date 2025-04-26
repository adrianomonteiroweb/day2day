'use client';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Keyboard,
  Platform,
  TouchableWithoutFeedback 
} from 'react-native';
import moment from 'moment';

interface Expense {
  id: string;
  amount: number;
  timestamp: Date;
}

const { width, height } = Dimensions.get('window');
const MIN_FONT_SCALE = 0.8;
const MAX_FONT_SCALE = 1.2;

export default function DailyExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    calculateTotalToday();
  }, [expenses]);

  const calculateTotalToday = () => {
    const today = moment().startOf('day');
    const todayExpenses = expenses.filter(expense => {
      return moment(expense.timestamp).isSame(today, 'day');
    });

    const total = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalToday(total);
  };

  const addExpense = () => {
    if (!amount) return;

    // Converte o valor em string para número
    const numberValue = Number(amount.replace(',', '.'));
    if (isNaN(numberValue) || numberValue <= 0) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: numberValue,
      timestamp: new Date(),
    };

    setExpenses([newExpense, ...expenses]);
    setAmount('');
    Keyboard.dismiss();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAmountChange = (text: string) => {
    // Remove tudo exceto números e vírgula
    const cleanedText = text.replace(/[^0-9,]/g, '');
    
    // Garante que só existe uma vírgula
    const parts = cleanedText.split(',');
    if (parts.length > 2) {
      return;
    }

    // Limita decimais a 2 dígitos
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(cleanedText);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Day2Day</Text>
          <Text style={styles.date}>
            {moment().format('DD/MM/YYYY')}
          </Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total de Hoje</Text>
          <Text style={styles.totalAmount} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(totalToday)}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="number-pad"
              placeholderTextColor="#666"
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={addExpense}
            />
          </View>
          <TouchableOpacity 
            style={[
              styles.addButton,
              (!amount || Number(amount.replace(',', '.')) <= 0) && styles.addButtonDisabled
            ]}
            onPress={addExpense}
            activeOpacity={0.7}
            disabled={!amount || Number(amount.replace(',', '.')) <= 0}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Math.max(20, width * 0.05),
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: height * 0.05,
  },
  title: {
    fontSize: Math.max(32, width * 0.08),
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  date: {
    fontSize: Math.max(16, width * 0.04),
    color: '#666',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: Math.max(24, width * 0.06),
    borderRadius: 16,
    marginBottom: height * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontSize: Math.max(18, width * 0.045),
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: Math.max(42, width * 0.12),
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    minHeight: 60,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: Math.max(60, height * 0.08),
  },
  currencySymbol: {
    fontSize: Math.max(20, width * 0.05),
    color: '#666',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: Math.max(24, width * 0.06),
    color: '#1a1a1a',
    padding: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
      android: {
        paddingVertical: 8,
      },
    }),
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: Math.max(60, height * 0.08),
    height: Math.max(60, height * 0.08),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: Math.max(32, width * 0.08),
    fontWeight: 'bold',
  },
}); 