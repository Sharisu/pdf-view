import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

function PdfListItem({title, onPress, disabled = false}) {
  return (
    <TouchableOpacity style={styles.container} disabled={disabled}
                      onPress={onPress}>
      <Text style={styles.text}>
        {title}
        <Text style={styles.textFileExtension}>
          .pdf
        </Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    flex: 1,
  },
  text: {
    fontSize: 14,
  },
  textFileExtension: {
    fontSize: 14,
    color: '#a4a4a4',
  },
});

export default PdfListItem;
