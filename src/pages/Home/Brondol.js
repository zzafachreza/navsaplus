import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Color, colors, fonts} from '../../utils';
import {MyButton, MyCalendar, MyHeader} from '../../components';
import {useIsFocused} from '@react-navigation/native';
import {getData, storeData, MYAPP} from '../../utils/localStorage';
import {Icon} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import moment from 'moment';
import RNFS from 'react-native-fs';
import {Platform, PermissionsAndroid} from 'react-native';
import Share from 'react-native-share'; // jika ingin share file
import * as XLSX from 'xlsx';

export default function Brondol({navigation, route}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const toast = useToast();

  // Ambil data transaksi BRONDOL
  const getTransaksi = async tgl => {
    try {
      setLoading(true);
      let res = await getData('BRONDOL');
      setData(res ? res.filter(i => i.tanggal == tgl) : []);
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getTransaksi(filter);
    }
  }, [isFocused]);

  const downloadExcel = async () => {
    try {
      // Data yang akan di-export, misal data TBH dari state 'data'
      // Ganti 'data' sesuai variabel kamu
      let exportData = data.map(item => ({
        Tanggal: item.tanggal,
        Divisi: item.divisi,
        Komplek: item.komplek,
        Blok: item.blok,
        Mandor: item.mandor,
        Krani: item.krani,
        Pemanen: item.pemanen,
        TPH: item.tph,
        KG: item.jjg,
      }));

      // Step 1: Buat worksheet dan workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transaksi BRONDOL');

      // Step 2: Convert ke file excel (biner)
      const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});

      // Step 3: Simpan ke file (Android/iOS Path)
      const fileName = `Transaksi_BRONDOL_${Date.now()}.xlsx`;
      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, wbout, 'ascii');

      // // Jika ingin langsung share file:
      await Share.open({url: `file://${path}`});
    } catch (error) {
      console.log(error);
    }
  };

  // Fungsi hapus transaksi berdasarkan ID
  const hapusTransaksi = id => {
    Alert.alert(MYAPP, 'Yakin akan hapus transaksi ini?', [
      {text: 'TIDAK'},
      {
        text: 'HAPUS',
        style: 'destructive',
        onPress: async () => {
          try {
            let res = await getData('BRONDOL');
            let arr = res ? res : [];
            let arrBaru = arr.filter(i => i.id !== id);
            await storeData('BRONDOL', arrBaru);
            toast.show('Transaksi berhasil dihapus', {type: 'success'});
            getTransaksi();
          } catch (error) {
            console.log(error);
            toast.show('Gagal menghapus transaksi', {type: 'danger'});
          }
        },
      },
    ]);
  };

  // Render item untuk FlatList
  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <View style={{flex: 1}}>
        <Text style={styles.namaText}>
          {item.divisi} - {item.komplek} - {item.blok}
        </Text>
        <Text style={styles.tanggalText}>
          {moment(item.tanggal).format('dddd, DD MMMM YYYY')}
        </Text>
        <Text style={styles.pemanenText}>Pemanen: {item.pemanen}</Text>
        <Text style={styles.kraniText}>Krani: {item.krani}</Text>
        <Text style={styles.mandorText}>Mandor: {item.mandor}</Text>
        <Text style={styles.tphText}>TPH: {item.tph}</Text>
        <Text style={styles.nominalText}>KG: {item.jjg || 0}</Text>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('BrondolEdit', item)}>
        <Icon
          type="ionicon"
          name="create-outline"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => hapusTransaksi(item.id)}
        style={{marginLeft: 10}}>
        <Icon
          type="ionicon"
          name="trash-outline"
          size={24}
          color={colors.danger}
        />
      </TouchableOpacity>
    </View>
  );

  const [filter, setFilter] = useState(moment().format('YYYY-MM-DD'));

  return (
    <SafeAreaView style={styles.container}>
      <MyHeader
        backgroundColor={colors.secondary}
        title="Hasil Transaksi BRONDOL"
      />
      <View style={styles.content}>
        <MyCalendar
          label="Filter Tanggal"
          value={filter}
          onDateChange={x => {
            setFilter(x);
            getTransaksi(x);
          }}
        />
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            !loading && (
              <Text style={styles.emptyText}>
                Belum ada transaksi BRONDOL yang tercatat.
              </Text>
            )
          }
        />
      </View>
      <View style={styles.buttonContainer}>
        <View
          style={{
            flex: 1,
          }}>
          <MyButton
            warna={colors.secondary}
            onPress={() => navigation.navigate('BrondolAdd')}
            title="Tambah"
          />
        </View>
        <View
          style={{
            flex: 1,
          }}>
          <MyButton
            warna={colors.success}
            onPress={downloadExcel}
            title="Download"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary + '33',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    backgroundColor: colors.white,
    marginVertical: 4,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  namaText: {
    fontFamily: fonts.secondary[800],
    fontSize: 15,
    color: colors.black,
  },
  tanggalText: {
    fontFamily: fonts.secondary[600],
    fontSize: 12,
    color: Color.blueGray[500],
  },
  nominalText: {
    fontFamily: fonts.secondary[800],
    fontSize: 20,
    color: colors.black,
  },
  basisText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.black,
  },
  pemanenText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.black,
  },
  kraniText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.black,
  },
  mandorText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.black,
  },
  tphText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.black,
  },
  mentahText: {
    fontFamily: fonts.secondary[400],
    fontSize: 13,
    color: colors.black,
  },
  dendaText: {
    fontFamily: fonts.secondary[600],
    fontSize: 13,
    color: colors.danger,
  },
  buttonContainer: {
    padding: 10,
    flexDirection: 'row',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.black,
    fontFamily: fonts.secondary[400],
  },
});
