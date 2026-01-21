import { UserProvider } from "@/app/UserContext";
import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <UserProvider>
            <Stack>
                <Stack.Screen name="inici_sessio" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </UserProvider>
    );
}
