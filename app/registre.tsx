import {View, Text, TouchableOpacity, StatusBar, TextInput, Platform, ScrollView} from 'react-native';
import type {ViewStyle} from 'react-native';
import {useState} from "react";
import {router} from "expo-router";

export default function Registre() {

    const [Usuari, setUsuari] = useState("");
    const [Correu, setCorreu] = useState("");
    const [Idsupercell, setIdSupercell] = useState("");
    const [Contrasenya, setContrasenya] = useState("");
    const [CContrasenya, setCContrasenya] = useState("");


    const containerStyle: ViewStyle = Platform.OS === "web"
        ? {
            width: "33%",
            minWidth: 350,
            alignSelf: "center"
        }
        : {
            width: "100%",
        };

    function registrar() {

        fetch('http://localhost:5432/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Usuari,
                Correu,
                Contrasenya,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.error) {
                    alert(data.error)
                } else {
                    alert('Correu enviat correctamente');
                    router.push('/inici_sessio');
                }
            })
    }

    function registrarConId() {

        fetch('http://localhost:5432/registrarConId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Usuari,
                Correu,
                Idsupercell,
                Contrasenya,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.error) {
                    alert(data.error)
                } else {
                    alert('Correu enviat correctamente');
                    router.push('/inici_sessio');
                }
            })
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

                    <Text style={{color: '#fff', fontSize: 18, marginBottom: 5}}>Correu</Text>
                    <TextInput
                        placeholder="Correu"
                        placeholderTextColor="#bbb"
                        keyboardType="email-address"
                        style={{
                            backgroundColor: '#1c1c1c',
                            color: 'white',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 20,
                            fontSize: 16,
                        }}
                        onChangeText={(text) => setCorreu(text)}
                    />

                    <Text style={{color: '#fff', fontSize: 18, marginBottom: 5}}>Supercell ID</Text>
                    <TextInput
                        placeholder="Supercell ID"
                        placeholderTextColor="#bbb"
                        style={{
                            backgroundColor: '#1c1c1c',
                            color: 'white',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 20,
                            fontSize: 16,
                        }}
                        onChangeText={(text) => setIdSupercell(text)}
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
                            marginBottom: 20,
                            fontSize: 16,
                        }}
                        onChangeText={(text) => setContrasenya(text)}
                    />

                    <Text style={{color: '#fff', fontSize: 18, marginBottom: 5}}>Confirma contrasenya</Text>
                    <TextInput
                        placeholder="Confirma contrasenya"
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
                        onChangeText={(text) => setCContrasenya(text)}
                    />

                    <TouchableOpacity
                        style={{
                            backgroundColor: '#3684B5',
                            paddingVertical: 15,
                            borderRadius: 10,
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            console.log({Usuari}, {Correu}, {Contrasenya}, {CContrasenya}, {Idsupercell});
                            if (Usuari && Correu && Contrasenya && CContrasenya && Idsupercell) {
                                if (Contrasenya === CContrasenya) {
                                    registrarConId();
                                } else {
                                    alert('Contrasenyes no coincideixen');
                                }
                            } else if (Usuari && Correu && Contrasenya && CContrasenya) {
                                if (Contrasenya === CContrasenya) {
                                    registrar();
                                } else {
                                    alert('Contrasenyes no coincideixen');
                                }
                            } else {
                                alert('Camps buits');
                            }
                        }
                        }>
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>
                            Registrar-se
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>
        </ScrollView>
    );
}