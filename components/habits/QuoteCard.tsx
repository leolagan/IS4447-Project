//This imports all the components and contexts needed for the quote card
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    quoteCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    quoteIcon:   { fontSize: 36, color: c.primary, lineHeight: 36, marginBottom: 4, fontFamily: 'Sora_700Bold' },
    quoteText:   { fontSize: 15, fontStyle: 'italic', color: c.text, lineHeight: 24, marginBottom: 8 },
    quoteAuthor: { fontSize: 12, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.subtext },
    quoteError:  { fontSize: 14, color: c.subtext },
  });
}

export default function QuoteCard() {
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [quote, setQuote]               = useState<{ content: string; author: string } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError]     = useState(false);

  //This fetches a random motivational quote from the API and stores it in state
  async function fetchQuote() {
    setQuoteLoading(true);
    setQuoteError(false);
    try {
      const res  = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/random`);
      const data = await res.json();
      setQuote({ content: data[0].q, author: data[0].a });
    } catch {
      setQuoteError(true);
    } finally {
      setQuoteLoading(false);
    }
  }

  //This refreshes the quote every time the screen comes into focus
  useFocusEffect(useCallback(() => { fetchQuote(); }, []));

  return (
    <View style={styles.quoteCard}>
      {/*This shows a spinner, an error message or the quote text depending on the fetch state*/}
      {quoteLoading ? (
        <ActivityIndicator size="small" color={colours.primary} />
      ) : quoteError ? (
        <Text style={styles.quoteError}>Could not load quote.</Text>
      ) : quote ? (
        <>
          <Text style={styles.quoteIcon}>"</Text>
          <Text style={styles.quoteText}>{quote.content}</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </>
      ) : null}
    </View>
  );
}