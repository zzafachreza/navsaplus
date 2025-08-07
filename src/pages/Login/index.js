import {View, Text} from 'react-native';
import React from 'react';
import {colors, fonts, windowWidth} from '../../utils';
import {useToast} from 'react-native-toast-notifications';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {MyButton, MyGap, MyInput} from '../../components';
import {useState} from 'react';
import SoundPlayer from 'react-native-sound-player';
import axios from 'axios';
import {apiURL, storeData} from '../../utils/localStorage';
import MyLoading from '../../components/MyLoading';
import {TouchableOpacity} from 'react-native';
import {Image} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native';
import {Pressable} from 'react-native';
export default function Login({navigation, route}) {
  const [kirim, setKirim] = useState({
    nomor_krani: '',
    nama_krani: '',
  });

  const toast = useToast();
  const updateKirim = (x, v) => {
    setKirim({
      ...kirim,
      [x]: v,
    });
  };
  const [loading, setLoading] = useState(false);
  const sendData = () => {
    if (kirim.nomor_krani.length == 0) {
      toast.show('No. Induk krani panen masih kosong !');
    } else if (kirim.nama_krani.length == 0) {
      toast.show('Nama krani panen masih kosong !');
    } else {
      console.log(kirim);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        storeData('user', kirim);
        navigation.replace('MainApp');
      }, 500);
    }
  };
  return (
    <View style={{flex: 1, backgroundColor: colors.white}}>
      <View
        style={{
          // flex: 0.5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{
            width: 200,
            height: 200,
          }}
        />
      </View>

      <View
        style={{
          flex: 1,
          padding: 20,
        }}>
        <Pressable
          onPress={() => navigation.navigate('Buah')}
          style={{
            marginVertical: 10,
            padding: 10,
            backgroundColor: colors.white,
            borderWidth: 3,
            borderColor: colors.primary,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage
            source={require('../../assets/a1.png')}
            style={{
              width: 120,
              height: 120,
            }}
          />
          <Text
            style={{
              fontFamily: fonts.secondary[800],
              fontSize: 30,
              color: colors.primary,
            }}>
            TBS
          </Text>
        </Pressable>
        <TouchableOpacity
          onPress={() => navigation.navigate('Brondol')}
          style={{
            marginVertical: 10,
            padding: 10,
            backgroundColor: colors.white,
            borderWidth: 3,
            borderColor: colors.secondary,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage
            source={require('../../assets/a2.png')}
            style={{
              width: 120,
              height: 120,
            }}
          />
          <Text
            style={{
              fontFamily: fonts.secondary[800],
              fontSize: 30,
              color: colors.secondary,
            }}>
            BRONDOL
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
