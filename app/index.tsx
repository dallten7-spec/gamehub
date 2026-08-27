import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>GAMEHUB</Text>

      <Text style={styles.title}>بازی‌های آنلاین چندنفره</Text>

      <Text style={styles.subtitle}>
        بازی کن، امتیاز بگیر و با دوستانت رقابت کن
      </Text>

      <Pressable
        style={styles.gameButton}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.gameButtonText}>اونو آنلاین</Text>
        <Text style={styles.gameInfo}>بازی سریع ۲ تا ۴ نفره</Text>
      </Pressable>

      <Pressable
        style={styles.gameButton}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.gameButtonText}>حکملاً نگران نباش! پیش می‌آید. این لینک مستقیم ورود به صفحه ویرایش همان فایل است:

👉 **[لینک مستقیم ویرایش فایل index.tsx](https://github.com/dallten7-spec/gamehub/edit/main/app/index.tsx)**

### مراحل را به ترتیب انجام بده:

۱. روی لینک بالا بزن (اگر ازت پرسید، با اکانت گیت‌هابت لاگین کن).
۲. کدهای قبلی که داخلش هست را **کامل پاک کن** (Select All و بعد Delete).
۳. کد زیر را کپی کن و در آنجا **Paste کن**:
```tsx
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
<View style={styles.container}>
<Text style={styles.logo}>GAMEHUB</Text>

<Text style={styles.title}>بازی‌های آنلاین چندنفره</Text>

<Text style={styles.subtitle}>
بازی کن، امتیاز بگیر و با دوستانت رقابت کن
</Text>

<Pressable
style={styles.gameButton}
onPress={() => router.push("/auth/login")}
>
<Text style={styles.gameButtonText}>اونو آنلاین</Text>
<Text style={styles.gameInfo}>بازی سریع ۲ تا ۴ نفره</Text>
</Pressable>

<Pressable
style={styles.gameButton}
onPress={() => router.push("/auth/login")}
>
<Text style={styles.gameButtonText}>حکم700",
textAlign: "right",
  },
  gameInfo: {
color: "#94A3B8",
fontSize: 14,
marginTop: 8,
textAlign: "right",
  },
  comingSoon: {
color: "#64748B",
fontSize: 14,
marginTop: 14,
  },
});
