import {View, Text, TouchableOpacity, StatusBar, Platform,StyleSheet} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Inicio() {

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
                    style={styles.buton1}
                    onPress={() => alert('Botón 1 presionado')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Unirse a una liga</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buton2}
                    onPress={() => alert('Botón 2 presionado')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Crear liga</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                <TouchableOpacity style={[styles.card, styles.cardSelected]}>
                    <View style={styles.infoContainer}>
                        <View style={styles.avatar} />
                        <View>
                            <Text style={styles.title}>Liga 1</Text>
                            <Text style={styles.subtitle}>3/14 137 Pts.</Text>
                        </View>
                    </View>
                    <Ionicons name="stats-chart" size={24} color="#555" />
                </TouchableOpacity>


                <TouchableOpacity style={[styles.card, styles.cardBlue]}>
                    <View style={styles.infoContainer}>
                        <View style={[styles.avatar, { backgroundColor: "#0D47A1" }]} />
                        <View>
                            <Text style={[styles.title, { color: "white" }]}>Liga 2</Text>
                            <Text style={[styles.subtitle, { color: "white" }]}>1/14 334 Pts.</Text>
                        </View>
                    </View>
                    <Ionicons name="stats-chart" size={24} color="white" />
                </TouchableOpacity>
            </View>
            );

        </View>
    );
}
const isWeb = Platform.OS === 'web';
const styles = StyleSheet.create({
    buton1:{
        backgroundColor: '#3684B5',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginRight: isWeb? 400 : 80,
    },
    buton2:{
        backgroundColor: '#3684B5',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: 150,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        padding: 20,
        gap: 20,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        elevation: 3,
    },
    cardSelected: {
        borderWidth: 2,
        borderColor: "#9C27B0",
    },
    cardBlue: {
        backgroundColor: "#1565C0",
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#ccc",
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 12,
        opacity: 0.7,
    },
});
