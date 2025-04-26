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
  TouchableWithoutFeedback,
  Modal,
  ScrollView
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
  const [selectedDate, setSelectedDate] = useState(moment());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
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
  }, [expenses, selectedDate]);

  const calculateMonthlyStats = () => {
    const currentMonth = selectedDate.clone().startOf('month');
    const daysInMonth = currentMonth.daysInMonth();
    const today = moment();
    const remainingDays = selectedDate.isSame(today, 'month') 
      ? daysInMonth - today.date() 
      : 0;

    const currentMonthExpenses = expenses.filter(expense => 
      moment(expense.timestamp).isSame(currentMonth, 'month')
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

    const projectedMonthTotal = selectedDate.isSame(today, 'month')
      ? totalSpent + (projectedDailyAverage * remainingDays)
      : totalSpent;

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
    const targetDate = selectedDate.clone().startOf('day');
    const targetExpenses = expenses.filter(expense => 
      moment(expense.timestamp).isSame(targetDate, 'day')
    );
    const total = targetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
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
      timestamp: selectedDate.toDate(),
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

  const renderDatePicker = () => {
    const days = Array.from({ length: selectedDate.daysInMonth() }, (_, i) => i + 1);
    const today = moment();
    const isCurrentMonth = selectedDate.isSame(today, 'month');

    return (
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione o Dia</Text>
              <ScrollView style={styles.dateGrid}>
                <View style={styles.daysContainer}>
                  {days.map(day => {
                    const date = selectedDate.clone().date(day);
                    const isToday = date.isSame(today, 'day');
                    const isPast = date.isBefore(today, 'day') || !isCurrentMonth;
                    
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          isToday && styles.todayButton,
                          selectedDate.date() === day && styles.selectedDayButton
                        ]}
                        onPress={() => {
                          setSelectedDate(prev => prev.clone().date(day));
                          setShowDatePicker(false);
                        }}
                        disabled={!isPast && !isToday}
                      >
                        <Text style={[
                          styles.dayText,
                          isToday && styles.todayText,
                          selectedDate.date() === day && styles.selectedDayText,
                          !isPast && !isToday && styles.futureDayText
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderMonthPicker = () => {
    const months = Array.from({ length: 12 }, (_, i) => moment().month(i));
    const currentMonth = moment();

    return (
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMonthPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione o Mês</Text>
              <ScrollView style={styles.monthGrid}>
                <View style={styles.monthsContainer}>
                  {months.map((month, index) => {
                    const isPast = month.isSameOrBefore(currentMonth, 'month');
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.monthButton,
                          selectedDate.month() === index && styles.selectedMonthButton,
                          month.isSame(currentMonth, 'month') && styles.currentMonthButton
                        ]}
                        onPress={() => {
                          setSelectedDate(prev => prev.clone().month(index).date(1));
                          setShowMonthPicker(false);
                        }}
                        disabled={!isPast}
                      >
                        <Text style={[
                          styles.monthText,
                          selectedDate.month() === index && styles.selectedMonthText,
                          !isPast && styles.futureMonthText
                        ]}>
                          {month.format('MMMM')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Day2Day</Text>
          <View style={styles.dateSelectors}>
            <TouchableOpacity 
              style={styles.dateSelector} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateSelectorText}>
                {selectedDate.format('DD')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.monthSelector} 
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.monthSelectorText}>
                {selectedDate.format('MMMM')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, styles.todayCard]}>
              <Text style={[styles.statsLabel, styles.todayLabel]}>
                {selectedDate.isSame(moment(), 'day') ? 'Hoje' : 'Dia'}
              </Text>
              <Text style={[styles.statsValue, styles.todayValue]} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(totalToday)}
              </Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Mês</Text>
              <Text style={styles.statsValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(monthlyStats.totalSpent)}
              </Text>
              <Text style={styles.statsDetail}>
                {monthlyStats.remainingDays > 0 ? `Faltam ${monthlyStats.remainingDays} dias` : 'Mês finalizado'}
              </Text>
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

        {renderDatePicker()}
        {renderMonthPicker()}
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
    marginBottom: 8,
  },
  dateSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateSelector: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  monthSelector: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    flex: 1,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  monthSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
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
  todayLabel: {
    color: '#fff',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  todayValue: {
    color: '#fff',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateGrid: {
    maxHeight: 300,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  todayButton: {
    backgroundColor: '#007AFF',
  },
  selectedDayButton: {
    backgroundColor: '#000',
  },
  dayText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  todayText: {
    color: '#fff',
  },
  selectedDayText: {
    color: '#fff',
  },
  futureDayText: {
    color: '#ccc',
  },
  monthGrid: {
    maxHeight: 300,
  },
  monthsContainer: {
    gap: 8,
  },
  monthButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedMonthButton: {
    backgroundColor: '#000',
  },
  currentMonthButton: {
    backgroundColor: '#007AFF',
  },
  monthText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  selectedMonthText: {
    color: '#fff',
  },
  futureMonthText: {
    color: '#ccc',
  },
}); 