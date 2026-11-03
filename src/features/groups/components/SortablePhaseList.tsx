/**
 * @file Phase list that leader and deputies reorder by dragging (UC06 step 3), with the mouse, touch or the
 *   keyboard; the move buttons on each card stay as another alternative.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-11-03
 * @modified 2026-11-03
 */

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useDndAccessibility } from '@/hooks'
import { cn } from '@/lib/utils'
import { type Phase, useMockStore } from '@/mocks'

/** A small move first, so clicking the handle never starts a drag */
const DRAG_DISTANCE_PX = 5

interface SortablePhaseListProps {
  groupId: string
  /** In display order */
  phases: Phase[]
  isSortable: boolean
  /** Renders one phase card with the given drag handle (undefined when not sortable) */
  renderPhase: (phase: Phase, index: number, dragHandle: ReactNode) => ReactNode
}

export function SortablePhaseList({ groupId, phases, isSortable, renderPhase }: SortablePhaseListProps) {
  const { t } = useTranslation('groups')
  const reorderPhases = useMockStore((state) => state.reorderPhases)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const accessibility = useDndAccessibility((id) => phases.find((phase) => phase.id === id)?.name ?? String(id))
  const ids = phases.map((phase) => phase.id)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    reorderPhases(groupId, arrayMove(ids, from, to))
    toast.success(t('phases.moved'))
  }

  if (!isSortable) {
    return (
      <ol className="flex flex-col gap-3" aria-label={t('phases.title')}>
        {phases.map((phase, index) => (
          <li key={phase.id}>{renderPhase(phase, index, undefined)}</li>
        ))}
      </ol>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} accessibility={accessibility} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className="flex flex-col gap-3" aria-label={t('phases.title')}>
          {phases.map((phase, index) => (
            <SortablePhase key={phase.id} phase={phase} index={index} renderPhase={renderPhase} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

interface SortablePhaseProps {
  phase: Phase
  index: number
  renderPhase: SortablePhaseListProps['renderPhase']
}

function SortablePhase({ phase, index, renderPhase }: SortablePhaseProps) {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: phase.id,
    attributes: { roleDescription: tCommon('dnd.roleDescription') },
  })
  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label={t('phases.dragHandle', { name: phase.name })}
      className="-ml-1 flex size-6 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted focus-visible:shadow-focus active:cursor-grabbing"
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  )

  return (
    <li
      ref={setNodeRef}
      // dnd-kit moves the item with a transform while it is dragged (a truly dynamic value)
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative', isDragging && 'z-10 opacity-80')}
    >
      {renderPhase(phase, index, handle)}
    </li>
  )
}
