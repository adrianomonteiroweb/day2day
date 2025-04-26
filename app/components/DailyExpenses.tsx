'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';

interface Expense {
  id: string;
  amount: number;
  description: string;
  timestamp: Date;
}

export default function DailyExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [totalToday, setTotalToday] = useState(0);

  // Set moment locale to Portuguese
  moment.locale('pt-br');

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
    if (!amount || isNaN(Number(amount))) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: Number(amount),
      description: description || 'Sem descrição',
      timestamp: new Date(),
    };

    setExpenses([newExpense, ...expenses]);
    setAmount('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Day2Day</Text>
      <Text style={styles.date}>
        {moment().format('dddd, D [de] MMMM')}
      </Text>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total de Hoje:</Text>
        <Text style={styles.totalAmount}>R$ {totalToday.toFixed(2)}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="R$ 0,00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.expensesList}>
        {expenses
          .filter(expense => moment(expense.timestamp).isSame(moment(), 'day'))
          .map(expense => (
            <View key={expense.id} style={styles.expenseItem}>
              <View>
                <Text style={styles.expenseAmount}>
                  R$ {expense.amount.toFixed(2)}
                </Text>
                <Text style={styles.expenseDescription}>
                  {expense.description}
                </Text>
              </View>
              <Text style={styles.expenseTime}>
                {moment(expense.timestamp).format('HH:mm')}
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  date: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  descriptionInput: {
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expensesList: {
    flex: 1,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
  },
  expenseTime: {
    fontSize: 14,
    color: '#666',
  },
}); 