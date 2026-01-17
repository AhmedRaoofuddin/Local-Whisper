import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TextInput as RNTextInput,
  StyleSheet,
} from 'react-native';

import {debounce} from 'lodash';
import {observer} from 'mobx-react-lite';
import Slider from '@react-native-community/slider';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Switch,
  Text,
  Card,
  Button,
  Icon,
  List,
  MD3Colors,
} from 'react-native-paper';

import {TextInput, Menu, Divider} from '../../components';
import {useTheme} from '../../hooks';
import {modelStore, uiStore} from '../../store';
import {L10nContext} from '../../utils';
import {CacheType, Theme} from '../../utils/types';

export const SettingsScreen: React.FC = observer(() => {
  const l10n = useContext(L10nContext);
  const theme = useTheme();
  const styles = createStyles(theme);

  const [contextSize, setContextSize] = useState(
    modelStore.n_context.toString(),
  );
  const [isValidInput, setIsValidInput] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const [showKeyCacheMenu, setShowKeyCacheMenu] = useState(false);
  const [showValueCacheMenu, setShowValueCacheMenu] = useState(false);
  const [keyCacheAnchor, setKeyCacheAnchor] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  });
  const [valueCacheAnchor, setValueCacheAnchor] = useState<{
    x: number;
    y: number;
  }>({x: 0, y: 0});
  const keyCacheButtonRef = useRef<View>(null);
  const valueCacheButtonRef = useRef<View>(null);

  const debouncedUpdateStore = useRef(
    debounce((value: number) => {
      modelStore.setNContext(value);
    }, 500),
  ).current;

  useEffect(() => {
    setContextSize(modelStore.n_context.toString());
  }, []);

  useEffect(() => {
    return () => {
      debouncedUpdateStore.cancel();
    };
  }, [debouncedUpdateStore]);

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    setContextSize(modelStore.n_context.toString());
    setIsValidInput(true);
    setShowKeyCacheMenu(false);
    setShowValueCacheMenu(false);
  };

  const handleContextSizeChange = (text: string) => {
    setContextSize(text);
    const value = parseInt(text, 10);
    if (!isNaN(value) && value >= modelStore.MIN_CONTEXT_SIZE) {
      setIsValidInput(true);
      debouncedUpdateStore(value);
    } else {
      setIsValidInput(false);
    }
  };

  const cacheTypeOptions = [
    {label: l10n.cacheTypeF32, value: CacheType.F32},
    {label: l10n.cacheTypeF16, value: CacheType.F16},
    {label: l10n.cacheTypeQ8_0, value: CacheType.Q8_0},
    {label: l10n.cacheTypeQ5_1, value: CacheType.Q5_1},
    {label: l10n.cacheTypeQ5_0, value: CacheType.Q5_0},
    {label: l10n.cacheTypeQ4_1, value: CacheType.Q4_1},
    {label: l10n.cacheTypeQ4_0, value: CacheType.Q4_0},
    {label: l10n.cacheTypeIQ4_NL, value: CacheType.IQ4_NL},
  ];

  const getCacheTypeLabel = (value: CacheType) => {
    return (
      cacheTypeOptions.find(option => option.value === value)?.label || value
    );
  };

  const handleKeyCachePress = () => {
    keyCacheButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setKeyCacheAnchor({x: pageX, y: pageY + height});
      setShowKeyCacheMenu(true);
    });
  };

  const handleValueCachePress = () => {
    valueCacheButtonRef.current?.measure(
      (x, y, width, height, pageX, pageY) => {
        setValueCacheAnchor({x: pageX, y: pageY + height});
        setShowValueCacheMenu(true);
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* 模型初始化设置 */}
          <Card
            elevation={0}
            style={[styles.card, {
              backgroundColor: theme.colors.surface,
              borderRadius: 12
            }]}
          >
            <Card.Title
              title={l10n.modelInitSettings || "Model Initialization Settings"}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              {/* Metal设置 (仅iOS) */}
              {Platform.OS === 'ios' && (
                <>
                  <View style={styles.settingItemContainer}>
                    <View style={styles.switchContainer}>
                      <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.metal}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {l10n.metalDescription}
                        </Text>
                      </View>
                      <Switch
                        testID="metal-switch"
                        value={modelStore.useMetal}
                        onValueChange={value =>
                          modelStore.updateUseMetal(value)
                        }
                        color={theme.colors.primary}
                      />
                    </View>
                    <Slider
                      testID="gpu-layers-slider"
                      disabled={!modelStore.useMetal}
                      value={modelStore.n_gpu_layers}
                      onValueChange={value =>
                        modelStore.setNGPULayers(Math.round(value))
                      }
                      minimumValue={1}
                      maximumValue={100}
                      step={1}
                      style={styles.slider}
                      thumbTintColor={theme.colors.primary}
                      minimumTrackTintColor={theme.colors.primary}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.layersOnGPU.replace('{{gpuLayers}}', modelStore.n_gpu_layers.toString())}
                    </Text>
                  </View>
                  <Divider />
                </>
              )}

              {/* 上下文大小 */}
              <View style={styles.settingItemContainer}>
                <Text variant="titleMedium" style={styles.textLabel}>
                  {l10n.contextSize}
                </Text>
                <TextInput
                  ref={inputRef}
                  testID="context-size-input"
                  style={[
                    styles.textInput,
                    !isValidInput && styles.invalidInput,
                  ]}
                  keyboardType="numeric"
                  value={contextSize}
                  onChangeText={handleContextSizeChange}
                  placeholder={l10n.contextSizePlaceholder.replace('{{minContextSize}}', modelStore.MIN_CONTEXT_SIZE.toString())}
                />
                {!isValidInput && (
                  <Text style={styles.errorText}>
                    {l10n.invalidContextSizeError.replace('{{minContextSize}}', modelStore.MIN_CONTEXT_SIZE.toString())}
                  </Text>
                )}
                <Text variant="labelSmall" style={styles.textDescription}>
                  {l10n.contextSizeChangeNote || "Note: Changing this setting requires reloading the model"}
                </Text>
              </View>

              {/* 高级设置 */}
              <List.Accordion
                title={l10n.advancedSettings || "Advanced Settings"}
                titleStyle={styles.accordionTitle}
                style={styles.advancedAccordion}
                expanded={showAdvancedSettings}
                onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                <View style={styles.advancedSettingsContent}>
                  {/* 批处理大小 */}
                  <View style={styles.settingItemContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.batchSize || "Batch Size"}
                    </Text>
                    <Slider
                      testID="batch-size-slider"
                      value={modelStore.n_batch}
                      onValueChange={value =>
                        modelStore.setNBatch(Math.round(value))
                      }
                      minimumValue={1}
                      maximumValue={4096}
                      step={1}
                      style={styles.slider}
                      thumbTintColor={theme.colors.primary}
                      minimumTrackTintColor={theme.colors.primary}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {`Batch Size: ${modelStore.n_batch}${
                        modelStore.n_batch > modelStore.n_context
                          ? ` (Actual: ${modelStore.n_context})`
                          : ''
                      }`}
                    </Text>
                  </View>
                  <Divider />

                  {/* 物理批处理大小 */}
                  <View style={styles.settingItemContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.physicalBatchSize || "Physical Batch Size"}
                    </Text>
                    <Slider
                      testID="ubatch-size-slider"
                      value={modelStore.n_ubatch}
                      onValueChange={value =>
                        modelStore.setNUBatch(Math.round(value))
                      }
                      minimumValue={1}
                      maximumValue={4096}
                      step={1}
                      style={styles.slider}
                      thumbTintColor={theme.colors.primary}
                      minimumTrackTintColor={theme.colors.primary}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {`Physical Batch Size: ${modelStore.n_ubatch}${
                        modelStore.n_ubatch >
                        Math.min(modelStore.n_batch, modelStore.n_context)
                          ? ` (Actual: ${Math.min(
                              modelStore.n_batch,
                              modelStore.n_context,
                            )})`
                          : ''
                      }`}
                    </Text>
                  </View>
                  <Divider />

                  {/* CPU 线程数 */}
                  <View style={styles.settingItemContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.cpuThreadCount}
                    </Text>
                    <Slider
                      testID="thread-count-slider"
                      value={modelStore.n_threads}
                      onValueChange={value =>
                        modelStore.setNThreads(Math.round(value))
                      }
                      minimumValue={1}
                      maximumValue={modelStore.max_threads}
                      step={1}
                      style={styles.slider}
                      thumbTintColor={theme.colors.primary}
                      minimumTrackTintColor={theme.colors.primary}
                    />
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.cpuThreadCountDescription.replace('{{count}}', modelStore.n_threads.toString())}
                    </Text>
                  </View>
                  <Divider />

                  {/* 闪存注意力 */}
                  <View style={styles.settingItemContainer}>
                    <View style={styles.switchContainer}>
                      <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.flashAttention}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {l10n.flashAttentionDescription}
                        </Text>
                      </View>
                      <Switch
                        testID="flash-attention-switch"
                        value={modelStore.flash_attn}
                        onValueChange={value => modelStore.setFlashAttn(value)}
                        color={theme.colors.primary}
                      />
                    </View>
                  </View>
                  <Divider />

                  {/* 键缓存类型 */}
                  <View style={styles.settingItemContainer}>
                    <View style={styles.switchContainer}>
                      <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.keyCacheType}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {modelStore.flash_attn
                            ? l10n.keyCacheTypeDescription
                            : l10n.enableFlashAttentionToChangeCache}
                        </Text>
                      </View>
                      <View style={styles.menuContainer}>
                        <Button
                          ref={keyCacheButtonRef}
                          mode="outlined"
                          onPress={handleKeyCachePress}
                          style={styles.menuButton}
                          contentStyle={styles.buttonContent}
                          disabled={!modelStore.flash_attn}
                          icon={({size, color}) => (
                            <Icon
                              source="chevron-down"
                              size={size}
                              color={color}
                            />
                          )}>
                          {getCacheTypeLabel(modelStore.cache_type_k)}
                        </Button>
                        <Menu
                          visible={showKeyCacheMenu}
                          onDismiss={() => setShowKeyCacheMenu(false)}
                          anchor={keyCacheAnchor}
                          selectable>
                          {cacheTypeOptions.map(option => (
                            <Menu.Item
                              key={option.value}
                              style={styles.menu}
                              label={option.label}
                              selected={
                                option.value === modelStore.cache_type_k
                              }
                              onPress={() => {
                                modelStore.setCacheTypeK(option.value);
                                setShowKeyCacheMenu(false);
                              }}
                            />
                          ))}
                        </Menu>
                      </View>
                    </View>
                  </View>
                  <Divider />

                  {/* 值缓存类型 */}
                  <View style={styles.settingItemContainer}>
                    <View style={styles.switchContainer}>
                    <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.valueCacheType}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {modelStore.flash_attn
                            ? l10n.valueCacheTypeDescription
                            : l10n.enableFlashAttentionToChangeCache}
                        </Text>
                      </View>
                      <View style={styles.menuContainer}>
                        <Button
                          ref={valueCacheButtonRef}
                          mode="outlined"
                          onPress={handleValueCachePress}
                          style={styles.menuButton}
                          contentStyle={styles.buttonContent}
                          disabled={!modelStore.flash_attn}
                          icon={({size, color}) => (
                            <Icon
                              source="chevron-down"
                              size={size}
                              color={color}
                            />
                          )}>
                          {getCacheTypeLabel(modelStore.cache_type_v)}
                        </Button>
                        <Menu
                          visible={showValueCacheMenu}
                          onDismiss={() => setShowValueCacheMenu(false)}
                          anchor={valueCacheAnchor}
                          selectable>
                          {cacheTypeOptions.map(option => (
                            <Menu.Item
                              key={option.value}
                              label={option.label}
                              style={styles.menu}
                              selected={
                                option.value === modelStore.cache_type_v
                              }
                              onPress={() => {
                                modelStore.setCacheTypeV(option.value);
                                setShowValueCacheMenu(false);
                              }}
                            />
                          ))}
                        </Menu>
                      </View>
                    </View>
                  </View>
                </View>
              </List.Accordion>
            </Card.Content>
          </Card>

          {/* 模型加载设置 */}
          <Card
            elevation={0}
            style={[styles.card, {
              backgroundColor: theme.colors.surface,
              borderRadius: 12
            }]}
          >
            <Card.Title
              title={l10n.modelLoadSettings || "Model Loading Settings"}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.settingItemContainer}>
                {/* 自动卸载/加载 */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.autoOffloadLoad}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.autoOffloadLoadDescription}
                    </Text>
                  </View>
                  <Switch
                    testID="auto-offload-load-switch"
                    value={modelStore.useAutoRelease}
                    onValueChange={value =>
                      modelStore.updateUseAutoRelease(value)
                    }
                    color={theme.colors.primary}
                  />
                </View>
                <Divider />

                {/* 自动导航到聊天 */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.autoNavigateToChat}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.autoNavigateToChatDescription}
                    </Text>
                  </View>
                  <Switch
                    testID="auto-navigate-to-chat-switch"
                    value={uiStore.autoNavigatetoChat}
                    onValueChange={value =>
                      uiStore.setAutoNavigateToChat(value)
                    }
                    color={theme.colors.primary}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* 应用设置 */}
          <Card
            elevation={0}
            style={[styles.card, {
              backgroundColor: theme.colors.surface,
              borderRadius: 12
            }]}
          >
            <Card.Title
              title={l10n.appSettings || "App Settings"}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.settingItemContainer}>
                {/* 深色模式 */}
                <View style={styles.switchContainer}>
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.textLabel}>
                      {l10n.darkMode || "Dark Mode"}
                    </Text>
                    <Text variant="labelSmall" style={styles.textDescription}>
                      {l10n.darkModeDescription || "Switch between light and dark theme"}
                    </Text>
                  </View>
                  <Switch
                    testID="dark-mode-switch"
                    value={uiStore.colorScheme === 'dark'}
                    onValueChange={value =>
                      uiStore.setColorScheme(value ? 'dark' : 'light')
                    }
                    color={theme.colors.primary}
                  />
                </View>

                {/* iOS Background Download */}
                {Platform.OS === 'ios' && (
                  <>
                    <Divider />
                    <View style={styles.switchContainer}>
                      <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.iOSBackgroundDownload}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {l10n.iOSBackgroundDownloadDescription}
                        </Text>
                      </View>
                      <Switch
                        testID="ios-background-download-switch"
                        value={uiStore.iOSBackgroundDownloading}
                        onValueChange={value =>
                          uiStore.setiOSBackgroundDownloading(value)
                        }
                        color={theme.colors.primary}
                      />
                    </View>
                  </>
                )}

                {/* 显示内存使用情况 (仅iOS) */}
                {Platform.OS === 'ios' && (
                  <>
                    <Divider />
                    <View style={styles.switchContainer}>
                      <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.textLabel}>
                          {l10n.showMemoryUsage || "Show Memory Usage"}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={styles.textDescription}>
                          {l10n.showMemoryUsageDescription || "Display app memory usage on settings page"}
                        </Text>
                      </View>
                      <Switch
                        testID="display-memory-usage-switch"
                        value={uiStore.displayMemUsage}
                        onValueChange={value =>
                          uiStore.setDisplayMemUsage(value)
                        }
                        color={theme.colors.primary}
                      />
                    </View>
                  </>
                )}
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
});

// 样式定义
const createStyles = (theme: Theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    elevation: 1,
  },
  cardTitle: {
    ...theme.fonts.titleMedium,
    color: theme.colors.primary,
  },
  settingItemContainer: {
    paddingVertical: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  textLabel: {
    ...theme.fonts.titleMedium,
    color: theme.colors.onSurface,
  },
  textDescription: {
    ...theme.fonts.bodySmall,
    color: theme.colors.onSurfaceVariant,
  },
  slider: {
    marginTop: 8,
    marginBottom: 8,
  },
  textInput: {
    marginTop: 8,
    marginBottom: 8,
  },
  invalidInput: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    ...theme.fonts.bodySmall,
  },
  advancedAccordion: {
    backgroundColor: 'transparent',
  },
  accordionTitle: {
    color: theme.colors.primary,
  },
  advancedSettingsContent: {
    paddingTop: 8,
  },
  menuContainer: {
    minWidth: 120,
  },
  menuButton: {
    borderColor: theme.colors.primary,
  },
  buttonContent: {
    justifyContent: 'space-between',
  },
  menu: {
    backgroundColor: theme.colors.surface,
  },
});

export default SettingsScreen;