import React, {useContext} from 'react';
import {observer} from 'mobx-react';
import {Portal, Dialog, Button, Text, Paragraph} from 'react-native-paper';
import {View} from 'react-native';
import {styles} from './styles';
import {L10nContext} from '../../utils';

type ModelsResetDialogProps = {
  testID?: string;
  visible: boolean;
  onDismiss: () => void;
  onReset: () => void;
};

export const ModelsResetDialog: React.FC<ModelsResetDialogProps> = observer(
  ({testID, visible, onDismiss, onReset}) => {
    const l10n = useContext(L10nContext);

    return (
      <Portal>
        <Dialog
          testID={testID}
          visible={visible}
          onDismiss={onDismiss}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.title}>{l10n.confirmReset}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.contentWrapper}>
              <Paragraph style={styles.mainText}>
                This will reset model settings to default, including:
              </Paragraph>

              <View style={styles.settingsList}>
                <Text style={styles.settingsItem}>• System prompts</Text>
                <Text style={styles.settingsItem}>• Chat templates</Text>
                <Text style={styles.settingsItem}>• Temperature parameters</Text>
                <Text style={styles.settingsItem}>• Other related settings</Text>
              </View>

              <View style={styles.noticeContainer}>
                <Text style={styles.noticeTitle}>Note:</Text>
                <Text style={styles.noticeItem}>
                  ✓ Downloaded model files will <Text style={styles.highlight}>not</Text> be deleted
                </Text>
                <Text style={styles.noticeItem}>
                  ✓ "Local model" configurations will remain unchanged
                </Text>
              </View>
            </View>
          </Dialog.Content>

          <Dialog.Actions style={styles.actions}>
            <Button
              testID="cancel-reset-button"
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelButton}
              labelStyle={styles.buttonLabel}
            >
              {l10n.cancel}
            </Button>
            <Button
              testID="proceed-reset-button"
              mode="contained"
              onPress={onReset}
              style={styles.confirmButton}
              labelStyle={styles.buttonLabel}
            >
              {l10n.proceedWithReset}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  },
);