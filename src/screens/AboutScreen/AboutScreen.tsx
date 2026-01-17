import React from 'react';
import {ScrollView, View, Linking, StyleSheet} from 'react-native';
import {Text, Card, Avatar, useTheme, List, Button, Divider} from 'react-native-paper';
import packageInfo from '../../../package.json';

const AboutScreen = () => {
  const theme = useTheme();

  const GITHUB_URL = 'https://github.com/AhmedRaoofuddin/Local-Whisper';
  const UPDATE_URL = 'https://github.com/AhmedRaoofuddin/Local-Whisper/releases';

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  const formatReleaseDate = (dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}/${parseInt(month)}/${parseInt(day)}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* App Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <Avatar.Icon
              size={72}
              icon="robot"
              style={{backgroundColor: theme.colors.primary}}
            />
            <View style={styles.titleContainer}>
              <Text variant="headlineMedium" style={styles.title}>
                On-Device Sage
              </Text>
              <Text variant="bodyMedium" style={styles.slogan}>
                Your Private AI Companion, Always Offline
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Update Card */}
      <Card style={[styles.card, {backgroundColor: theme.colors.primaryContainer}]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.updateTitle}>
            Current Version
          </Text>
          <Text variant="bodyMedium" style={styles.versionInfo}>
            Version: {packageInfo.version}
          </Text>
          <Text variant="bodyMedium" style={styles.versionInfo}>
            Release Date: {formatReleaseDate(packageInfo.date)}
          </Text>
          <View style={styles.updateNotes}>
            <Text variant="bodyMedium" style={styles.updateItem}>• Added DeepSeek R1 model support</Text>
            <Text variant="bodyMedium" style={styles.updateItem}>• Improved conversation experience</Text>
            <Text variant="bodyMedium" style={styles.updateItem}>• Performance and UI optimizations</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Updates */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Stay Updated
          </Text>
          <List.Item
            title="GitHub Releases"
            description="Get the latest version and updates"
            left={props => <List.Icon {...props} icon="github" color={theme.colors.primary} />}
            style={styles.listItem}
            onPress={() => openLink(UPDATE_URL)}
          />
        <Button
          mode="contained"
          onPress={() => openLink(UPDATE_URL)}
          style={styles.updateButton}
          icon="download">
          Check for Updates
        </Button>
        </Card.Content>
      </Card>

      {/* Contact */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Contact & Support
          </Text>
          <List.Item
            title="GitHub"
            description="Local-Whisper"
            left={props => <List.Icon {...props} icon="github" />}
            onPress={() => openLink(GITHUB_URL)}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Email Feedback"
            description="ethereal_ai@hotmail.com"
            left={props => <List.Icon {...props} icon="email" />}
            onPress={() => openLink('mailto:ethereal_ai@hotmail.com')}
          />
        </Card.Content>
      </Card>

      {/* Creator */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.creatorText}>
            Created by Ahmed Raoofuddin
          </Text>
        </Card.Content>
      </Card>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  titleContainer: {
    marginLeft: 16,
  },
  title: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  slogan: {
    marginTop: 4,
    opacity: 0.7,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  updateTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a237e',
  },
  versionInfo: {
    marginBottom: 4,
    opacity: 0.8,
  },
  updateNotes: {
    marginVertical: 12,
    paddingLeft: 8,
  },
  updateItem: {
    marginBottom: 6,
    lineHeight: 20,
  },
  updateButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  divider: {
    marginVertical: 8,
  },
  creatorText: {
    textAlign: 'center',
    opacity: 0.7,
    marginVertical: 8,
  },
});

export default AboutScreen;