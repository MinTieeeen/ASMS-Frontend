/**
 * @file Avatar upload dialog, SCR-USER-02 (UC-USER-02, API-USER-03): pick or drop a photo, crop a square with a round
 *   mask, zoom 1–3×, preview at 96 and 32 px, upload with progress.
 * @author MinhTien
 * @version 1.0.0
 * @since 2026-10-04
 * @modified 2026-10-04
 */

import { CircleAlert, ImageUp, Loader2, Minus, Plus, Upload } from 'lucide-react'
import { type DragEvent, useCallback, useEffect, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { uploadMyAvatar } from '@/api/generated/endpoints/profiles/profiles'
import type { AvatarResponse } from '@/api/generated/models'
import { toApiError } from '@/api/http-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

import {
  AVATAR_ACCEPT,
  type AvatarFileError,
  loadAvatarFile,
  type LoadedAvatar,
  maxZoomFor,
} from '../utils/avatar-file'

const ZOOM_STEP = 0.1
const PREVIEW_SIZES = [96, 32] as const

type DialogError = AvatarFileError | 'rateLimited' | 'network' | 'generic'

interface AvatarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the new URLs once the photo is saved */
  onUploaded: (avatar: AvatarResponse) => void
}

export function AvatarDialog({ open, onOpenChange, onUploaded }: AvatarDialogProps) {
  const { t } = useTranslation('profile')
  const { t: tCommon } = useTranslation()
  const { t: tAuth } = useTranslation('auth')
  const [image, setImage] = useState<LoadedAvatar | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [error, setError] = useState<{ kind: DialogError; retryAfter?: number } | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isUploading = progress !== null

  // The object URL lives as long as the photo is shown
  useEffect(
    () => () => {
      if (image) URL.revokeObjectURL(image.url)
    },
    [image],
  )

  const reset = () => {
    setImage(null)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    setArea(null)
    setError(null)
    setProgress(null)
  }

  const close = (next: boolean) => {
    if (isUploading) return // cannot be closed while uploading (screen conventions)
    if (!next) reset()
    onOpenChange(next)
  }

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    const result = await loadAvatarFile(file)
    if (!result.ok) {
      setError({ kind: result.error })
      return
    }
    setImage(result.image)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    setError(null)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    void pickFile(event.dataTransfer.files[0])
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), [])

  const save = async () => {
    if (!image || !area) return
    // A square in pixels of the upright original, kept inside the photo
    const size = Math.min(
      Math.round(area.width),
      Math.round(area.height),
      image.width,
      image.height,
    )
    const cropX = Math.min(Math.max(0, Math.round(area.x)), image.width - size)
    const cropY = Math.min(Math.max(0, Math.round(area.y)), image.height - size)
    setError(null)
    setProgress(0)
    try {
      const avatar = await uploadMyAvatar(
        { file: image.file, cropX, cropY, cropSize: size },
        {
          onUploadProgress: (event) =>
            setProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0),
        },
      )
      toast.success(t('avatarDialog.updated'))
      onUploaded(avatar)
      reset()
      onOpenChange(false)
    } catch (caught) {
      setProgress(null)
      setError(errorOf(caught))
    }
  }

  const maxZoom = image ? maxZoomFor(image.width, image.height) : 1
  const errorText =
    error &&
    {
      unsupported: t('avatarDialog.errorUnsupported'),
      tooLarge: t('avatarDialog.errorTooLarge'),
      invalid: t('avatarDialog.errorInvalid'),
      rateLimited: tAuth('message.rateLimited', { count: error.retryAfter ?? 0 }),
      network: tCommon('error.network'),
      generic: tCommon('error.generic'),
    }[error.kind]

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className="max-h-svh gap-0 overflow-y-auto p-0 sm:max-w-150"
        showCloseButton={!isUploading}
        onEscapeKeyDown={(event) => isUploading && event.preventDefault()}
        onPointerDownOutside={(event) => isUploading && event.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="font-heading text-lg">{t('avatarDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('avatarDialog.requirements')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 pt-4 pb-5">
          <input
            ref={inputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              void pickFile(event.target.files?.[0])
              event.target.value = '' // choosing the same file again still triggers a change
            }}
          />

          {!image ? (
            <section
              aria-label={t('avatarDialog.drop')}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              className={cn(
                'flex h-65 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-background p-6 text-center',
                error && ['unsupported', 'tooLarge', 'invalid'].includes(error.kind)
                  ? 'border-destructive'
                  : 'border-input',
                isDragOver && 'border-primary bg-accent',
              )}
            >
              <span className="flex size-13 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <ImageUp className="size-6" aria-hidden />
              </span>
              <p className="text-[15px] font-semibold">{t('avatarDialog.drop')}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                <Upload aria-hidden />
                {t('avatarDialog.choose')}
              </Button>
              <p className="text-[13px] leading-[18px] text-muted-foreground">
                {t('avatarDialog.requirements')}
              </p>
            </section>
          ) : (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex flex-col gap-3">
                <div
                  className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted sm:w-80"
                  aria-label={t('avatarDialog.cropArea')}
                  role="img"
                >
                  <Cropper
                    image={image.url}
                    crop={crop}
                    zoom={zoom}
                    minZoom={1}
                    maxZoom={maxZoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    objectFit="cover"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="flex items-center gap-2.5 sm:w-80">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('avatarDialog.zoomOut')}
                    disabled={isUploading || zoom <= 1}
                    onClick={() => setZoom((value) => Math.max(1, value - ZOOM_STEP))}
                  >
                    <Minus aria-hidden />
                  </Button>
                  <Slider
                    aria-label={t('avatarDialog.zoom')}
                    min={1}
                    max={maxZoom}
                    step={0.01}
                    value={[zoom]}
                    onValueChange={([value]) => value !== undefined && setZoom(value)}
                    disabled={isUploading || maxZoom <= 1}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('avatarDialog.zoomIn')}
                    disabled={isUploading || zoom >= maxZoom}
                    onClick={() => setZoom((value) => Math.min(maxZoom, value + ZOOM_STEP))}
                  >
                    <Plus aria-hidden />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3.5">
                <span className="text-[13px] font-semibold text-muted-foreground">
                  {t('avatarDialog.preview')}
                </span>
                <div className="flex items-end gap-4">
                  {PREVIEW_SIZES.map((size) => (
                    <CropPreview key={size} image={image} area={area} size={size} />
                  ))}
                </div>
                <span className="max-w-40 text-xs text-muted-foreground">
                  {t('avatarDialog.previewHint')}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-3 self-start"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {t('avatarDialog.chooseAnother')}
                </Button>
              </div>
            </div>
          )}

          {errorText && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden />
              <AlertTitle>{errorText}</AlertTitle>
              {error?.kind === 'tooLarge' && (
                <AlertDescription>{t('avatarDialog.errorTooLargeHint')}</AlertDescription>
              )}
            </Alert>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-b-xl border-t bg-transparent px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => close(false)}
          >
            {tCommon('action.cancel')}
          </Button>
          <Button
            type="button"
            className="min-w-30"
            disabled={!image || !area || isUploading}
            aria-busy={isUploading}
            onClick={() => void save()}
          >
            {isUploading && <Loader2 className="animate-spin" aria-hidden />}
            {isUploading
              ? t('avatarDialog.uploading', { percent: progress })
              : t('avatarDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Round preview of the current crop, drawn from the original photo */
function CropPreview({
  image,
  area,
  size,
}: {
  image: LoadedAvatar
  area: Area | null
  size: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || !area) return
    const element = new Image()
    element.onload = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = size * ratio
      canvas.height = size * ratio
      context.imageSmoothingQuality = 'high'
      context.drawImage(
        element,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        canvas.width,
        canvas.height,
      )
    }
    element.src = image.url
  }, [image, area, size])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="shrink-0 rounded-full bg-muted"
      style={{ width: size, height: size }}
    />
  )
}

function errorOf(caught: unknown): { kind: DialogError; retryAfter?: number } {
  const apiError = toApiError(caught)
  switch (apiError.code) {
    case 'AVATAR_UNSUPPORTED_TYPE':
      return { kind: 'unsupported' }
    case 'AVATAR_TOO_LARGE':
      return { kind: 'tooLarge' }
    case 'AVATAR_INVALID_IMAGE':
      return { kind: 'invalid' }
    case 'AUTH_RATE_LIMITED':
      return { kind: 'rateLimited', retryAfter: apiError.retryAfterSeconds }
    default:
      return { kind: apiError.isNetworkError ? 'network' : 'generic' }
  }
}
