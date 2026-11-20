import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  useWindowDimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  ArrowRight,
  Download,
  Smartphone,
  Sparkles,
  BookOpen,
  ChevronRight,
  Zap,
  Menu,
  X,
} from 'lucide-react-native';
import { usePWA } from '@/context/PWAContext';
import Theme from '@/constants/Theme';

const { FONTS, SPACING, SHADOWS } = Theme;

type SectionId = 'hero' | 'features' | 'teachers' | 'students' | 'pwa';

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;
  const isTablet = width >= 640 && width < 920;
  const isMobile = width < 640;

  const { openInstallModal, siteUrl } = usePWA();
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<{ [key in SectionId]?: number }>({
    hero: 0,
    features: 650,
    teachers: 1350,
    students: 1700,
    pwa: 2100,
  });

  const currentUrl =
    siteUrl ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'https://hamkor-talim.vercel.app');
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    currentUrl,
  )}`;

  // Smooth scroll handler
  const scrollToSection = useCallback(
    (sectionId: SectionId) => {
      setActiveSection(sectionId);
      setMobileMenuOpen(false);

      if (sectionId === 'hero') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const el = document.getElementById(`section-${sectionId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      const targetY = sectionPositions.current[sectionId] || 0;
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, targetY - 80),
        animated: true,
      });
    },
    [],
  );

  // Track scroll position to update active navbar item
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = e.nativeEvent.contentOffset.y;
      const pos = sectionPositions.current;

      const feat = (pos.features || 650) - 150;
      const teach = (pos.teachers || 1350) - 150;
      const stud = (pos.students || 1700) - 150;
      const pwaPos = (pos.pwa || 2100) - 150;

      if (scrollY < feat) {
        setActiveSection('hero');
      } else if (scrollY < teach) {
        setActiveSection('features');
      } else if (scrollY < stud) {
        setActiveSection('teachers');
      } else if (scrollY < pwaPos) {
        setActiveSection('students');
      } else {
        setActiveSection('pwa');
      }
    },
    [],
  );

  return (
    <View style={styles.mainWrapper}>
      {/* ===================== STICKY TOP NAVBAR ===================== */}
      <View style={styles.stickyHeader}>
        <SafeAreaView edges={['top']} style={styles.stickyHeaderInner}>
          <View style={styles.navbarContent}>
            {/* Logo */}
            <TouchableOpacity
              style={styles.logoWrap}
              onPress={() => scrollToSection('hero')}
              activeOpacity={0.8}
            >
              <View style={styles.logoIcon}>
                <GraduationCap size={22} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.logoTitle}>HAMKOR TA'LIM</Text>
                <Text style={styles.logoSubtitle}>ZAMONAVIY TA'LIM TIZIMI</Text>
              </View>
            </TouchableOpacity>

            {/* Desktop Navigation Links */}
            {isDesktop && (
              <View style={styles.navLinks}>
                <TouchableOpacity
                  style={[
                    styles.navItemBtn,
                    activeSection === 'hero' && styles.navItemBtnActive,
                  ]}
                  onPress={() => scrollToSection('hero')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.navLink,
                      activeSection === 'hero' && styles.navLinkActive,
                    ]}
                  >
                    ASOSIY
                  </Text>
                  {activeSection === 'hero' && <View style={styles.activePill} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navItemBtn,
                    activeSection === 'features' && styles.navItemBtnActive,
                  ]}
                  onPress={() => scrollToSection('features')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.navLink,
                      activeSection === 'features' && styles.navLinkActive,
                    ]}
                  >
                    IMKONIYATLAR
                  </Text>
                  {activeSection === 'features' && <View style={styles.activePill} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navItemBtn,
                    activeSection === 'teachers' && styles.navItemBtnActive,
                  ]}
                  onPress={() => scrollToSection('teachers')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.navLink,
                      activeSection === 'teachers' && styles.navLinkActive,
                    ]}
                  >
                    O'QITUVCHILARGA
                  </Text>
                  {activeSection === 'teachers' && <View style={styles.activePill} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navItemBtn,
                    activeSection === 'students' && styles.navItemBtnActive,
                  ]}
                  onPress={() => scrollToSection('students')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.navLink,
                      activeSection === 'students' && styles.navLinkActive,
                    ]}
                  >
                    O'QUVCHILARGA
                  </Text>
                  {activeSection === 'students' && <View style={styles.activePill} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navItemBtn,
                    activeSection === 'pwa' && styles.navItemBtnActive,
                  ]}
                  onPress={() => {
                    scrollToSection('pwa');
                    openInstallModal();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.navLink,
                      activeSection === 'pwa' && styles.navLinkActive,
                    ]}
                  >
                    ILOVA (PWA)
                  </Text>
                  {activeSection === 'pwa' && <View style={styles.activePill} />}
                </TouchableOpacity>
              </View>
            )}

            {/* Right Action Buttons */}
            <View style={styles.headerRight}>
              {/* Quick PWA Button for Tablet/Mobile */}
              {!isDesktop && (
                <TouchableOpacity
                  style={styles.headerPwaIconBtn}
                  onPress={openInstallModal}
                  activeOpacity={0.8}
                >
                  <Smartphone size={18} color="#f59e0b" />
                </TouchableOpacity>
              )}

              {/* Login CTA */}
              <TouchableOpacity
                style={styles.headerCtaButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.headerCtaText}>KIRISH</Text>
              </TouchableOpacity>

              {/* Mobile Hamburger Menu Button */}
              {!isDesktop && (
                <TouchableOpacity
                  style={styles.menuToggleBtn}
                  onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                  activeOpacity={0.8}
                >
                  {mobileMenuOpen ? (
                    <X size={22} color="#ffffff" />
                  ) : (
                    <Menu size={22} color="#ffffff" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Mobile Drawer Dropdown Menu */}
          {!isDesktop && mobileMenuOpen && (
            <View style={styles.mobileDropdown}>
              <TouchableOpacity
                style={[
                  styles.mobileMenuItem,
                  activeSection === 'hero' && styles.mobileMenuItemActive,
                ]}
                onPress={() => scrollToSection('hero')}
              >
                <Text
                  style={[
                    styles.mobileMenuText,
                    activeSection === 'hero' && styles.mobileMenuTextActive,
                  ]}
                >
                  ASOSIY
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mobileMenuItem,
                  activeSection === 'features' && styles.mobileMenuItemActive,
                ]}
                onPress={() => scrollToSection('features')}
              >
                <Text
                  style={[
                    styles.mobileMenuText,
                    activeSection === 'features' && styles.mobileMenuTextActive,
                  ]}
                >
                  IMKONIYATLAR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mobileMenuItem,
                  activeSection === 'teachers' && styles.mobileMenuItemActive,
                ]}
                onPress={() => scrollToSection('teachers')}
              >
                <Text
                  style={[
                    styles.mobileMenuText,
                    activeSection === 'teachers' && styles.mobileMenuTextActive,
                  ]}
                >
                  O'QITUVCHILARGA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mobileMenuItem,
                  activeSection === 'students' && styles.mobileMenuItemActive,
                ]}
                onPress={() => scrollToSection('students')}
              >
                <Text
                  style={[
                    styles.mobileMenuText,
                    activeSection === 'students' && styles.mobileMenuTextActive,
                  ]}
                >
                  O'QUVCHILARGA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mobileMenuItem,
                  activeSection === 'pwa' && styles.mobileMenuItemActive,
                ]}
                onPress={() => {
                  scrollToSection('pwa');
                  openInstallModal();
                }}
              >
                <Text
                  style={[
                    styles.mobileMenuText,
                    activeSection === 'pwa' && styles.mobileMenuTextActive,
                  ]}
                >
                  ILOVA O'RNATISH (PWA)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mobileMenuItem, styles.mobileLoginItem]}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.mobileLoginText}>TIZIMGA KIRISH</Text>
                <ArrowRight size={16} color="#0f172a" />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* ===================== SCROLL CONTENT ===================== */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ===================== HERO SECTION ===================== */}
        <View
          // @ts-ignore for web DOM anchor
          id="section-hero"
          nativeID="section-hero"
          style={[styles.heroWrapper, { minHeight: isDesktop ? 680 : 580 }]}
          onLayout={(e) => {
            sectionPositions.current.hero = e.nativeEvent.layout.y;
          }}
        >
          <ImageBackground
            source={require('@/assets/images/hero-bg.jpg')}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          >
            {/* Dark Gradient Overlay */}
            <View style={styles.heroOverlay} />
          </ImageBackground>

          <View style={styles.heroInner}>
            {/* HERO MAIN CONTENT */}
            <View
              style={[
                styles.heroMain,
                {
                  paddingTop: isDesktop ? 80 : 50,
                  maxWidth: isDesktop ? 820 : '100%',
                },
              ]}
            >
              {/* Tag badge */}
              <View style={styles.badgeRow}>
                <Sparkles size={14} color="#f59e0b" />
                <Text style={styles.badgeText}>
                  YAGONA TA'LIM VA HAMKORLIK PLATFORMASI
                </Text>
              </View>

              {/* Massive Authoritative Headline (Inspired by GURUKUL reference) */}
              <Text
                style={[
                  styles.heroTitle,
                  {
                    fontSize: isDesktop ? 60 : isTablet ? 48 : 38,
                    lineHeight: isDesktop ? 66 : isTablet ? 54 : 44,
                  },
                ]}
              >
                O'RGANING.{'\n'}O'RGATING.{'\n'}RIVOJLANING.
              </Text>

              {/* Subtitle Description */}
              <Text
                style={[
                  styles.heroDescription,
                  { fontSize: isDesktop ? 16 : 14, lineHeight: isDesktop ? 26 : 22 },
                ]}
              >
                O'qituvchi va o'quvchilar uchun zamonaviy raqamli ta'lim maydoni.
                Topshiriqlarni boshqarish, guruhlar tizimi, shaffof baholash va
                uzluksiz ta'lim jarayonini bir platformada birlashtiring.
              </Text>

              {/* Meta Features Line (Academic Subtext) */}
              <Text style={styles.heroMetaLine}>
                HAMKORLIK · GURUHLAR TIZIMI · AQLLI TAQVIM · PWA MOBIL ILOVA
              </Text>

              {/* Action Buttons Row */}
              <View
                style={[
                  styles.heroActions,
                  { flexDirection: isDesktop ? 'row' : 'column' },
                ]}
              >
                <TouchableOpacity
                  style={styles.primaryAmberBtn}
                  onPress={() => router.push('/login')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryAmberBtnText}>TIZIMGA KIRISH</Text>
                  <ArrowRight size={18} color="#0f172a" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.outlineGlassBtn}
                  onPress={() => router.push('/signup')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.outlineGlassBtnText}>RO'YXATDAN O'TISH</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pwaInstallHeroBtn}
                  onPress={openInstallModal}
                  activeOpacity={0.85}
                >
                  <Smartphone size={16} color="#ffffff" />
                  <Text style={styles.pwaInstallHeroBtnText}>
                    {isDesktop ? 'TELEFONGA YUKLASH' : "ILOVANI O'RNATISH (PWA)"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ===================== BENTO GRID: FEATURES ===================== */}
        <View
          // @ts-ignore for web DOM anchor
          id="section-features"
          nativeID="section-features"
          style={styles.sectionContainer}
          onLayout={(e) => {
            sectionPositions.current.features = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionPreTitle}>IMKONIYATLAR</Text>
            <Text style={styles.sectionTitle}>
              Zamonaviy ta'limni boshqarish uchun barcha vositalar
            </Text>
            <Text style={styles.sectionSubtitle}>
              Qog'ozbozlik va chalkashliklarsiz — o'qituvchi va o'quvchilar uchun
              qulay, tezkor va shaffof tizim.
            </Text>
          </View>

          {/* Grid Cards Row 1 */}
          <View
            style={[
              styles.bentoGrid,
              { flexDirection: isDesktop ? 'row' : 'column' },
            ]}
          >
            {/* Card 1: Groups */}
            <View style={[styles.bentoCard, isDesktop && { flex: 1 }]}>
              <View style={[styles.cardIconBox, { backgroundColor: '#eff6ff' }]}>
                <Users size={24} color="#3b82f6" />
              </View>
              <Text style={styles.cardTitle}>Guruhlar boshqaruvi</Text>
              <Text style={styles.cardDescription}>
                Sinflar va to'garaklar bo'yicha alohida guruhlar yarating,
                o'quvchilarni a'zo qiling va o'quv jarayonini bir joydan nazorat qiling.
              </Text>
              <View style={styles.cardBadge}>
                <CheckCircle2 size={14} color="#3b82f6" />
                <Text style={styles.cardBadgeText}>Cheksiz guruhlar va o'quvchilar</Text>
              </View>
            </View>

            {/* Card 2: Tasks */}
            <View style={[styles.bentoCard, isDesktop && { flex: 1 }]}>
              <View style={[styles.cardIconBox, { backgroundColor: '#fef3c7' }]}>
                <BookOpen size={24} color="#d97706" />
              </View>
              <Text style={styles.cardTitle}>Topshiriqlar va Vazifalar</Text>
              <Text style={styles.cardDescription}>
                Fayllar (PDF, Word, rasmlar) bilan vazifalar bering. O'quvchilar o'z
                javoblarini telefon yoki kompyuter orqali bir zumda yuklashadi.
              </Text>
              <View style={styles.cardBadge}>
                <CheckCircle2 size={14} color="#d97706" />
                <Text style={styles.cardBadgeText}>Fayl va rasm yuklash imkoniyati</Text>
              </View>
            </View>

            {/* Card 3: Calendar */}
            <View style={[styles.bentoCard, isDesktop && { flex: 1 }]}>
              <View style={[styles.cardIconBox, { backgroundColor: '#f0fdf4' }]}>
                <Calendar size={24} color="#16a34a" />
              </View>
              <Text style={styles.cardTitle}>Aqlli taqvim va Muddatlar</Text>
              <Text style={styles.cardDescription}>
                Barcha vazifalar muddati va dars kunlari avtomatik tartibda taqvimda
                aks etadi. Hech bir topshiriq unutilmaydi.
              </Text>
              <View style={styles.cardBadge}>
                <CheckCircle2 size={14} color="#16a34a" />
                <Text style={styles.cardBadgeText}>Avtomatik dedlayn eslatmalari</Text>
              </View>
            </View>
          </View>

          {/* Second Row: 2 Big Cards */}
          <View
            style={[
              styles.bentoGrid,
              { flexDirection: isDesktop ? 'row' : 'column', marginTop: SPACING.md },
            ]}
          >
            {/* Card 4: Evaluation */}
            <View style={[styles.bentoCard, isDesktop && { flex: 1.2 }]}>
              <View style={[styles.cardIconBox, { backgroundColor: '#faf5ff' }]}>
                <Award size={24} color="#9333ea" />
              </View>
              <Text style={styles.cardTitle}>Shaffof baholash va Fikr-mulohazalar</Text>
              <Text style={styles.cardDescription}>
                O'qituvchilar topshirilgan vazifalarni to'g'ridan-to'g'ri tizimda
                tekshirib, 5 ballik shkalada baholaydi va o'quvchiga shaxsiy
                tavsiya yozadi. O'quvchi o'z kamchiliklarini darhol ko'radi.
              </Text>
            </View>

            {/* Card 5: PWA Tech */}
            <View
              style={[
                styles.bentoCard,
                isDesktop && { flex: 1 },
                { backgroundColor: '#0f172a', borderColor: '#1e293b' },
              ]}
            >
              <View style={[styles.cardIconBox, { backgroundColor: '#1e293b' }]}>
                <Zap size={24} color="#f59e0b" />
              </View>
              <Text style={[styles.cardTitle, { color: '#ffffff' }]}>
                PWA Mobil Ilova Texnologiyasi
              </Text>
              <Text style={[styles.cardDescription, { color: '#94a3b8' }]}>
                Play Market yoki App Store kutish shart emas. Brauzerdan to'g'ridan-to'g'ri
                telefoningizga o'rnatiladi, internetni tejaydi va tez ochiladi.
              </Text>
              <TouchableOpacity
                style={styles.cardActionBtn}
                onPress={openInstallModal}
                activeOpacity={0.8}
              >
                <Text style={styles.cardActionBtnText}>Ilovani yuklab olish</Text>
                <ChevronRight size={16} color="#f59e0b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ===================== ROLES SPLIT SECTION ===================== */}
        <View style={styles.rolesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionPreTitle}>KIMLAR UCHUN?</Text>
            <Text style={[styles.sectionTitle, { color: '#ffffff' }]}>
              O'qituvchi va o'quvchilar uchun maxsus moslashtirilgan
            </Text>
          </View>

          <View
            style={[
              styles.rolesGrid,
              { flexDirection: isDesktop ? 'row' : 'column' },
            ]}
          >
            {/* Teacher Role */}
            <View
              // @ts-ignore for web DOM anchor
              id="section-teachers"
              nativeID="section-teachers"
              style={[styles.roleCard, isDesktop && { flex: 1 }]}
              onLayout={(e) => {
                sectionPositions.current.teachers = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.roleHeader}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>USTOZLAR UCHUN</Text>
                </View>
              </View>
              <Text style={styles.roleTitle}>O'qituvchi Kabineti</Text>
              <Text style={styles.roleText}>
                • Yangi sinf va to'garaklar uchun guruhlar ochish{'\n'}
                • Vazifalarni muddat va biriktirilgan fayllar bilan joylash{'\n'}
                • O'quvchilar yuborgan javoblarni ko'rish va baholash{'\n'}
                • Guruh statistikasi va faollik monitoringi
              </Text>
              <TouchableOpacity
                style={styles.roleBtn}
                onPress={() => router.push('/signup')}
                activeOpacity={0.85}
              >
                <Text style={styles.roleBtnText}>O'qituvchi sifatida boshlash</Text>
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Student Role */}
            <View
              // @ts-ignore for web DOM anchor
              id="section-students"
              nativeID="section-students"
              style={[styles.roleCard, isDesktop && { flex: 1 }]}
              onLayout={(e) => {
                sectionPositions.current.students = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.roleHeader}>
                <View style={[styles.roleBadge, { backgroundColor: '#10b981' }]}>
                  <Text style={styles.roleBadgeText}>O'QUVCHILAR UCHUN</Text>
                </View>
              </View>
              <Text style={styles.roleTitle}>O'quvchi Kabineti</Text>
              <Text style={styles.roleText}>
                • O'z guruhlari va dars topshiriqlarini bitta ro'yxatda ko'rish{'\n'}
                • Bajarilgan vazifalarni telefon kamerasi yoki fayl orqali yuklash{'\n'}
                • O'qituvchi bahosi va mulohazalarini tezkor qabul qilish{'\n'}
                • Shaxsiy rivojlanish va o'zlashtirish tahlilini kuzatish
              </Text>
              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: '#10b981' }]}
                onPress={() => router.push('/signup')}
                activeOpacity={0.85}
              >
                <Text style={styles.roleBtnText}>O'quvchi sifatida boshlash</Text>
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ===================== PWA APP PROMOTION CTA ===================== */}
        <View
          // @ts-ignore for web DOM anchor
          id="section-pwa"
          nativeID="section-pwa"
          style={styles.sectionContainer}
          onLayout={(e) => {
            sectionPositions.current.pwa = e.nativeEvent.layout.y;
          }}
        >
          <View
            style={[
              styles.pwaPromotionCard,
              { flexDirection: isDesktop ? 'row' : 'column' },
            ]}
          >
            {/* Left Text */}
            <View style={[styles.pwaTextCol, isDesktop && { flex: 1.4 }]}>
              <View style={styles.pwaBadge}>
                <Smartphone size={16} color="#3b82f6" />
                <Text style={styles.pwaBadgeText}>MOBIL ILOVA DASTURI</Text>
              </View>
              <Text style={styles.pwaCardTitle}>
                Hamkor Ta'lim ilovasini telefoningizga o'rnating
              </Text>
              <Text style={styles.pwaCardSubtitle}>
                Ilovani Play Market yoki App Store'siz, to'g'ridan-to'g'ri telefoningizga
                o'rnatib oling. U atigi ~2 MB joy egallaydi, xuddi mobil ilovadek tez va qulay ishlaydi.
              </Text>

              <View style={styles.pwaFeatureList}>
                <View style={styles.pwaFeatureItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <Text style={styles.pwaFeatureText}>
                    Android va iPhone (iOS) to'liq qo'llab-quvvatlanadi
                  </Text>
                </View>
                <View style={styles.pwaFeatureItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <Text style={styles.pwaFeatureText}>
                    Offline rejim va internetni tejash
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.pwaDownloadBtn}
                onPress={openInstallModal}
                activeOpacity={0.85}
              >
                <Download size={18} color="#ffffff" />
                <Text style={styles.pwaDownloadBtnText}>
                  Ilovani o'rnatish oynasini ochish
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right QR Code (Desktop only) */}
            {isDesktop && (
              <View style={styles.qrCol}>
                <View style={styles.qrCard}>
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrLabel}>Telefoningiz kamerasi bilan skanerlang</Text>
                  <Text style={styles.qrSub}>{currentUrl}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ===================== FOOTER ===================== */}
        <View style={styles.footerWrapper}>
          <View style={styles.footerContent}>
            <View style={styles.footerBrand}>
              <TouchableOpacity
                style={styles.logoWrap}
                onPress={() => scrollToSection('hero')}
              >
                <View style={styles.logoIcon}>
                  <GraduationCap size={20} color="#ffffff" />
                </View>
                <Text style={[styles.logoTitle, { fontSize: 16 }]}>HAMKOR TA'LIM</Text>
              </TouchableOpacity>
              <Text style={styles.footerDesc}>
                Zamonaviy ta'lim vazifalarini boshqarish va o'quvchilar bilimini
                baholashning raqamli tizimi.
              </Text>
            </View>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => scrollToSection('hero')}>
                <Text style={styles.footerLink}>Asosiy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToSection('features')}>
                <Text style={styles.footerLink}>Imkoniyatlar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Kirish</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.footerLink}>Ro'yxatdan o'tish</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openInstallModal}>
                <Text style={styles.footerLink}>Ilovani o'rnatish</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.footerCopy}>
              Hamkor Ta'lim Enterprise © 2026. Barcha huquqlar himoyalangan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
  },

  /* ===================== STICKY HEADER ===================== */
  stickyHeader: {
    position: 'relative',
    backgroundColor: '#0b1120',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 100,
    ...(Platform.OS === 'web'
      ? {
          position: 'sticky',
          top: 0,
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(11, 17, 32, 0.95)',
        }
      : {}),
  },
  stickyHeaderInner: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  logoSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navItemBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    position: 'relative',
    borderRadius: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  navItemBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  navLink: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  navLinkActive: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  activePill: {
    position: 'absolute',
    bottom: -4,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerPwaIconBtn: {
    padding: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  headerCtaButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 24,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  headerCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  menuToggleBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  mobileDropdown: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0b1120',
  },
  mobileMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  mobileMenuItemActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  mobileMenuText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  mobileMenuTextActive: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  mobileLoginItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f59e0b',
    marginTop: 8,
    paddingVertical: 12,
  },
  mobileLoginText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '800',
  },

  /* ===================== HERO STYLES ===================== */
  heroWrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(to right, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.72) 50%, rgba(15, 23, 42, 0.55) 100%)',
        }
      : {}),
  },
  heroInner: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl * 1.5,
  },
  heroMain: {
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  badgeText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  heroDescription: {
    fontFamily: FONTS.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: SPACING.md,
  },
  heroMetaLine: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.2,
    marginBottom: SPACING.lg + 8,
  },

  /* ---------- HERO ACTIONS ---------- */
  heroActions: {
    gap: 12,
  },
  primaryAmberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  primaryAmberBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  outlineGlassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  outlineGlassBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  pwaInstallHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  pwaInstallHeroBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  /* ===================== SECTION COMMON ===================== */
  sectionContainer: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl * 1.5,
  },
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    maxWidth: 720,
    alignSelf: 'center',
  },
  sectionPreTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#0f172a',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* ===================== BENTO GRID ===================== */
  bentoGrid: {
    gap: SPACING.md,
  },
  bentoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  cardBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  cardActionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '700',
  },

  /* ===================== ROLES SECTION ===================== */
  rolesSection: {
    backgroundColor: '#0f172a',
    paddingVertical: SPACING.xl * 1.5,
    paddingHorizontal: SPACING.lg,
  },
  rolesGrid: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.lg,
  },
  roleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.8,
  },
  roleTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  roleText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 'auto',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  roleBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },

  /* ===================== PWA PROMOTION CTA ===================== */
  pwaPromotionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.xl,
  },
  pwaTextCol: {
    alignItems: 'flex-start',
  },
  pwaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  pwaBadgeText: {
    color: '#3b82f6',
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.8,
  },
  pwaCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: '#0f172a',
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 8,
  },
  pwaCardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  pwaFeatureList: {
    gap: 8,
    marginBottom: SPACING.lg,
  },
  pwaFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pwaFeatureText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#334155',
  },
  pwaDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  pwaDownloadBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  qrCol: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.sm,
  },
  qrImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  qrLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#0f172a',
    marginTop: 8,
    textAlign: 'center',
  },
  qrSub: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },

  /* ===================== FOOTER ===================== */
  footerWrapper: {
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.lg,
  },
  footerContent: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  footerBrand: {
    maxWidth: 380,
  },
  footerDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerLink: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#cbd5e1',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  footerBottom: {
    maxWidth: 1240,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  footerCopy: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#475569',
  },
});
