import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

interface SavedAccount {
  email: string;
  // In a real app, you should not store the password in plain text.
  // This is for demonstration purposes only.
  password?: string;
}

interface Props {
  visible: boolean;
  accounts: SavedAccount[];
  onSelect: (account: SavedAccount) => void;
  onClose: () => void;
}

const SavedAccountsModal: React.FC<Props> = ({ visible, accounts, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select an account</Text>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.accountItem} onPress={() => onSelect(item)}>
                <Text>{item.email}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  accountItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'blue',
  },
});

export default SavedAccountsModal;