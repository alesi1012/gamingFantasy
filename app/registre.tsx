import { View, Text, TouchableOpacity, StatusBar, TextInput, Platform, ScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';

export default function Registre() {

    const containerStyle: ViewStyle = Platform.OS === "web"
        ? {
            width: "33%",
            minWidth: 350,
            alignSelf: "center"
        }
        : {
            width: "100%",
        };

    return (
        <ScrollView style={{ backgroundColor: 'black'}}>
            <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', paddingHorizontal: 30 }}>
                <StatusBar/>

                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ color: '#fff', fontSize: 50, fontWeight: 'bold' }}>
                        Fantasy Gamer
                    </Text>
                </View>

                <View style={[containerStyle]}>

                    <Text style={{ color: '#fff', fontSize: 18, marginBottom: 5 }}>Usuari</Text>
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
                    />

                    <Text style={{ color: '#fff', fontSize: 18, marginBottom: 5 }}>Correu</Text>
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
                    />

                    <Text style={{ color: '#fff', fontSize: 18, marginBottom: 5 }}>Contrasenya</Text>
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
                    />

                    <Text style={{ color: '#fff', fontSize: 18, marginBottom: 5 }}>Confirma contrasenya</Text>
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
                    />

                    <TouchableOpacity
                        style={{
                            backgroundColor: '#3684B5',
                            paddingVertical: 15,
                            borderRadius: 10,
                            alignItems: 'center',
                        }}
                        onPress={() => alert('botó registrar-se')}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>
                            Registrar-se
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>
        </ScrollView>
    );
}
