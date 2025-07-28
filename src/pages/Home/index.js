import {StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, TouchableNativeFeedback, FlatList} from 'react-native';
import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, fonts, MyDimensi} from '../../utils';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {MyButton, MyGap, MyInput} from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

export default function Home({navigation}) {
  const [user] = useState({});
  const [step, setStep] = useState(1); // 1: input dasar, 2: input detail
  const [formData, setFormData] = useState({
    noInduk: '',
    nama: '',
    blok: '',
    basisJJG: '',
    tph: '',
    jumlahJJG: '',
    janjangKosong: '',
    janjangDibayar: '',
    denda: '',
    lainLain: ''
  });
  const [history, setHistory] = useState([]);

  // Load history from storage on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('potongBuahHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveToHistory = async () => {
    try {
      const newEntry = {
        ...formData,
        id: Date.now().toString(), // Add unique ID for each entry
        date: new Date().toISOString()
      };
      
      const updatedHistory = [...history, newEntry];
      await AsyncStorage.setItem('potongBuahHistory', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      
      // Reset form after save
      setFormData({
        noInduk: '',
        nama: '',
        blok: '',
        basisJJG: '',
        tph: '',
        jumlahJJG: '',
        janjangKosong: '',
        janjangDibayar: '',
        denda: '',
        lainLain: ''
      });
      setStep(1);
      
      alert('Data berhasil disimpan!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const navigateToDetail = (product) => {
    navigation.navigate('ProdukDetail', { product });
  };

  const navigateToDetailRiwayat = (item) => {
    navigation.navigate('DetailRiwayat', { riwayat: item });
  };

  const renderStep1 = () => (
    <View style={{padding: 20}}>
      <MyInput 
        label="No. Induk" 
        placeholder="Masukan Nomor Induk"
        value={formData.noInduk}
        onChangeText={(text) => handleInputChange('noInduk', text)}
      />
      <MyInput 
        label="Nama Lengkap" 
        placeholder="Masukan Nama Lengkap"
        value={formData.nama}
        onChangeText={(text) => handleInputChange('nama', text)}
      />

      <TouchableNativeFeedback
        onPress={() => {
          if (formData.noInduk && formData.nama) {
            setStep(2);
          } else {
            alert('Harap isi No. Induk dan Nama Lengkap terlebih dahulu');
          }
        }}
      >
        <View style={styles.nextButton}>
          <Text style={styles.buttonText}>Selanjutnya</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );

  const renderStep2 = () => (
    <View style={{padding: 20}}>
      <Text style={styles.stepTitle}>Data Potong Buah</Text>
      <Text style={styles.userInfo}>No. Induk: {formData.noInduk}</Text>
      <Text style={styles.userInfo}>Nama: {formData.nama}</Text>
      
      <MyInput 
        label="Blok" 
        placeholder="Masukan Blok"
        value={formData.blok}
        onChangeText={(text) => handleInputChange('blok', text)}
      />
      <MyInput 
        label="Basis (JJG)" 
        placeholder="Masukan Basis JJG"
        value={formData.basisJJG}
        onChangeText={(text) => handleInputChange('basisJJG', text)}
        keyboardType="numeric"
      />
      <MyInput 
        label="No. TPH" 
        placeholder="Masukan No. TPH"
        value={formData.tph}
        onChangeText={(text) => handleInputChange('tph', text)}
      />
      <MyInput 
        label="Jumlah JJG" 
        placeholder="Masukan Jumlah JJG"
        value={formData.jumlahJJG}
        onChangeText={(text) => handleInputChange('jumlahJJG', text)}
        keyboardType="numeric"
      />
      <MyInput 
        label="Janjang Kosong" 
        placeholder="Masukan Janjang Kosong"
        value={formData.janjangKosong}
        onChangeText={(text) => handleInputChange('janjangKosong', text)}
        keyboardType="numeric"
      />
      <MyInput 
        label="Janjang Dibayar" 
        placeholder="Masukan Janjang Dibayar"
        value={formData.janjangDibayar}
        onChangeText={(text) => handleInputChange('janjangDibayar', text)}
        keyboardType="numeric"
      />
      <MyInput 
        label="Denda" 
        placeholder="Masukan Denda"
        value={formData.denda}
        onChangeText={(text) => handleInputChange('denda', text)}
      />
      <MyInput 
        label="Lain-lain" 
        placeholder="Masukan Keterangan Lain"
        value={formData.lainLain}
        onChangeText={(text) => handleInputChange('lainLain', text)}
      />

      <View style={styles.buttonGroup}>
        <TouchableNativeFeedback onPress={() => setStep(1)}>
          <View style={[styles.actionButton, {backgroundColor: colors.secondary}]}>
            <Text style={styles.buttonText}>Kembali</Text>
          </View>
        </TouchableNativeFeedback>
        
        <TouchableNativeFeedback onPress={saveToHistory}>
          <View style={styles.actionButton}>
            <Text style={styles.buttonText}>Simpan</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  );

  const renderHistoryItem = ({item}) => (
    <TouchableOpacity 
      style={styles.historyCard} 
      onPress={() => navigateToDetailRiwayat(item)}
      activeOpacity={0.8}
    >
      <View style={styles.historyCardHeader}>
        <View style={styles.historyCardTitle}>
          <Text style={styles.historyName}>{item.nama}</Text>
          <Text style={styles.historyNoInduk}>No. Induk: {item.noInduk}</Text>
        </View>
        <View style={styles.historyCardBadge}>
          <Text style={styles.badgeText}>Blok {item.blok}</Text>
        </View>
      </View>
      
      <View style={styles.historyCardContent}>
        <View style={styles.historyRow}>
          <View style={styles.historyColumn}>
            <Text style={styles.historyLabel}>Basis JJG</Text>
            <Text style={styles.historyValue}>{item.basisJJG || '-'}</Text>
          </View>
          <View style={styles.historyColumn}>
            <Text style={styles.historyLabel}>Jumlah JJG</Text>
            <Text style={styles.historyValue}>{item.jumlahJJG || '-'}</Text>
          </View>
          <View style={styles.historyColumn}>
            <Text style={styles.historyLabel}>No. TPH</Text>
            <Text style={styles.historyValue}>{item.tph || '-'}</Text>
          </View>
        </View>
        
        <View style={styles.historyRow}>
          <View style={styles.historyColumn}>
            <Text style={styles.historyLabel}>Janjang Kosong</Text>
            <Text style={styles.historyValue}>{item.janjangKosong || '-'}</Text>
          </View>
          <View style={styles.historyColumn}>
            <Text style={styles.historyLabel}>Janjang Dibayar</Text>
            <Text style={styles.historyValue}>{item.janjangDibayar || '-'}</Text>
          </View>
          <View style={styles.historyColumn}>
            <Text style={styles.historyLabel}>Denda</Text>
            <Text style={styles.historyValue}>{item.denda || '-'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.historyCardFooter}>
        <Text style={styles.historyDate}>
          {new Date(item.date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={styles.detailText}>Tap untuk detail →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, '#ffffff']}
        style={styles.headerGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Selamat datang,</Text>
            <Text style={styles.greetingText}>{user.nama_lengkap || 'User'}</Text>
          </View>
          <FastImage
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {step === 1 ? renderStep1() : renderStep2()}
        
        {/* History Section */}
        {history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Riwayat Input ({history.length})</Text>
            <FlatList
              data={history.reverse()} // Show latest first
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => item.id || index.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{height: 12}} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    paddingBottom: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    top: 10
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  greetingText: {
    fontFamily: fonts.secondary[600],
    fontSize: 20,
    color: 'white',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  nextButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  },
  buttonText: {
    fontFamily: fonts.primary[600],
    color: colors.white,
    textAlign: 'center'
  },
  stepTitle: {
    fontFamily: fonts.primary[700],
    fontSize: 18,
    color: colors.dark,
    marginBottom: 15,
    textAlign: 'center'
  },
  userInfo: {
    fontFamily: fonts.primary[600],
    fontSize: 14,
    color: colors.dark,
    marginBottom: 10
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  actionButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: "center",
    width: '48%'
  },
  historyContainer: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.primary[700],
    fontSize: 18,
    color: colors.dark,
    marginBottom: 20,
    textAlign: 'center'
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyCardTitle: {
    flex: 1,
  },
  historyName: {
    fontFamily: fonts.primary[700],
    fontSize: 16,
    color: colors.dark,
    marginBottom: 4,
  },
  historyNoInduk: {
    fontFamily: fonts.primary[500],
    fontSize: 12,
    color: '#666',
  },
  historyCardBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: fonts.primary[600],
    fontSize: 11,
    color: 'white',
  },
  historyCardContent: {
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyColumn: {
    flex: 1,
    alignItems: 'center',
  },
  historyLabel: {
    fontFamily: fonts.primary[400],
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
    textAlign: 'center',
  },
  historyValue: {
    fontFamily: fonts.primary[600],
    fontSize: 13,
    color: colors.dark,
    textAlign: 'center',
  },
  historyCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  historyDate: {
    fontFamily: fonts.primary[400],
    fontSize: 11,
    color: '#888',
    flex: 1,
  },
  detailText: {
    fontFamily: fonts.primary[500],
    fontSize: 11,
    color: colors.primary,
  },
});