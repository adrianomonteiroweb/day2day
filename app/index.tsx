import { View, StatusBar } from 'react-native';
import DailyExpenses from './components/DailyExpenses';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <DailyExpenses />
    </View>
  );
} 