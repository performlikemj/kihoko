import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ArtCard from '../components/ArtCard';

const DATA = [
  {
    id: '1',
    title: 'Project One',
    image: { uri: 'https://placekitten.com/300/300' },
  },
  {
    id: '2',
    title: 'Project Two',
    image: { uri: 'https://placekitten.com/301/301' },
  },
  {
    id: '3',
    title: 'Project Three',
    image: { uri: 'https://placekitten.com/302/302' },
  },
];

export default function PortfolioScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <ArtCard
      title={item.title}
      image={item.image}
      onPress={() => navigation.navigate('ArtDetail', { item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
});
