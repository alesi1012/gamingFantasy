import {View, Text, TouchableOpacity, StatusBar, Platform} from 'react-native';

export default function Inicio() {
    const isWeb = Platform.OS === 'web';
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar backgroundColor={'#000'}></StatusBar>
            <View style={{alignItems: 'center'}}>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
                    Fantasy Gamer
                </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 20 }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#3684B5',
                        paddingVertical: 12,
                        paddingHorizontal: 25,
                        borderRadius: 8,
                        marginRight: isWeb? 400 : 120,
                    }}
                    onPress={() => alert('Botón 1 presionado')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Unirse a una liga</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#3684B5',
                        paddingVertical: 12,
                        paddingHorizontal: 25,
                        borderRadius: 8,
                    }}
                    onPress={() => alert('Botón 2 presionado')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Crear liga</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}
