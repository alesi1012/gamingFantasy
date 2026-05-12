import { UserProvider } from "@/app/UserContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
    return (
        <UserProvider>
            <StatusBar style="light" backgroundColor="black" translucent={false} />
            <Stack screenOptions={{ contentStyle: { backgroundColor: "black" } }}>
                <Stack.Screen name="inici_sessio" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="registre" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </UserProvider>
    );
}