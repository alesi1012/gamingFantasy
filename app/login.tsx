import {View, Text, TouchableOpacity, StatusBar, Image, ScrollView} from 'react-native';
import { router } from "expo-router";


export default function  Login () {

    return (
        <ScrollView style={{ backgroundColor: 'black'}}>
            <View style={{flex: 1}}>
                <StatusBar/>
                <View style={{alignItems: 'center'}}>
                    <Text style={{color: '#fff', fontSize: 50, fontWeight: 'bold'}}>
                        Fantasy Gamer
                    </Text>
                    <Text style={{color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 40}}>
                        Registrat o iniciar sessió
                    </Text>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#3684B5',
                            paddingVertical: 12,
                            paddingHorizontal: 25,
                            borderRadius: 8,
                            marginTop: 100,
                        }}
                        onPress={() => router.push("/inici_sessio")}
                    >
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>Iniciar sessió</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#3684B5',
                            paddingVertical: 12,
                            paddingHorizontal: 25,
                            borderRadius: 8,
                            marginTop: 70,
                        }}
                        onPress={() => router.push("/registre")}
                    >
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>Registrar</Text>
                    </TouchableOpacity>
                    <Image
                        source={require('../assets/images/user.jpg')}
                        style={{width: 150, height: 150, borderRadius: 75, marginTop: 50}}
                    />
                </View>
            </View>
        </ScrollView>
    );
};
