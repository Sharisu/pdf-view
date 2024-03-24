import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

function FooterButton({title, onPress, disabled}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} disabled={disabled}>
      <Text style={disabled ? styles.textDisabled : styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    color: '#007AFF',
    fontWeight: '600',
  },
  textDisabled: {
    color: 'gray',
    fontWeight: '600',
  }
});

export default FooterButton;
