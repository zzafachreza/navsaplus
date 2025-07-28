import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { colors, fonts } from '../../utils'
import { MyHeader } from '../../components'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function DetailRiwayat({navigation, route}) {
  const { riwayat } = route.params;

  const deleteRiwayat = async () => {
    Alert.alert(
      "Hapus Riwayat",
      "Apakah Anda yakin ingin menghapus riwayat ini?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const savedHistory = await AsyncStorage.getItem('potongBuahHistory');
              if (savedHistory) {
                const history = JSON.parse(savedHistory);
                const updatedHistory = history.filter(item => item.id !== riwayat.id);
                await AsyncStorage.setItem('potongBuahHistory', JSON.stringify(updatedHistory));
                Alert.alert("Berhasil", "Riwayat berhasil dihapus");
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting history:', error);
              Alert.alert("Error", "Gagal menghapus riwayat");
            }
          }
        }
      ]
    );
  };

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MyHeader 
        title="Detail Riwayat" 
        onPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          
          {/* Header Card */}
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>{riwayat.nama}</Text>
            <Text style={styles.headerSubtitle}>No. Induk: {riwayat.noInduk}</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                {new Date(riwayat.date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          {/* Detail Information */}
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Informasi Potong Buah</Text>
            
            <DetailRow label="Blok" value={riwayat.blok} />
            <DetailRow label="Basis (JJG)" value={riwayat.basisJJG} />
            <DetailRow label="No. TPH" value={riwayat.tph} />
            <DetailRow label="Jumlah JJG" value={riwayat.jumlahJJG} />
            <DetailRow label="Janjang Kosong" value={riwayat.janjangKosong} />
            <DetailRow label="Janjang Dibayar" value={riwayat.janjangDibayar} />
            <DetailRow label="Denda" value={riwayat.denda} />
            <DetailRow label="Keterangan Lain" value={riwayat.lainLain} />
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Ringkasan</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total JJG</Text>
                <Text style={styles.summaryValue}>{riwayat.jumlahJJG || '0'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Janjang Kosong</Text>
                <Text style={styles.summaryValue}>{riwayat.janjangKosong || '0'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Janjang Dibayar</Text>
                <Text style={styles.summaryValue}>{riwayat.janjangDibayar || '0'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Basis JJG</Text>
                <Text style={styles.summaryValue}>{riwayat.basisJJG || '0'}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                // Navigate to edit page if needed
                Alert.alert("Info", "Fitur edit akan tersedia di update selanjutnya");
              }}
            >
              <Text style={styles.editButtonText}>Edit Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={deleteRiwayat}
            >
              <Text style={styles.deleteButtonText}>Hapus Riwayat</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.primary[700],
    fontSize: 20,
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: fonts.primary[500],
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontFamily: fonts.primary[500],
    fontSize: 12,
    color: 'white',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: fonts.primary[700],
    fontSize: 16,
    color: colors.dark,
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontFamily: fonts.primary[500],
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    color: colors.dark,
    flex: 1,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontFamily: fonts.primary[400],
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryValue: {
    fontFamily: fonts.primary[700],
    fontSize: 18,
    color: colors.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  editButtonText: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#ff4757',
  },
  deleteButtonText: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    color: 'white',
  },
});