import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {colors, fonts} from '../../utils';
import {
  MyButton,
  MyCalendar,
  MyHeader,
  MyInput,
  MyPicker,
} from '../../components';
import {ToastProvider, useToast} from 'react-native-toast-notifications';
import axios from 'axios';
import {apiURL, getData, storeData} from '../../utils/localStorage';
import moment from 'moment';
import {Icon} from 'react-native-elements';

export default function BuahEdit({navigation, route}) {
  const DATA_UTAMA = require('../../assets/data_utama.json');
  const DATA_BLOK = require('../../assets/data_blok.json');
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [kirim, setKirim] = useState(route.params);

  // Debug log untuk melihat data yang diterima
  useEffect(() => {
    console.log('Data yang diterima di BuahEdit:', route.params);
    console.log('Kirim state:', kirim);
    
    // Pastikan data ter-set dengan benar
    if (route.params) {
      setKirim({
        ...route.params,
        // Pastikan semua field numeric dalam format yang benar
        jjg: route.params.jjg || 0,
        mentah: route.params.mentah || 0,
        tph: route.params.tph || 1,
      });
    }
  }, [route.params]);

  const updateKirim = (key, value) => {
    setKirim({
      ...kirim,
      [key]: value,
    });
  };

  const sendData = async () => {
    try {
      getData('TBH').then(res => {
        let tmp = res ? res : [];
        let idx = tmp.findIndex(item => item.id === kirim.id);
        if (idx !== -1) {
          // Update data lama
          tmp[idx] = {...kirim};
          storeData('TBH', tmp);
          setTimeout(() => {
            toast.show('Data berhasil diubah!', {
              type: 'success',
            });
            navigation.goBack();
          }, 500);
        } else {
          toast.show('Data tidak ditemukan!', {type: 'danger'});
        }
      });
    } catch (error) {
      console.log(error);
      toast.show('Gagal mengubah data');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MyHeader title="Edit Transaksi TBS" />
      <View style={styles.innerContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <MyCalendar
            label="Tanggal"
            value={kirim.tanggal}
            onDateChange={x => updateKirim('tanggal', x)}
          />
          {/* Divisi & Komplek */}
          <View style={styles.row}>
            <View style={styles.flexRight}>
              <MyPicker
                iconname="list"
                label="Divisi"
                value={kirim.divisi}
                onChangeText={x => {
                  setKirim({
                    ...kirim,
                    divisi: x,
                    komplek: '',
                    blok: '',
                    mandor: '',
                    krani: '',
                    pemanen: '',
                  });
                }}
                data={[
                  {value: '', label: 'Pilih Divisi...'},
                  // Jika ada value, tampilkan sebagai selected
                  ...(kirim.divisi && !DATA_BLOK.some(item => item.divisi === kirim.divisi) ? 
                    [{value: kirim.divisi, label: `${kirim.divisi} (Terpilih)`}] : []),
                  ...new Map(
                    DATA_BLOK.map(item => [
                      item.divisi,
                      {value: item.divisi, label: item.divisi},
                    ]),
                  ).values(),
                ]}
              />
            </View>
            <View style={styles.flexLeft}>
              <MyPicker
                iconname="list"
                label="Komplek"
                value={kirim.komplek}
                onChangeText={x => {
                  setKirim({
                    ...kirim,
                    komplek: x,
                    blok: '',
                    mandor: '',
                    krani: '',
                    pemanen: '',
                  });
                }}
                data={[
                  {value: '', label: 'Pilih Komplek...'},
                  // Jika ada value, tampilkan sebagai selected
                  ...(kirim.komplek && !DATA_BLOK.filter(e => e.divisi === kirim.divisi).some(item => item.komplek === kirim.komplek) ? 
                    [{value: kirim.komplek, label: `${kirim.komplek} (Terpilih)`}] : []),
                  ...new Map(
                    DATA_BLOK.filter(e => e.divisi === kirim.divisi).map(
                      item => [
                        item.komplek,
                        {value: item.komplek, label: item.komplek},
                      ],
                    ),
                  ).values(),
                ]}
              />
            </View>
          </View>

          {/* Blok & Mandor */}
          <View style={styles.row}>
            <View style={styles.flexRight}>
              <MyPicker
                iconname="list"
                label="Blok"
                value={kirim.blok}
                onChangeText={x => {
                  setKirim({
                    ...kirim,
                    blok: x,
                    mandor: '',
                    krani: '',
                    pemanen: '',
                  });
                }}
                data={[
                  {value: '', label: 'Pilih Blok...'},
                  // Jika ada value, tampilkan sebagai selected
                  ...(kirim.blok && !DATA_BLOK.filter(e => e.komplek === kirim.komplek).some(item => item.blok === kirim.blok) ? 
                    [{value: kirim.blok, label: `${kirim.blok} (Terpilih)`}] : []),
                  ...new Map(
                    DATA_BLOK.filter(e => e.komplek === kirim.komplek).map(
                      item => [item.blok, {value: item.blok, label: item.blok}],
                    ),
                  ).values(),
                ]}
              />
            </View>
            <View style={styles.flexLeft}>
              <MyPicker
                iconname="list"
                label="Mandor"
                value={kirim.mandor}
                onChangeText={x => {
                  setKirim({
                    ...kirim,
                    mandor: x,
                    krani: '',
                    pemanen: '',
                  });
                }}
                data={[
                  {value: '', label: 'Pilih Mandor...'},
                  // Jika ada value, tampilkan sebagai selected
                  ...(kirim.mandor && !DATA_UTAMA.filter(e => e.divisi === kirim.divisi && e.tipe === 'TBH').some(item => item.mandor === kirim.mandor) ? 
                    [{value: kirim.mandor, label: `${kirim.mandor} (Terpilih)`}] : []),
                  ...new Map(
                    DATA_UTAMA.filter(
                      e => e.divisi === kirim.divisi && e.tipe === 'TBH',
                    ).map(item => [
                      item.mandor,
                      {value: item.mandor, label: item.mandor},
                    ]),
                  ).values(),
                ]}
              />
            </View>
          </View>

          {/* Krani & Pemanen */}
          <View style={styles.row}>
            <View style={styles.flexRight}>
              <MyPicker
                iconname="list"
                label="Krani"
                value={kirim.krani}
                onChangeText={x => {
                  setKirim({
                    ...kirim,
                    krani: x,
                    pemanen: '',
                  });
                }}
                data={[
                  {value: '', label: 'Pilih Krani...'},
                  // Jika ada value, tampilkan sebagai selected
                  ...(kirim.krani && !DATA_UTAMA.filter(e => e.divisi === kirim.divisi && e.tipe === 'TBH' && e.mandor === kirim.mandor).some(item => item.krani === kirim.krani) ? 
                    [{value: kirim.krani, label: `${kirim.krani} (Terpilih)`}] : []),
                  ...new Map(
                    DATA_UTAMA.filter(
                      e =>
                        e.divisi === kirim.divisi &&
                        e.tipe === 'TBH' &&
                        e.mandor === kirim.mandor,
                    ).map(item => [
                      item.krani,
                      {value: item.krani, label: item.krani},
                    ]),
                  ).values(),
                ]}
              />
            </View>
            <View style={styles.flexLeft}>
              <MyPicker
                iconname="list"
                label="Pemanen"
                value={kirim.pemanen}
                onChangeText={x => {
                  setKirim({
                    ...kirim,
                    pemanen: x,
                  });
                }}
                data={[
                  {value: '', label: 'Pilih Pemanen...'},
                  // Jika ada value, tampilkan sebagai selected
                  ...(kirim.pemanen && !DATA_UTAMA.filter(e => e.divisi === kirim.divisi && e.tipe === 'TBH' && e.mandor === kirim.mandor).some(item => item.pemanen === kirim.pemanen) ? 
                    [{value: kirim.pemanen, label: `${kirim.pemanen} (Terpilih)`}] : []),
                  ...new Map(
                    DATA_UTAMA.filter(
                      e =>
                        e.divisi === kirim.divisi &&
                        e.tipe === 'TBH' &&
                        e.mandor === kirim.mandor,
                    ).map(item => [
                      item.pemanen,
                      {value: item.pemanen, label: item.pemanen},
                    ]),
                  ).values(),
                ]}
              />
            </View>
          </View>

          {/* Basis */}
          <MyInput
            label="Basis (JJG)"
            value={kirim.basis}
            onChangeText={x => updateKirim('basis', x)}
          />

          {/* TPH & JJG */}
          <View style={styles.row}>
            <View style={styles.flexRight}>
              <MyPicker
                filter={false}
                iconname="list"
                label="TPH"
                value={kirim.tph}
                onChangeText={x => {
                  setKirim({
                    ...kirim,
                    tph: x,
                  });
                }}
                data={[
                  // Jika ada value tph yang sudah dipilih, tampilkan sebagai selected
                  ...(kirim.tph ? [{label: `${kirim.tph} (Terpilih)`, value: kirim.tph}] : []),
                  ...Array.from({length: 120}, (_, i) => ({
                    label: i + 1,
                    value: i + 1,
                  }))
                ]}
              />
            </View>
            <View style={styles.flexLeft}>
              <Text style={styles.label}>JJG</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  onPress={() =>
                    updateKirim(
                      'jjg',
                      Math.max((parseInt(kirim.jjg) || 0) - 1, 0),
                    )
                  }
                  style={styles.counterButton}>
                  <Icon type="ionicon" name="remove" color={colors.white} />
                </TouchableOpacity>
                <TextInput
                  style={styles.counterInput}
                  keyboardType="numeric"
                  value={String(kirim.jjg || '')}
                  onChangeText={x => updateKirim('jjg', x)}
                />
                <TouchableOpacity
                  onPress={() =>
                    updateKirim('jjg', (parseInt(kirim.jjg) || 0) + 1)
                  }
                  style={styles.counterButton}>
                  <Icon type="ionicon" name="add" color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mentah & Denda */}
          <View style={styles.row}>
            <View style={styles.flexRight}>
              <Text style={styles.label}>Mentah</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  onPress={() =>
                    updateKirim(
                      'mentah',
                      Math.max((parseInt(kirim.mentah) || 0) - 1, 0),
                    )
                  }
                  style={styles.counterButton}>
                  <Icon type="ionicon" name="remove" color={colors.white} />
                </TouchableOpacity>
                <TextInput
                  style={styles.counterInput}
                  keyboardType="numeric"
                  value={String(kirim.mentah || '')}
                  onChangeText={x => updateKirim('mentah', x)}
                />
                <TouchableOpacity
                  onPress={() =>
                    updateKirim('mentah', (parseInt(kirim.mentah) || 0) + 1)
                  }
                  style={styles.counterButton}>
                  <Icon type="ionicon" name="add" color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.flexLeft}>
              <Text style={styles.label}>Denda</Text>
              <Text style={styles.dendaText}>
                Rp{(parseFloat(kirim.mentah || 0) * 10000).toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : (
          <MyButton onPress={sendData} title="Simpan Perubahan" />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRight: {
    flex: 1,
    paddingRight: 5,
  },
  flexLeft: {
    flex: 1,
    paddingLeft: 5,
  },
  label: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    marginTop: 10,
  },
  dendaText: {
    fontFamily: fonts.secondary[600],
    fontSize: 16,
    marginTop: 10,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  counterButton: {
    padding: 10,
    width: 50,
    backgroundColor: colors.primary,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 60,
    height: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 10,
  },
});