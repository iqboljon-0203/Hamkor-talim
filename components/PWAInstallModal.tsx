import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
} from 'react-native';
import {
  Download,
  X,
  Share,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react-native';
import Theme from '@/constants/Theme';
import { usePWA } from '@/context/PWAContext';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } = Theme;

export default function PWAInstallModal() {
  const {
    isModalOpen,
    closeInstallModal,
    deferredPrompt,
    installApp,
    isIOS,
    isMobile,
    isInstalled,
    siteUrl,
  } = usePWA();

  if (!isModalOpen) return null;

  const currentUrl = siteUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://hamkor-talim.vercel.app');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await installApp();
    }
  };

  return (
    <Modal
      visible={isModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeInstallModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.appBadge}>
                <Sparkles size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.title}>Hamkor Ta'lim Mobil Ilovasi</Text>
                <Text style={styles.subtitle}>PWA (Progressive Web App)</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeInstallModal}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color={COLORS.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Value props */}
            <View style={styles.featureGrid}>
              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color={COLORS.success[500]} />
                <Text style={styles.featureText}>Play Market/App Store'siz to'g'ridan-to'g'ri o'rnatish</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color={COLORS.success[500]} />
                <Text style={styles.featureText}>Telefon xotirasini tejaydi (atigi ~2 MB)</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color={COLORS.success[500]} />
                <Text style={styles.featureText}>Tezkor ishlaydi va internetni tejaydi</Text>
              </View>
            </View>

            {/* Android / Chromium Direct Install */}
            {deferredPrompt && (
              <View style={styles.directInstallSection}>
                <TouchableOpacity
                  style={styles.mainInstallButton}
                  onPress={handleInstallClick}
                  activeOpacity={0.85}
                >
                  <Download size={20} color="#ffffff" />
                  <Text style={styles.mainInstallButtonText}>Telefonga yuklab olish (O'rnatish)</Text>
                </TouchableOpacity>
                <Text style={styles.installNote}>
                  Bir marta bosish bilan telefoningiz bosh ekraniga o'rnatiladi.
                </Text>
              </View>
            )}

            {/* iOS Safari Guide */}
            {isIOS && (
              <View style={styles.iosGuideBox}>
                <View style={styles.deviceHeader}>
                  <Smartphone size={18} color={COLORS.primary[600]} />
                  <Text style={styles.deviceTitle}>iPhone / iPad ga o'rnatish:</Text>
                </View>
                <View style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                  <Text style={styles.stepText}>
                    Safari brauzeri pastidagi <Share size={14} color={COLORS.primary[500]} /> <Text style={{ fontWeight: '700' }}>Ulashish (Share)</Text> tugmasini bosing.
                  </Text>
                </View>
                <View style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                  <Text style={styles.stepText}>
                    Menyuni pastga siljitib <Text style={{ fontWeight: '700' }}>"Asosiy ekranga qo'shish"</Text> (Add to Home Screen) bandini tanlang.
                  </Text>
                </View>
                <View style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                  <Text style={styles.stepText}>
                    Yuqori o'ng burchakdagi <Text style={{ fontWeight: '700' }}>"Qo'shish"</Text> tugmasini bosing.
                  </Text>
                </View>
              </View>
            )}

            {/* Desktop / Laptop Guide with QR Code */}
            {!isMobile && (
              <View style={styles.desktopGuideBox}>
                <View style={styles.deviceHeader}>
                  <QrCode size={18} color={COLORS.primary[600]} />
                  <Text style={styles.deviceTitle}>Telefoningizga yuklab olish:</Text>
                </View>
                <Text style={styles.desktopText}>
                  Telefoningiz kamerasi orqali quyidagi QR kodni skanerlang va telefon brauzerida oching:
                </Text>

                <View style={styles.qrContainer}>
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrSubtext}>{currentUrl}</Text>
                </View>

                {deferredPrompt && (
                  <TouchableOpacity
                    style={styles.desktopInstallButton}
                    onPress={handleInstallClick}
                  >
                    <Laptop size={16} color={COLORS.primary[600]} />
                    <Text style={styles.desktopInstallButtonText}>
                      Ushbu kompyuterga ham ilova sifatida o'rnatish
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Android manual if no deferredPrompt */}
            {!deferredPrompt && !isIOS && isMobile && (
              <View style={styles.iosGuideBox}>
                <View style={styles.deviceHeader}>
                  <Smartphone size={18} color={COLORS.primary[600]} />
                  <Text style={styles.deviceTitle}>Android brauzerida o'rnatish:</Text>
                </View>
                <Text style={styles.stepText}>
                  1. Brauzeringizning yuqori o'ng burchagidagi <Text style={{ fontWeight: '700' }}>3 ta nuqta</Text> menyusini bosing.
                </Text>
                <Text style={styles.stepText}>
                  2. <Text style={{ fontWeight: '700' }}>"Ilovani o'rnatish"</Text> yoki <Text style={{ fontWeight: '700' }}>"Asosiy ekranga qo'shish"</Text> tugmasini tanlang.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.continueWebButton}
              onPress={closeInstallModal}
            >
              <Text style={styles.continueWebButtonText}>Saytda davom etish</Text>
              <ArrowRight size={16} color={COLORS.gray[700]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    zIndex: 10000,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  appBadge: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.primary[600],
    fontWeight: '500',
  },
  closeBtn: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  featureGrid: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  featureText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[700],
  },
  directInstallSection: {
    marginBottom: SPACING.md,
  },
  mainInstallButton: {
    backgroundColor: COLORS.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  mainInstallButtonText: {
    color: '#ffffff',
    fontFamily: FONTS.medium,
    fontSize: 15,
    fontWeight: '700',
  },
  installNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 6,
  },
  iosGuideBox: {
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary[100],
    marginBottom: SPACING.md,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  deviceTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[900],
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: 6,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[700],
    lineHeight: 18,
  },
  desktopGuideBox: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: SPACING.md,
  },
  desktopText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  qrImage: {
    width: 160,
    height: 160,
    borderRadius: BORDER_RADIUS.sm,
  },
  qrSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  desktopInstallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: 10,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.md,
  },
  desktopInstallButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary[700],
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    backgroundColor: COLORS.gray[50],
  },
  continueWebButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: 10,
  },
  continueWebButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
    fontWeight: '600',
  },
});
