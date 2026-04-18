import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    quoteCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    quoteText:    { fontSize: 14, fontStyle: 'italic', color: c.text, lineHeight: 20, marginBottom: 8 },
    quoteAuthor:  { fontSize: 12, fontWeight: '600', color: c.subtext, marginBottom: 12 },
    quoteError:   { fontSize: 14, color: c.subtext, marginBottom: 12 },
    quoteBtn:     { alignSelf: 'flex-start', backgroundColor: c.primaryLight, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
    quoteBtnText: { fontSize: 13, fontWeight: '600', color: c.primary },
  });
}

export default function QuoteCard() {
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  const [quote, setQuote]               = useState<{ content: string; author: string } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError]     = useState(false);

  async function fetchQuote() {
    setQuoteLoading(true);
    setQuoteError(false);
    try {
      const res  = await fetch('https://zenquotes.io/api/random');
      const data = await res.json();
      setQuote({ content: data[0].q, author: data[0].a });
    } catch {
      setQuoteError(true);
    } finally {
      setQuoteLoading(false);
    }
  }

  useEffect(() => { fetchQuote(); }, []);

  return (
    <View style={styles.quoteCard}>
      {quoteLoading ? (
        <ActivityIndicator size="small" color={colours.primary} />
      ) : quoteError ? (
        <Text style={styles.quoteError}>Could not load quote.</Text>
      ) : quote ? (
        <>
          <Text style={styles.quoteText}>"{quote.content}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </>
      ) : null}
      <TouchableOpacity
        style={styles.quoteBtn}
        onPress={fetchQuote}
        disabled={quoteLoading}
        accessibilityRole="button"
        accessibilityLabel="Get new quote"
      >
        <Text style={styles.quoteBtnText}>New Quote</Text>
      </TouchableOpacity>
    </View>
  );
}
