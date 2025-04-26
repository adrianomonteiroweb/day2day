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

interface MonthlyStats {
  daysInMonth: number;
  remainingDays: number;
  daysWithExpenses: number;
  realDailyAverage: number;
  projectedDailyAverage: number;
  totalSpent: number;
  projectedMonthTotal: number;
}

const { width, height } = Dimensions.get('window');

export default function DailyExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [totalToday, setTotalToday] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    daysInMonth: 0,
    remainingDays: 0,
    daysWithExpenses: 0,
    realDailyAverage: 0,
    projectedDailyAverage: 0,
    totalSpent: 0,
    projectedMonthTotal: 0
  });

  useEffect(() => {
    calculateTotalToday();
    calculateMonthlyStats();
  }, [expenses]);

  const calculateMonthlyStats = () => {
    const today = moment();
    const daysInMonth = today.daysInMonth();
    const remainingDays = daysInMonth - today.date();

    const currentMonthExpenses = expenses.filter(expense => 
      moment(expense.timestamp).isSame(today, 'month')
    );

    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const expensesByDay = currentMonthExpenses.reduce((acc, expense) => {
      const day = moment(expense.timestamp).date();
      if (!acc[day]) acc[day] = 0;
      acc[day] += expense.amount;
      return acc;
    }, {} as Record<number, number>);

    const daysWithExpenses = Object.keys(expensesByDay).length;
    const realDailyAverage = daysWithExpenses > 0 ? totalSpent / daysWithExpenses : 0;

    const last5DaysExpenses = Object.entries(expensesByDay)
      .sort(([dayA], [dayB]) => Number(dayB) - Number(dayA))
      .slice(0, 5);

    const projectedDailyAverage = last5DaysExpenses.length > 0
      ? last5DaysExpenses.reduce((sum, [, amount]) => sum + amount, 0) / last5DaysExpenses.length
      : realDailyAverage;

    const projectedMonthTotal = totalSpent + (projectedDailyAverage * remainingDays);

    setMonthlyStats({
      daysInMonth,
      remainingDays,
      daysWithExpenses,
      realDailyAverage,
      projectedDailyAverage,
      totalSpent,
      projectedMonthTotal
    });
  };

  const calculateTotalToday = () => {
    const today = moment().startOf('day');
    const todayExpenses = expenses.filter(expense => 
      moment(expense.timestamp).isSame(today, 'day')
    );
    const total = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalToday(total);
  };

  const handleAmountChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9,]/g, '');
    const parts = cleanedText.split(',');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleanedText);
  };

  const addExpense = () => {
    if (!amount) return;
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Day2Day</Text>
          <Text style={styles.date}>{moment().format('DD/MM/YYYY')}</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, styles.todayCard]}>
              <Text style={styles.statsLabel}>Hoje</Text>
              <Text style={styles.statsValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(totalToday)}
              </Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Mês</Text>
              <Text style={styles.statsValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(monthlyStats.totalSpent)}
              </Text>
              <Text style={styles.statsDetail}>Faltam {monthlyStats.remainingDays} dias</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Média/Dia</Text>
              <Text style={styles.statsValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(monthlyStats.realDailyAverage)}
              </Text>
              <Text style={styles.statsDetail}>{monthlyStats.daysWithExpenses} dias</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Previsão</Text>
              <Text style={styles.statsValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(monthlyStats.projectedMonthTotal)}
              </Text>
              <Text style={styles.statsDetail}>Final do mês</Text>
            </View>
          </View>
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
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  mainContent: {
    flex: 1,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todayCard: {
    backgroundColor: '#007AFF',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  statsDetail: {
    fontSize: 10,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1a1a1a',
    padding: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 8,
      },
      android: {
        paddingVertical: 6,
      },
    }),
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 10,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 