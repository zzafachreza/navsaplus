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
  const [filter, setFilter] = useState(moment().format('YYYY-MM-DD'));

  // Ambil data transaksi BRONDOL - PERBAIKAN: tambahkan parameter default
  const getTransaksi = async (tgl = filter) => {
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
    // Cek apakah ada data untuk di-export
    if (data.length === 0) {
      toast.show('Tidak ada data untuk di-export', {type: 'warning'});
      return;
    }

    console.log('Data yang akan di-export:', data); // Debug log

    // Buat workbook dan worksheet
    const wb = XLSX.utils.book_new();
    
    // Data untuk worksheet - FORMAT SEDERHANA seperti TBS
    const wsData = [];
    
    // BARIS 1: Header kolom (PERSIS seperti template TBS tapi untuk Brondol)
    wsData.push([
      'Tanggal',
      'Divisi', 
      'Komplek',
      'Blok',
      'Mandor',
      'Krani', 
      'Pembrondol',
      'TPH',
      'KG'
    ]);
    
    // BARIS 2 dan seterusnya: Data transaksi
    data.forEach((item) => {
      // Convert semua angka dengan benar dan handle undefined/null
      const tph = item.tph ? String(item.tph) : '';
      const kg = item.jjg ? String(item.jjg) : '0'; // Di brondol, jjg adalah KG
      
      wsData.push([
        item.tanggal || '', // Tanggal (format YYYY-MM-DD)
        item.divisi || '', // Divisi
        item.komplek || '', // Komplek  
        item.blok || '', // Blok
        item.mandor || '', // Mandor (sudah include NIK - NAMA)
        item.krani || '', // Krani (sudah include NIK - NAMA)
        item.pemanen || '', // Pembrondol (di data disimpan sebagai pemanen)
        tph, // TPH (sebagai string)
        kg // KG (sebagai string)
      ]);
    });

    console.log('Final Worksheet Data:', wsData); // Debug log

    // Buat worksheet dari array
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths sesuai kebutuhan data
    ws['!cols'] = [
      {wch: 15}, // A: Tanggal (diperlebar)
      {wch: 12}, // B: Divisi
      {wch: 18}, // C: Komplek
      {wch: 10}, // D: Blok
      {wch: 30}, // E: Mandor (NIK - NAMA butuh space lebih)
      {wch: 30}, // F: Krani (NIK - NAMA butuh space lebih)
      {wch: 30}, // G: Pembrondol (NIK - NAMA butuh space lebih)
      {wch: 10}, // H: TPH
      {wch: 12}  // I: KG
    ];

    // Styling untuk header row
    const headerStyle = {
      font: { bold: true, name: 'Arial', sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: 'E0E0E0' } }, // Background abu-abu muda
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Styling untuk data rows
    const dataStyle = {
      font: { name: 'Arial', sz: 10 },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Apply styling ke header (row 1)
    for (let col = 0; col < 9; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
      ws[cellAddress].s = headerStyle;
    }

    // Apply styling ke data rows
    for (let row = 1; row < wsData.length; row++) {
      for (let col = 0; col < 9; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
        
        // Gunakan data style untuk semua kolom
        ws[cellAddress].s = dataStyle;
      }
    }

    // Set range untuk print area dan freeze panes
    ws['!ref'] = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: 8, r: wsData.length - 1 }
    });

    // Freeze first row (header)
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Append worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi Brondol');

    // Generate file Excel
    const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xls' }); // Format .xls
    
    // Nama file sesuai format client: BKTB_tanggal_divisi.xls
    const tanggalFormat = moment(filter).format('DDMMYYYY');
    const divisiData = data[0]?.divisi || 'SWTA';
    // Clean divisi name (hilangkan space dan karakter khusus)
    const divisiClean = divisiData.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `BKTB_${tanggalFormat}_${divisiClean}.xls`;
    
    const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    await RNFS.writeFile(path, wbout, 'ascii');

    toast.show(`File berhasil disimpan: ${fileName}`, { type: 'success' });

    // Share file
    await Share.open({ url: `file://${path}` });
    
  } catch (error) {
    console.log('Download Excel Error:', error);
    toast.show('Gagal membuat file Excel', { type: 'danger' });
  }
};
  // PERBAIKAN: Fungsi hapus transaksi berdasarkan ID - panggil getTransaksi dengan filter aktif
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
            // PERBAIKAN: panggil getTransaksi dengan filter yang sedang aktif
            getTransaksi(filter);
          } catch (error) {
            console.log(error);
            toast.show('Gagal menghapus transaksi', {type: 'danger'});
          }
        },
      },
    ]);
  };

  // PERBAIKAN: Render item untuk FlatList - ubah Pemanen menjadi Pembrondol
  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <View style={{flex: 1}}>
        <Text style={styles.namaText}>
          {item.divisi} - {item.komplek} - {item.blok}
        </Text>
        <Text style={styles.tanggalText}>
          {moment(item.tanggal).format('dddd, DD MMMM YYYY')}
        </Text>
        <Text style={styles.pemanenText}>Pembrondol: {item.pemanen}</Text>
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
    fontFamily: fonts.secondary[700],
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