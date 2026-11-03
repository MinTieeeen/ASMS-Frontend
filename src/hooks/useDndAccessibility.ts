/**
 * @file Translated screen reader instructions and announcements for dnd-kit drag and drop (accessibility rules:
 *   every drag also works with the keyboard and is announced).
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import type { Announcements, ScreenReaderInstructions, UniqueIdentifier } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

/**
 * @param labelOf readable name of a draggable item or a drop target, from its dnd-kit id
 */
export function useDndAccessibility(labelOf: (id: UniqueIdentifier) => string): {
  announcements: Announcements
  screenReaderInstructions: ScreenReaderInstructions
} {
  const { t } = useTranslation()
  return {
    screenReaderInstructions: { draggable: t('dnd.instructions') },
    announcements: {
      onDragStart: ({ active }) => t('dnd.pickedUp', { item: labelOf(active.id) }),
      onDragOver: ({ active, over }) =>
        over
          ? t('dnd.over', { item: labelOf(active.id), target: labelOf(over.id) })
          : t('dnd.overNone', { item: labelOf(active.id) }),
      onDragEnd: ({ active, over }) =>
        over
          ? t('dnd.dropped', { item: labelOf(active.id), target: labelOf(over.id) })
          : t('dnd.droppedNone', { item: labelOf(active.id) }),
      onDragCancel: ({ active }) => t('dnd.cancelled', { item: labelOf(active.id) }),
    },
  }
}
