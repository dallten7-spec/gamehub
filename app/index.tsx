import { View, Text, StyleSheet, Pressable } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GameHub</Text>
      <Text style={styles.subtitle}>بازی‌های آنلاین چندنفره</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>اونو آنلاین</Text>
      </Pressable>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>حکم</Text>
      </Pressable>

      <Pressable style={styles.membershipButton}>
        <Text style={styles.buttonText}>عضویت ویژه</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101827",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#aab4c5",
    fontSize: 17,
    marginBottom: 36,
  },
  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  membershipButton: {
    width: "100%",
    backgroundColor: "#c084fc",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
