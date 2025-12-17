import {View, Text, TouchableOpacity, StatusBar, TextInput, Image, Platform, ScrollView} from 'react-native';
import type {ViewStyle} from 'react-native';
import {router} from "expo-router";
import {useState} from "react";

export default function Inici_sessio() {

    const containerStyle: ViewStyle = Platform.OS === "web"
        ? {width: "33%", alignSelf: "center", minWidth: 350}
        : {width: "100%"};

    const [Usuari, setUsuari] = useState("");

    const [Contrasenya, setContrasenya] = useState("");

    const [loged, setLoged] = useState(false);

    function iniciarSessio() {

        fetch(`http://localhost:3000/player?Usuari=${encodeURIComponent(Usuari)}`, {
            method: 'GET',
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.error) {
                    alert(data.error);
                } else if (data.usuari) {
                    if (data.usuari.password === Contrasenya && data.usuari.nombre === Usuari) {
                        alert('Usuari iniciat sessió correctamente');
                        setLoged(true);
                        router.push('/inicio');
                    } else {
                        alert('Usuari o contrasenya incorrectes');
                    }
                } else {
                    alert('Resposta inesperada del servidor');
                }
            })
            .catch((err) => {
                console.error(err);
                alert('Error de connexió');
            });
    }


    return (
        <ScrollView style={{backgroundColor: 'black'}}>
            <View style={{flex: 1, backgroundColor: 'black', justifyContent: 'center', paddingHorizontal: 30}}>
                <StatusBar/>
                <View style={{alignItems: 'center', marginBottom: 40}}>
                    <Text style={{color: '#fff', fontSize: 50, fontWeight: 'bold'}}>
                        Fantasy Gamer
                    </Text>
                </View>
                <View style={[containerStyle]}>
                    <Text style={{color: '#fff', fontSize: 18, marginBottom: 5}}>Usuari</Text>
                    <TextInput
                        placeholder="Usuari"
                        placeholderTextColor="#bbb"
                        style={{
                            backgroundColor: '#1c1c1c',
                            color: 'white',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 20,
                            fontSize: 16,
                        }}
                        onChangeText={(text) => setUsuari(text)}
                    />
                    <Text style={{color: '#fff', fontSize: 18, marginBottom: 5}}>Contrasenya</Text>
                    <TextInput
                        placeholder="Contrasenya"
                        placeholderTextColor="#bbb"
                        secureTextEntry
                        style={{
                            backgroundColor: '#1c1c1c',
                            color: 'white',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 30,
                            fontSize: 16,
                        }}
                        onChangeText={(text) => setContrasenya(text)}

                    />
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#3684B5',
                            paddingVertical: 15,
                            borderRadius: 10,
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            console.log({Usuari}, {Contrasenya})
                            if (Usuari && Contrasenya) {
                                iniciarSessio();
                            } else {
                                alert('Camps buits');
                            }
                        }}
                    >
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>
                            Iniciar sessió
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{alignItems: 'center', marginTop: 40}}>
                    <Image
                        source={require('../assets/images/user.jpg')}
                        style={{width: 150, height: 150, borderRadius: 75, opacity: 0.8}}
                    />
                </View>
            </View>
        </ScrollView>
    );
}