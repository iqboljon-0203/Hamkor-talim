import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Theme from '@/constants/Theme';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import Button from './Button';

const { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } = Theme;

interface DatePickerProps {
  label?: string;
  value: string; // ISO date string
  onChange: (date: string) => void;
  error?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  minDate,
  maxDate,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const formattedDate = value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Select date';

  const handleDayPress = (day: { dateString: string }) => {
    onChange(day.dateString);
    setIsVisible(false);
  };

  const openModal = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.pickerContainer,
          error && styles.errorContainer,
          disabled && styles.disabledContainer,
        ]}
        onPress={openModal}
        disabled={disabled}
      >
        <Text
          style={[
            styles.pickerText,
            !value && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {formattedDate}
        </Text>
        <CalendarIcon
          size={20}
          color={disabled ? COLORS.gray[400] : COLORS.gray[600]}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                [value]: { selected: true, selectedColor: COLORS.primary[500] },
              }}
              minDate={minDate}
              maxDate={maxDate}
              theme={{
                todayTextColor: COLORS.primary[500],
                selectedDayBackgroundColor: COLORS.primary[500],
                dotColor: COLORS.primary[500],
                arrowColor: COLORS.primary[500],
              }}
            />
            <View style={styles.modalFooter}>
              <Button title="Cancel" onPress={closeModal} type="outline" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  pickerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
  },
  placeholderText: {
    color: COLORS.gray[400],
  },
  errorContainer: {
    borderColor: COLORS.error[500],
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.error[500],
    marginTop: SPACING.xs,
  },
  disabledContainer: {
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[300],
  },
  disabledText: {
    color: COLORS.gray[500],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalFooter: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default DatePicker;
